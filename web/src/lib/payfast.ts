import { createHash, timingSafeEqual } from "crypto";
import { PLANS, type PlanSlug } from "@/lib/plans";

type PayFastEnv = {
  merchantId: string;
  merchantKey: string;
  passphrase?: string;
  processUrl: string;
};

export type PayFastCheckoutInput = {
  plan: PlanSlug;
  userId: string;
  email: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
};

function normalizeValue(input: string): string {
  return input.trim();
}

function buildSignature(input: Record<string, string>, passphrase?: string): string {
  const body = Object.entries(input)
    .filter(([, value]) => value.length > 0)
    .map(([key, value]) => `${key}=${encodeURIComponent(value).replace(/%20/g, "+")}`)
    .join("&");

  const finalBody = passphrase
    ? `${body}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}`
    : body;

  return createHash("md5").update(finalBody).digest("hex");
}

export function getPayFastEnv(): PayFastEnv {
  const merchantId = process.env.PAYFAST_MERCHANT_ID?.trim() ?? "";
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY?.trim() ?? "";
  const passphrase = process.env.PAYFAST_PASSPHRASE?.trim() || undefined;
  const processUrl =
    process.env.PAYFAST_PROCESS_URL?.trim() || "https://www.payfast.co.za/eng/process";

  if (!merchantId || !merchantKey) {
    throw new Error("PAYFAST_MERCHANT_ID and PAYFAST_MERCHANT_KEY are required");
  }

  return { merchantId, merchantKey, passphrase, processUrl };
}

export function buildPayFastCheckoutUrl(input: PayFastCheckoutInput): string {
  const plan = PLANS[input.plan];
  const env = getPayFastEnv();

  const payload: Record<string, string> = {
    merchant_id: env.merchantId,
    merchant_key: env.merchantKey,
    return_url: normalizeValue(input.returnUrl),
    cancel_url: normalizeValue(input.cancelUrl),
    notify_url: normalizeValue(input.notifyUrl),
    name_first: "Subscriber",
    email_address: normalizeValue(input.email),
    m_payment_id: `${input.userId}:${input.plan}:${Date.now()}`,
    amount: plan.priceUsd.toFixed(2),
    item_name: `${plan.name} Plan Monthly Subscription`,
    item_description: `${plan.name} monthly billing`,
    custom_str1: normalizeValue(input.userId),
    custom_str2: normalizeValue(input.plan),
    custom_str3: "monthly",
  };

  payload.signature = buildSignature(payload, env.passphrase);

  const query = new URLSearchParams(payload);
  return `${env.processUrl}?${query.toString()}`;
}

export function verifyPayFastSignature(
  fields: Record<string, string>,
  signature: string,
): boolean {
  const passphrase = process.env.PAYFAST_PASSPHRASE?.trim() || undefined;
  const computed = buildSignature(fields, passphrase);
  const received = (signature ?? "").trim().toLowerCase();
  const expected = computed.toLowerCase();
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  if (receivedBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(receivedBuffer, expectedBuffer);
}
