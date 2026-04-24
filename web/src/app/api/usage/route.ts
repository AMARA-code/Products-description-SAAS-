import { NextResponse } from "next/server";
import { createSupabaseForApiRoute } from "@/lib/supabase/api-route";
import {
  checkSubscription,
  ensureUsageCycleWindow,
  normalizePlanType,
  planLimitFor,
} from "@/lib/subscriptionService";

export async function GET(request: Request) {
  const supabase = await createSupabaseForApiRoute(request);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("plan, plan_type, ai_requests_used, ai_requests_limit, subscription_start, created_at")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const profileWithCycle = await ensureUsageCycleWindow(supabase, user.id, profile);
  const month = new Date().toISOString().slice(0, 7);
  const subscription = await checkSubscription(supabase, user.id);
  const planType = normalizePlanType(
    profileWithCycle.plan_type ?? profileWithCycle.plan?.toLowerCase(),
  );
  const trackedUsed = profileWithCycle.ai_requests_used ?? 0;
  const planLimit = planLimitFor(planType);
  const limit =
    planType === "basic" ? planLimit : (profileWithCycle.ai_requests_limit ?? planLimit);
  const used = trackedUsed;

  const remaining = Math.max(0, limit - used);

  return NextResponse.json({
    month,
    used,
    limit,
    remaining,
    plan: profileWithCycle.plan ?? "BASIC",
    planType,
    planStartedAt: profileWithCycle.subscription_start ?? profileWithCycle.created_at ?? null,
    subscriptionStatus: subscription.profile?.subscription_status ?? "inactive",
    subscriptionAllowed: subscription.allowed,
  });
}
