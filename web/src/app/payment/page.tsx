"use client";

import { Button } from "@/components/ui/button";
import { PLANS, type PlanSlug } from "@/lib/plans";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

const PAYMENT_INSTRUCTIONS = [
  "Send payment to the EasyPaisa account below using your registered number.",
  "After payment, copy the transaction ID exactly as shown in your app/SMS.",
  "Submit the transaction ID below for manual verification.",
];

const RECEIVER_ACCOUNT_NUMBER = "03045840258";
const RECEIVER_ACCOUNT_NAME = "Farzana Mehmood";

function parsePlan(value: string | null): PlanSlug {
  if (value === "pro" || value === "agency" || value === "basic") return value;
  return "pro";
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [transactionId, setTransactionId] = useState("");
  const [channel, setChannel] = useState<"jazzcash" | "easypaisa">("easypaisa");
  const [loading, setLoading] = useState(false);

  const plan = useMemo(() => parsePlan(searchParams.get("plan")), [searchParams]);
  const planMeta = PLANS[plan];

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const tx = transactionId.trim();
    if (!tx) {
      toast.error("Transaction ID is required.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push(`/login?next=${encodeURIComponent(`/payment?plan=${plan}`)}`);
        return;
      }

      const res = await fetch("/api/payments/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          transactionId: tx,
          channel,
        }),
      });
      const payload = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(payload.error ?? "Unable to submit payment.");
      }

      toast.success("Payment submitted. Awaiting admin approval.");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Manual Payment</h1>
      <p className="mt-2 text-sm text-muted">
        Selected plan: <span className="font-medium">{planMeta.name}</span> (
        {planMeta.priceUsd === 0 ? "Free" : `$${planMeta.priceUsd}/month`})
      </p>

      <div className="mt-6 rounded-2xl border border-violet-500/20 bg-white/50 p-5 dark:bg-[#111733]">
        <h2 className="text-sm font-semibold">EasyPaisa Payment Instructions</h2>
        <p className="mt-2 text-sm text-muted">
          Receiver: <span className="font-medium text-foreground">{RECEIVER_ACCOUNT_NAME}</span> (
          <span className="font-medium text-foreground">{RECEIVER_ACCOUNT_NUMBER}</span>)
        </p>
        <ul className="mt-3 space-y-2 text-sm text-muted">
          {PAYMENT_INSTRUCTIONS.map((item) => (
            <li key={item}>- {item}</li>
          ))}
        </ul>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-2xl border border-violet-500/20 p-5">
        <label className="block space-y-2 text-sm">
          <span className="text-muted">Payment method</span>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as "jazzcash" | "easypaisa")}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            <option value="jazzcash">JazzCash</option>
            <option value="easypaisa">EasyPaisa</option>
          </select>
        </label>
        <label className="block space-y-2 text-sm">
          <span className="text-muted">Transaction ID</span>
          <input
            required
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="Enter transaction ID"
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </label>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Submitting..." : "Submit for approval"}
        </Button>
      </form>
    </div>
  );
}
