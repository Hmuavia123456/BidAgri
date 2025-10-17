"use client";

import { useMemo, useRef } from "react";

// Sticky action bar that stays visible while scrolling and respects safe-area.
// Dev check: In mobile viewport, scroll the products list and confirm this bar remains visible.
// Tap "Filters" to open the sheet; change sort from the select and ensure the URL query updates and list reorders without page jump.
export default function StickyFilterBar({
  onOpenFilters,
  activeCount = 0,
  sortValue,
  sortOptions = [],
  onChangeSort,
}) {
  const btnRef = useRef(null);
  const label = useMemo(() => {
    return activeCount > 0 ? `${activeCount} filters` : "Filters";
  }, [activeCount]);

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 md:hidden"
      style={{ paddingBottom: `max(env(safe-area-inset-bottom), 0px)` }}
      role="region"
      aria-label="Filter and sort actions"
    >
      <div className="mx-auto max-w-7xl px-4 pb-2">
    <div className="rounded-full shadow-lg ring-1 ring-black/10 bg-[color:var(--surface)] overflow-hidden">
          <div className="flex items-stretch divide-x divide-[color:var(--surface-2)]">
            <button
              ref={btnRef}
              type="button"
              onClick={() => onOpenFilters?.(btnRef)}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-[color:var(--foreground)] hover:bg-[color:var(--surface-2)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]"
              aria-label="Open filters"
            >
              {label}
            </button>
            <label className="sr-only" htmlFor="sticky-sort">Sort</label>
            <div className="flex-1 relative">
              <select
                id="sticky-sort"
                aria-label="Sort products"
                value={sortValue}
                onChange={(e) => onChangeSort?.(e.target.value)}
                className="w-full appearance-none bg-[color:var(--surface)] px-4 py-3 text-sm font-medium text-[color:var(--foreground)] hover:bg-[color:var(--surface-2)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
