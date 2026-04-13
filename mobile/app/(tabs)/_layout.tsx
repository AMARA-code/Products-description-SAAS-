import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#07080c" },
        headerTintColor: "#f4f4f8",
        tabBarStyle: {
          backgroundColor: "#0b0d14",
          borderTopColor: "rgba(255,255,255,0.06)",
        },
        tabBarActiveTintColor: "#a5b4fc",
        tabBarInactiveTintColor: "#6b7280",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="generate"
        options={{
          title: "Generate",
          tabBarIcon: ({ color, size }) => (
            <Feather name="zap" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => (
            <Feather name="clock" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
