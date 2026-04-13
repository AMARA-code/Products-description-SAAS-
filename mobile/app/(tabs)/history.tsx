import { fetchHistory } from "../../lib/api";
import { createSupabase } from "../../lib/supabase";
import { getTokenGetter } from "../../lib/session";
import { MotiView } from "moti";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import tw from "twrnc";

type Item = {
  id: string;
  title: string | null;
  source_type: "image" | "text";
  product_name: string | null;
  category: string | null;
  description: string;
  created_at: string;
};

export default function HistoryTab() {
  const supabase = useMemo(() => createSupabase(), []);
  const getToken = useMemo(() => getTokenGetter(supabase), [supabase]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchHistory(getToken, { limit: 50 });
      setItems((data.items ?? []) as Item[]);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScrollView
      contentContainerStyle={tw`gap-4 p-6 pb-16`}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
          tintColor="#a5b4fc"
        />
      }
    >
      <Text style={tw`text-3xl font-semibold text-white`}>History</Text>
      <Text style={tw`text-sm text-[#8b8fa3]`}>Saved generations from your account.</Text>

      {loading ? (
        <ActivityIndicator color="#a5b4fc" />
      ) : items.length === 0 ? (
        <Text style={tw`text-sm text-[#8b8fa3]`}>No items yet.</Text>
      ) : (
        items.map((it, idx) => (
          <MotiView
            key={it.id}
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: idx * 20 }}
            style={tw`rounded-2xl border border-white/10 bg-white/5 p-4`}
          >
            <Text style={tw`text-xs text-[#8b8fa3]`}>
              {new Date(it.created_at).toLocaleString()} · {it.source_type}
            </Text>
            <Text style={tw`mt-2 text-base font-semibold text-white`}>
              {it.title || it.product_name || "Untitled"}
            </Text>
            <Text style={tw`mt-3 text-sm leading-6 text-white/90`}>{it.description}</Text>
          </MotiView>
        ))
      )}
    </ScrollView>
  );
}
