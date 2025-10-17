"use client";

import { useEffect, useMemo, useRef, useCallback } from "react";
import SearchBar from "@/components/SearchBar";
import PriceRangeSlider from "@/components/PriceRangeSlider";
import StatusChips from "@/components/StatusChips";
import { getCategories } from "@/data/categoryUtils";

// Bottom sheet for mobile filter experience with focus trap and accessible labels.
// Dev check: In a mobile viewport, visit "/products", tap the sticky "Filters" button.
// The sheet should slide up from the bottom, trap focus (Tab/Shift+Tab cycles), and Esc or overlay click closes.
// Tap "Apply" or "Clear all" and confirm the URL query updates and product list refreshes without page scroll.
export default function MobileFilterSheet({
  open,
  onClose,
  filters,
  setFilters,
  onApply,
  onClear,
  products = [],
  triggerRef,
}) {
  const categories = getCategories();
  const titles = useMemo(() => products.map((p) => p.title), [products]);

  const sheetRef = useRef(null);
  const firstFocusRef = useRef(null);
  const lastFocusRef = useRef(null);
  const previousActiveRef = useRef(null);

  const handleSearchChange = useCallback(
    (q) => {
      setFilters((f) => (f.q === q ? f : { ...f, q }));
    },
    [setFilters]
  );
  const handleCategoryChange = useCallback(
    (e) => {
      const value = e.target.value;
      setFilters((f) => ({ ...f, category: value, subcategory: "" }));
    },
    [setFilters]
  );
  const handlePriceChange = useCallback(
    ({ min, max }) => {
      setFilters((f) => ({ ...f, minPrice: min, maxPrice: max }));
    },
    [setFilters]
  );
  const handleStatusChange = useCallback(
    (status) => {
      setFilters((f) => ({ ...f, status }));
    },
    [setFilters]
  );

  const statusCounts = useMemo(() => {
    return products.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});
  }, [products]);

  // Focus trap: keep focus within the sheet while open, move focus to first control on open, and return focus to trigger on close.
  useEffect(() => {
    if (!open) return;
    previousActiveRef.current = document.activeElement;

    const container = sheetRef.current;
    if (!container) return;

    // Focus the first focusable element
    const focusables = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (focusables.length > 0) {
      (focusables[0] instanceof HTMLElement) && focusables[0].focus();
    }

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
        return;
      }
      if (e.key === "Tab") {
        const f = container.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (f.length === 0) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            (last instanceof HTMLElement) && last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            (first instanceof HTMLElement) && first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  // Restore focus to trigger when closing
  useEffect(() => {
    if (open) return;
    const prev = previousActiveRef.current;
    const trigger = triggerRef?.current;
    const target = trigger || prev;
    if (target && target instanceof HTMLElement) {
      target.focus();
    }
  }, [open, triggerRef]);

  // Mounting animation: slide up from bottom
  useEffect(() => {
    if (!open) return;
    const el = sheetRef.current;
    if (!el) return;
    el.classList.add("translate-y-full");
    const id = requestAnimationFrame(() => {
      el.classList.remove("translate-y-full");
      el.classList.add("translate-y-0");
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Filters">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom sheet */}
      <div
        ref={sheetRef}
        className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col overflow-hidden rounded-t-2xl bg-[color:var(--surface)] shadow-2xl ring-1 ring-black/10 transition-transform duration-200 will-change-transform translate-y-full"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-between px-4 pt-4">
          <h2 id="filters-title" className="text-base font-semibold text-[color:var(--primary)]">Filters</h2>
          <button
            ref={firstFocusRef}
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[color:var(--muted)] hover:bg-[color:var(--surface-2)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]"
            aria-label="Close filters"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto px-4 pb-4 pt-2 space-y-4" aria-labelledby="filters-title">
          <SearchBar
            value={filters.q}
            onChange={handleSearchChange}
            suggestions={titles}
            label="Search products"
            placeholder="Search products…"
          />

          <div>
            <label className="text-sm font-medium text-[color:var(--foreground)]" htmlFor="mf-category-select">Category</label>
            <select
              id="mf-category-select"
              className="mt-1 w-full rounded-md border border-[color:var(--accent)] px-3 py-2 text-sm bg-[color:var(--surface)] text-[color:var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]"
              value={filters.category}
              onChange={handleCategoryChange}
            >
              <option className="text-[color:var(--foreground)]" value="All">All</option>
              {categories.map((c) => (
                <option className="text-[color:var(--foreground)]" key={c.slug} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <PriceRangeSlider
            value={{ min: filters.minPrice, max: filters.maxPrice }}
            onChange={handlePriceChange}
            min={0}
            max={2000}
            step={10}
          />

          <div>
            <p className="text-sm font-medium text-[color:var(--foreground)] mb-1">Availability</p>
            <StatusChips value={filters.status} onChange={handleStatusChange} counts={statusCounts} />
          </div>
        </div>

        {/* Actions bar */}
        <div className="border-t border-[color:var(--supporting)]/40 bg-[color:var(--surface)] px-4 py-3 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              onClear?.();
              onClose?.();
            }}
            className="rounded-full bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] ring-1 ring-[color:var(--supporting)] hover:bg-[color:var(--surface-2)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]"
          >
            Clear all
          </button>
          <button
            ref={lastFocusRef}
            type="button"
            onClick={() => {
              onApply?.();
              onClose?.();
            }}
            className="inline-flex justify-center rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-[color:var(--surface)] shadow-sm hover:bg-[color:var(--leaf)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
