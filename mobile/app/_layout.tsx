import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#07080c" },
          headerTintColor: "#f4f4f8",
          headerShadowVisible: false,
          contentStyle: { backgroundColor: "#07080c" },
          headerShown: false,
        }}
      />
    </SafeAreaProvider>
  );
}
