"use client";

import { Button } from "@/components/ui/button";
import { ADMIN_EMAIL } from "@/lib/adminAccess";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type ManualPayment = {
  id: string;
  user_id: string;
  payment_id: string;
  event_type: string;
  amount: number | null;
  status: string;
  provider: string;
  raw_payload?: {
    channel?: string;
    submitted_at?: string;
  };
  created_at: string;
};

export default function AdminPaymentsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [payments, setPayments] = useState<ManualPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);

  const pendingPayments = useMemo(
    () => payments.filter((p) => p.status === "pending"),
    [payments],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const email = data.user?.email?.toLowerCase() ?? "";
        if (email !== ADMIN_EMAIL) {
          router.replace("/");
          return;
        }

        const res = await fetch("/api/admin/payments");
        const raw = await res.text();
        let payload: { error?: string; payments?: ManualPayment[] } = {};
        if (raw.trim().length > 0) {
          try {
            payload = JSON.parse(raw) as { error?: string; payments?: ManualPayment[] };
          } catch {
            throw new Error("Admin response was not valid JSON.");
          }
        }
        if (!res.ok) throw new Error(payload.error ?? "Failed to load payments.");
        if (!cancelled) setPayments(payload.payments ?? []);
      } catch (error) {
        if (!cancelled) toast.error(error instanceof Error ? error.message : "Failed to load.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  const decide = async (paymentId: string, action: "approve" | "reject") => {
    setActioning(paymentId);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, action }),
      });
      const raw = await res.text();
      let payload: { error?: string } = {};
      if (raw.trim().length > 0) {
        try {
          payload = JSON.parse(raw) as { error?: string };
        } catch {
          throw new Error("Admin response was not valid JSON.");
        }
      }
      if (!res.ok) throw new Error(payload.error ?? "Unable to process payment.");
      setPayments((prev) =>
        prev.map((payment) =>
          payment.id === paymentId
            ? { ...payment, status: action === "approve" ? "approved" : "rejected" }
            : payment,
        ),
      );
      toast.success(`Payment ${action}d successfully.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed.");
    } finally {
      setActioning(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-12">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Admin Payments</h1>
        <p className="mt-2 text-sm text-muted">Review manual JazzCash / EasyPaisa payment submissions.</p>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading payments...</p>
      ) : pendingPayments.length === 0 ? (
        <p className="text-sm text-muted">No pending payments.</p>
      ) : (
        <div className="space-y-4">
          {pendingPayments.map((payment) => (
            <div key={payment.id} className="rounded-2xl border border-violet-500/20 p-4">
              <div className="grid gap-1 text-sm">
                <div>
                  <span className="text-muted">Plan:</span> {payment.event_type?.toUpperCase()}
                </div>
                <div>
                  <span className="text-muted">Amount:</span>{" "}
                  {payment.amount !== null ? `$${payment.amount}` : "-"}
                </div>
                <div>
                  <span className="text-muted">Transaction ID:</span> {payment.payment_id}
                </div>
                <div>
                  <span className="text-muted">Channel:</span> {payment.raw_payload?.channel ?? "-"}
                </div>
                <div>
                  <span className="text-muted">User ID:</span> {payment.user_id}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  onClick={() => decide(payment.id, "approve")}
                  disabled={actioning === payment.id}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => decide(payment.id, "reject")}
                  disabled={actioning === payment.id}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
