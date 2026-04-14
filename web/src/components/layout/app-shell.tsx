"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  History,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Sparkles,
  UserCog,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useMemo, useRef, useState } from "react";

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
    avatarUrl: string | null;
  } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

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
      const avatarUrl =
        (typeof user.user_metadata?.avatar_url === "string" && user.user_metadata.avatar_url) ||
        null;

      setProfile({
        name: fullName || "User",
        avatarUrl,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("mousedown", onClick);
    };
  }, []);

  const initials = useMemo(() => {
    if (!profile?.name) return "U";
    const parts = profile.name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "U";
    const second = parts[1]?.[0] ?? "";
    return `${first}${second}`.toUpperCase();
  }, [profile]);

  return (
    <div className="min-h-screen">
      <aside className="glass fixed inset-y-0 left-0 z-30 h-screen w-20 border-r border-black/10 sm:w-64">
        <div className="flex h-full flex-col gap-6 px-3 py-4 sm:px-4 sm:py-6">
          <Link href="/dashboard" className="flex items-center justify-center gap-2 sm:justify-start">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-cyan-500 shadow-[0_10px_24px_rgba(123,97,255,0.3)]">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="hidden leading-tight sm:block">
              <div className="text-sm font-semibold tracking-tight">Describeflow</div>
              <div className="text-xs text-muted">AI descriptions</div>
            </div>
          </Link>

          <nav className="flex flex-1 flex-col gap-1">
            {links.map((l) => {
              const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
              const Icon = l.icon;
              return (
                <Link key={l.href} href={l.href} className="block">
                  <motion.div
                    whileHover={{ x: 2 }}
                    className={cn(
                      "flex items-center justify-center gap-3 rounded-xl px-2 py-2.5 text-sm transition-colors sm:justify-start sm:px-3",
                      active
                        ? "bg-violet-500/10 text-violet-700"
                        : "text-muted hover:bg-violet-500/10 hover:text-violet-700",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="hidden sm:inline">{l.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/login");
              router.refresh();
            }}
            className="flex items-center justify-center gap-2 rounded-xl border border-violet-400/25 bg-white/60 px-2 py-2 text-xs text-muted transition hover:bg-violet-500/10 hover:text-violet-700 sm:justify-start sm:px-3"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </aside>

      <main className="min-h-screen pl-24 pr-4 pt-6 sm:pl-72 sm:pr-6 lg:pr-12 lg:pt-8">
        <div className="mb-6 flex items-center justify-end" ref={menuRef}>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="grid h-8 w-8 place-items-center overflow-hidden rounded-full border border-white/15 bg-white/60 transition hover:bg-white/80"
              aria-label="Open profile menu"
            >
              {profile?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatarUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center bg-gradient-to-br from-violet-600/80 via-fuchsia-500/80 to-cyan-500/80 text-xs font-semibold text-white">
                  {initials}
                </div>
              )}
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-12 z-30 w-56 rounded-2xl border border-white/15 bg-white/95 p-2 shadow-card backdrop-blur sm:w-64">
                <div className="mb-1 rounded-xl px-3 py-2">
                  <div className="text-sm font-medium">{profile?.name ?? "User"}</div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setMenuOpen(false);
                    await supabase.auth.signOut();
                    router.push(`/login?next=${encodeURIComponent(pathname)}`);
                    router.refresh();
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-foreground transition hover:bg-violet-500/10"
                >
                  <UserCog className="h-4 w-4" />
                  Switch account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/signup");
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-foreground transition hover:bg-violet-500/10"
                >
                  <PlusCircle className="h-4 w-4" />
                  Create new account
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setMenuOpen(false);
                    await supabase.auth.signOut();
                    router.push("/login");
                    router.refresh();
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-foreground transition hover:bg-violet-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
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
