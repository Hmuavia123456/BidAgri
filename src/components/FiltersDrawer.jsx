"use client";
import SearchBar from "@/components/SearchBar";
import PriceRangeSlider from "@/components/PriceRangeSlider";
import StatusChips from "@/components/StatusChips";
import { getCategories } from "@/data/categoryUtils";
import { memo, useMemo, useCallback } from "react";
function FiltersDrawer({ open, onClose, filters, setFilters, onApply, onClear, products = [] }) {
  const categories = getCategories();
  const titles = useMemo(() => products.map((p) => p.title), [products]);
  const handleSearchChange = useCallback((q) => {
    setFilters((f) => (f.q === q ? f : { ...f, q }));
  }, [setFilters]);
  const handleCategoryChange = useCallback((e) => {
    const value = e.target.value;
    setFilters((f) => ({ ...f, category: value, subcategory: "" }));
  }, [setFilters]);
  const handlePriceChange = useCallback(({ min, max }) => {
    setFilters((f) => ({ ...f, minPrice: min, maxPrice: max }));
  }, [setFilters]);
  const handleStatusChange = useCallback((status) => {
    setFilters((f) => ({ ...f, status }));
  }, [setFilters]);
  const statusCounts = useMemo(() => {
    return products.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});
  }, [products]);

  const dialogRef = React.useRef(null);
  const closeBtnRef = React.useRef(null);
  const lastFocusedRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    lastFocusedRef.current = document.activeElement;
    const t = setTimeout(() => closeBtnRef.current?.focus(), 0);
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
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
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="relative z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters drawer">
      <div className="fixed inset-0 bg-[rgba(var(--primary-rgb),0.45)]" onClick={onClose} />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div ref={dialogRef} className="relative transform overflow-hidden rounded-t-2xl bg-[color:var(--surface)] text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:rounded-2xl" role="dialog" aria-modal="true" aria-labelledby="filters-drawer-title">
            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between">
                <h2 id="filters-drawer-title" className="text-base font-semibold leading-6 text-[color:var(--foreground)]">Filters</h2>
                <button ref={closeBtnRef} type="button" onClick={onClose} className="rounded-full p-2 text-[color:var(--muted)] hover:bg-[color:var(--surface-2)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]" aria-label="Close filters">✕</button>
              </div>
              <div className="mt-4 space-y-4">
                <SearchBar
                  value={filters.q}
                  onChange={handleSearchChange}
                  suggestions={titles}
                  label="Search products"
                  placeholder="Search products…"
                />
                <div>
                  <label className="text-sm font-medium text-[color:var(--foreground)]" htmlFor="m-category-select">Category</label>
                  <select
                    id="m-category-select"
                    className="mt-1 w-full rounded-md border border-[color:var(--supporting)] px-3 py-2 text-sm bg-[color:var(--surface)] text-[color:var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]"
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
            </div>
            <div className="bg-[color:var(--surface-2)] px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                onClick={() => { onApply(); onClose(); }}
                className="inline-flex w/full justify-center rounded-full bg-[color:var(--leaf)] px-4 py-2 text-sm font-semibold text-[color:var(--surface)] shadow-sm hover:bg-[color:var(--primary)] sm:ml-3 sm:w-auto focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]/50"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={() => { onClear(); onClose(); }}
                className="mt-3 inline-flex w-full justify-center rounded-full bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] ring-1 ring-[color:var(--supporting)] hover:bg-[color:var(--surface-2)] sm:mt-0 sm:w-auto"
              >
                Clear all
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(FiltersDrawer);
