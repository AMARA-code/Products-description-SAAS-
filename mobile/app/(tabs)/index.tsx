import { fetchUsage } from "../../lib/api";
import { createSupabase } from "../../lib/supabase";
import { getTokenGetter } from "../../lib/session";
import { MotiView } from "moti";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import tw from "twrnc";

type Usage = {
  month: string;
  used: number;
  limit: number;
  remaining: number;
  plan: string;
};

export default function DashboardTab() {
  const supabase = useMemo(() => createSupabase(), []);
  const getToken = useMemo(() => getTokenGetter(supabase), [supabase]);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = (await fetchUsage(getToken)) as Usage;
      setUsage(data);
    } catch {
      setUsage(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  const pct =
    usage && usage.limit > 0
      ? Math.min(100, Math.round((usage.used / usage.limit) * 100))
      : 0;

  return (
    <ScrollView
      contentContainerStyle={tw`gap-6 p-6 pb-12`}
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
      <View style={tw`flex-row items-start justify-between gap-4`}>
        <View style={tw`flex-1`}>
          <Text style={tw`text-3xl font-semibold text-white`}>Dashboard</Text>
          <Text style={tw`mt-2 text-sm text-[#8b8fa3]`}>
            Usage resets monthly (UTC). Pull to refresh.
          </Text>
        </View>
        <Pressable
          onPress={async () => {
            await supabase.auth.signOut();
            router.replace("/login");
          }}
          style={tw`rounded-full border border-white/10 bg-white/5 px-3 py-2`}
        >
          <Text style={tw`text-xs text-[#8b8fa3]`}>Sign out</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color="#a5b4fc" />
      ) : (
        <>
          <MotiView
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={tw`rounded-3xl border border-white/10 bg-white/5 p-5`}
          >
            <Text style={tw`text-xs uppercase tracking-wide text-[#8b8fa3]`}>
              Current plan
            </Text>
            <Text style={tw`mt-2 text-2xl font-semibold capitalize text-white`}>
              {usage?.plan ?? "—"}
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 50 }}
            style={tw`rounded-3xl border border-white/10 bg-white/5 p-5`}
          >
            <View style={tw`flex-row items-center justify-between`}>
              <Text style={tw`text-xs uppercase tracking-wide text-[#8b8fa3]`}>
                Monthly usage
              </Text>
              <Text style={tw`text-lg font-semibold text-white`}>
                {usage?.used ?? 0}{" "}
                <Text style={tw`text-sm font-normal text-[#8b8fa3]`}>
                  / {usage?.limit ?? 0}
                </Text>
              </Text>
            </View>
            <View style={tw`mt-4 h-2 overflow-hidden rounded-full bg-white/10`}>
              <View
                style={[tw`h-full rounded-full bg-indigo-500`, { width: `${pct}%` }]}
              />
            </View>
            <Text style={tw`mt-3 text-xs text-[#8b8fa3]`}>
              {usage?.remaining ?? 0} remaining · {usage?.month}
            </Text>
          </MotiView>

          <Pressable
            onPress={() => router.push("/generate")}
            style={tw`items-center rounded-2xl bg-indigo-500 py-4 active:opacity-90`}
          >
            <Text style={tw`text-sm font-semibold text-white`}>Generate description</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}
