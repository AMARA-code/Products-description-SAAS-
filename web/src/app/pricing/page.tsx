"use client";

import { Button } from "@/components/ui/button";
import { isPaidPlan, PLANS, type PlanSlug } from "@/lib/plans";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { Check, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function PricingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<{ id: string } | null | undefined>(undefined);
  const [loadingPlan, setLoadingPlan] = useState<PlanSlug | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!cancelled) setUser(data.user ? { id: data.user.id } : null);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const checkout = async (plan: PlanSlug) => {
    if (!isPaidPlan(plan) && !user) {
      router.push(`/login?next=${encodeURIComponent("/generate")}`);
      return;
    }

    if (!user) {
      router.push(`/login?next=${encodeURIComponent("/pricing")}`);
      return;
    }

    if (!isPaidPlan(plan)) {
      toast.success("Basic plan is free and already available.");
      router.push("/generate");
      return;
    }

    setLoadingPlan(plan);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        url?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      if (data.url) window.location.href = data.url as string;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-white/80 px-3 py-1 text-xs text-muted">
            <Sparkles className="h-3.5 w-3.5 text-fuchsia-500" />
            Transparent, usage-aware pricing
          </div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Plans for every team</h1>
          <p className="mt-3 max-w-2xl text-muted">
            Monthly billing is powered by PayFast. Plan limits reset every 30 days after successful renewal.
          </p>
        </div>
        <Link href="/signup">
          <Button size="lg">Create account</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {(Object.keys(PLANS) as PlanSlug[]).map((slug, idx) => {
          const p = PLANS[slug];
          const popular = slug === "pro";
          return (
            <motion.div
              key={slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`glass relative rounded-2xl p-7 shadow-card ${
                popular ? "ring-1 ring-fuchsia-500/40" : ""
              }`}
            >
              {popular && (
                <div className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Popular
                </div>
              )}
              <div className="text-sm font-semibold">{p.name}</div>
              <div className="mt-3 text-4xl font-semibold">
                ${p.priceUsd}
                <span className="text-base font-normal text-muted"> / mo</span>
              </div>
              <p className="mt-3 text-sm text-muted">{p.description}</p>
              <ul className="mt-6 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="mt-8 w-full"
                variant={popular ? "primary" : "outline"}
                disabled={loadingPlan !== null || user === undefined}
                onClick={() => checkout(slug)}
              >
                {loadingPlan === slug ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Redirecting…
                  </>
                ) : user === null ? (
                  slug === "basic" ? "Sign in to start free" : "Sign in to subscribe"
                ) : slug === "basic" ? (
                  "Start for free"
                ) : (
                  `Choose ${p.name}`
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
