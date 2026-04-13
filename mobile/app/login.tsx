import { createSupabase } from "../lib/supabase";
import { MotiView } from "moti";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import tw from "twrnc";

export default function LoginScreen() {
  const supabase = useMemo(() => createSupabase(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={tw`flex-1 bg-[#07080c] px-6 justify-center`}
    >
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 350 }}
        style={tw`rounded-3xl border border-white/10 bg-white/5 p-6`}
      >
        <Text style={tw`text-center text-2xl font-semibold text-white`}>Welcome back</Text>
        <Text style={tw`mt-2 text-center text-sm text-[#8b8fa3]`}>
          Sign in to Describeflow
        </Text>

        <View style={tw`mt-6 gap-3`}>
          <Text style={tw`text-xs text-[#8b8fa3]`}>Email</Text>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholder="you@company.com"
            placeholderTextColor="#6b7280"
            style={tw`rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white`}
          />
          <Text style={tw`text-xs text-[#8b8fa3]`}>Password</Text>
          <TextInput
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#6b7280"
            style={tw`rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white`}
          />
        </View>

        {error ? <Text style={tw`mt-3 text-center text-sm text-red-400`}>{error}</Text> : null}

        <Pressable
          onPress={onSubmit}
          disabled={loading}
          style={tw`mt-6 items-center rounded-2xl bg-indigo-500 py-3 active:opacity-90`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={tw`text-sm font-semibold text-white`}>Sign in</Text>
          )}
        </Pressable>
      </MotiView>
    </KeyboardAvoidingView>
  );
}
