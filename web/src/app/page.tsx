"use client";

import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, CheckCircle2, ImageIcon, Sparkles, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const features = [
  {
    title: "Vision + language models",
    body: "Upload a hero image or enter structured fields — tuned prompts return ready-to-ship copy.",
    icon: ImageIcon,
  },
  {
    title: "Usage you can trust",
    body: "Monthly quotas, automatic resets, and guardrails when limits are hit — upgrade in one click.",
    icon: Zap,
  },
  {
    title: "Ops-ready billing",
    body: "PayFast subscriptions with webhook enforcement synced to your Supabase profile.",
    icon: Sparkles,
  },
];

const stats = [
  { value: "3.5x", label: "faster launch cycle" },
  { value: "42%", label: "higher conversion copy" },
  { value: "99.9%", label: "team uptime confidence" },
];

const steps = [
  "Upload product media or product specs",
  "Generate high-converting copy variants",
  "Export to storefront, ads, and email",
];

const scatterOffsets = [
  { x: -280, y: -260, rotate: -24, scale: 0.72 }, // top-left outside
  { x: 300, y: -240, rotate: 22, scale: 0.7 }, // top-right outside
  { x: -300, y: 260, rotate: -20, scale: 0.74 }, // bottom-left outside
  { x: 310, y: 250, rotate: 24, scale: 0.72 }, // bottom-right outside
];

const collisionOffsets = [
  { x: 16, y: 12 },
  { x: -14, y: 11 },
  { x: 14, y: -10 },
  { x: -16, y: -12 },
];

const impactPointOffsets = [
  { x: 14, y: -8 },
  { x: -12, y: -6 },
  { x: 10, y: 9 },
  { x: -14, y: 10 },
];

const crossThroughOffsets = [
  { x: 132, y: 94 }, // card 1 crosses to opposite side
  { x: -126, y: 90 }, // card 2 crosses to opposite side
  { x: 124, y: -92 }, // card 3 crosses to opposite side
  { x: -130, y: -96 }, // card 4 crosses to opposite side
];

const arrivalOrder = [2, 0, 3, 1];
const motionDurations = [1.42, 1.62, 1.28, 1.52];
const recoilOffsets = [
  { x: -166, y: -132 }, // card 1 gets pushed out harder
  { x: 0, y: 0 }, // card 2 mostly holds
  { x: 156, y: 118 }, // card 3 gets pushed out harder
  { x: 0, y: 0 }, // card 4 mostly holds
];

const showcaseGridVariants = {
  hidden: {},
  show: {
    transition: {},
  },
};

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const heroDriftY = useTransform(scrollYProgress, [0, 0.5], [0, -28]);
  const heroDriftX = useTransform(scrollYProgress, [0, 0.5], [0, 16]);
  const dashboardDriftY = useTransform(scrollYProgress, [0, 0.45], [0, -18]);

  return (
    <div className="relative overflow-hidden pb-20">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-20 -z-10 h-[24rem] w-[24rem] rounded-full bg-violet-500/60 blur-3xl"
        animate={{ x: [0, 54, -42, 0], y: [0, -40, 26, 0], scale: [1, 1.22, 0.9, 1], opacity: [0.56, 0.95, 0.68, 0.56] }}
        transition={{ duration: 6.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-8 top-32 -z-10 h-[22rem] w-[22rem] rounded-full bg-cyan-400/62 blur-3xl"
        animate={{ x: [0, -52, 46, 0], y: [0, 38, -30, 0], scale: [1, 0.86, 1.2, 1], opacity: [0.52, 0.9, 0.64, 0.52] }}
        transition={{ duration: 6.9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/3 top-8 -z-10 h-[20rem] w-[20rem] rounded-full bg-fuchsia-500/56 blur-3xl"
        animate={{ x: [0, 42, -44, 0], y: [0, 42, -30, 0], scale: [1, 1.18, 0.9, 1], opacity: [0.48, 0.86, 0.6, 0.48] }}
        transition={{ duration: 6.1, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div style={{ y: heroDriftY, x: heroDriftX }} className="h-full w-full">
          <Image
            src="/images/hero-product-2.svg"
            alt=""
            fill
            className="object-cover opacity-[0.07]"
            sizes="100vw"
            priority
          />
        </motion.div>
      </div>
      <motion.div
        className="pointer-events-none absolute -right-16 top-20 -z-10 h-72 w-72 overflow-hidden rounded-full border border-white/55"
        animate={{ x: [0, -8, 6, 0], y: [0, -10, 0, 8, 0], rotate: [0, 2, 0, -2, 0], scale: [1, 1.02, 0.98, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src="/images/hero-product-3.svg"
          alt=""
          fill
          className="object-cover opacity-20"
          sizes="288px"
        />
      </motion.div>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-cyan-500 shadow-[0_12px_30px_rgba(123,97,255,0.35)]">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="text-sm font-semibold tracking-tight">Describeflow</div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/pricing" className="text-muted transition hover:text-foreground">
            Pricing
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:pt-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-white/85 px-3 py-1 text-xs text-muted"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-500" />
              Trusted by modern eCommerce and DTC teams
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.55 }}
              className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
            >
              Build your next AI growth engine like a{" "}
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
                real SaaS
              </span>
              .
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.55 }}
              className="max-w-xl text-pretty text-base text-muted sm:text-lg"
            >
              Describeflow turns your product inputs into conversion-focused copy, team workflows,
              and analytics-ready output with enterprise-grade auth, billing, and usage control.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.55 }}
              className="flex flex-col gap-3 sm:flex-row sm:flex-wrap"
            >
              <Link href="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full gap-2 sm:w-auto">
                  Get started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Compare plans
                </Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="grid grid-cols-1 gap-3 sm:grid-cols-3"
            >
              {stats.map((item, idx) => (
                <motion.div
                  key={item.label}
                  whileHover={{ y: -9, rotate: -1.4, scale: 1.03 }}
                  animate={{ y: [0, idx % 2 === 0 ? -8 : -5, 0] }}
                  transition={{
                    y: { duration: 2.6 + idx * 0.3, repeat: Infinity, ease: "easeInOut" },
                    default: { type: "spring", stiffness: 260, damping: 18 },
                  }}
                  className="glass rounded-2xl border border-violet-500/20 px-4 py-3 shadow-card"
                >
                  <div className="text-xl font-semibold">{item.value}</div>
                  <div className="text-xs text-muted">{item.label}</div>
                </motion.div>
              ))}
            </motion.div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { title: "Live SEO score", value: "92/100", tone: "from-violet-100 to-fuchsia-200/80" },
                { title: "Campaign velocity", value: "2.4x", tone: "from-white to-cyan-200/60" },
              ].map((card, idx) => (
                <motion.div
                  key={card.title}
                  whileHover={{ y: -10, x: 6, rotate: 1.8, scale: 1.04 }}
                  animate={{ y: [0, idx === 0 ? -10 : -7, 0] }}
                  transition={{
                    y: { duration: 2.8 + idx * 0.35, repeat: Infinity, ease: "easeInOut" },
                    default: { type: "spring", stiffness: 260, damping: 16 },
                  }}
                  className={`rounded-2xl border border-violet-500/20 bg-gradient-to-br ${card.tone} p-4 text-foreground shadow-card`}
                >
                  <p className="text-xs font-medium">{card.title}</p>
                  <p className="mt-1 text-2xl font-semibold">{card.value}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.55 }}
            className="relative"
            style={{ y: dashboardDriftY }}
          >
            <div className="glass absolute -inset-6 rounded-[32px] blur-2xl" />
            <div className="relative glass overflow-visible rounded-[28px] p-6 shadow-[0_24px_70px_rgba(34,34,59,0.2)]">
              <motion.div
                aria-hidden
                className="pointer-events-none absolute -left-8 -top-10 h-24 w-24 rounded-full bg-fuchsia-500/20 blur-2xl"
                animate={{ x: [0, 22, -20, 0], y: [0, 24, -22, 0], scale: [1, 1.2, 0.9, 1], opacity: [0.55, 1, 0.7, 0.55] }}
                transition={{ duration: 6.8, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="relative mt-2 grid gap-4 sm:grid-cols-2"
                variants={showcaseGridVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
              >
                {[
                  { src: "/images/hero-product-1.svg", title: "Automated Product Copy", tone: "from-violet-100/70 to-white" },
                  { src: "/images/hero-product-2.svg", title: "Brand Voice Variants", tone: "from-fuchsia-200/45 to-white" },
                  { src: "/images/hero-product-3.svg", title: "Campaign-ready Exports", tone: "from-cyan-200/40 to-white" },
                  { src: "/illustrations/hero.svg", title: "AI Workflow Canvas", tone: "from-violet-100/70 to-fuchsia-100/40" },
                ].map((item, idx) => (
                  <motion.div
                    key={item.title}
                    variants={{
                      hidden: {
                        opacity: 1,
                        x: scatterOffsets[idx].x,
                        y: scatterOffsets[idx].y,
                        rotate: scatterOffsets[idx].rotate,
                        scale: scatterOffsets[idx].scale,
                      },
                      show: {
                        opacity: [1, 1, 1, 1, 1, 1],
                        x: [
                          scatterOffsets[idx].x,
                          crossThroughOffsets[idx].x,
                          impactPointOffsets[idx].x,
                          recoilOffsets[idx].x,
                          collisionOffsets[idx].x,
                          0,
                        ],
                        y: [
                          scatterOffsets[idx].y,
                          crossThroughOffsets[idx].y,
                          impactPointOffsets[idx].y,
                          recoilOffsets[idx].y,
                          collisionOffsets[idx].y,
                          0,
                        ],
                        rotate: [scatterOffsets[idx].rotate, idx % 2 === 0 ? 14 : -13, 0, idx % 2 === 0 ? -12 : 11, idx % 2 === 0 ? 5 : -4, 0],
                        scale: [scatterOffsets[idx].scale, 1.08, 1.03, 0.9, 1.02, 1],
                        transition: {
                          delay: 0.18 + arrivalOrder[idx] * 0.14,
                          duration: motionDurations[idx] + 0.72,
                          ease: [0.22, 1, 0.36, 1],
                          times: [0, 0.36, 0.54, 0.72, 0.88, 1],
                        },
                      },
                    }}
                    whileHover={{ y: -8, rotateX: 7, rotateY: idx % 2 === 0 ? -7 : 7, scale: 1.03 }}
                    className={`group overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br ${item.tone} shadow-sm transition-all duration-300 hover:shadow-[0_16px_36px_rgba(123,97,255,0.2)]`}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <div className="relative h-40 w-full">
                      <Image
                        src={item.src}
                        alt={item.title}
                        fill
                        className="object-contain p-3 transition duration-500 group-hover:scale-105"
                        sizes="(min-width: 640px) 25vw, 50vw"
                      />
                    </div>
                    <div className="border-t border-violet-500/15 bg-white/80 px-3 py-2 text-xs font-medium text-foreground">
                      {item.title}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>

        <div className="mt-24 grid gap-6 md:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: i * 0.05, duration: 0.45 }}
              whileHover={{ y: -6, rotateX: 2.5, rotateY: i % 2 === 0 ? -2 : 2 }}
              className="glass rounded-2xl border border-violet-500/20 p-6 shadow-card"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-200/80 to-cyan-100">
                <f.icon className="h-5 w-5 text-violet-700" />
              </div>
              <div className="text-base font-semibold">{f.title}</div>
              <p className="mt-2 text-sm text-muted">{f.body}</p>
            </motion.div>
          ))}
        </div>

        <section className="mt-24 grid gap-8 rounded-3xl border border-violet-500/20 bg-white/90 p-8 lg:grid-cols-2 lg:items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Launch faster with a full-stack SaaS foundation
            </h2>
            <p className="max-w-xl text-muted">
              Everything from account onboarding to billing logic is production-ready. Your team
              focuses on growth, not glue code.
            </p>
            <div className="space-y-3">
              {steps.map((step) => (
                <div key={step} className="flex items-center gap-3 text-sm text-foreground/90">
                  <CheckCircle2 className="h-4 w-4 text-fuchsia-500" />
                  {step}
                </div>
              ))}
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="glass rounded-2xl border border-violet-500/20 p-6"
          >
            <div className="text-xs uppercase tracking-wide text-muted">Ready to scale</div>
            <div className="mt-3 text-2xl font-semibold">Set up in under 10 minutes</div>
            <p className="mt-2 text-sm text-muted">
              Auth, usage metering, and PayFast subscriptions are already integrated and polished.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button className="w-full gap-2 sm:w-auto">
                  Create account <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">
                  Open dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
