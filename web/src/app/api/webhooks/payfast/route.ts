import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLANS, type PlanSlug } from "@/lib/plans";
import { verifyPayFastSignature } from "@/lib/payfast";

type PayFastWebhookFields = Record<string, string>;

function toPlanSlug(value: string | undefined): PlanSlug | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "basic" || normalized === "pro" || normalized === "agency") {
    return normalized;
  }
  return null;
}

function parseFormBody(rawBody: string): PayFastWebhookFields {
  const search = new URLSearchParams(rawBody);
  const fields: PayFastWebhookFields = {};
  for (const [key, value] of search.entries()) {
    fields[key] = value;
  }
  return fields;
}

function nextExpiryDate(days: number): string {
  const next = new Date();
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString();
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const fields = parseFormBody(rawBody);

  const signature = fields.pf_signature;
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const signedFields = { ...fields };
  delete signedFields.pf_signature;
  if (!verifyPayFastSignature(signedFields, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const userId = fields.custom_str1?.trim();
  if (!userId) {
    return NextResponse.json({ received: true });
  }

  const requestedPlan = toPlanSlug(fields.custom_str2) ?? "basic";
  const paymentStatus = fields.payment_status?.toUpperCase() ?? "UNKNOWN";
  const subscriptionCycle = fields.custom_str3?.toLowerCase() ?? "";
  const admin = createAdminClient();

  if (paymentStatus === "COMPLETE" && subscriptionCycle === "monthly") {
    const selectedPlan = PLANS[requestedPlan];
    await admin
      .from("profiles")
      .update({
        plan: selectedPlan.dbPlan,
        subscription_status: "active",
        ai_requests_limit: selectedPlan.monthlyLimit,
        ai_requests_used: 0,
        expiry_date: nextExpiryDate(30),
      })
      .eq("id", userId);

    return NextResponse.json({ received: true });
  }

  if (
    paymentStatus === "FAILED" ||
    paymentStatus === "CANCELLED" ||
    paymentStatus === "DENIED" ||
    paymentStatus === "EXPIRED"
  ) {
    const fallback = PLANS.basic;
    await admin
      .from("profiles")
      .update({
        plan: fallback.dbPlan,
        subscription_status: paymentStatus.toLowerCase(),
        ai_requests_limit: fallback.monthlyLimit,
        expiry_date: new Date().toISOString(),
      })
      .eq("id", userId);
  }

  return NextResponse.json({ received: true });
}
