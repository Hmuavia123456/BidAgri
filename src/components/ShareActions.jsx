"use client";

import { useEffect, useState } from "react";

export default function ShareActions({ product }) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const shareNative = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      await navigator.share({ title: product.title, text: product.title, url });
    } catch {
      // ignore cancel
    }
  };

  const copyLink = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex items-center gap-2 rounded-full border border-[color:var(--supporting)] px-3 py-1.5 text-sm text-[color:var(--foreground)] bg-[color:var(--surface)] hover:bg-[color:var(--surface-2)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
      >
        <span aria-hidden>🔗</span>
        {copied ? "Link copied" : "Copy Link"}
      </button>
      <button
        type="button"
        onClick={shareNative}
        disabled={!canShare}
        aria-disabled={!canShare}
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-2 ${
          canShare
            ? "bg-[color:var(--primary)] text-[color:var(--surface)] hover:shadow-[0_8px_24px_rgba(var(--primary-rgb),0.25)] focus:ring-[color:var(--accent)]"
            : "bg-[color:var(--surface-2)] text-[color:var(--muted)] focus:ring-[color:var(--supporting)]"
        }`}
      >
        <span aria-hidden>📣</span>
        {canShare ? "Share" : "Share (unsupported)"}
      </button>
    </div>
  );
}
