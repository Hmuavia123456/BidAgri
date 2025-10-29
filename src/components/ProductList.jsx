"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProductSkeleton from "@/components/ProductSkeleton";

const DEFAULT_PAGE_SIZE = 9;

export default function ProductList({
  items = [],
  renderItem,
  getItemId = (item, idx) => item?.id ?? idx,
  pageSize = DEFAULT_PAGE_SIZE,
  pageParam = "page",
  modeParam = "mode", // "infinite" | "paged"
  preferenceKey = "product-list-mode",
  resetKey, // change to reset pagination (e.g., filters query string)
  getImageSrc = (item) => item?.image,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Determine initial mode from URL -> default. Avoid reading localStorage
  // before hydration to keep SSR/CSR markup identical.
  const urlMode = (searchParams.get(modeParam) || "").toLowerCase();
  const initialMode = urlMode === "infinite" || urlMode === "paged" ? urlMode : "paged";
  // Deterministic initial render: honor URL if present, avoid localStorage until after mount.
  const [mode, setMode] = useState(initialMode);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const urlPage = Math.max(1, Math.min(Number(searchParams.get(pageParam)) || 1, totalPages));
  // Honor URL page for deterministic SSR/CSR initial markup.
  const [page, setPage] = useState(urlPage);

  // Reset page when filters (resetKey) or items change
  useEffect(() => {
    setPage(1);
  }, [resetKey, total]);

  // Keep URL in sync when mode or page changes (preserve existing params)
  const updateUrl = useCallback(
    (next) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.page != null) params.set(pageParam, String(next.page));
      if (next.mode) params.set(modeParam, next.mode);
      // Avoid ?page=1 clutter
      if (Number(params.get(pageParam)) === 1) params.delete(pageParam);
      const qs = params.toString();
      const href = qs ? `${pathname}?${qs}` : pathname;
      router.replace(href, { scroll: false });
    },
    [router, pathname, searchParams, pageParam, modeParam]
  );

  // Track hydration so we can defer side effects like localStorage/URL writes
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Sync from URL on mount
    if (urlPage !== page) setPage(urlPage);
    if (urlMode && urlMode !== mode) setMode(urlMode);
    // If no explicit mode in URL, try to restore a saved preference after mount
    if (!urlMode) {
      try {
        const saved = typeof window !== "undefined"
          ? window.localStorage.getItem(preferenceKey)
          : null;
        if (saved === "infinite" || saved === "paged") {
          if (saved !== mode) setMode(saved);
        }
      } catch {}
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist mode preference
  useEffect(() => {
    if (!hydrated) return; // avoid overwriting saved preference during SSR hydration
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(preferenceKey, mode);
      } catch {}
    }
    updateUrl({ mode });
  }, [mode, preferenceKey, updateUrl, hydrated]);

  // Scroll restoration per-URL
  const currentUrlKey = `${pathname}?${searchParams.toString()}`;
  useEffect(() => {
    const key = `scroll:${currentUrlKey}`;
    const saved = typeof window !== "undefined" ? window.sessionStorage.getItem(key) : null;
    if (saved) {
      const y = Number(saved) || 0;
      window.requestAnimationFrame(() => window.scrollTo(0, y));
    }
    return () => {
      try {
        window.sessionStorage.setItem(key, String(window.scrollY));
      } catch {}
    };
  }, [currentUrlKey]);

  // Visible items state and loading skeletons
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(() => {
    const count = pageSize * (initialMode === "paged" ? urlPage : 1);
    return Math.min(total, count);
  });

  // Reset visible count when items changed
  useEffect(() => {
    setVisibleCount(pageSize * 1);
  }, [resetKey, pageSize]);

  const hasMore = visibleCount < total;
  const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);

  // Focus management for newly loaded content
  const firstNewRef = useRef(null);
  const liveRegionRef = useRef(null);
  const announce = (text) => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = text;
    }
  };

  const loadNext = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const prevCount = visibleCount;
    // simulate async to show skeletons and allow painting
    await new Promise((r) => setTimeout(r, 250));
    const nextCount = Math.min(total, prevCount + pageSize);
    setVisibleCount(nextCount);
    setLoading(false);
    // Announce and focus first newly added card
    announce(`Loaded ${nextCount - prevCount} more items`);
    // Focus after next paint
    requestAnimationFrame(() => {
      if (firstNewRef.current) {
        firstNewRef.current.focus();
      }
    });
  }, [loading, hasMore, visibleCount, total, pageSize]);

  // Paged mode: handle page change via URL param and scroll to top of list
  const listTopRef = useRef(null);
  const pageFirstRef = useRef(null);
  const handlePageChange = useCallback(
    async (nextPage) => {
      const bounded = Math.max(1, Math.min(nextPage, totalPages));
      if (bounded === page) return;
      setLoading(true);
      // update URL first
      updateUrl({ page: bounded });
      // Simulate incremental load
      await new Promise((r) => setTimeout(r, 200));
      setPage(bounded);
      setVisibleCount(Math.min(total, bounded * pageSize));
      setLoading(false);
      // Move focus to first item in the new page
      requestAnimationFrame(() => {
        const el = pageFirstRef.current || listTopRef.current;
        if (el) {
          el.focus();
          const rect = el.getBoundingClientRect();
          const top = window.scrollY + rect.top - 80; // account for sticky header
          window.scrollTo({ top, behavior: "smooth" });
        }
      });
    },
    [page, pageSize, total, totalPages, updateUrl]
  );

  // Ensure visibleCount reflects current page for shareable URLs
  useEffect(() => {
    if (mode === "paged") {
      setVisibleCount((prev) => {
        const desired = Math.min(total, page * pageSize);
        return prev === desired ? prev : desired;
      });
    }
  }, [mode, page, pageSize, total]);

  // Infinite mode: IntersectionObserver to auto-load more
  const sentinelRef = useRef(null);
  useEffect(() => {
    if (mode !== "infinite") return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            loadNext();
          }
        }
      },
      { rootMargin: "400px 0px", threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mode, loadNext, sentinelRef]);

  // When switching modes, adjust URL and counts
  const switchMode = useCallback(
    (next) => {
      setMode(next);
      // Reset page and visible count for clarity
      setPage(1);
      setVisibleCount(pageSize);
      updateUrl({ page: 1, mode: next });
    },
    [pageSize, updateUrl]
  );

  // Render
  const startIdx = mode === "paged" ? (page - 1) * pageSize : 0;
  const endIdx = mode === "paged" ? Math.min(page * pageSize, visibleCount) : visibleCount;
  const pageSlice = mode === "paged" ? items.slice(startIdx, endIdx) : items.slice(0, endIdx);
  const firstNewIndex = Math.max(0, endIdx - pageSize);

  // Opportunistic prefetch: warm up next images
  useEffect(() => {
    if (!hasMore || loading) return;
    const nextStart = endIdx;
    const nextEnd = Math.min(total, endIdx + Math.min(pageSize, 6));
    const nextItems = items.slice(nextStart, nextEnd);
    nextItems.forEach((it) => {
      const src = getImageSrc(it);
      if (src) {
        const img = new Image();
        img.src = src;
      }
    });
  }, [endIdx, hasMore, loading, items, total, pageSize, getImageSrc]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-[color:var(--muted)]">
          Showing {Math.min(endIdx, total)} of {total}
        </div>
        <div className="inline-flex rounded-full bg-[color:var(--surface-2)] p-1" role="tablist" aria-label="List loading mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "paged"}
            onClick={() => switchMode("paged")}
            className={`px-3 py-1.5 text-sm rounded-full ${
              mode === "paged" ? "bg-[color:var(--surface)] shadow text-[color:var(--foreground)]" : "text-[color:var(--muted)]"
            }`}
          >
            Page numbers
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "infinite"}
            onClick={() => switchMode("infinite")}
            className={`px-3 py-1.5 text-sm rounded-full ${
              mode === "infinite" ? "bg-[color:var(--surface)] shadow text-[color:var(--foreground)]" : "text-[color:var(--muted)]"
            }`}
          >
            Infinite scroll
          </button>
        </div>
      </div>

      <div
        ref={listTopRef}
        tabIndex={-1}
        aria-label="Product results"
        className="outline-none"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 mt-0">
        {pageSlice.map((item, idx) => {
          const id = getItemId(item, idx);
          const isFirstNew = idx === firstNewIndex && endIdx > pageSize;
          const ref = isFirstNew ? firstNewRef : mode === "paged" && idx === 0 ? pageFirstRef : undefined;
          return (
            <div key={id} ref={ref} tabIndex={-1} className="focus:outline-none">
              {renderItem(item)}
            </div>
          );
        })}
      </div>

      {loading && (
        <div className="mt-6">
          <ProductSkeleton count={Math.min(pageSize, total - endIdx)} />
        </div>
      )}

      {/* Paged controls */}
      {mode === "paged" && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-[color:var(--muted)]" aria-live="polite">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2" role="navigation" aria-label="Pagination">
            <button
              type="button"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm rounded-lg ring-1 ring-[color:var(--supporting)] disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).slice(0, 7).map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  aria-current={p === page ? "page" : undefined}
                  type="button"
                  onClick={() => handlePageChange(p)}
                  className={`px-3 py-1.5 text-sm rounded-lg ring-1 ring-[color:var(--supporting)] ${
                    p === page ? "bg-[color:var(--leaf)] text-[color:var(--surface)] ring-[color:var(--leaf)]" : "bg-[color:var(--surface)] text-[color:var(--foreground)]"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-sm rounded-lg ring-1 ring-[color:var(--supporting)] disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Infinite controls */}
      {mode === "infinite" && hasMore && (
        <div ref={sentinelRef} className="h-2" aria-hidden />
      )}

      <div
        ref={liveRegionRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </div>
  );
}
