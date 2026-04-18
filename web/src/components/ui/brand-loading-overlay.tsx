"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type BrandLoadingOverlayProps = {
  className?: string;
};

export function BrandLoadingOverlay({ className }: BrandLoadingOverlayProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 grid place-items-center bg-background/90 backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-4" aria-label="Loading">
        <div className="relative h-10 w-40">
          <motion.div
            aria-hidden
            className="absolute left-0 top-1/2 h-2 w-full -translate-y-1/2 rounded-full bg-[color-mix(in_srgb,var(--accent)_14%,transparent)]"
          />
          <motion.div
            aria-hidden
            className="absolute left-0 top-1/2 h-2 w-16 -translate-y-1/2 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, var(--brand-from), var(--brand-via), var(--brand-to))",
            }}
            animate={{ x: [0, 92, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            aria-hidden
            className="absolute -top-3 left-0"
            animate={{ x: [0, 104, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="relative h-6 w-6">
              <div
                className="absolute left-2 top-1 h-2 w-2 rounded-full"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--accent-2) 78%, black)",
                }}
              />
              <motion.div
                className="absolute left-1 top-3 h-[2px] w-5 rounded-full"
                style={{ backgroundColor: "color-mix(in srgb, var(--accent-2) 70%, transparent)" }}
                animate={{ rotate: [10, -12, 10] }}
                transition={{ duration: 0.28, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute left-0 top-4 h-[2px] w-3 rounded-full"
                style={{ backgroundColor: "color-mix(in srgb, var(--accent-2) 70%, transparent)" }}
                animate={{ rotate: [-22, 18, -22] }}
                transition={{ duration: 0.28, repeat: Infinity, ease: "easeInOut", delay: 0.07 }}
              />
              <motion.div
                className="absolute left-3 top-4 h-[2px] w-3 rounded-full"
                style={{ backgroundColor: "color-mix(in srgb, var(--accent-2) 70%, transparent)" }}
                animate={{ rotate: [22, -18, 22] }}
                transition={{ duration: 0.28, repeat: Infinity, ease: "easeInOut", delay: 0.07 }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

