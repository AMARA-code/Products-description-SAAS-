"use client";

import { Button } from "@/components/ui/button";
import { Mail, Phone, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("Message prepared. You can now send it by email.");
      const subject = encodeURIComponent(`Contact request from ${name.trim() || "Website visitor"}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      );
      window.location.href = `mailto:amaranaeem453@gmail.com?subject=${subject}&body=${body}`;
    } catch {
      toast.error("Unable to prepare your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative mx-auto max-w-6xl px-6 py-14 sm:py-16">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-8 top-8 h-64 w-72 rounded-[28%] bg-gradient-to-br from-violet-500/30 via-fuchsia-500/24 to-cyan-400/26 blur-3xl" />
        <div className="absolute right-0 top-14 h-56 w-80 rounded-[24%] bg-gradient-to-r from-cyan-400/28 via-indigo-500/24 to-fuchsia-500/24 blur-3xl" />
      </div>

      <section className="glass rounded-3xl p-7 shadow-card sm:p-10">
        <p className="inline-flex rounded-full border border-violet-400/30 bg-white/70 px-3 py-1 text-xs text-muted dark:bg-[#121a3c]">
          We usually reply within 24 hours
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Contact Us</h1>
        <p className="mt-3 max-w-3xl text-sm text-muted sm:text-base">
          Questions about subscriptions, billing, or AI generation quality? Reach out and we
          will help quickly.
        </p>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <aside className="glass rounded-2xl p-6 shadow-card lg:col-span-2">
          <h2 className="text-lg font-semibold">Support Channels</h2>
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-violet-400/25 bg-white/70 p-4 dark:bg-[#121a3c]">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Mail className="h-4 w-4 text-fuchsia-500" />
                Email
              </div>
              <a
                href="mailto:amaranaeem453@gmail.com"
                className="mt-2 block text-sm text-muted transition hover:text-foreground"
              >
                amaranaeem453@gmail.com
              </a>
            </div>
            <div className="rounded-xl border border-violet-400/25 bg-white/70 p-4 dark:bg-[#121a3c]">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Phone className="h-4 w-4 text-cyan-400" />
                Phone
              </div>
              <a
                href="tel:03346445127"
                className="mt-2 block text-sm text-muted transition hover:text-foreground"
              >
                03346445127
              </a>
            </div>
          </div>
        </aside>

        <section className="glass rounded-2xl p-6 shadow-card lg:col-span-3 sm:p-7">
          <h2 className="text-lg font-semibold">Send a Message</h2>
          <p className="mt-2 text-sm text-muted">
            Share your issue or feedback and include as much context as possible.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block space-y-2 text-sm">
              <span className="text-muted">Name</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </label>

            <label className="block space-y-2 text-sm">
              <span className="text-muted">Email</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </label>

            <label className="block space-y-2 text-sm">
              <span className="text-muted">Message</span>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="Tell us how we can help..."
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </label>

            <Button type="submit" className="w-full gap-2 sm:w-auto" disabled={submitting}>
              <Send className="h-4 w-4" />
              {submitting ? "Preparing..." : "Send message"}
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}

