"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TypingText } from "@/components/ui/typing-text";
import { Copy, Loader2, Wand2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Usage = {
  used: number;
  limit: number;
  remaining: number;
  plan: string;
  planType?: string;
  planStartedAt?: string | null;
};

export default function GeneratePage() {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [features, setFeatures] = useState("");
  const [wordLimit, setWordLimit] = useState("180");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [limitHit, setLimitHit] = useState(false);
  const [copying, setCopying] = useState(false);
  const [usage, setUsage] = useState<Usage | null>(null);

  const usagePct = useMemo(() => {
    const limit = usage?.limit ?? 0;
    if (limit <= 0) return 0;
    return Math.min(100, Math.round(((usage?.used ?? 0) / limit) * 100));
  }, [usage]);

  const canSubmit = productName.trim().length > 0;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/usage");
        if (!res.ok) return;
        const data = (await res.json()) as Usage;
        if (!cancelled) setUsage(data);
      } catch {
        if (!cancelled) setUsage(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async () => {
    if (!canSubmit) {
      toast.error("Enter a product name.");
      return;
    }
    setLoading(true);
    setResult(null);
    setLimitHit(false);
    try {
      const parsedWordLimit = Number(wordLimit);
      if (!Number.isFinite(parsedWordLimit)) {
        toast.error("Enter a valid word limit.");
        return;
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "text",
          productName: productName.trim(),
          category: category.trim() || undefined,
          features: features.trim() || undefined,
          wordLimit: parsedWordLimit,
        }),
      });

      const payload = await res.json();
      if (res.status === 402) {
        if (payload?.error === "subscription_required") {
          toast.error("Active subscription required. Please subscribe to continue.");
        } else {
          setLimitHit(true);
          toast.error("Monthly limit reached. Please upgrade.");
        }
        return;
      }
      if (!res.ok) {
        throw new Error(payload.error ?? "Request failed");
      }

      const description = String(payload.description ?? "");
      setResult(description);
      if (payload?.usage?.used !== undefined && payload?.usage?.limit !== undefined) {
        const used = Number(payload.usage.used);
        const limit = Number(payload.usage.limit);
        setUsage({
          used,
          limit,
          remaining: Math.max(0, limit - used),
          plan: usage?.plan ?? "",
          planType: usage?.planType,
          planStartedAt: usage?.planStartedAt ?? null,
        });
      }
      toast.success("SEO description generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-semibold tracking-tight"
        >
          Generate SEO Description
        </motion.h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Enter product details to generate an SEO-friendly description, meta title, meta
          description, and keyword list.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-white/60 px-3 py-1 text-xs text-muted dark:bg-[#121938]">
          <span className="font-medium text-foreground">
            Usage: {usage?.used ?? 0}/{usage?.limit ?? 0}
          </span>
          <span>Remaining: {usage?.remaining ?? 0}</span>
          {usage?.planStartedAt && <span>Cycle start: {usage.planStartedAt.slice(0, 10)}</span>}
        </div>
        <div className="mt-3 h-2 w-full max-w-md overflow-hidden rounded-full bg-white/20 dark:bg-[#111733]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
            initial={{ width: 0 }}
            animate={{ width: `${usagePct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="glass rounded-2xl p-6 shadow-card">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="text-muted">Product name</span>
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. iPhone 15 Pro case"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition focus:border-indigo-400/60 focus:ring-2 focus:ring-[var(--ring)]"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-muted">Category / type</span>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Phone accessories"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition focus:border-indigo-400/60 focus:ring-2 focus:ring-[var(--ring)]"
            />
          </label>
        </div>

        <label className="mt-4 block space-y-2 text-sm">
          <span className="text-muted">Product features (optional)</span>
          <textarea
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
            placeholder="e.g. MagSafe compatible, shockproof edges, anti-yellow TPU, camera lip protection"
            rows={4}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition focus:border-indigo-400/60 focus:ring-2 focus:ring-[var(--ring)]"
          />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="text-muted">Word limit</span>
            <input
              type="number"
              min={60}
              max={400}
              step={1}
              value={wordLimit}
              onChange={(e) => setWordLimit(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition focus:border-indigo-400/60 focus:ring-2 focus:ring-[var(--ring)]"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-muted">
            Features are optional. Add them only when you want more targeted SEO copy.
          </div>
          <Button
            type="button"
            onClick={submit}
            disabled={loading || !canSubmit}
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Generate SEO description
              </>
            )}
          </Button>
        </div>
      </div>

      {limitHit && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl border border-amber-500/25 bg-amber-500/10 p-5"
        >
          <div className="text-sm font-medium text-amber-100">You have reached your monthly limit.</div>
          <p className="mt-1 text-sm text-amber-100/80">
            Upgrade your workspace to keep generating descriptions without interruption.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/pricing">
              <Button size="sm">View plans</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Back to dashboard
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

      <div className="glass rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-medium">Result</div>
          {result && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={copying}
              onClick={async () => {
                try {
                  setCopying(true);
                  await navigator.clipboard.writeText(result);
                  toast.success("Copied full description");
                } catch {
                  toast.error("Unable to copy text");
                } finally {
                  setCopying(false);
                }
              }}
            >
              <Copy className="h-3.5 w-3.5" />
              {copying ? "Copying..." : "Copy description"}
            </Button>
          )}
        </div>
        <div className="mt-4 min-h-[140px] text-sm leading-relaxed text-foreground/90">
          {loading && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-10/12" />
            </div>
          )}
          {!loading && result && <TypingText text={result} />}
          {!loading && !result && (
            <p className="text-sm text-muted">
              Your SEO-ready product content will appear here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
