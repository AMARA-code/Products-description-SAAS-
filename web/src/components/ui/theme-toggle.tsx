"use client";

import { useTheme } from "@/components/theme-provider";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const Icon = theme === "dark" ? Sun : Moon;
  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-xl border border-[color-mix(in_srgb,var(--border)_80%,transparent)] bg-card text-foreground transition hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
