import { PLANS } from "@/lib/plans";

type SupabaseLike = {
  from: (table: string) => {
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        maybeSingle: () => Promise<{ data: ProfileRecord | null; error: { message: string } | null }>;
      };
    };
    update: (values: Record<string, unknown>) => {
      eq: (column: string, value: string) => Promise<{ error: { message: string } | null }>;
    };
  };
};

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

export async function ensureSubscriptionNotExpired(
  supabase: SupabaseLike,
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
  const isExpired = subscriptionEnd ? subscriptionEnd <= now : true;
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
  supabase: SupabaseLike,
  userId: string,
): Promise<{
  allowed: boolean;
  reason?: "profile_not_found" | "inactive" | "expired";
  profile: ProfileRecord | null;
}> {
  const profile = await ensureSubscriptionNotExpired(supabase, userId);
  if (!profile) return { allowed: false, reason: "profile_not_found", profile: null };

  const isActive = profile.subscription_status === "active";
  if (!isActive) return { allowed: false, reason: "inactive", profile };

  const end = parseDate(profile.subscription_end ?? profile.expiry_date);
  if (!end || end <= new Date()) {
    return { allowed: false, reason: "expired", profile };
  }

  return { allowed: true, profile };
}

