"use client";

import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, CheckCircle2, ImageIcon, Sparkles, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const features = [
  {
    title: "Image + prompt generation",
    body: "Upload a product image or add key details, and get ready-to-use descriptions in seconds.",
    icon: ImageIcon,
  },
  {
    title: "Fast output for every launch",
    body: "Generate multiple variants instantly for marketplaces, product pages, ads, and social posts.",
    icon: Zap,
  },
  {
    title: "Consistent brand voice",
    body: "Keep your tone clear and on-brand across your full catalog without rewriting manually.",
    icon: Sparkles,
  },
];

const stats = [
  { value: "< 10s", label: "average description generation" },
  { value: "3x", label: "faster product listing workflow" },
  { value: "24/7", label: "instant copy creation" },
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
  const dashboardDriftY = useTransform(scrollYProgress, [0, 0.45], [0, -18]);

  return (
    <div className="relative overflow-hidden pb-20">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-20 -z-10 h-[20rem] w-[30rem] rounded-[28%] bg-gradient-to-br from-violet-500/60 via-fuchsia-500/40 to-cyan-400/45 blur-3xl dark:from-violet-500/48 dark:via-fuchsia-500/40 dark:to-cyan-400/48"
        animate={{ x: [0, 72, -56, 0], y: [0, -30, 22, 0], scale: [1, 1.14, 0.94, 1], rotate: [0, 7, -5, 0], opacity: [0.58, 0.96, 0.72, 0.58] }}
        transition={{ duration: 8.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-6 top-36 -z-10 h-[18rem] w-[31rem] rounded-[24%] bg-gradient-to-r from-cyan-400/60 via-sky-400/34 to-fuchsia-500/36 blur-3xl dark:from-cyan-400/44 dark:via-indigo-500/34 dark:to-fuchsia-500/42"
        animate={{ x: [0, -70, 52, 0], y: [0, 26, -24, 0], scale: [1, 0.9, 1.08, 1], rotate: [0, -8, 6, 0], opacity: [0.54, 0.9, 0.66, 0.54] }}
        transition={{ duration: 8.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-[28%] top-6 -z-10 h-[18rem] w-[26rem] rounded-[34%] bg-gradient-to-br from-fuchsia-500/48 via-violet-500/34 to-cyan-400/34 blur-3xl dark:from-fuchsia-500/44 dark:via-violet-500/38 dark:to-cyan-400/34"
        animate={{ x: [0, 56, -48, 0], y: [0, 30, -26, 0], scale: [1, 1.12, 0.9, 1], rotate: [0, 6, -6, 0], opacity: [0.5, 0.86, 0.62, 0.5] }}
        transition={{ duration: 7.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -right-16 top-20 -z-10 h-64 w-80 overflow-hidden rounded-[24%] border border-white/55 dark:border-violet-300/20"
        animate={{ x: [0, -14, 10, 0], y: [0, -12, 0, 12, 0], rotate: [0, 4, 0, -4, 0], scale: [1, 1.03, 0.97, 1] }}
        transition={{ duration: 12.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src="/images/hero-product-3.svg"
          alt=""
          fill
          className="object-cover opacity-20 dark:opacity-35 dark:mix-blend-screen"
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
          <Link href="/pricing" className="hidden text-muted transition hover:text-foreground sm:inline-flex">
            Pricing
          </Link>
          <Link href="/contact" className="hidden sm:inline-flex">
            <Button variant="outline" size="sm">
              Contact
            </Button>
          </Link>
          <Link href="/login" className="hidden sm:inline-flex">
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
              className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-white/85 px-3 py-1 text-xs text-muted dark:border-violet-400/45 dark:bg-[#121732]/90 dark:text-violet-100"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-500" />
              Trusted by ecommerce brands and sellers
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.55 }}
              className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
            >
              Generate high-converting{" "}
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
                product descriptions in seconds
              </span>
              .
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.55 }}
              className="max-w-xl text-pretty text-base text-muted sm:text-lg"
            >
              Describeflow turns your product name, features, and images into clear, persuasive
              product copy you can publish right away.
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
                { title: "Descriptions generated", value: "50K+", tone: "from-violet-100 to-fuchsia-200/80" },
                { title: "Average time saved", value: "12 hrs/week", tone: "from-white to-cyan-200/60" },
              ].map((card, idx) => (
                <motion.div
                  key={card.title}
                  whileHover={{ y: -10, x: 6, rotate: 1.8, scale: 1.04 }}
                  animate={{ y: [0, idx === 0 ? -10 : -7, 0] }}
                  transition={{
                    y: { duration: 2.8 + idx * 0.35, repeat: Infinity, ease: "easeInOut" },
                    default: { type: "spring", stiffness: 260, damping: 16 },
                  }}
                  className={`rounded-2xl border border-violet-500/20 bg-gradient-to-br ${card.tone} p-4 text-foreground shadow-card dark:border-violet-400/35 dark:from-[#151b3d] dark:via-[#121732] dark:to-[#0f1330]`}
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
            <div className="relative glass overflow-visible rounded-[28px] p-6 shadow-[0_24px_70px_rgba(34,34,59,0.2)] dark:shadow-[0_30px_90px_rgba(2,7,30,0.72)]">
              <motion.div
                aria-hidden
                className="pointer-events-none absolute -left-10 -top-10 h-20 w-28 rounded-[30%] bg-gradient-to-br from-fuchsia-500/24 to-cyan-400/20 blur-2xl dark:from-fuchsia-500/35 dark:to-cyan-400/28"
                animate={{ x: [0, 26, -20, 0], y: [0, 20, -18, 0], scale: [1, 1.18, 0.9, 1], rotate: [0, 8, -6, 0], opacity: [0.56, 1, 0.72, 0.56] }}
                transition={{ duration: 7.3, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="relative mt-2 grid gap-4 sm:grid-cols-2"
                variants={showcaseGridVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
              >
                {[
                  { src: "/images/hero-product-1.svg", title: "One-click product copy", tone: "from-violet-100/70 to-white" },
                  { src: "/images/hero-product-2.svg", title: "Tone and style options", tone: "from-fuchsia-200/45 to-white" },
                  { src: "/images/hero-product-3.svg", title: "Store-ready descriptions", tone: "from-cyan-200/40 to-white" },
                  { src: "/illustrations/hero.svg", title: "Fast writing workflow", tone: "from-violet-100/70 to-fuchsia-100/40" },
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
                    className={`group overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br ${item.tone} shadow-sm transition-all duration-300 hover:shadow-[0_16px_36px_rgba(123,97,255,0.2)] dark:border-violet-400/40 dark:from-[#1a2149] dark:via-[#121834] dark:to-[#0f1330] dark:hover:shadow-[0_20px_46px_rgba(49,82,185,0.34)]`}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <div className="relative h-40 w-full">
                      <Image
                        src={item.src}
                        alt={item.title}
                        fill
                        className="object-contain p-3 transition duration-500 group-hover:scale-105 dark:brightness-110 dark:contrast-110 dark:saturate-125"
                        sizes="(min-width: 640px) 25vw, 50vw"
                      />
                    </div>
                    <div className="border-t border-violet-500/15 bg-white/80 px-3 py-2 text-xs font-medium text-foreground dark:border-violet-400/35 dark:bg-[#141a38] dark:text-violet-100">
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
              className="glass rounded-2xl border border-violet-500/20 p-6 shadow-card dark:border-violet-400/40"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-200/80 to-cyan-100 dark:from-violet-500/35 dark:to-cyan-400/25">
                <f.icon className="h-5 w-5 text-violet-700 dark:text-violet-100" />
              </div>
              <div className="text-base font-semibold">{f.title}</div>
              <p className="mt-2 text-sm text-muted">{f.body}</p>
            </motion.div>
          ))}
        </div>

        <section className="mt-24 grid gap-8 rounded-3xl border border-violet-500/20 bg-white/90 p-8 lg:grid-cols-2 lg:items-center dark:border-violet-400/35 dark:bg-gradient-to-br dark:from-[#171f46] dark:via-[#121735] dark:to-[#100f2e]">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Write better product copy at scale
            </h2>
            <p className="max-w-xl text-muted">
              Stop writing descriptions manually. Generate polished copy for every product in your
              catalog in just a few clicks.
            </p>
            <div className="space-y-3">
              {steps.map((step) => (
                <div key={step} className="flex items-center gap-3 text-sm text-foreground/90 dark:text-violet-100/95">
                  <CheckCircle2 className="h-4 w-4 text-fuchsia-500 dark:text-cyan-300" />
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
            className="glass rounded-2xl border border-violet-500/20 p-6 dark:border-violet-400/35 dark:bg-gradient-to-br dark:from-[#19224d] dark:via-[#13193a] dark:to-[#11132f]"
          >
            <div className="text-xs uppercase tracking-wide text-muted">Start creating instantly</div>
            <div className="mt-3 text-2xl font-semibold">Publish product descriptions in seconds</div>
            <p className="mt-2 text-sm text-muted">
              Add your product details, click generate, and copy your final description to your
              store in one step.
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
      <footer className="mx-auto w-full max-w-6xl px-6 pb-10">
        <div className="glass flex flex-col gap-4 rounded-2xl px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted">
            <span className="font-medium text-foreground">Describeflow</span> - AI product
            description SaaS
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Link href="/privacy-policy" className="text-muted transition hover:text-foreground">
              Privacy Policy
            </Link>
            <Link
              href="/terms-and-conditions"
              className="text-muted transition hover:text-foreground"
            >
              Terms & Conditions
            </Link>
            <Link href="/service-policy" className="text-muted transition hover:text-foreground">
              Service Policy
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-xl border border-[color-mix(in_srgb,var(--accent)_35%,transparent)] bg-card px-3 py-1.5 text-foreground transition hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
