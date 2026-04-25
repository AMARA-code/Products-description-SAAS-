"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Usage = {
  month: string;
  used: number;
  limit: number;
  remaining: number;
  plan: string;
  planStartedAt?: string | null;
  subscriptionAllowed?: boolean;
  planType?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/usage");
        if (!res.ok) throw new Error("Failed to load usage");
        const data = (await res.json()) as Usage;
        if (data.subscriptionAllowed === false && data.planType !== "basic") {
          router.replace("/pricing");
          return;
        }
        if (!cancelled) setUsage(data);
      } catch {
        if (!cancelled) setUsage(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const pct =
    usage && usage.limit > 0
      ? Math.min(100, Math.round((usage.used / usage.limit) * 100))
      : 0;

  const usageResetLabel = useMemo(() => {
    if (!usage?.planStartedAt) return "Resets monthly based on your plan start date.";

    const planStarted = new Date(usage.planStartedAt);
    if (Number.isNaN(planStarted.getTime())) {
      return "Resets monthly based on your plan start date.";
    }

    const nextReset = new Date(planStarted);
    nextReset.setUTCMonth(nextReset.getUTCMonth() + 1);
    return `Resets on ${nextReset.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    })} (UTC).`;
  }, [usage?.planStartedAt]);

  return (
    <div className="relative mx-auto max-w-5xl space-y-8 overflow-hidden rounded-3xl border border-violet-400/20 bg-white/35 p-4 sm:p-6 sm:space-y-10 dark:border-violet-300/20 dark:bg-[#0f1d44]/70">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-14 top-10 -z-10 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl dark:opacity-40"
        animate={{ x: [0, 18, -14, 0], y: [0, -16, 10, 0], opacity: [0.35, 0.6, 0.42, 0.35] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-0 top-24 -z-10 h-44 w-44 rounded-full bg-cyan-400/18 blur-3xl dark:opacity-35"
        animate={{ x: [0, -14, 12, 0], y: [0, 14, -12, 0], opacity: [0.28, 0.5, 0.34, 0.28] }}
        transition={{ duration: 12.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="space-y-2 sm:space-y-3">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-semibold tracking-tight sm:text-4xl"
        >
          Dashboard
        </motion.h1>
        <p className="max-w-2xl text-sm text-muted">
          Monitor monthly usage, remaining credits, and jump back into generation.
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.55, ease: "easeOut" }}
          whileHover={{ y: -4, scale: 1.01 }}
          className="glass rounded-2xl p-5 sm:p-6 shadow-card"
        >
          <div className="text-xs uppercase tracking-wide text-muted">
            Current plan
          </div>
          <div className="mt-2 text-xl font-semibold capitalize sm:text-2xl">
            {loading ? <Skeleton className="h-8 w-24" /> : usage?.plan ?? "—"}
          </div>
          <Link
            href="/pricing"
            className="mt-4 inline-flex items-center gap-1 text-xs text-indigo-300 hover:text-indigo-200"
          >
            View plans <ArrowRight className="h-3 w-3" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.58, ease: "easeOut" }}
          whileHover={{ y: -4, scale: 1.005 }}
          className="glass rounded-2xl p-5 sm:p-6 shadow-card md:col-span-2"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted">
                Monthly usage
              </div>
              <div className="mt-2 text-sm text-muted">
                {usageResetLabel}
              </div>
            </div>
            <div className="text-right">
              {loading ? (
                <Skeleton className="ml-auto h-8 w-28" />
              ) : (
                <>
                  <div className="text-xl font-semibold tabular-nums sm:text-2xl">
                    {usage?.used ?? 0}{" "}
                    <span className="text-base font-normal text-muted">
                      / {usage?.limit ?? 0}
                    </span>
                  </div>
                  <div className="text-xs text-muted">
                    {usage?.remaining ?? 0} remaining
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-fuchsia-500"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.55, ease: "easeOut" }}
        whileHover={{ y: -4, scale: 1.005 }}
        className="glass flex flex-col items-start justify-between gap-4 rounded-2xl p-5 sm:p-6 shadow-card sm:flex-row sm:items-center"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-indigo-300" />
            Ready for your next listing?
          </div>
          <p className="text-sm text-muted">
            Upload a hero shot or enter a product name — we will craft a polished description.
          </p>
        </div>
        <Link href="/generate">
          <Button size="lg" className="w-full gap-2 sm:w-auto">
            Generate <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
