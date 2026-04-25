"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
      const baseUrl = appUrl && appUrl.length > 0 ? appUrl : window.location.origin;
      const redirectTo = `${baseUrl.replace(/\/$/, "")}/reset-password?email=${encodeURIComponent(normalizedEmail)}`;

      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Password reset link sent. Check your email.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to send reset email. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
      <div className="pointer-events-none absolute inset-2 -z-10 overflow-hidden rounded-[34px]">
        <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_0%_0%,color-mix(in_srgb,var(--accent)_13%,transparent)_0%,transparent_48%),radial-gradient(120%_100%_at_100%_100%,color-mix(in_srgb,var(--accent-2)_13%,transparent)_0%,transparent_52%),linear-gradient(160deg,color-mix(in_srgb,var(--card)_95%,transparent),color-mix(in_srgb,var(--card-2)_82%,transparent))]" />
      </div>
      <div className="pointer-events-none absolute inset-2 -z-10 hidden overflow-hidden rounded-[34px] dark:block">
        <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_0%_0%,color-mix(in_srgb,var(--accent-3)_16%,transparent)_0%,transparent_48%),radial-gradient(120%_100%_at_100%_100%,color-mix(in_srgb,var(--accent)_16%,transparent)_0%,transparent_52%),linear-gradient(160deg,color-mix(in_srgb,var(--card)_92%,transparent),color-mix(in_srgb,var(--card-2)_80%,transparent))]" />
      </div>
      <div className="glass mx-auto w-full max-w-2xl rounded-2xl p-8 shadow-card sm:p-10">
        <div className="mb-6 space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
          <p className="text-sm text-muted">We’ll email you a secure reset link.</p>
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

          <Button type="submit" className="mt-2 w-full" disabled={loading}>
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          Remembered it?{" "}
          <Link
            href="/login"
            className="transition-colors hover:text-[color-mix(in_srgb,var(--accent)_72%,var(--foreground))]"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

