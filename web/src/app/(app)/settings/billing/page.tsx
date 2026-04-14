"use client";

import { Button } from "@/components/ui/button";
import { isPaidPlan, PLANS, type PlanSlug } from "@/lib/plans";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function BillingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<PlanSlug | null>(null);

  const startCheckout = async (plan: PlanSlug) => {
    if (!isPaidPlan(plan)) {
      toast.success("Basic plan is free. You can start generating now.");
      router.push("/generate");
      return;
    }

    setLoading(plan);
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
      setLoading(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-semibold tracking-tight"
        >
          Billing
        </motion.h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Subscriptions are billed securely through PayFast. Webhook confirmation controls plan
          activation and renewals.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {(Object.keys(PLANS) as PlanSlug[]).map((slug, idx) => {
          const p = PLANS[slug];
          const popular = slug === "pro";
          return (
            <motion.div
              key={slug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`relative glass rounded-2xl p-6 shadow-card ${
                popular ? "ring-1 ring-indigo-400/40" : ""
              }`}
            >
              {popular && (
                <div className="absolute -top-3 left-4 rounded-full bg-indigo-500/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Popular
                </div>
              )}
              <div className="text-sm font-semibold">{p.name}</div>
              <div className="mt-2 text-3xl font-semibold tracking-tight">
                ${p.priceUsd}
                <span className="text-sm font-normal text-muted"> / mo</span>
              </div>
              <p className="mt-3 text-sm text-muted">{p.description}</p>
              <ul className="mt-5 space-y-2 text-sm text-foreground/90">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="mt-6 w-full"
                variant={popular ? "primary" : "outline"}
                disabled={loading !== null}
                onClick={() => startCheckout(slug)}
              >
                {loading === slug ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Redirecting…
                  </>
                ) : (
                  slug === "basic" ? "Start free" : `Subscribe to ${p.name}`
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
