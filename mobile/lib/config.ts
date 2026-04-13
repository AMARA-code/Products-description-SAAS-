import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra as
  | { apiUrl?: string; supabaseUrl?: string; supabaseAnon?: string }
  | undefined;

export const apiUrl =
  process.env.EXPO_PUBLIC_API_URL ??
  extra?.apiUrl ??
  "http://localhost:3000";

export const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? extra?.supabaseUrl ?? "";

export const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? extra?.supabaseAnon ?? "";
