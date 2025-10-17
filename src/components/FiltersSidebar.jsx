"use client";

import SearchBar from "@/components/SearchBar";
import PriceRangeSlider from "@/components/PriceRangeSlider";
import StatusChips from "@/components/StatusChips";
import { getCategories } from "@/data/categoryUtils";
import { useMemo, useCallback } from "react";

// Clean JSX structure and comments; no malformed nested blocks.
function FiltersSidebar({
  filters,
  setFilters,
  onApply,
  onClear,
  products = [],
}) {
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

  const categoryCounts = useMemo(() => {
    return products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});
  }, [products]);

  return (
    <div className="rounded-xl border border-[color:var(--surface-2)] bg-[color:var(--surface)] p-4 shadow-sm space-y-4">
        {/* Sidebar content; parent applies sticky + width */}
        <div>
          <SearchBar
            value={filters.q}
            onChange={handleSearchChange}
            suggestions={titles}
            label="Search products"
            placeholder="Search products…"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-[color:var(--foreground)]" htmlFor="category-select">Category</label>
          <select
            id="category-select"
            className="mt-1 w-full rounded-md border border-[color:var(--surface-2)] px-3 py-2 text-sm bg-[color:var(--surface)] text-[color:var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]"
            value={filters.category}
            onChange={handleCategoryChange}
          >
            <option className="text-[color:var(--foreground)]" value="All">All</option>
            {categories.map((c) => (
              <option className="text-[color:var(--foreground)]" key={c.slug} value={c.name}>
                {c.name}{categoryCounts[c.name] != null ? ` (${categoryCounts[c.name]})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <PriceRangeSlider
            value={{ min: filters.minPrice, max: filters.maxPrice }}
            onChange={handlePriceChange}
            min={0}
            max={2000}
            step={10}
          />
        </div>

        <div>
          <p className="text-sm font-medium text-[color:var(--foreground)] mb-1">Availability</p>
          <StatusChips value={filters.status} onChange={handleStatusChange} counts={statusCounts} />
        </div>

        <div>
          <button
            type="button"
            onClick={onApply}
            className="w-full rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-[color:var(--surface)] shadow-sm transition hover:bg-[color:var(--leaf)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]"
          >
            Apply filters
          </button>
          <button
            type="button"
            onClick={onClear}
            className="mt-2 w-full rounded-full bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] ring-1 ring-[color:var(--surface-2)] hover:bg-[color:var(--surface-2)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]/40"
          >
            Clear all
          </button>
        </div>
      </div>
  );
}

// Export plain component to avoid any export/memo-related parser edge cases.
export default FiltersSidebar;
