import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseJs } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * Supports browser sessions (cookies) and mobile clients (`Authorization: Bearer`).
 */
export async function createSupabaseForApiRoute(request: Request) {
  const { url, anonKey } = getSupabaseEnv();
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const jwt = auth.slice(7);
    return createSupabaseJs(
      url,
      anonKey,
      {
        global: { headers: { Authorization: `Bearer ${jwt}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      },
    );
  }

  const cookieStore = await cookies();
  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options?: Parameters<typeof cookieStore.set>[2];
          }>,
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // ignore
          }
        },
      },
    },
  );
}
