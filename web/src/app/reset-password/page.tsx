"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function validatePassword(password: string) {
  if (password.length < 8) return "Password must be at least 8 characters.";
  return null;
}

export default function ResetPasswordPage() {
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Prevent using a stale signed-in session from another account.
        await supabase.auth.signOut({ scope: "local" });

        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const tokenHash = params.get("token_hash");
        const otpType = params.get("type");
        const expectedEmail = params.get("email")?.trim().toLowerCase() ?? null;
        if (code) {
          const { error: codeError } = await supabase.auth.exchangeCodeForSession(code);
          if (codeError) {
            if (!cancelled) toast.error(codeError.message);
            if (!cancelled) setReady(false);
            return;
          }
          window.history.replaceState(null, "", window.location.pathname);
        }

        if (tokenHash && otpType === "recovery") {
          const { error: otpError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "recovery",
          });
          if (otpError) {
            if (!cancelled) toast.error(otpError.message);
            if (!cancelled) setReady(false);
            return;
          }
          window.history.replaceState(null, "", window.location.pathname);
        }

        // Explicitly hydrate recovery session from hash tokens when present.
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");

        if (accessToken && refreshToken && (!type || type === "recovery")) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) {
            if (!cancelled) toast.error(sessionError.message);
            if (!cancelled) setReady(false);
            return;
          }

          // Remove sensitive tokens from the URL after they are consumed.
          window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
        }

        const { data: userData } = await supabase.auth.getUser();
        if (!cancelled) {
          const recoveredEmail = userData.user?.email?.toLowerCase() ?? null;
          const emailMatches = !expectedEmail || expectedEmail === recoveredEmail;
          setReady(Boolean(userData.user) && emailMatches);
          setRecoveryEmail(userData.user?.email ?? null);
          if (userData.user && !emailMatches) {
            toast.error("This reset link is for a different email. Request a new link.");
          }
        }
      } catch {
        if (!cancelled) setReady(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const err = validatePassword(password);
    if (err) {
      toast.error(err);
      return;
    }

    if (password !== password.trim() || confirm !== confirm.trim()) {
      toast.error("Passwords cannot start or end with spaces.");
      return;
    }

    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        toast.error("This reset link is invalid or expired. Request a new link.");
        setReady(false);
        return;
      }
      const expectedEmail = new URLSearchParams(window.location.search).get("email")?.trim().toLowerCase();
      if (expectedEmail && authData.user.email?.toLowerCase() !== expectedEmail) {
        toast.error("This reset link is for a different email. Request a new link.");
        setReady(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(error.message);
        return;
      }
      await supabase.auth.signOut({ scope: "local" });
      toast.success("Password updated. You can sign in now.");
      const next = authData.user.email
        ? `/login?email=${encodeURIComponent(authData.user.email)}`
        : "/login";
      window.location.href = next;
    } catch (e2) {
      const message =
        e2 instanceof Error ? e2.message : "Unable to update password. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
      <div className="pointer-events-none absolute inset-2 -z-10 overflow-hidden rounded-[34px]">
        <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_0%_0%,color-mix(in_srgb,var(--accent-3)_13%,transparent)_0%,transparent_48%),radial-gradient(120%_100%_at_100%_100%,color-mix(in_srgb,var(--accent)_13%,transparent)_0%,transparent_52%),linear-gradient(160deg,color-mix(in_srgb,var(--card)_95%,transparent),color-mix(in_srgb,var(--card-2)_82%,transparent))]" />
      </div>
      <div className="pointer-events-none absolute inset-2 -z-10 hidden overflow-hidden rounded-[34px] dark:block">
        <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_0%_0%,color-mix(in_srgb,var(--accent)_16%,transparent)_0%,transparent_48%),radial-gradient(120%_100%_at_100%_100%,color-mix(in_srgb,var(--accent-2)_16%,transparent)_0%,transparent_52%),linear-gradient(160deg,color-mix(in_srgb,var(--card)_92%,transparent),color-mix(in_srgb,var(--card-2)_80%,transparent))]" />
      </div>
      <div className="glass mx-auto w-full max-w-2xl rounded-2xl p-8 shadow-card sm:p-10">
        <div className="mb-6 space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Choose a new password</h1>
          <p className="text-sm text-muted">
            Use a strong password you don&apos;t reuse elsewhere.
            {recoveryEmail ? ` Resetting for ${recoveryEmail}.` : ""}
          </p>
        </div>

        {!ready ? (
          <div className="rounded-2xl border border-[color-mix(in_srgb,var(--border)_70%,transparent)] bg-card p-4 text-sm text-muted">
            This link may be invalid or expired. Please request a new reset link.
            <div className="mt-3">
              <Link
                href="/forgot-password"
                className="text-sm transition-colors hover:text-[color-mix(in_srgb,var(--accent)_72%,var(--foreground))]"
              >
                Request a new link
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block space-y-2 text-sm">
              <span className="text-muted">New password</span>
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </label>
            <label className="block space-y-2 text-sm">
              <span className="text-muted">Confirm password</span>
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter password"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </label>

            <Button type="submit" className="mt-2 w-full" disabled={loading}>
              {loading ? "Updating…" : "Update password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

