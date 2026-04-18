import { ShieldCheck, Database, Lock, Eye } from "lucide-react";

const sections = [
  {
    icon: ShieldCheck,
    title: "Information We Collect",
    points: [
      "Account details such as name, email address, and authentication metadata.",
      "Subscription and billing status required to activate and manage paid access.",
      "Product inputs you provide to generate AI descriptions (text prompts and image data).",
    ],
  },
  {
    icon: Database,
    title: "How We Use Data",
    points: [
      "Provide, maintain, and improve the AI product description generation service.",
      "Process subscriptions, usage limits, and access control for your selected plan.",
      "Monitor reliability, security, abuse prevention, and technical diagnostics.",
    ],
  },
  {
    icon: Lock,
    title: "Security and Retention",
    points: [
      "We use industry-standard technical safeguards to protect stored account and usage data.",
      "Sensitive payment details are handled by payment infrastructure and are not stored in plaintext by the app.",
      "Data is retained only for business and legal purposes, then deleted or anonymized when no longer needed.",
    ],
  },
  {
    icon: Eye,
    title: "Your Rights",
    points: [
      "You can request account updates or deletion by contacting support.",
      "You are responsible for ensuring you have rights to submit product content and images.",
      "By using the service, you consent to processing required for service delivery and subscription management.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-14 sm:py-16">
      <section className="glass rounded-3xl p-7 shadow-card sm:p-10">
        <p className="inline-flex rounded-full border border-violet-400/30 bg-white/70 px-3 py-1 text-xs text-muted dark:bg-[#121a3c]">
          Last updated: {new Date().toISOString().slice(0, 10)}
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Privacy Policy</h1>
        <p className="mt-3 max-w-3xl text-sm text-muted sm:text-base">
          This Privacy Policy explains how Describeflow collects and uses information when
          you use our SaaS subscription platform for AI-powered product description generation.
        </p>
      </section>

      <section className="mt-8 grid gap-5 sm:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <article key={section.title} className="glass rounded-2xl p-6 shadow-card">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/25 to-cyan-400/25">
                <Icon className="h-5 w-5 text-foreground" />
              </div>
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                {section.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          );
        })}
      </section>
    </div>
  );
}

