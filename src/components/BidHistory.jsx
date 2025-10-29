"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

async function fetchBids(productId) {
  const params = new URLSearchParams({ productId, limit: "50" });
  const response = await fetch(`/api/bids?${params.toString()}`, { cache: "no-store" });
  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw new Error(detail?.message || "Unable to load bids.");
  }
  const json = await response.json();
  return Array.isArray(json?.items) ? json.items : [];
}

function formatBidderName(value, index) {
  if (value) return value;
  return `Bidder #${index + 1}`;
}

export default function BidHistory({ productId }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef(null);
  const firstRef = useRef(null);
  const lastFocusedRef = useRef(null);
  const [bids, setBids] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!productId) return;
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const items = await fetchBids(productId);
        if (active) {
          setBids(items);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Unable to load bids.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const listener = (event) => {
      const changedId = event.detail?.productId;
      if (!changedId || changedId === productId) {
        load();
      }
    };
    window.addEventListener("bid:placed", listener);
    return () => {
      active = false;
      window.removeEventListener("bid:placed", listener);
    };
  }, [productId]);

  useEffect(() => {
    if (!open) return;
    lastFocusedRef.current = document.activeElement;
    const t = setTimeout(() => firstRef.current?.focus(), 0);
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last instanceof HTMLElement && last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first instanceof HTMLElement && first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKeyDown);
      const prev = lastFocusedRef.current;
      if (prev && prev instanceof HTMLElement) prev.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    const previous = document.body.style.overflow;
    if (open) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open, mounted]);

  const preview = useMemo(() => bids.slice(0, 3), [bids]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[rgba(var(--leaf-rgb),0.16)] bg-gradient-to-br from-white via-[rgba(var(--leaf-rgb),0.04)] to-white p-4 shadow-[0_18px_32px_rgba(15,23,42,0.12)]">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[color:var(--foreground)]">Recent Bids</h3>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-sm text-[color:var(--leaf)] hover:underline"
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          View all
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}

      <div className="mt-3">
        <div className="max-h-56 overflow-y-auto pr-1">
          <ul className="space-y-2">
            {preview.map((b, index) => (
              <li
                key={b.id}
                className="flex items-center justify-between rounded-full bg-[rgba(var(--leaf-rgb),0.08)] px-3 py-2 text-sm"
              >
                <span className="text-[color:var(--muted)]">{formatBidderName(b.bidderName, index)}</span>
                <span className="font-semibold text-[color:var(--foreground)]">Rs {Number(b.bidPerKg || 0).toLocaleString()}/kg</span>
              </li>
            ))}
            {!loading && preview.length === 0 && (
              <li className="rounded-full bg-[rgba(var(--accent-rgb),0.08)] px-3 py-2 text-center text-sm text-[color:var(--muted)]">
                No bids yet.
              </li>
            )}
            {loading && (
              <li className="rounded-full bg-[rgba(var(--accent-rgb),0.08)] px-3 py-2 text-center text-sm text-[color:var(--muted)]">
                Loading bids…
              </li>
            )}
          </ul>
        </div>
      </div>

      {mounted &&
        open &&
        createPortal(
          <div role="dialog" aria-modal="true" className="fixed inset-0 z-[999]">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div
                ref={dialogRef}
                className="w-full max-w-md overflow-hidden rounded-3xl border border-[rgba(var(--accent-rgb),0.22)] bg-gradient-to-br from-white via-[rgba(var(--accent-rgb),0.04)] to-white shadow-[0_16px_44px_rgba(var(--accent-rgb),0.25)]"
                role="document"
              >
                <div className="flex items-center justify-between border-b border-[rgba(var(--accent-rgb),0.15)] px-5 py-3">
                  <h4 className="text-base font-semibold text-[color:var(--foreground)]">Bid History</h4>
                  <button
                    ref={firstRef}
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--muted)] transition hover:bg-[rgba(var(--accent-rgb),0.12)] hover:text-[color:var(--foreground)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
                  <ul className="space-y-3">
                    {bids.map((b, index) => (
                      <li
                        key={b.id}
                        className="flex items-center justify-between rounded-2xl border border-[rgba(var(--leaf-rgb),0.16)] bg-white/80 px-4 py-2 text-sm shadow-sm shadow-[rgba(var(--leaf-rgb),0.12)]"
                      >
                        <div className="text-[color:var(--muted)]">{formatBidderName(b.bidderName, index)}</div>
                        <div className="text-[color:var(--foreground)] font-semibold">
                          Rs {Number(b.bidPerKg || 0).toLocaleString()}/kg
                        </div>
                      </li>
                    ))}
                    {!loading && bids.length === 0 && (
                      <li className="rounded-2xl border border-dashed border-[rgba(var(--leaf-rgb),0.2)] bg-white/70 px-4 py-3 text-center text-sm text-[color:var(--muted)]">
                        No bids yet.
                      </li>
                    )}
                    {loading && (
                      <li className="rounded-2xl border border-[rgba(var(--accent-rgb),0.15)] bg-white/70 px-4 py-3 text-center text-sm text-[color:var(--muted)]">
                        Loading bids…
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
