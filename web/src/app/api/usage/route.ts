import { NextResponse } from "next/server";
import { createSupabaseForApiRoute } from "@/lib/supabase/api-route";
import {
  checkSubscription,
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
    .select("plan, plan_type, ai_requests_used, ai_requests_limit")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const month = new Date().toISOString().slice(0, 7);
  const subscription = await checkSubscription(supabase, user.id);
  const planType = normalizePlanType(profile.plan_type ?? profile.plan?.toLowerCase());
  const trackedUsed = profile.ai_requests_used ?? 0;
  const planLimit = planLimitFor(planType);
  const limit = planType === "basic" ? planLimit : (profile.ai_requests_limit ?? planLimit);
  const used = trackedUsed;

  const remaining = Math.max(0, limit - used);

  return NextResponse.json({
    month,
    used,
    limit,
    remaining,
    plan: profile.plan ?? "BASIC",
    planType,
    subscriptionStatus: subscription.profile?.subscription_status ?? "inactive",
    subscriptionAllowed: subscription.allowed,
  });
}
