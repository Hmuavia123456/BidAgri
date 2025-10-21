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
  className = "",
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

  const containerClasses = [
    "space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses}>
      <h2 className="text-lg font-semibold text-[color:var(--primary)]">
        Filters
      </h2>

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
        <label
          className="text-sm font-semibold text-gray-800"
          htmlFor="category-select"
        >
          Category
        </label>
        <select
          id="category-select"
          className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary"
          value={filters.category}
          onChange={handleCategoryChange}
        >
          <option className="text-gray-800" value="All">
            All
          </option>
          {categories.map((c) => (
            <option className="text-gray-800" key={c.slug} value={c.name}>
              {c.name}
              {categoryCounts[c.name] != null
                ? ` (${categoryCounts[c.name]})`
                : ""}
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
        <p className="mb-1 text-sm font-semibold text-gray-800">
          Availability
        </p>
        <StatusChips
          value={filters.status}
          onChange={handleStatusChange}
          counts={statusCounts}
        />
      </div>

      <div>
        <button
          type="button"
          onClick={onApply}
          className="w-full rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-secondary/70 focus:ring-offset-2 focus:ring-offset-white"
        >
          Apply filters
        </button>
        <button
          type="button"
          onClick={onClear}
          className="mt-2 w-full rounded-full bg-white px-5 py-2 text-sm font-semibold text-gray-800 ring-1 ring-gray-200 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:ring-offset-2 focus:ring-offset-white"
        >
          Clear all
        </button>
      </div>
    </div>
  );
}

// Export plain component to avoid any export/memo-related parser edge cases.
export default FiltersSidebar;
