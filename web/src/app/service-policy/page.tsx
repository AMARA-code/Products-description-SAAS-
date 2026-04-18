import { BadgeCheck, Clock3, Globe2, RefreshCcw } from "lucide-react";

const policyCards = [
  {
    icon: Globe2,
    title: "Digital-Only Service",
    body: "Describeflow provides instant digital AI content generation only. No physical goods are sold or shipped.",
  },
  {
    icon: Clock3,
    title: "Instant Delivery",
    body: "Generated descriptions are delivered instantly inside your account/dashboard after successful request processing.",
  },
  {
    icon: BadgeCheck,
    title: "Subscription Access",
    body: "Feature availability and usage volume depend on your active subscription plan and current billing status.",
  },
  {
    icon: RefreshCcw,
    title: "Renewal and Expiry",
    body: "Paid access continues during active subscription periods and expires automatically when the billing period ends without renewal.",
  },
];

export default function ServicePolicyPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-14 sm:py-16">
      <section className="glass rounded-3xl p-7 shadow-card sm:p-10">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Service Policy</h1>
        <p className="mt-3 max-w-3xl text-sm text-muted sm:text-base">
          This policy explains how Describeflow delivers its SaaS service and what to expect
          from our subscription-based AI product description platform.
        </p>
      </section>

      <section className="mt-8 grid gap-5 sm:grid-cols-2">
        {policyCards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.title} className="glass rounded-2xl p-6 shadow-card">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/25 to-cyan-400/25">
                <Icon className="h-5 w-5 text-foreground" />
              </div>
              <h2 className="text-lg font-semibold">{card.title}</h2>
              <p className="mt-2 text-sm text-muted">{card.body}</p>
            </article>
          );
        })}
      </section>

      <section className="mt-8 glass rounded-2xl p-6 shadow-card">
        <h2 className="text-lg font-semibold">Refund and Support Notes</h2>
        <p className="mt-2 text-sm text-muted">
          Because this is an instant digital SaaS service, no shipping timelines apply. Subscription
          disputes, billing questions, or service issues can be raised through our contact page.
        </p>
      </section>
    </div>
  );
}

