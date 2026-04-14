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

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100);
  const offset = Math.max(Number(searchParams.get("offset") ?? 0), 0);

  const { data, error } = await supabase
    .from("generations")
    .select(
      "id, title, source_type, product_name, category, image_url, description, created_at",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const deduped = (data ?? []).filter((item, idx, arr) => {
    const key = [
      item.title ?? "",
      item.product_name ?? "",
      item.category ?? "",
      item.description ?? "",
    ].join("|");
    const firstIndex = arr.findIndex((x) => {
      const xKey = [
        x.title ?? "",
        x.product_name ?? "",
        x.category ?? "",
        x.description ?? "",
      ].join("|");
      return xKey === key;
    });
    return firstIndex === idx;
  });

  // Hide the oldest legacy item (pre-tracker era) so history aligns with tracked usage.
  const withoutLegacyFirst = deduped.length > 0 ? deduped.slice(0, -1) : deduped;

  return NextResponse.json({ items: withoutLegacyFirst });
}
