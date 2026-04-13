import { postGenerate } from "../../lib/api";
import { createSupabase } from "../../lib/supabase";
import { getTokenGetter } from "../../lib/session";
import * as ImagePicker from "expo-image-picker";
import { MotiView } from "moti";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import tw from "twrnc";

type Mode = "text" | "image";

export default function GenerateTab() {
  const supabase = useMemo(() => createSupabase(), []);
  const getToken = useMemo(() => getTokenGetter(supabase), [supabase]);
  const [mode, setMode] = useState<Mode>("text");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [limitHit, setLimitHit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError("Photo library permission is required.");
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      base64: true,
    });
    if (picked.canceled || !picked.assets[0]) return;
    const asset = picked.assets[0];
    setMimeType(asset.mimeType ?? "image/jpeg");
    setImageBase64(asset.base64 ?? null);
    setError(null);
  };

  const submit = async () => {
    setError(null);
    setLimitHit(false);
    setResult(null);

    if (mode === "text" && !productName.trim()) {
      setError("Enter a product name.");
      return;
    }
    if (mode === "image" && !imageBase64) {
      setError("Pick a product image.");
      return;
    }

    setLoading(true);
    try {
      const body =
        mode === "text"
          ? {
              mode: "text" as const,
              productName: productName.trim(),
              category: category.trim() || undefined,
            }
          : {
              mode: "image" as const,
              imageBase64,
              mimeType: mimeType ?? "image/jpeg",
              productName: productName.trim() || undefined,
              category: category.trim() || undefined,
            };

      const { res, data } = await postGenerate(getToken, body);
      if (res.status === 402) {
        setLimitHit(true);
        setError("Monthly limit reached.");
        return;
      }
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Request failed");
        return;
      }
      setResult((data as { description?: string }).description ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={tw`gap-5 p-6 pb-16`}>
      <Text style={tw`text-3xl font-semibold text-white`}>Generate</Text>
      <Text style={tw`text-sm text-[#8b8fa3]`}>
        Text mode requires a product name. Image mode requires a photo.
      </Text>

      <View style={tw`flex-row rounded-2xl bg-black/30 p-1`}>
        <Pressable
          onPress={() => setMode("text")}
          style={tw`flex-1 rounded-xl py-2 ${mode === "text" ? "bg-white/10" : ""}`}
        >
          <Text style={tw`text-center text-sm text-white`}>Name + category</Text>
        </Pressable>
        <Pressable
          onPress={() => setMode("image")}
          style={tw`flex-1 rounded-xl py-2 ${mode === "image" ? "bg-white/10" : ""}`}
        >
          <Text style={tw`text-center text-sm text-white`}>Image</Text>
        </Pressable>
      </View>

      {mode === "text" ? (
        <View style={tw`gap-3`}>
          <Text style={tw`text-xs text-[#8b8fa3]`}>Product name</Text>
          <TextInput
            value={productName}
            onChangeText={setProductName}
            placeholder="Aurora Trail Shell"
            placeholderTextColor="#6b7280"
            style={tw`rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white`}
          />
          <Text style={tw`text-xs text-[#8b8fa3]`}>Category / type</Text>
          <TextInput
            value={category}
            onChangeText={setCategory}
            placeholder="Waterproof jacket"
            placeholderTextColor="#6b7280"
            style={tw`rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white`}
          />
        </View>
      ) : (
        <View style={tw`gap-4`}>
          <Pressable
            onPress={pickImage}
            style={tw`items-center rounded-2xl border border-dashed border-white/20 py-10`}
          >
            <Text style={tw`text-sm text-white`}>Tap to choose an image</Text>
            <Text style={tw`mt-1 text-xs text-[#8b8fa3]`}>Library access required</Text>
          </Pressable>
          {imageBase64 ? (
            <Image
              source={{ uri: `data:${mimeType ?? "image/jpeg"};base64,${imageBase64}` }}
              style={tw`h-56 w-full rounded-2xl bg-black/40`}
              resizeMode="contain"
            />
          ) : null}
          <Text style={tw`text-xs text-[#8b8fa3]`}>Optional hints</Text>
          <TextInput
            value={productName}
            onChangeText={setProductName}
            placeholder="Product name (optional)"
            placeholderTextColor="#6b7280"
            style={tw`rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white`}
          />
          <TextInput
            value={category}
            onChangeText={setCategory}
            placeholder="Category (optional)"
            placeholderTextColor="#6b7280"
            style={tw`rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white`}
          />
        </View>
      )}

      {error ? <Text style={tw`text-sm text-red-400`}>{error}</Text> : null}

      {limitHit ? (
        <MotiView
          from={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          style={tw`rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4`}
        >
          <Text style={tw`text-sm font-medium text-amber-100`}>
            Limit reached — upgrade on the web app billing page.
          </Text>
        </MotiView>
      ) : null}

      <Pressable
        onPress={submit}
        disabled={loading}
        style={tw`items-center rounded-2xl bg-indigo-500 py-4 active:opacity-90`}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={tw`text-sm font-semibold text-white`}>Generate</Text>
        )}
      </Pressable>

      {result ? (
        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={tw`rounded-2xl border border-white/10 bg-white/5 p-4`}
        >
          <Text style={tw`text-xs uppercase tracking-wide text-[#8b8fa3]`}>Result</Text>
          <Text style={tw`mt-3 text-sm leading-6 text-white`}>{result}</Text>
        </MotiView>
      ) : null}
    </ScrollView>
  );
}
