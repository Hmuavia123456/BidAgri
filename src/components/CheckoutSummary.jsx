"use client";

import React, { useMemo, useState } from "react";
import { ShieldCheck, Lock } from "lucide-react";

export default function CheckoutSummary({
  items = [],
  fees = { shipping: 0, service: 0 },
  currency = "PKR",
  className = "",
}) {
  const [promo, setPromo] = useState("");
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");

  // Temporary frontend-only promo codes
  const PROMO_CODES = {
    SAVE10: 10,
    FARM5: 5,
    AGRI20: 20,
  };

  const subtotal = useMemo(
    () => items.reduce((acc, it) => acc + it.price * it.qty, 0),
    [items]
  );
  const total = useMemo(
    () => subtotal + (fees.shipping || 0) + (fees.service || 0),
    [subtotal, fees]
  );
  const discountedTotal = useMemo(
    () => (discountPercent > 0 ? total * (1 - discountPercent / 100) : total),
    [total, discountPercent]
  );

  async function handleApply(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setApplying(true);
    try {
      // Simulate minimal UX delay
      await new Promise((res) => setTimeout(res, 400));
      if (!promo) throw new Error("Enter a promo code");
      const code = promo.trim().toUpperCase();

      const pct = PROMO_CODES[code];
      if (!pct) {
        setDiscountPercent(0);
        setAppliedCode("");
        throw new Error("Invalid or expired promo code.");
      }

      setDiscountPercent(pct);
      setAppliedCode(code);
      setSuccess(`Promo code applied! You saved ${pct}%.`);
    } catch (err) {
      setError(err.message || "Failed to apply promo");
    } finally {
      setApplying(false);
    }
  }

  return (
    <section
      className={`ui-card border border-[rgba(15,23,42,0.08)] bg-white/95 ${className}`}
      aria-labelledby="order-summary-heading"
    >
      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="ui-badge bg-[rgba(var(--leaf-rgb),0.12)] text-[color:var(--leaf)]">Cart</span>
            <h2 id="order-summary-heading" className="mt-3 text-2xl font-semibold tracking-tight text-[#0f172a] sm:text-[28px]">
              Order Summary
            </h2>
          </div>
          <div className="rounded-xl bg-[rgba(var(--leaf-rgb),0.12)] px-3 py-2 text-right text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(var(--leaf-rgb),0.9)]">
            Secure Checkout
          </div>
        </div>

        <ul className="mt-6 divide-y divide-[rgba(15,23,42,0.08)]" role="list">
          {items.map((it, idx) => (
            <li key={idx} className="flex items-start justify-between py-3">
              <div>
                <p className="font-semibold text-[#0f172a]">{it.name}</p>
                <p className="text-sm text-slate-500">Qty: {it.qty}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[#0f172a]">
                  {currency} {(it.price * it.qty).toFixed(2)}
                </p>
                <p className="text-xs text-slate-500">@ {currency} {it.price.toFixed(2)}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-5 space-y-3 rounded-2xl bg-[rgba(241,245,249,0.6)] p-4 text-sm text-[#0f172a]">
          <div className="flex justify-between text-base">
            <span className="font-medium text-slate-600">Subtotal</span>
            <span className="font-semibold">
              {currency} {subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-base">
            <span className="font-medium text-slate-600">Shipping</span>
            <span className="font-semibold">
              {currency} {(fees.shipping || 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-base">
            <span className="font-medium text-slate-600">Service Fee</span>
            <span className="font-semibold">
              {currency} {(fees.service || 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between border-t border-white/60 pt-3 text-lg font-semibold text-[#0f172a]">
            <span>Total</span>
            <span>
              {discountPercent > 0 ? (
                <span className="flex items-center gap-2">
                  <span className="text-sm font-normal text-slate-500 line-through">{currency} {total.toFixed(2)}</span>
                  <span>{currency} {discountedTotal.toFixed(2)}</span>
                </span>
              ) : (
                `${currency} ${total.toFixed(2)}`
              )}
            </span>
          </div>
        </div>

        <form className="mt-6" onSubmit={handleApply}>
          <label htmlFor="promo" className="block text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Have a promo code?
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="promo"
              name="promo"
              type="text"
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
              className="flex-1 rounded-xl border border-[rgba(15,23,42,0.12)] bg-white px-3 py-3 text-sm font-medium text-[#0f172a] placeholder:text-slate-400 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--leaf)]/60"
              placeholder="e.g., SAVE10"
              aria-invalid={!!error}
              aria-describedby={error ? "promo-error" : undefined}
            />
            <button
              type="submit"
              className="rounded-xl bg-[color:var(--leaf)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-[0_14px_28px_rgba(var(--leaf-rgb),0.28)] transition hover:bg-[color:var(--secondary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--leaf)]/60 disabled:opacity-50"
              disabled={applying}
            >
              {applying ? "Applying…" : "Apply"}
            </button>
          </div>
          {error && (
            <p id="promo-error" className="mt-2 text-sm text-[color:var(--accent)]">
              {error}
            </p>
          )}
          {success && (
            <p className="mt-2 text-sm text-[color:var(--leaf)]">{success}</p>
          )}
        </form>

        {discountPercent > 0 && (
          <div className="mt-6 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-[rgba(var(--leaf-rgb),0.08)] p-4 text-sm text-[#0f172a] shadow-inner">
            <div className="flex items-center justify-between">
              <span className="font-semibold">
                Discount Applied ({discountPercent}%)
                {appliedCode ? ` — ${appliedCode}` : ""}
              </span>
              <span className="text-sm font-medium text-slate-500 line-through">
                {currency} {total.toFixed(2)}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-lg font-semibold">
              <span>New Total</span>
              <span>
                {currency} {discountedTotal.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <div className="mt-7 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white/90 p-4 text-xs text-slate-600 shadow-sm">
          <p className="text-sm text-[#0f172a]">
            Payments are protected by SSL and tokenization. We do not store card details. Trusted by farmers and buyers across Pakistan.
          </p>
          <div className="mt-3 flex items-center gap-3 text-slate-500">
            <ShieldCheck className="h-5 w-5 text-[color:var(--leaf)]" aria-hidden />
            <Lock className="h-5 w-5" aria-hidden />
            <span className="sr-only">Security and trust badges</span>
          </div>
        </div>
      </div>
    </section>
  );
}
