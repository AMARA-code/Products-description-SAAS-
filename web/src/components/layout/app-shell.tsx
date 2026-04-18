"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Sparkles,
  UserCog,
  CreditCard,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/generate", label: "Generate", icon: Sparkles },
  { href: "/history", label: "History", icon: History },
  { href: "/settings/billing", label: "Billing", icon: CreditCard },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<{
    name: string;
  } | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let user:
        | {
            email?: string;
            user_metadata?: Record<string, unknown>;
          }
        | null
        | undefined;
      try {
        // Use session read on client to avoid lock contention across parallel auth calls.
        const { data } = await supabase.auth.getSession();
        user = data.session?.user;
      } catch {
        user = null;
      }
      if (!user || cancelled) return;

      const fullName =
        (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
        (typeof user.user_metadata?.name === "string" && user.user_metadata.name) ||
        "";
      setProfile({
        name: fullName || "User",
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  return (
    <div className="min-h-screen">
      {/* Shared top bar on all screen sizes: hamburger left, logo right */}
      <div className="fixed inset-x-0 top-0 z-40 px-4 pt-4 sm:px-6">
        <div className="glass flex h-12 items-center justify-between rounded-2xl px-3">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="grid h-10 w-10 place-items-center rounded-xl border border-[color-mix(in_srgb,var(--border)_80%,transparent)] bg-card text-foreground transition hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div
              className="grid h-9 w-9 place-items-center rounded-xl shadow-[0_10px_24px_rgba(123,97,255,0.22)]"
              style={{
                background:
                  "linear-gradient(135deg, var(--brand-from), var(--brand-via), var(--brand-to))",
              }}
            >
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          </Link>
        </div>
      </div>

      {/* Drawer: full-screen on small screens, side panel on larger screens */}
      <AnimatePresence>
        {drawerOpen ? (
          <motion.div
            key="drawer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed inset-0 z-[70]"
            onMouseDown={() => setDrawerOpen(false)}
            aria-label="Navigation drawer"
          >
            <div className="absolute inset-0 bg-transparent sm:bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] sm:backdrop-blur-0" />
            <motion.div
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -16, opacity: 0 }}
              transition={{ duration: 0.26, ease: "easeOut" }}
              className="glass relative h-full w-full p-4 sm:w-[360px] sm:max-w-[85vw] lg:w-[380px]"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{profile?.name ?? "User"}</div>
                      <div className="text-xs text-muted">Account</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setDrawerOpen(false);
                            router.push(
                              `/login?switch=1&next=${encodeURIComponent(pathname)}`,
                            );
                          }}
                          className="inline-flex items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--border)_80%,transparent)] bg-card px-3 py-2 text-xs text-foreground transition hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]"
                        >
                          <UserCog className="h-4 w-4" />
                          Switch account
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDrawerOpen(false);
                            router.push("/signup?switch=1");
                          }}
                          className="inline-flex items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--border)_80%,transparent)] bg-card px-3 py-2 text-xs text-foreground transition hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]"
                        >
                          <PlusCircle className="h-4 w-4" />
                          New account
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <button
                      type="button"
                      onClick={() => setDrawerOpen(false)}
                      aria-label="Close menu"
                      className="grid h-10 w-10 place-items-center rounded-xl border border-[color-mix(in_srgb,var(--border)_80%,transparent)] bg-card text-foreground transition hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <nav className="mt-6 flex flex-1 flex-col gap-2">
                  {links.map((l) => {
                    const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
                    const Icon = l.icon;
                    return (
                      <button
                        key={l.href}
                        type="button"
                        onClick={() => {
                          setDrawerOpen(false);
                          router.push(l.href);
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition",
                          active
                            ? "bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[color-mix(in_srgb,var(--accent)_72%,var(--foreground))]"
                            : "text-muted hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] hover:text-[color-mix(in_srgb,var(--accent)_72%,var(--foreground))]",
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{l.label}</span>
                      </button>
                    );
                  })}
                </nav>

                <button
                  type="button"
                  onClick={async () => {
                    setDrawerOpen(false);
                    await supabase.auth.signOut();
                    router.push("/login");
                    router.refresh();
                  }}
                  className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-[color-mix(in_srgb,var(--border)_80%,transparent)] bg-card px-4 py-3 text-sm text-muted transition hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] hover:text-[color-mix(in_srgb,var(--accent)_72%,var(--foreground))]"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  Sign out
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <main
        className={cn(
          "min-h-screen px-4 pt-24 transition-[margin] duration-300 ease-out sm:px-6 lg:px-10",
          drawerOpen ? "lg:ml-[380px]" : "lg:ml-0",
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, filter: "blur(8px)" }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
