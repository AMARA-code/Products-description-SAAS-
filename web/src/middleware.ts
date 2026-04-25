import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { ADMIN_EMAIL } from "@/lib/adminAccess";

const authProtectedPrefixes = ["/dashboard", "/generate", "/history", "/settings"];

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const path = request.nextUrl.pathname;
  const switchMode = request.nextUrl.searchParams.get("switch") === "1";

  const isAuthProtected = authProtectedPrefixes.some((p) => path === p || path.startsWith(`${p}/`));
  const isAdminRoute = path === "/admin/payments" || path.startsWith("/admin/payments/");

  if (isAuthProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (isAdminRoute) {
    if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  if ((path === "/login" || path === "/signup") && user && !switchMode) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
