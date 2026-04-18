import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const protectedPrefixes = ["/dashboard", "/generate", "/history", "/settings"];

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user, supabase } = await updateSession(request);
  const path = request.nextUrl.pathname;
  const switchMode = request.nextUrl.searchParams.get("switch") === "1";

  const isProtected = protectedPrefixes.some((p) => path === p || path.startsWith(`${p}/`));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if ((path === "/login" || path === "/signup") && user && !switchMode) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  const requiresActiveSubscription =
    path === "/generate" || path.startsWith("/generate/");
  if (requiresActiveSubscription && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, subscription_status, expiry_date")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.plan === "BASIC") {
      return supabaseResponse;
    }

    const isActive = profile?.subscription_status === "active";
    const isExpired = !profile?.expiry_date || new Date(profile.expiry_date) <= new Date();

    if (!isActive || isExpired) {
      const url = request.nextUrl.clone();
      url.pathname = "/pricing";
      url.searchParams.set("required", "subscription");
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
