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
      className={`rounded-2xl border border-[color:var(--surface-2)] bg-[color:var(--surface)] shadow-sm ${className}`}
      aria-labelledby="order-summary-heading"
    >
      <div className="p-5 sm:p-6">
        <h2 id="order-summary-heading" className="text-xl font-semibold tracking-tight text-[color:var(--primary)]">
          Order Summary
        </h2>

        <ul className="mt-4 divide-y divide-[color:var(--surface-2)]/80" role="list">
          {items.map((it, idx) => (
            <li key={idx} className="flex items-start justify-between py-3">
              <div>
                <p className="font-medium text-[color:var(--foreground)]">{it.name}</p>
                <p className="text-sm text-[color:var(--muted)]">Qty: {it.qty}</p>
              </div>
              <div className="text-right">
                <p className="text-[color:var(--foreground)]">
                  {currency} {(it.price * it.qty).toFixed(2)}
                </p>
                <p className="text-xs text-[color:var(--muted)]">@ {currency} {it.price.toFixed(2)}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[color:var(--foreground)]/90">Subtotal</span>
            <span className="font-medium">
              {currency} {subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[color:var(--foreground)]/90">Shipping</span>
            <span className="font-medium">
              {currency} {(fees.shipping || 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[color:var(--foreground)]/90">Service Fee</span>
            <span className="font-medium">
              {currency} {(fees.service || 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between border-t pt-2 text-base">
            <span className="font-semibold">Total</span>
            <span className="font-semibold">
              {currency} {total.toFixed(2)}
            </span>
          </div>
        </div>

        <form className="mt-5" onSubmit={handleApply}>
          <label htmlFor="promo" className="block text-sm font-medium text-[color:var(--primary)]">
            Have a promo code?
          </label>
          <div className="mt-1 flex gap-2">
            <input
              id="promo"
              name="promo"
              type="text"
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
              className="flex-1 rounded-lg border border-[color:var(--surface-2)] bg-[color:var(--surface)] px-3 py-2 text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--leaf)]/50"
              placeholder="e.g., SAVE10"
              aria-invalid={!!error}
              aria-describedby={error ? "promo-error" : undefined}
            />
            <button
              type="submit"
              className="rounded-lg bg-[color:var(--leaf)] px-4 py-2 text-[color:var(--surface)] shadow-sm transition hover:bg-[color:var(--primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--leaf)]/60 disabled:opacity-50"
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
          <div className="mt-5 rounded-xl border border-[color:var(--surface-2)] bg-[color:var(--surface-2)] p-4 text-sm text-[color:var(--foreground)] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                Discount Applied ({discountPercent}%)
                {appliedCode ? ` — ${appliedCode}` : ""}
              </span>
              <span className="line-through opacity-70">
                {currency} {total.toFixed(2)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-base">
              <span className="font-semibold">New Total</span>
              <span className="font-semibold">
                {currency} {discountedTotal.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        <div className="mt-6 rounded-xl border border-[color:var(--surface-2)] bg-[color:var(--surface)] p-3 text-xs text-[color:var(--foreground)] shadow-sm">
          <p>
            Payments are protected by SSL and tokenization. We do not store card details. Trusted by farmers and buyers across Pakistan.
          </p>
          <div className="mt-2 flex items-center gap-2 text-[color:var(--foreground)]/80">
            <ShieldCheck className="h-5 w-5 text-[color:var(--leaf)]" aria-hidden />
            <Lock className="h-5 w-5" aria-hidden />
            <span className="sr-only">Security and trust badges</span>
          </div>
        </div>
      </div>
    </section>
  );
}
