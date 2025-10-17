"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function AuctionTimer({ endTime, onExpire, className = "" }) {
  const [now, setNow] = useState(() => Date.now());
  const expiredRef = useRef(false);

  // tick per second
  useEffect(() => {
    if (!endTime) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [endTime]);

  const msLeft = endTime ? Math.max(0, endTime - now) : 0;
  const secondsLeft = Math.floor(msLeft / 1000);
  const isEnding = secondsLeft <= 30;

  useEffect(() => {
    if (secondsLeft <= 0 && !expiredRef.current) {
      expiredRef.current = true;
      onExpire?.();
    }
  }, [secondsLeft, onExpire]);

  const label = useMemo(() => formatDuration(secondsLeft), [secondsLeft]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span
        className={
          "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium " +
          (secondsLeft > 0
            ? isEnding
              ? "bg-white text-[color:var(--primary)] ring-1 ring-[color:var(--accent)] motion-safe:animate-pulse"
              : "bg-white text-[color:var(--secondary)] ring-1 ring-[color:var(--accent)]"
            : "bg-[color:var(--surface)] text-[color:var(--muted)] ring-1 ring-[color:var(--accent)]")
        }
        aria-live="polite"
        aria-atomic="true"
        role="status"
      >
        {secondsLeft > 0 ? `Time left: ${label}` : "Auction ended"}
      </span>
    </div>
  );
}

function formatDuration(totalSeconds) {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h > 0) return `${h}h ${min}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}
