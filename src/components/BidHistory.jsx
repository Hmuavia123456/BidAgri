"use client";

import { useMemo, useRef, useState, useEffect } from "react";

export default function BidHistory({ productId }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef(null);
  const firstRef = useRef(null);
  const lastFocusedRef = useRef(null);

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
        const f = dialogRef.current.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
        if (f.length === 0) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last instanceof HTMLElement && last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first instanceof HTMLElement && first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKeyDown);
      const prev = lastFocusedRef.current;
      if (prev && prev instanceof HTMLElement) prev.focus();
    };
  }, [open]);

  const bids = useMemo(() => mockBids(productId), [productId]);
  const preview = bids.slice(0, 3);

  return (
    <div className="rounded-xl ring-1 ring-[color:var(--supporting)]/40 bg-gradient-to-b from-[color:var(--surface)] to-[color:var(--surface-2)] p-4">
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

      <ul className="mt-3 space-y-2">
        {preview.map((b) => (
          <li key={b.id} className="flex items-center justify-between text-sm">
            <span className="text-[color:var(--muted)]">{b.label}</span>
            <span className="text-[color:var(--foreground)] font-medium">Rs {b.amount}/kg</span>
          </li>
        ))}
        {preview.length === 0 && (
          <li className="text-sm text-[color:var(--muted)]">No bids yet.</li>
        )}
      </ul>

      {open && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div ref={dialogRef} className="w-full max-w-md rounded-xl bg-[color:var(--surface)] shadow-lg ring-1 ring-[color:var(--supporting)]/40" role="document">
              <div className="flex items-center justify-between border-b border-[color:var(--supporting)]/40 px-4 py-3">
                <h4 className="font-semibold text-[color:var(--foreground)]">Bid History</h4>
                <button
                  ref={firstRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto px-4 py-3">
                <ul className="space-y-2">
                  {bids.map((b) => (
                    <li key={b.id} className="flex items-center justify-between text-sm">
                      <div className="text-[color:var(--muted)]">{b.label}</div>
                      <div className="text-[color:var(--foreground)] font-medium">Rs {b.amount}/kg</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function mockBids(productId) {
  const base = [
    { id: 1, amount: 100, ts: Date.now() - 1000 * 60 * 20 },
    { id: 2, amount: 105, ts: Date.now() - 1000 * 60 * 40 },
    { id: 3, amount: 110, ts: Date.now() - 1000 * 60 * 60 },
    { id: 4, amount: 115, ts: Date.now() - 1000 * 60 * 80 },
  ];
  return base.map((b, i) => ({
    ...b,
    id: `${productId}-${b.id}`,
    label: `Bidder #${i + 1}`,
  }));
}
