"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TypingText } from "@/components/ui/typing-text";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, ImageIcon, Loader2, Type, Wand2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Mode = "text" | "image";
type Usage = {
  used: number;
  limit: number;
  remaining: number;
  plan: string;
};

export default function GeneratePage() {
  const [mode, setMode] = useState<Mode>("text");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
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

  const canSubmit = useMemo(() => {
    if (mode === "text") return productName.trim().length > 0;
    return !!file && !!preview;
  }, [mode, productName, file, preview]);

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

  const onFile = useCallback((f: File | null) => {
    setFile(f);
    setPreview(null);
    setMimeType(f?.type ?? null);
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setPreview(reader.result);
    };
    reader.readAsDataURL(f);
  }, []);

  const submit = async () => {
    if (!canSubmit) {
      toast.error(
        mode === "text"
          ? "Enter a product name."
          : "Add a product image.",
      );
      return;
    }
    setLoading(true);
    setResult(null);
    setLimitHit(false);
    try {
      let body: Record<string, unknown>;
      if (mode === "text") {
        body = {
          mode: "text",
          productName: productName.trim(),
          category: category.trim() || undefined,
        };
      } else {
        const dataUrl = preview!;
        const comma = dataUrl.indexOf(",");
        const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
        body = {
          mode: "image",
          imageBase64: base64,
          mimeType: mimeType ?? "image/jpeg",
          productName: productName.trim() || undefined,
          category: category.trim() || undefined,
        };
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const payload = await res.json();
      if (res.status === 402) {
        if (payload?.error === "subscription_required") {
          toast.error("Active subscription required. Please subscribe to continue.");
        } else {
          setLimitHit(true);
          toast.error("Monthly limit reached. Upgrade to continue.");
        }
        return;
      }
      if (!res.ok) {
        throw new Error(payload.error ?? "Request failed");
      }
      setResult(payload.description as string);
      if (payload?.usage?.used !== undefined && payload?.usage?.limit !== undefined) {
        const used = Number(payload.usage.used);
        const limit = Number(payload.usage.limit);
        setUsage({
          used,
          limit,
          remaining: Math.max(0, limit - used),
          plan: usage?.plan ?? "",
        });
      }
      toast.success("Description generated");
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
          Generate
        </motion.h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Use a crisp product photo or structured fields. At least one path is required before
          generation.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-white/60 px-3 py-1 text-xs text-muted">
          <span className="font-medium text-foreground">
            Usage: {usage?.used ?? 0}/{usage?.limit ?? 0}
          </span>
          <span>Remaining: {usage?.remaining ?? 0}</span>
        </div>
        <div className="mt-3 h-2 w-full max-w-md overflow-hidden rounded-full bg-white/20">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
            initial={{ width: 0 }}
            animate={{ width: `${usagePct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="glass rounded-2xl p-1 shadow-card sm:p-2">
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-black/30 p-1">
          <button
            type="button"
            onClick={() => setMode("text")}
            className={cn(
              "relative flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition",
              mode === "text"
                ? "text-white"
                : "text-muted hover:text-foreground",
            )}
          >
            {mode === "text" && (
              <motion.div
                layoutId="mode"
                className="absolute inset-0 rounded-lg bg-white/[0.08]"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Type className="relative h-4 w-4" />
            <span className="relative">Name + category</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("image")}
            className={cn(
              "relative flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition",
              mode === "image"
                ? "text-white"
                : "text-muted hover:text-foreground",
            )}
          >
            {mode === "image" && (
              <motion.div
                layoutId="mode"
                className="absolute inset-0 rounded-lg bg-white/[0.08]"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <ImageIcon className="relative h-4 w-4" />
            <span className="relative">Image upload</span>
          </button>
        </div>

        <div className="mt-6 space-y-5 p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {mode === "text" ? (
              <motion.div
                key="text"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="grid gap-4 sm:grid-cols-2"
              >
                <label className="space-y-2 text-sm">
                  <span className="text-muted">Product name</span>
                  <input
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Aurora Trail Shell"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none ring-0 transition focus:border-indigo-400/60 focus:ring-2 focus:ring-[var(--ring)]"
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="text-muted">Category / type</span>
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Waterproof jacket"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition focus:border-indigo-400/60 focus:ring-2 focus:ring-[var(--ring)]"
                  />
                </label>
              </motion.div>
            ) : (
              <motion.div
                key="image"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="grid gap-6 lg:grid-cols-2"
              >
                <label className="group relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-gradient-to-b from-white/[0.04] to-transparent px-6 py-10 text-center transition hover:border-indigo-400/40">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                  />
                  <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.06] transition group-hover:scale-105">
                    <ImageIcon className="h-6 w-6 text-indigo-200" />
                  </div>
                  <div className="text-sm font-medium">Drop an image or click to upload</div>
                  <div className="mt-1 text-xs text-muted">PNG, JPG, WEBP up to ~20MB</div>
                </label>
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                    {preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-h-72 w-full object-contain"
                      />
                    ) : (
                      <div className="grid h-64 place-items-center text-xs text-muted">
                        Preview will appear here
                      </div>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-2 text-xs">
                      <span className="text-muted">Optional product name</span>
                      <input
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="e.g. Summit backpack"
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
                      />
                    </label>
                    <label className="space-y-2 text-xs">
                      <span className="text-muted">Optional category</span>
                      <input
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="e.g. Travel gear"
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
                      />
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted">
              {mode === "text"
                ? "Requires product name. Category sharpens tone and keywords."
                : "Requires image. Name/category are optional hints."}
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
                  Generate description
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {limitHit && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="glass rounded-2xl border border-amber-500/25 bg-amber-500/10 p-5"
          >
            <div className="text-sm font-medium text-amber-100">
              You have reached your monthly limit.
            </div>
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
      </AnimatePresence>

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
              Your generated description will stream here with a lightweight typing effect.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
