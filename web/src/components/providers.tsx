"use client";

import { Toaster } from "sonner";
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BrandLoadingOverlay } from "@/components/ui/brand-loading-overlay";

function Splash() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    type ConnectionLike = {
      effectiveType?: string;
      downlink?: number;
      saveData?: boolean;
    };

    const connection = (navigator as Navigator & { connection?: ConnectionLike }).connection;
    const unstableNetwork =
      Boolean(connection?.saveData) ||
      connection?.effectiveType === "slow-2g" ||
      connection?.effectiveType === "2g" ||
      connection?.effectiveType === "3g" ||
      (typeof connection?.downlink === "number" && connection.downlink < 1.5);

    // Only show splash for genuinely slow/unstable first loads.
    if (!unstableNetwork || document.readyState === "complete") {
      setVisible(false);
      return;
    }

    const showTimer = window.setTimeout(() => setVisible(true), 180);
    const hide = () => setVisible(false);
    const loadTimer = window.setTimeout(hide, 5200); // safety timeout

    window.addEventListener("load", hide, { once: true });

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(loadTimer);
      window.removeEventListener("load", hide);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="fixed inset-0 z-[80]"
          aria-label="Loading"
        >
          <BrandLoadingOverlay />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Splash />
      {children}
      <ThemeAwareToaster />
    </ThemeProvider>
  );
}

function ThemeAwareToaster() {
  const { theme } = useTheme();
  return <Toaster richColors position="top-center" theme={theme} />;
}
