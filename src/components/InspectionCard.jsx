"use client";

import React from "react";
import ImageWithFallback from "@/components/ImageWithFallback";

const STABLE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

function formatForSSR(iso) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso || "—";
    return `${STABLE_FORMATTER.format(d)} UTC`;
  } catch {
    return iso || "—";
  }
}

function formatForClient(iso) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso || "—";
    const locale = typeof navigator !== "undefined" ? navigator.language : "en-GB";
    const resolved = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions() : {};
    const tz = resolved?.timeZone || "UTC";
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: tz,
      timeZoneName: "short",
    }).format(d);
  } catch {
    return iso || "—";
  }
}

function useFormattedTimestamp(iso) {
  const ssrValue = React.useMemo(() => formatForSSR(iso), [iso]);
  const [value, setValue] = React.useState(ssrValue);

  React.useEffect(() => {
    setValue(formatForClient(iso));
  }, [iso]);

  return value;
}

export function InspectionCard({ item, onOpen }) {
  const { inspector, timestamp, note, images = [] } = item || {};
  const img = images[0];
  const formattedTimestamp = useFormattedTimestamp(timestamp);

  return (
    <article className="flex items-start gap-3 rounded-lg ring-1 ring-[color:var(--supporting)]/40 bg-[color:var(--surface)] p-3 shadow-sm">
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-[color:var(--surface-2)] ring-1 ring-[color:var(--supporting)]/40">
        {img ? (
          <div className="relative h-full w-full">
            <ImageWithFallback
              src={img}
              alt="Quality assurance checklist illustration."
              fill
              sizes="64px"
              quality={60}
            />
          </div>
        ) : (
          <div className="h-full w-full grid place-items-center text-[color:var(--muted)]">—</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-[color:var(--foreground)]">Inspection</h4>
          <time className="text-xs text-[color:var(--muted)]" dateTime={timestamp}>
            {formattedTimestamp}
          </time>
        </div>
        <p className="mt-1 text-sm text-[color:var(--foreground)] line-clamp-2">{note}</p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-[color:var(--muted)]">Inspector: {inspector}</p>
          <button
            type="button"
            onClick={() => onOpen?.(item)}
            className="text-xs font-medium text-[color:var(--leaf)] hover:underline focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] rounded"
            aria-label="View proof"
          >
            View proof
          </button>
        </div>
      </div>
    </article>
  );
}

export function InspectionModal({ open, onClose, item }) {
  const firstRef = React.useRef(null);
  const lastFocusedRef = React.useRef(null);
  const dialogRef = React.useRef(null);
  const formattedTimestamp = useFormattedTimestamp(item?.timestamp);
  React.useEffect(() => {
    if (!open) return;
    lastFocusedRef.current = document.activeElement;
    const t = setTimeout(() => firstRef.current?.focus(), 0);
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
      }
      if (e.key === "Tab" && dialogRef.current) {
        const f = dialogRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
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
    document.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKeyDown);
      const prev = lastFocusedRef.current;
      if (prev && prev instanceof HTMLElement) prev.focus();
    };
  }, [open, onClose]);

  if (!open || !item) return null;
  const { inspector, timestamp, note, images = [] } = item;
  const titleId = `insp-title-${item.id}`;
  const descId = `insp-desc-${item.id}`;
  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/50" aria-hidden onClick={onClose} />
      <div className="fixed inset-0 z-[70] grid place-items-center p-4">
        <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descId} className="w-full max-w-lg rounded-2xl bg-[color:var(--surface)] p-5 shadow-2xl ring-1 ring-[color:var(--supporting)]/40">
          <header className="flex items-start justify-between gap-3 border-b border-[color:var(--accent)]/30 pb-3">
            <div>
              <h3 id={titleId} className="text-base font-semibold text-[color:var(--foreground)]">Inspection proof</h3>
              <p id={descId} className="text-xs text-[color:var(--muted)]">
                Inspector: {inspector} • {formattedTimestamp}
              </p>
            </div>
            <button ref={firstRef} onClick={onClose} className="rounded-full p-2 text-[color:var(--muted)] hover:bg-[color:var(--surface-2)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]" aria-label="Close">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
            </button>
          </header>
          <div className="mt-4 space-y-3">
            <p className="text-sm text-[color:var(--foreground)]/80">{note}</p>
            <div className="grid grid-cols-2 gap-3">
              {images.map((src, i) => (
                <figure key={i} className="overflow-hidden rounded-md ring-1 ring-[color:var(--supporting)]/40 bg-[color:var(--surface-2)]">
                  <div className="relative h-40 w-full">
                    <ImageWithFallback
                      src={src}
                      alt="Quality assurance checklist illustration."
                      fill
                      sizes="(max-width: 640px) 45vw, 25vw"
                      quality={65}
                    />
                  </div>
                </figure>
              ))}
              {images.length === 0 && (
                <div className="text-sm text-[color:var(--muted)]">No media attached.</div>
              )}
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <button type="button" onClick={onClose} className="rounded-lg bg-[color:var(--primary)] text-[color:var(--surface)] px-4 py-2 text-sm font-medium hover:shadow-[0_8px_24px_rgba(var(--primary-rgb),0.25)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]">Close</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default InspectionCard;
