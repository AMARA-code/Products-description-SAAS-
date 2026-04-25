import { NextResponse } from "next/server";
import { PLANS, type PlanSlug } from "@/lib/plans";
import { createSupabaseForApiRoute } from "@/lib/supabase/api-route";
import { createAdminClient } from "@/lib/supabase/admin";

type Body = {
  plan?: PlanSlug;
  transactionId?: string;
  channel?: "jazzcash" | "easypaisa";
};

function isPlan(value: unknown): value is PlanSlug {
  return value === "basic" || value === "pro" || value === "agency";
}

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
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!isPlan(body.plan)) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }
  const transactionId = body.transactionId?.trim();
  if (!transactionId) {
    return NextResponse.json({ error: "Transaction ID is required." }, { status: 400 });
  }
  if (body.channel !== "jazzcash" && body.channel !== "easypaisa") {
    return NextResponse.json({ error: "Invalid payment channel." }, { status: 400 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Admin configuration is missing.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
  const { error } = await admin.from("payments").insert({
    user_id: user.id,
    provider: "manual",
    payment_id: transactionId,
    event_type: body.plan,
    status: "pending",
    amount: PLANS[body.plan].priceUsd,
    signature_valid: true,
    raw_payload: {
      channel: body.channel,
      submitted_at: new Date().toISOString(),
      plan: body.plan,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("duplicate") || error.message.toLowerCase().includes("unique")) {
      return NextResponse.json({ error: "Transaction ID already submitted." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
