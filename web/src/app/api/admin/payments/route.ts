import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/adminAccess";
import { createSupabaseForApiRoute } from "@/lib/supabase/api-route";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  normalizePlanType,
  planLimitFor,
  toDbPlan,
  type SubscriptionPlanType,
} from "@/lib/subscriptionService";

type UpdateBody = {
  paymentId?: string;
  action?: "approve" | "reject";
};

function toPlanTypeFromEvent(eventType: string | null): SubscriptionPlanType {
  return normalizePlanType(eventType ?? "basic");
}

async function assertAdmin(request: Request) {
  const supabase = await createSupabaseForApiRoute(request);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user || !isAdminEmail(user.email)) return null;
  return user;
}

export async function GET(request: Request) {
  const user = await assertAdmin(request);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let admin;
  try {
    admin = createAdminClient();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Admin configuration is missing.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
  const { data, error } = await admin
    .from("payments")
    .select("id, user_id, payment_id, event_type, amount, status, provider, raw_payload, created_at")
    .eq("provider", "manual")
    .in("status", ["pending", "approved", "rejected"])
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ payments: data ?? [] });
}

export async function PATCH(request: Request) {
  const user = await assertAdmin(request);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: UpdateBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!body.paymentId || (body.action !== "approve" && body.action !== "reject")) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Admin configuration is missing.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
  const { data: payment, error: paymentError } = await admin
    .from("payments")
    .select("id, user_id, event_type, status, raw_payload")
    .eq("id", body.paymentId)
    .eq("provider", "manual")
    .maybeSingle();

  if (paymentError || !payment) {
    return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  }

  if (body.action === "reject") {
    const { error } = await admin
      .from("payments")
      .update({
        status: "rejected",
        processed_at: new Date().toISOString(),
        raw_payload: {
          ...(payment.raw_payload ?? {}),
          reviewed_by: user.email,
          reviewed_at: new Date().toISOString(),
          decision: "rejected",
        },
      })
      .eq("id", payment.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const planType = toPlanTypeFromEvent(payment.event_type);
  const now = new Date();
  const end = new Date(now);
  end.setUTCDate(end.getUTCDate() + 30);

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      plan: toDbPlan(planType),
      plan_type: planType,
      subscription_status: "active",
      subscription_start: now.toISOString(),
      subscription_end: end.toISOString(),
      expiry_date: end.toISOString(),
      ai_requests_limit: planLimitFor(planType),
      ai_requests_used: 0,
      updated_at: now.toISOString(),
    })
    .eq("id", payment.user_id);
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });

  const { error: markError } = await admin
    .from("payments")
    .update({
      status: "approved",
      processed_at: now.toISOString(),
      raw_payload: {
        ...(payment.raw_payload ?? {}),
        reviewed_by: user.email,
        reviewed_at: now.toISOString(),
        decision: "approved",
      },
    })
    .eq("id", payment.id);
  if (markError) return NextResponse.json({ error: markError.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
