"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

async function fetchWatchlistItems() {
  const token = await auth.currentUser?.getIdToken();
  const response = await fetch("/api/watchlist", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch watchlist");
  }
  const json = await response.json();
  return Array.isArray(json?.items) ? json.items : [];
}

async function addToWatchlist(productId) {
  const token = await auth.currentUser?.getIdToken();
  const response = await fetch("/api/watchlist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ productId }),
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw new Error(detail?.message || "Unable to save watchlist");
  }
}

async function removeFromWatchlist(productId) {
  const token = await auth.currentUser?.getIdToken();
  const url = `/api/watchlist?productId=${encodeURIComponent(productId)}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw new Error(detail?.message || "Unable to remove watchlist");
  }
}

export default function WatchlistButton({ product }) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setSaved(false);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const items = await fetchWatchlistItems();
        setSaved(items.some((item) => item.id === product.id || item.productId === product.id));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Watchlist unavailable");
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [product.id]);

  const toggle = async () => {
    if (!user) {
      setError("Sign in to manage your watchlist");
      return;
    }
    setError("");
    try {
      if (saved) {
        await removeFromWatchlist(product.id);
        setSaved(false);
      } else {
        await addToWatchlist(product.id);
        setSaved(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    }
  };

  const label = !user ? "Sign in to watch" : saved ? "Watching" : "Add to Watchlist";

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={loading}
        aria-pressed={saved}
        onClick={toggle}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-60 ${
          saved
            ? "border-[color:var(--leaf)] bg-[rgba(var(--primary-rgb),0.08)] text-[color:var(--leaf)]"
            : "border-[color:var(--supporting)] bg-[color:var(--surface)] text-[color:var(--foreground)] hover:bg-[color:var(--surface-2)]"
        }`}
      >
        {loading ? "Loading…" : label}
      </button>
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </div>
  );
}
