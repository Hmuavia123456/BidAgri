"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import OrderStepper from "@/components/OrderStepper";
import CheckoutSummary from "@/components/CheckoutSummary";
import PaymentMethods from "@/components/PaymentMethods";
import { ShieldCheck, Lock, CreditCard } from "lucide-react";

function mockCart() {
  return [
    { name: "Wheat (50kg)", price: 5500, qty: 2 },
    { name: "Rice Basmati (25kg)", price: 4200, qty: 1 },
  ];
}

function generateOrderId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BA-${ts}-${rnd}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState(mockCart());
  const [fees, setFees] = useState({ shipping: 350, service: 99 });
  const [method, setMethod] = useState("jazzcash");
  const [processing, setProcessing] = useState(false);
  const [isMethodValid, setIsMethodValid] = useState(false);
  const [error, setError] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const total = useMemo(
    () => items.reduce((acc, it) => acc + it.price * it.qty, 0) + fees.shipping + fees.service,
    [items, fees]
  );

  const onApplyPromo = useCallback(async (code) => {
    // Simple mock: code "BID10" applies 10% on service fee
    if (code === "BID10" && !promoApplied) {
      setFees((f) => ({ ...f, service: Math.max(0, Math.round(f.service * 0.9)) }));
      setPromoApplied(true);
      return true;
    }
    return false;
  }, [promoApplied]);

  async function handlePay(e) {
    e.preventDefault();
    setError("");
    setProcessing(true);
    try {
      // Simulate processing
      await new Promise((res) => setTimeout(res, 1200));
      // Randomly fail 20% to simulate errors
      const success = Math.random() > 0.2;
      const orderId = generateOrderId();

      // Persist a minimal receipt payload for receipt page
      const payload = {
        id: orderId,
        status: success ? "success" : "failed",
        method,
        items,
        fees,
        total,
        createdAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem(`receipt:${orderId}`, JSON.stringify(payload));
      } catch {}

      if (!success) {
        throw new Error("Payment was declined. Please try again.");
      }
      router.push(`/checkout/receipt/${encodeURIComponent(orderId)}`);
    } catch (err) {
      setError(err.message || "Something went wrong. Please retry.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10 text-[color:var(--foreground)]">
      <OrderStepper current={1} className="mb-6" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <section className="rounded-2xl border border-[color:var(--supporting)] bg-white p-5 sm:p-8 shadow-sm">
            <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--foreground)]">Review & Payment</h1>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              Choose a payment method and confirm your order. Need help? <a href="/contact" className="text-[color:var(--leaf)] underline underline-offset-2 hover:opacity-90">Contact support</a>.
            </p>

            <div className="mt-6">
              <PaymentMethods
                selected={method}
                onSelect={setMethod}
                disabled={processing}
                onValidityChange={setIsMethodValid}
              />
            </div>

            {error && (
              <div className="mt-6 rounded-xl border border-[color:var(--accent)]/40 bg-white p-4 text-[color:var(--foreground)] shadow-sm">
                <p className="font-semibold">Payment Error</p>
                <p className="text-sm leading-6">{error}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={handlePay}
                  className="rounded-lg bg-[color:var(--leaf)] px-3.5 py-2 text-sm font-medium text-[color:var(--surface)] shadow-sm transition hover:-translate-y-0.5 hover:bg-[color:var(--primary)] hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--leaf)]/60"
                    disabled={processing}
                  >
                    Retry Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setError("")}
                  className="rounded-lg border border-[color:var(--accent)] bg-[color:var(--surface)] px-3.5 py-2 text-sm font-medium text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
                    disabled={processing}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </section>

          <div className="rounded-2xl border border-[color:var(--surface-2)] bg-[color:var(--surface)] p-4 text-xs text-[color:var(--foreground)] shadow-sm">
            <p className="flex items-start gap-2 leading-6"><ShieldCheck className="mt-0.5 h-4 w-4 text-[color:var(--leaf)]" aria-hidden /> We use bank-grade 256-bit SSL encryption and tokenized payments when using cards. You may be redirected to a secure bank page if required. We never store sensitive payment data.</p>
            <p className="mt-2 flex items-start gap-2 leading-6"><Lock className="mt-0.5 h-4 w-4 text-[color:var(--foreground)]/80" aria-hidden /> Refunds are easy. If something goes wrong, contact us within 7 days.</p>
          </div>
        </div>

        <div className="lg:col-span-1">
          <CheckoutSummary items={items} fees={fees} onApplyPromo={onApplyPromo} />
          <form className="mt-4" onSubmit={handlePay}>
            <button
              type="submit"
              className="group w-full rounded-2xl bg-[color:var(--leaf)] px-6 py-3.5 font-semibold text-[color:var(--surface)] shadow-sm transition-all duration-200 hover:bg-[color:var(--primary)] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--leaf)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
              disabled={processing || !isMethodValid}
              aria-busy={processing}
            >
              <span className="inline-flex items-center justify-center gap-2">
                <CreditCard className="h-5 w-5" aria-hidden />
                {processing ? "Processing…" : "Confirm & Pay"}
              </span>
            </button>
          </form>
          <p className="mt-3 text-center text-xs text-[color:var(--muted)]">
            By placing this order, you agree to our Terms & Refund Policy.
          </p>
          <div className="mt-4 flex items-center justify-center gap-5 text-[color:var(--foreground)]/70">
            <CreditCard className="h-5 w-5" aria-hidden />
            <ShieldCheck className="h-5 w-5" aria-hidden />
            <Lock className="h-5 w-5" aria-hidden />
            <span className="sr-only">Trusted payments</span>
          </div>
        </div>
      </div>
    </div>
  );
}
