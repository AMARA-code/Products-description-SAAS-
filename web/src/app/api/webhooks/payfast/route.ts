import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPayFastSignature } from "@/lib/payfast";
import {
  mapPlanTypeFromAmount,
  normalizePlanType,
  planLimitFor,
  toDbPlan,
  type SubscriptionPlanType,
} from "@/lib/subscriptionService";

type PayFastWebhookFields = Record<string, string>;

function toPlanType(value: string | undefined): SubscriptionPlanType {
  return normalizePlanType(value);
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

function parseAmount(fields: PayFastWebhookFields): number {
  const raw = fields.amount_gross ?? fields.amount_net ?? fields.amount_fee ?? "0";
  const amount = Number.parseFloat(raw);
  return Number.isFinite(amount) ? amount : 0;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const fields = parseFormBody(rawBody);
  const paymentId = (fields.pf_payment_id ?? fields.m_payment_id ?? "").trim();
  const eventType = (fields.payment_status ?? "UNKNOWN").toUpperCase();
  const admin = createAdminClient();

  const { data: existingPayment } = paymentId
    ? await admin
        .from("payments")
        .select("id, processed_at")
        .eq("provider", "payfast")
        .eq("payment_id", paymentId)
        .maybeSingle()
    : { data: null };

  const signature = fields.pf_signature;
  if (!signature) {
    if (paymentId && !existingPayment) {
      await admin.from("payments").insert({
        provider: "payfast",
        payment_id: paymentId,
        event_type: eventType,
        status: "missing_signature",
        signature_valid: false,
        raw_payload: fields,
      });
    }
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const signedFields = { ...fields };
  delete signedFields.pf_signature;
  const signatureValid = verifyPayFastSignature(signedFields, signature);
  if (!signatureValid) {
    if (paymentId && !existingPayment) {
      await admin.from("payments").insert({
        provider: "payfast",
        payment_id: paymentId,
        event_type: eventType,
        status: "invalid_signature",
        signature_valid: false,
        raw_payload: fields,
      });
    }
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const userId = fields.custom_str1?.trim();
  if (paymentId && existingPayment?.processed_at) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const amount = parseAmount(fields);
  const requestedPlan = fields.custom_str2
    ? toPlanType(fields.custom_str2)
    : mapPlanTypeFromAmount(amount);
  const subscriptionDays = Number.parseInt(fields.custom_int1 ?? "30", 10) || 30;
  const nowIso = new Date().toISOString();
  const subscriptionEnd = nextExpiryDate(subscriptionDays);

  if (paymentId) {
    if (existingPayment) {
      await admin
        .from("payments")
        .update({
          user_id: userId || null,
          event_type: eventType,
          status: "verified",
          amount: amount > 0 ? amount : null,
          signature_valid: true,
          verified_at: nowIso,
          raw_payload: fields,
        })
        .eq("id", existingPayment.id);
    } else {
      await admin.from("payments").insert({
        user_id: userId || null,
        provider: "payfast",
        payment_id: paymentId,
        event_type: eventType,
        status: "verified",
        amount: amount > 0 ? amount : null,
        signature_valid: true,
        verified_at: nowIso,
        raw_payload: fields,
      });
    }
  }

  if (!userId) {
    return NextResponse.json({ received: true });
  }

  const paymentStatus = fields.payment_status?.toUpperCase() ?? "UNKNOWN";
  const subscriptionCycle = fields.custom_str3?.toLowerCase() ?? "";

  if (paymentStatus === "COMPLETE" && subscriptionCycle === "monthly") {
    await admin
      .from("profiles")
      .update({
        plan: toDbPlan(requestedPlan),
        plan_type: requestedPlan,
        subscription_status: "active",
        subscription_start: nowIso,
        subscription_end: subscriptionEnd,
        ai_requests_limit: planLimitFor(requestedPlan),
        ai_requests_used: 0,
        expiry_date: subscriptionEnd,
        updated_at: nowIso,
      })
      .eq("id", userId);

    if (paymentId) {
      await admin
        .from("payments")
        .update({
          status: "processed",
          processed_at: new Date().toISOString(),
        })
        .eq("provider", "payfast")
        .eq("payment_id", paymentId);
    }

    return NextResponse.json({ received: true });
  }

  if (
    paymentStatus === "FAILED" ||
    paymentStatus === "CANCELLED" ||
    paymentStatus === "DENIED" ||
    paymentStatus === "EXPIRED"
  ) {
    await admin
      .from("profiles")
      .update({
        plan: "BASIC",
        plan_type: "basic",
        subscription_status: "inactive",
        ai_requests_limit: planLimitFor("basic"),
        subscription_start: null,
        subscription_end: nowIso,
        expiry_date: new Date().toISOString(),
        updated_at: nowIso,
      })
      .eq("id", userId);
  }

  if (paymentId) {
    await admin
      .from("payments")
      .update({
        status: paymentStatus.toLowerCase(),
        processed_at: new Date().toISOString(),
      })
      .eq("provider", "payfast")
      .eq("payment_id", paymentId);
  }

  return NextResponse.json({ received: true });
}
