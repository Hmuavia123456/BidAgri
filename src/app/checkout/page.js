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
  const [stepStage, setStepStage] = useState(1);

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
    setStepStage(2);
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
      setStepStage(1);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 text-[#0f172a] sm:py-10">
      <OrderStepper current={stepStage} className="mb-8" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section className="ui-card bg-white/95 p-6 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="ui-badge bg-[rgba(var(--leaf-rgb),0.12)] text-[color:var(--leaf)]">Step {stepStage}</span>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#0f172a]">Review &amp; Payment</h1>
              </div>
              <div className="rounded-2xl bg-[rgba(var(--leaf-rgb),0.12)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--leaf)]">
                Secure Session
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-600 sm:text-base">
              Choose a payment method and confirm your order. Need help? <a href="/contact" className="font-medium text-primary underline underline-offset-2 transition-colors hover:text-secondary">Contact support</a>.
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
              <div className="mt-6 rounded-2xl border border-[rgba(239,68,68,0.2)] bg-[rgba(254,226,226,0.7)] p-4 text-sm text-rose-700 shadow-sm">
                <p className="font-semibold text-rose-700">Payment Error</p>
                <p className="mt-1 leading-6">{error}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={handlePay}
                    className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-colors duration-200 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={processing}
                  >
                    Retry Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setError("")}
                    className="rounded-full border border-rose-400/70 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition-colors duration-200 hover:bg-rose-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/70 focus:ring-offset-2 focus:ring-offset-white"
                    disabled={processing}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </section>

          <div className="ui-card bg-white/95 p-5 text-sm text-slate-600">
            <p className="flex items-start gap-3 leading-6 text-[#0f172a]"><ShieldCheck className="mt-0.5 h-5 w-5 text-[color:var(--leaf)]" aria-hidden /> We use bank-grade 256-bit SSL encryption and tokenized payments when using cards. You may be redirected to a secure bank page if required. We never store sensitive payment data.</p>
            <p className="mt-3 flex items-start gap-3 leading-6"><Lock className="mt-0.5 h-5 w-5 text-slate-500" aria-hidden /> Refunds are easy. If something goes wrong, contact us within 7 days.</p>
          </div>
        </div>

        <div className="lg:col-span-1">
          <CheckoutSummary items={items} fees={fees} onApplyPromo={onApplyPromo} />
          <form className="mt-4" onSubmit={handlePay}>
            <button
              type="submit"
              className="group w-full rounded-2xl bg-primary px-6 py-3.5 font-semibold text-white shadow-[0_18px_36px_rgba(var(--leaf-rgb),0.28)] transition-colors duration-200 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
              disabled={processing || !isMethodValid}
              aria-busy={processing}
            >
              <span className="inline-flex items-center justify-center gap-2">
                <CreditCard className="h-5 w-5" aria-hidden />
                {processing ? "Processing…" : "Confirm & Pay"}
              </span>
            </button>
          </form>
          <p className="mt-3 text-center text-xs text-slate-500">
            By placing this order, you agree to our Terms & Refund Policy.
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-slate-500">
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
