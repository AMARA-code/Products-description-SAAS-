import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { checkSubscription } from "@/lib/subscriptionService";

const authProtectedPrefixes = ["/dashboard", "/generate", "/history", "/settings"];
const subscriptionProtectedPrefixes = ["/generate", "/history"];

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user, supabase } = await updateSession(request);
  const path = request.nextUrl.pathname;
  const switchMode = request.nextUrl.searchParams.get("switch") === "1";

  const isAuthProtected = authProtectedPrefixes.some((p) => path === p || path.startsWith(`${p}/`));
  const isSubscriptionProtected = subscriptionProtectedPrefixes.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );

  if (isAuthProtected && !user) {
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

  if (isSubscriptionProtected && user) {
    const subscription = await checkSubscription(supabase, user.id);
    if (!subscription.allowed) {
      const url = request.nextUrl.clone();
      url.pathname = "/pricing";
      url.searchParams.set("required", "subscription");
      if (subscription.reason) {
        url.searchParams.set("reason", subscription.reason);
      }
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
