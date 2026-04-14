"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
          fullName: fullName.trim(),
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        toast.error(payload.error ?? "Unable to create account");
        return;
      }

      // Skip immediate auto-login to avoid transient invalid-credential race.
      toast.success("Account created successfully. Please sign in.");
      router.push(`/login?email=${encodeURIComponent(normalizedEmail)}`);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Signup failed. Check Supabase configuration and network.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-12 sm:px-6 sm:py-16">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-12 top-12 -z-10 h-36 w-36 rounded-full bg-fuchsia-500/30 blur-3xl"
        animate={{ x: [0, 24, -16, 0], y: [0, -14, 10, 0], opacity: [0.28, 0.5, 0.32, 0.28] }}
        transition={{ duration: 8.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-14 bottom-10 -z-10 h-44 w-44 rounded-full bg-violet-500/28 blur-3xl"
        animate={{ x: [0, -22, 16, 0], y: [0, 20, -10, 0], opacity: [0.24, 0.46, 0.3, 0.24] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[34px]">
        <Image
          src="/images/hero-product-2.svg"
          alt=""
          fill
          className="object-cover opacity-20"
          sizes="100vw"
          priority
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8 shadow-card"
      >
        <div className="mb-6 space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create your workspace</h1>
          <p className="text-sm text-muted">Start generating descriptions in minutes.</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block space-y-2 text-sm">
            <span className="text-muted">Company / name</span>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name or company"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </label>
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
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </label>
          <Button type="submit" className="mt-2 w-full" disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </Button>
        </form>
        <p className="mt-6 text-center text-xs text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-fuchsia-600 transition-colors hover:text-violet-700">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
