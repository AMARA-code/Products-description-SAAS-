import { createSupabase } from "./supabase";

export function getTokenGetter(supabase: ReturnType<typeof createSupabase>) {
  return async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  };
}
