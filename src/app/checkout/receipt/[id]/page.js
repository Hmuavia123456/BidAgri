"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import OrderStepper from "@/components/OrderStepper";

export default function ReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params || {};
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    // Load from localStorage (mock). In real app, fetch from server.
    try {
      const raw = localStorage.getItem(`receipt:${id}`);
      if (raw) setData(JSON.parse(raw));
    } catch {}
    setLoading(false);
  }, [id]);

  const statusStyles = useMemo(() => {
    const base = "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-sm";
    if (data?.status === "success")
      return `${base} bg-[color:var(--surface-2)] text-[color:var(--leaf)] border border-[color:var(--supporting)]`;
    if (data?.status === "failed")
      return `${base} bg-[color:var(--surface-2)] text-[color:var(--accent)] border border-[color:var(--supporting)]`;
    return `${base} bg-[color:var(--surface)] text-[color:var(--foreground)] border border-[color:var(--supporting)]`;
  }, [data]);

  function handleCopy() {
    if (!id) return;
    navigator.clipboard.writeText(id).catch(() => {});
  }

  function handlePrint() {
    if (typeof window !== "undefined") window.print();
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <OrderStepper current={2} className="mb-6" />
        <div className="rounded-xl border border-[color:var(--supporting)] bg-[color:var(--surface)] p-6 shadow-sm">
          <p className="animate-pulse text-[color:var(--muted)]">Loading receipt…</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <OrderStepper current={2} className="mb-6" />
      <div className="rounded-xl border border-[color:var(--supporting)] bg-[color:var(--surface-2)] p-6 shadow-sm">
          <p className="font-medium text-[color:var(--foreground)]">
            Receipt not found. It may have expired or been removed.
          </p>
          <button
            onClick={() => router.push("/checkout")}
            className="mt-3 rounded-md bg-[color:var(--leaf)] px-4 py-2 text-[color:var(--surface)] hover:bg-[color:var(--primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]"
          >
            Go to Checkout
          </button>
        </div>
      </div>
    );
  }

  const { items = [], fees = { shipping: 0, service: 0 }, total, method, createdAt } = data;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <OrderStepper current={2} className="mb-6" />
      <div className="rounded-xl border border-[color:var(--supporting)] bg-[color:var(--surface)] shadow-sm">
        <div className="border-b p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl font-semibold text-[color:var(--foreground)]">Order Confirmation</h1>
            <span className={statusStyles}>
              <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
              {data.status === "success" ? "Paid" : data.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Thank you. Your order has been {data.status}. A copy of this receipt can be printed or saved for your records.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-mono text-[color:var(--foreground)]">Order ID: {id}</span>
            <button
              onClick={handleCopy}
              className="rounded-md border border-[color:var(--supporting)] px-2 py-1 text-xs text-[color:var(--foreground)] hover:bg-[color:var(--surface-2)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]"
            >
              Copy
            </button>
            <span className="text-[color:var(--muted)]">•</span>
            <span className="text-[color:var(--foreground)]">{new Date(createdAt).toLocaleString()}</span>
          </div>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2">
          <section>
            <h2 className="text-base font-semibold text-[color:var(--foreground)]">Items</h2>
            <ul className="mt-3 divide-y divide-[color:var(--supporting)]/60" role="list">
              {items.map((it, idx) => (
                <li key={idx} className="flex items-start justify-between py-3">
                  <div>
                    <p className="font-medium text-[color:var(--foreground)]">{it.name}</p>
                    <p className="text-sm text-[color:var(--muted)]">Qty: {it.qty}</p>
                  </div>
                  <p className="text-[color:var(--foreground)]">PKR {(it.price * it.qty).toFixed(2)}</p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[color:var(--foreground)]">Payment</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-[color:var(--muted)]">Method</dt>
                <dd className="font-medium capitalize text-[color:var(--foreground)]">{method}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[color:var(--muted)]">Shipping</dt>
                <dd className="font-medium text-[color:var(--foreground)]">PKR {(fees.shipping || 0).toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[color:var(--muted)]">Service Fee</dt>
                <dd className="font-medium text-[color:var(--foreground)]">PKR {(fees.service || 0).toFixed(2)}</dd>
              </div>
              <div className="flex justify-between border-t pt-2 text-base">
                <dt className="font-semibold text-[color:var(--foreground)]">Total</dt>
                <dd className="font-semibold text-[color:var(--foreground)]">PKR {Number(total || 0).toFixed(2)}</dd>
              </div>
            </dl>

              <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={handlePrint}
                className="rounded-md bg-[color:var(--leaf)] px-4 py-2 text-[color:var(--surface)] shadow-sm transition hover:-translate-y-0.5 hover:bg-[color:var(--primary)] hover:shadow focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]"
              >
                Print Receipt
              </button>
              <button
                onClick={() => router.push("/")}
                className="rounded-md border border-[color:var(--supporting)] bg-[color:var(--surface)] px-4 py-2 text-[color:var(--foreground)] shadow-sm transition hover:-translate-y-0.5 hover:bg-[color:var(--surface-2)] hover:shadow focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]"
              >
                Continue Shopping
              </button>
            </div>
            <p className="mt-3 text-xs text-[color:var(--muted)]">
              Your payment details were processed securely using tokenization and SSL. We never store your card numbers.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
