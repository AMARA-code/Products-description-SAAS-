import { createSupabase } from "../lib/supabase";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import tw from "twrnc";

export default function Index() {
  const [state, setState] = useState<"loading" | "in" | "out">("loading");

  useEffect(() => {
    const supabase = createSupabase();
    supabase.auth.getSession().then(({ data }) => {
      setState(data.session ? "in" : "out");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(session ? "in" : "out");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (state === "loading") {
    return (
      <View style={tw`flex-1 items-center justify-center bg-[#07080c]`}>
        <ActivityIndicator color="#a5b4fc" />
      </View>
    );
  }

  if (state === "out") {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
