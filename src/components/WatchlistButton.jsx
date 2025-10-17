"use client";

import { useEffect, useState } from "react";

export default function WatchlistButton({ product }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("watchlist:v1");
      const ids = raw ? JSON.parse(raw) : [];
      setSaved(ids.includes(product.id));
    } catch {}
  }, [product.id]);

  const toggle = () => {
    try {
      const raw = localStorage.getItem("watchlist:v1");
      const ids = raw ? JSON.parse(raw) : [];
      let next;
      if (ids.includes(product.id)) {
        next = ids.filter((id) => id !== product.id);
        setSaved(false);
      } else {
        next = [...ids, product.id];
        setSaved(true);
      }
      localStorage.setItem("watchlist:v1", JSON.stringify(next));
    } catch {}
  };

  return (
    <button
      type="button"
      aria-pressed={saved}
      onClick={toggle}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] ${
        saved
          ? "border-[color:var(--leaf)] bg-[rgba(var(--primary-rgb),0.08)] text-[color:var(--leaf)]"
          : "border-[color:var(--supporting)] bg-[color:var(--surface)] text-[color:var(--foreground)] hover:bg-[color:var(--surface-2)]"
      }`}
    >
      <span aria-hidden>{saved ? "★" : "☆"}</span>
      {saved ? "Watching" : "Add to Watchlist"}
    </button>
  );
}
