import { NextResponse } from "next/server";
import { createSupabaseForApiRoute } from "@/lib/supabase/api-route";
import { buildPayFastCheckoutUrl } from "@/lib/payfast";
import { isPaidPlan, type PlanSlug } from "@/lib/plans";

export async function POST(request: Request) {
  const supabase = await createSupabaseForApiRoute(request);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { plan?: PlanSlug };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const plan = body.plan;
  if (!plan || !["basic", "pro", "agency"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }
  if (!isPaidPlan(plan)) {
    return NextResponse.json(
      { error: "Basic plan is free and does not require checkout" },
      { status: 400 },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .single();

  const origin =
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  const email = profile?.email ?? user.email;
  if (!email) {
    return NextResponse.json(
      { error: "User email is required to start checkout" },
      { status: 400 },
    );
  }

  let url: string;
  try {
    url = buildPayFastCheckoutUrl({
      plan,
      userId: user.id,
      email,
      returnUrl: process.env.PAYFAST_RETURN_URL?.trim() || `${origin}/settings/billing`,
      cancelUrl: process.env.PAYFAST_CANCEL_URL?.trim() || `${origin}/pricing`,
      notifyUrl:
        process.env.PAYFAST_NOTIFY_URL?.trim() || `${origin}/api/webhooks/payfast`,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to initialize PayFast checkout";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ url });
}
