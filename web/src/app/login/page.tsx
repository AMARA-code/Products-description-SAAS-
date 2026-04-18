"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

function LoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") ?? "/dashboard";
  const emailFromQuery = search.get("email") ?? "";
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (emailFromQuery) setEmail(emailFromQuery);
  }, [emailFromQuery]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (error) {
        const normalized = error.message.toLowerCase();
        if (normalized.includes("invalid login credentials")) {
          toast.error("Incorrect password.");
        } else {
          toast.error(error.message);
        }
        return;
      }
      router.push(next);
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Login failed. Check Supabase URL/anon key and network.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
      <div className="pointer-events-none absolute inset-2 -z-10 overflow-hidden rounded-[34px]">
        <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_0%_0%,color-mix(in_srgb,var(--accent)_15%,transparent)_0%,transparent_48%),radial-gradient(120%_100%_at_100%_100%,color-mix(in_srgb,var(--accent-3)_14%,transparent)_0%,transparent_52%),linear-gradient(160deg,color-mix(in_srgb,var(--card)_95%,transparent),color-mix(in_srgb,var(--card-2)_82%,transparent))]" />
      </div>
      <div className="pointer-events-none absolute inset-2 -z-10 hidden overflow-hidden rounded-[34px] dark:block">
        <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_0%_0%,color-mix(in_srgb,var(--accent)_18%,transparent)_0%,transparent_48%),radial-gradient(120%_100%_at_100%_100%,color-mix(in_srgb,var(--accent-2)_18%,transparent)_0%,transparent_52%),linear-gradient(160deg,color-mix(in_srgb,var(--card)_92%,transparent),color-mix(in_srgb,var(--card-2)_80%,transparent))]" />
      </div>
      <div className="glass mx-auto w-full max-w-2xl rounded-2xl p-8 shadow-card sm:p-10">
        <div className="mb-6 space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted">Sign in to your Describeflow workspace.</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block space-y-2 text-sm">
            <span className="text-muted">Email</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </label>
          <label className="block space-y-2 text-sm">
            <span className="text-muted">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </label>
          <Button type="submit" className="mt-2 w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Link
            href="/forgot-password"
            className="text-xs text-muted transition-colors hover:text-[color-mix(in_srgb,var(--accent)_72%,var(--foreground))]"
          >
            Forgot password?
          </Link>
        </div>
        <p className="mt-6 text-center text-xs text-muted">
          No account?{" "}
          <Link
            href="/signup"
            className="transition-colors hover:text-[color-mix(in_srgb,var(--accent)_72%,var(--foreground))]"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
