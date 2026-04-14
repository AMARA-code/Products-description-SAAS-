import { NextResponse } from "next/server";
import { createSupabaseForApiRoute } from "@/lib/supabase/api-route";
import {
  generateFromImage,
  generateFromText,
  generateMockFromImage,
  generateMockFromText,
} from "@/lib/openai-generate";

export const runtime = "nodejs";
export const maxDuration = 60;

type Body = {
  mode: "text" | "image";
  productName?: string;
  category?: string;
  imageBase64?: string;
  mimeType?: string;
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

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("plan, subscription_status, ai_requests_used, ai_requests_limit, expiry_date")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const plan = profile.plan ?? "BASIC";
  const isBasic = plan === "BASIC";

  const isActive = profile.subscription_status === "active";
  const isExpired = !profile.expiry_date || new Date(profile.expiry_date) <= new Date();
  if (!isBasic && (!isActive || isExpired)) {
    return NextResponse.json(
      {
        error: "subscription_required",
        reason: "active_subscription_required",
      },
      { status: 402 },
    );
  }

  const used = profile.ai_requests_used ?? 0;
  const limit = profile.ai_requests_limit ?? 0;
  if (used >= limit) {
    return NextResponse.json(
      {
        error: "limit_reached",
        reason: "ai_requests_limit_exceeded",
        used,
        limit,
      },
      { status: 402 },
    );
  }

  const nextUsed = used + 1;
  const { error: reserveError } = await supabase
    .from("profiles")
    .update({ ai_requests_used: nextUsed })
    .eq("id", user.id);

  if (reserveError) {
    return NextResponse.json({ error: reserveError.message }, { status: 500 });
  }

  let description: string;
  try {
    if (mode === "text") {
      description = isBasic
        ? await generateMockFromText({
            productName: body.productName!.trim(),
            category: body.category?.trim(),
          })
        : await generateFromText({
            productName: body.productName!.trim(),
            category: body.category?.trim(),
          });
    } else {
      description = isBasic
        ? await generateMockFromImage({
            base64: body.imageBase64!,
            mimeType: body.mimeType!,
            productHint: body.productName?.trim() || body.category?.trim(),
          })
        : await generateFromImage({
            base64: body.imageBase64!,
            mimeType: body.mimeType!,
            productHint: body.productName?.trim() || body.category?.trim(),
          });
    }
  } catch (e) {
    await supabase
      .from("profiles")
      .update({ ai_requests_used: used })
      .eq("id", user.id);
    const message = e instanceof Error ? e.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
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
    await supabase
      .from("profiles")
      .update({ ai_requests_used: used })
      .eq("id", user.id);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
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
