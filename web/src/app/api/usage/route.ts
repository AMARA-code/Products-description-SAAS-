import { NextResponse } from "next/server";
import { createSupabaseForApiRoute } from "@/lib/supabase/api-route";

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
    .select("plan, ai_requests_used, ai_requests_limit")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const month = new Date().toISOString().slice(0, 7);
  const trackedUsed = profile.ai_requests_used ?? 0;
  const limit = profile.ai_requests_limit ?? 60;
  let used = trackedUsed;

  // Backfill legacy accounts where history exists but tracker was never incremented.
  const { count: generationsCount } = await supabase
    .from("generations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (typeof generationsCount === "number" && generationsCount > trackedUsed) {
    used = generationsCount;
    await supabase
      .from("profiles")
      .update({ ai_requests_used: used })
      .eq("id", user.id);
  }

  const remaining = Math.max(0, limit - used);

  return NextResponse.json({
    month,
    used,
    limit,
    remaining,
    plan: profile.plan ?? "BASIC",
  });
}
