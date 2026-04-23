import { NextResponse } from "next/server";
import { createSupabaseForApiRoute } from "@/lib/supabase/api-route";
import {
  generateBasicFromImageWithGemini,
  generateBasicFromTextWithGemini,
  generateFromImage,
  generateFromText,
} from "@/lib/openai-generate";
import {
  checkSubscription,
  normalizePlanType,
  planLimitFor,
} from "@/lib/subscriptionService";

export const runtime = "nodejs";
export const maxDuration = 60;

type Body = {
  mode: "text" | "image";
  productName?: string;
  category?: string;
  imageBase64?: string;
  mimeType?: string;
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

  const mode = body.mode;
  if (mode !== "text" && mode !== "image") {
    return NextResponse.json({ error: "mode must be text or image" }, { status: 400 });
  }

  if (mode === "text") {
    if (!body.productName?.trim()) {
      return NextResponse.json(
        { error: "Product name is required for text mode" },
        { status: 400 },
      );
    }
  } else {
    if (!body.imageBase64?.trim() || !body.mimeType?.trim()) {
      return NextResponse.json(
        { error: "Image and mime type are required for image mode" },
        { status: 400 },
      );
    }
  }

  const requestedWordLimit = Number(body.wordLimit ?? 120);
  if (!Number.isFinite(requestedWordLimit)) {
    return NextResponse.json({ error: "wordLimit must be a number" }, { status: 400 });
  }
  const wordLimit = Math.max(30, Math.min(500, Math.floor(requestedWordLimit)));

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("plan, plan_type, subscription_status, subscription_end, ai_requests_used, ai_requests_limit, expiry_date")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const planType = normalizePlanType(profile.plan_type ?? profile.plan?.toLowerCase());
  if (planType === "basic" && mode === "image") {
    return NextResponse.json(
      { error: "Image-based generation is available on Pro and above." },
      { status: 403 },
    );
  }

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

  const used = profile.ai_requests_used ?? 0;
  const planLimit = planLimitFor(planType);
  const limit = planType === "basic" ? planLimit : (profile.ai_requests_limit ?? planLimit);
  if (used >= limit) {
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
    if (mode === "text") {
      if (planType === "basic") {
        description = await generateBasicFromTextWithGemini({
          productName: body.productName!.trim(),
          category: body.category?.trim(),
          wordLimit,
        });
      } else {
        description = await generateFromText({
          productName: body.productName!.trim(),
          category: body.category?.trim(),
          wordLimit,
        });
      }
    } else {
      if (planType === "basic") {
        description = await generateBasicFromImageWithGemini({
          base64: body.imageBase64!,
          mimeType: body.mimeType!,
          productHint: body.productName?.trim() || body.category?.trim(),
          wordLimit,
        });
      } else {
        description = await generateFromImage({
          base64: body.imageBase64!,
          mimeType: body.mimeType!,
          productHint: body.productName?.trim() || body.category?.trim(),
          wordLimit,
        });
      }
    }
  } catch (e) {
    if (planType === "basic") {
      console.error("[basic-gemini-generation-failed]", e);
      return NextResponse.json(
        { error: "Unable to generate description at the moment" },
        { status: 502 },
      );
    } else {
      const message = e instanceof Error ? e.message : "Generation failed";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  if (!description.trim()) {
    return NextResponse.json(
      { error: "Unable to generate description at the moment" },
      { status: 502 },
    );
  }

  const title =
    mode === "text"
      ? body.productName!.trim()
      : body.productName?.trim() || "Image product";

  const { data: inserted, error: insertError } = await supabase
    .from("generations")
    .insert({
      user_id: user.id,
      title,
      source_type: mode === "text" ? "text" : "image",
      product_name: body.productName?.trim() ?? null,
      category: body.category?.trim() ?? null,
      image_url: mode === "image" ? "inline" : null,
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
