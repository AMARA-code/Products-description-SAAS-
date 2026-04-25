import { NextResponse } from "next/server";
import { createSupabaseForApiRoute } from "@/lib/supabase/api-route";
import {
  generateBasicFromTextWithGemini,
  generateFromText,
} from "@/lib/openai-generate";
import {
  checkSubscription,
  ensureUsageCycleWindow,
  normalizePlanType,
  planLimitFor,
} from "@/lib/subscriptionService";

export const runtime = "nodejs";
export const maxDuration = 60;

type Body = {
  mode?: "text" | "image";
  productName?: string;
  category?: string;
  features?: string;
  wordLimit?: number;
};

export async function POST(request: Request) {
  const supabase = await createSupabaseForApiRoute(request);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.productName?.trim()) {
    return NextResponse.json(
      { error: "Product name is required" },
      { status: 400 },
    );
  }

  const requestedWordLimit = Number(body.wordLimit ?? 120);
  if (!Number.isFinite(requestedWordLimit)) {
    return NextResponse.json({ error: "wordLimit must be a number" }, { status: 400 });
  }
  const wordLimit = Math.max(30, Math.min(500, Math.floor(requestedWordLimit)));

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("plan, plan_type, subscription_status, subscription_start, subscription_end, ai_requests_used, ai_requests_limit, expiry_date, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const planType = normalizePlanType(profile.plan_type ?? profile.plan?.toLowerCase());
  const subscription = await checkSubscription(supabase, user.id);
  // Basic/free users should be able to generate without paid subscription.
  if (planType !== "basic" && !subscription.allowed) {
    return NextResponse.json(
      {
        error: "subscription_required",
        reason: subscription.reason ?? "active_subscription_required",
      },
      { status: 402 },
    );
  }

  const profileWithCycle = await ensureUsageCycleWindow(supabase, user.id, profile);
  const used = profileWithCycle.ai_requests_used ?? 0;
  const planLimit = planLimitFor(planType);
  const limit =
    planType === "basic" ? planLimit : (profileWithCycle.ai_requests_limit ?? planLimit);
  if (planType !== "enterprise" && used >= limit) {
    return NextResponse.json(
      {
        error: "Monthly limit reached. Please upgrade your plan.",
        reason: "ai_requests_limit_exceeded",
        used,
        limit,
      },
      { status: 402 },
    );
  }

  let description: string;
  try {
    if (planType === "basic") {
      description = await generateBasicFromTextWithGemini({
        productName: body.productName!.trim(),
        category: body.category?.trim(),
        features: body.features?.trim(),
        wordLimit,
      });
    } else {
      description = await generateFromText({
        productName: body.productName!.trim(),
        category: body.category?.trim(),
        features: body.features?.trim(),
        wordLimit,
      });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  if (!description.trim()) {
    return NextResponse.json(
      { error: "Unable to generate description at the moment" },
      { status: 502 },
    );
  }

  const title = body.productName!.trim();

  const { data: inserted, error: insertError } = await supabase
    .from("generations")
    .insert({
      user_id: user.id,
      title,
      source_type: "text",
      product_name: body.productName?.trim() ?? null,
      category: body.category?.trim() ?? null,
      image_url: null,
      description,
    })
    .select("id")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const nextUsed = used + 1;
  const { error: usageUpdateError } = await supabase
    .from("profiles")
    .update({ ai_requests_used: nextUsed })
    .eq("id", user.id);

  if (usageUpdateError) {
    return NextResponse.json({ error: usageUpdateError.message }, { status: 500 });
  }

  return NextResponse.json({
    id: inserted?.id,
    description,
    usage: {
      used: nextUsed,
      limit,
    },
  });
}
