"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Calendar, Copy, ImageIcon, Type } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Item = {
  id: string;
  title: string | null;
  source_type: "image" | "text";
  product_name: string | null;
  category: string | null;
  description: string;
  created_at: string;
};

export default function HistoryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/history?limit=50");
        const data = await res.json();
        if (!cancelled) setItems(data.items ?? []);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-semibold tracking-tight"
          >
            History
          </motion.h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Every generation is saved to your workspace for quick reuse and QA.
          </p>
        </div>
        <Link href="/generate">
          <Button className="gap-2">New generation</Button>
        </Link>
      </div>

      <div className="space-y-4">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-3 h-3 w-full" />
              <Skeleton className="mt-2 h-3 w-5/6" />
            </div>
          ))}

        {!loading && items.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass overflow-hidden rounded-2xl p-10"
          >
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div className="text-center lg:text-left">
                <div className="text-sm font-medium text-foreground/90">
                  No generations yet
                </div>
                <p className="mt-2 text-sm text-muted">
                  Your workspace will automatically save every description you generate — including
                  product details and timestamps.
                </p>
                <div className="mt-5 flex justify-center gap-2 lg:justify-start">
                  <Link href="/generate">
                    <Button className="gap-2">Create your first description</Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline">Back to dashboard</Button>
                  </Link>
                </div>
              </div>
              <motion.div
                aria-hidden="true"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="mx-auto w-full max-w-md"
              >
                <Image
                  src="/illustrations/empty-history.svg"
                  alt=""
                  width={900}
                  height={700}
                  className="h-auto w-full opacity-90"
                />
              </motion.div>
            </div>
          </motion.div>
        )}

        {items.map((it, idx) => (
          <motion.article
            key={it.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="glass rounded-2xl p-5 shadow-card"
          >
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2 py-1 text-[11px] text-foreground/80">
                {it.source_type === "image" ? (
                  <ImageIcon className="h-3 w-3" />
                ) : (
                  <Type className="h-3 w-3" />
                )}
                {it.source_type === "image" ? "Image" : "Text"}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(it.created_at).toLocaleString()}
              </span>
            </div>
            <div className="mt-3 text-base font-semibold">
              {it.title || it.product_name || "Untitled product"}
            </div>
            {(it.category || it.product_name) && (
              <div className="mt-1 text-xs text-muted">
                {[it.product_name, it.category].filter(Boolean).join(" · ")}
              </div>
            )}
            <div className="mt-3">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(it.description);
                    toast.success("Description copied");
                  } catch {
                    toast.error("Unable to copy description");
                  }
                }}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy description
              </Button>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {it.description}
            </p>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
