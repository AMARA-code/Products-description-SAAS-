import { PLANS } from "@/lib/plans";
import { SupabaseClient } from "@supabase/supabase-js";

export type SubscriptionPlanType = "basic" | "pro" | "enterprise";

export type ProfileRecord = {
  id?: string;
  plan?: "BASIC" | "PRO" | "AGENCY" | null;
  plan_type?: string | null;
  subscription_status?: string | null;
  subscription_start?: string | null;
  subscription_end?: string | null;
  expiry_date?: string | null;
  ai_requests_used?: number | null;
  ai_requests_limit?: number | null;
  created_at?: string | null;
};

const PLAN_LIMITS: Record<SubscriptionPlanType, number> = {
  basic: PLANS.basic.monthlyLimit,
  pro: PLANS.pro.monthlyLimit,
  enterprise: Math.max(1000000, PLANS.agency.monthlyLimit),
};

export function toDbPlan(planType: SubscriptionPlanType): "BASIC" | "PRO" | "AGENCY" {
  if (planType === "pro") return "PRO";
  if (planType === "enterprise") return "AGENCY";
  return "BASIC";
}

export function normalizePlanType(input: string | null | undefined): SubscriptionPlanType {
  const value = (input ?? "").trim().toLowerCase();
  if (value === "enterprise" || value === "agency") return "enterprise";
  if (value === "pro") return "pro";
  return "basic";
}

export function planLimitFor(planType: SubscriptionPlanType): number {
  return PLAN_LIMITS[planType];
}

export function mapPlanTypeFromAmount(amount: number): SubscriptionPlanType {
  if (amount >= PLANS.agency.priceUsd) return "enterprise";
  if (amount >= PLANS.pro.priceUsd) return "pro";
  return "basic";
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function addMonths(date: Date, months: number): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function computeCurrentCycleStart(anchor: Date, now: Date): Date {
  let cycleStart = new Date(anchor);
  while (addMonths(cycleStart, 1) <= now) {
    cycleStart = addMonths(cycleStart, 1);
  }
  return cycleStart;
}

export async function ensureUsageCycleWindow(
  supabase: SupabaseClient,
  userId: string,
  profile: ProfileRecord,
): Promise<ProfileRecord> {
  const now = new Date();
  const anchor =
    parseDate(profile.subscription_start) ??
    parseDate(profile.created_at) ??
    now;
  const cycleStart = computeCurrentCycleStart(anchor, now);

  const shouldInitializeStart = !parseDate(profile.subscription_start);
  const cycleAdvanced = cycleStart.getTime() !== anchor.getTime();
  const shouldResetUsage = cycleAdvanced && (profile.ai_requests_used ?? 0) > 0;

  if (!shouldInitializeStart && !shouldResetUsage) {
    return profile;
  }

  const updatePayload: Record<string, unknown> = {};
  if (shouldInitializeStart || cycleAdvanced) {
    updatePayload.subscription_start = cycleStart.toISOString();
  }
  if (shouldResetUsage) {
    updatePayload.ai_requests_used = 0;
  }

  const { data: updated } = await supabase
    .from("profiles")
    .update(updatePayload)
    .eq("id", userId)
    .select(
      "id, plan, plan_type, subscription_status, subscription_start, subscription_end, expiry_date, ai_requests_used, ai_requests_limit, created_at",
    )
    .maybeSingle();

  return (updated as ProfileRecord | null) ?? {
    ...profile,
    subscription_start:
      (updatePayload.subscription_start as string | undefined) ??
      profile.subscription_start,
    ai_requests_used:
      (updatePayload.ai_requests_used as number | undefined) ??
      profile.ai_requests_used,
  };
}

export async function ensureSubscriptionNotExpired(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileRecord | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, plan, plan_type, subscription_status, subscription_start, subscription_end, expiry_date, ai_requests_used, ai_requests_limit",
    )
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;

  const subscriptionEnd = parseDate(data.subscription_end ?? data.expiry_date);
  const now = new Date();

  // ✅ Fixed: missing end date means NOT expired (new user)
  const isExpired = subscriptionEnd ? subscriptionEnd <= now : false;
  const isActive = data.subscription_status === "active";

  if (isActive && isExpired) {
    await supabase
      .from("profiles")
      .update({
        subscription_status: "inactive",
        updated_at: now.toISOString(),
      })
      .eq("id", userId);
    return {
      ...data,
      subscription_status: "inactive",
    };
  }

  return data;
}

export async function checkSubscription(
  supabase: SupabaseClient,
  userId: string,
): Promise<{
  allowed: boolean;
  reason?: "profile_not_found" | "inactive" | "expired";
  profile: ProfileRecord | null;
}> {
  const profile = await ensureSubscriptionNotExpired(supabase, userId);

  // ✅ No profile row yet = brand new user, allow through
  if (!profile) return { allowed: true, profile: null };

  const status = profile.subscription_status;

  // ✅ Null status or trialing = new user, allow through to dashboard
  if (!status || status === "trialing") {
    return { allowed: true, profile };
  }

  const isActive = status === "active";
  if (!isActive) return { allowed: false, reason: "inactive", profile };

  const end = parseDate(profile.subscription_end ?? profile.expiry_date);

  // ✅ Active subscription with no end date = valid (just created)
  if (!end) return { allowed: true, profile };

  if (end <= new Date()) {
    return { allowed: false, reason: "expired", profile };
  }

  return { allowed: true, profile };
}