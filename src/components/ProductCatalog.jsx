"use client";

import ProductCard from "@/components/ProductCard";
import { useMemo, useState, useEffect, useCallback, memo, useRef } from "react";
import { usePathname } from "next/navigation";
import FiltersSidebar from "@/components/FiltersSidebar";
import MobileFilterSheet from "@/components/MobileFilterSheet";
import StickyFilterBar from "@/components/StickyFilterBar";
import FilterChips from "@/components/FilterChips";
import SearchBar from "@/components/SearchBar";
import useQueryFilters from "@/hooks/useQueryFilters";
import { getCategories, getCategoryBySlug } from "@/data/categoryUtils";

import BidModal from "@/components/BidModal";

import { PRODUCTS } from "@/data/products";
import ProductList from "@/components/ProductList";
import styles from "./ProductLayout.module.css";

const CATEGORY_NAMES = getCategories().map((c) => c.name);
const categoryOptions = ["All", ...CATEGORY_NAMES];
const sortOptions = [
  { value: "Newest", label: "Newest" },
  { value: "PriceLowHigh", label: "Price: Low→High" },
  { value: "PriceHighLow", label: "Price: High→Low" },
  { value: "Popular", label: "Popular" },
];

// Dev check: 
// - Mobile: open "/products", tap the sticky "Filters"; sheet slides up, focus traps, Esc closes. Change sort in the sticky bar; URL should update (e.g., ?sort=PriceLowHigh) and list reorders without page jump.
// - Desktop: sidebar filters are visible; changing them updates URL and results. Chips appear under the result count; clicking a chip removes it and syncs the URL.
// - Route sync: navigating to /products/[category]/[subcategory] should preselect those in filters.
// Use external ProductCard component to ensure consistent next/image usage and skeleton

export default function ProductCatalog() {
  // UI cleanup: ensure no simulate button or bell icon remains.
  // Layout is kept stable (sticky toolbar, sidebar/drawer) during search/filter updates.
  const pathname = usePathname();
  const { filters, setFilters, applyFilters, clearAll, queryString } = useQueryFilters({
    q: "",
    category: "All",
    subcategory: "",
    status: "",
    minPrice: "",
    maxPrice: "",
    sort: "Newest",
  });
  const [showDrawer, setShowDrawer] = useState(false);
  const filterTriggerRef = useRef(null);
  const [isBidOpen, setIsBidOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleOpenBid = useCallback((item) => {
    setSelectedItem(item);
    setIsBidOpen(true);
  }, []);

  const handleCloseBid = () => {
    setIsBidOpen(false);
    setSelectedItem(null);
  };

  const baseItems = PRODUCTS;

  const titleSuggestions = useMemo(() => PRODUCTS.map((p) => p.title), []);

  const defaultOrder = useMemo(
    () => new Map(baseItems.map((product, index) => [product.id, index])),
    [baseItems]
  );

  const filteredItems = useMemo(() => {
    const trimmedSearch = (filters.q || "").trim().toLowerCase();

    let filtered = baseItems.filter((product) => {
      const matchesCategory =
        filters.category === "All" || product.category === filters.category;
      const matchesSubcategory =
        !filters.subcategory || product.subcategory === filters.subcategory;
      const matchesSearch =
        trimmedSearch.length === 0 ||
        product.title.toLowerCase().includes(trimmedSearch) ||
        product.location.toLowerCase().includes(trimmedSearch);
      const matchesStatus = !filters.status || product.status === filters.status;
      const priceOkMin = filters.minPrice === "" || product.pricePerKg >= Number(filters.minPrice);
      const priceOkMax = filters.maxPrice === "" || product.pricePerKg <= Number(filters.maxPrice);

      return (
        matchesCategory &&
        matchesSubcategory &&
        matchesSearch &&
        matchesStatus &&
        priceOkMin &&
        priceOkMax
      );
    });

    const sortOption = filters.sort;
    if (sortOption === "PriceLowHigh") {
      filtered = [...filtered].sort((a, b) => a.pricePerKg - b.pricePerKg);
    } else if (sortOption === "PriceHighLow") {
      filtered = [...filtered].sort((a, b) => b.pricePerKg - a.pricePerKg);
    } else if (sortOption === "Popular") {
      filtered = [...filtered].sort((a, b) => {
        const aHot = a.status === "In Bidding" ? 1 : 0;
        const bHot = b.status === "In Bidding" ? 1 : 0;
        if (bHot !== aHot) return bHot - aHot;
        return b.pricePerKg - a.pricePerKg;
      });
    } else {
      filtered = [...filtered].sort(
        (a, b) => defaultOrder.get(a.id) - defaultOrder.get(b.id)
      );
    }

    return filtered;
  }, [baseItems, defaultOrder, filters]);

  // Sync category from route: /products/[category] or /products/[category]/[subcategory]
  useEffect(() => {
    const parts = (pathname || "").split("/").filter(Boolean);
    // parts: ["products", "category?", "subcategory?"]
    if (parts[0] !== "products") return;
    const categorySlug = parts[1];
    const subSlug = parts[2] || "";
    if (!categorySlug) {
      setFilters((f) => {
        if (f.category === "All" && (f.subcategory || "") === "") return f;
        return { ...f, category: "All", subcategory: "" };
      });
      return;
    }
    const cat = getCategoryBySlug(categorySlug);
    if (cat?.name) {
      setFilters((f) => {
        const desiredCat = cat.name;
        const desiredSub = subSlug;
        if (f.category === desiredCat && (f.subcategory || "") === desiredSub) return f;
        return { ...f, category: desiredCat, subcategory: desiredSub };
      });
    }
  }, [pathname, setFilters]);
  const handleApply = useCallback(() => {
    applyFilters({});
  }, [applyFilters]);
  const handleReset = useCallback(() => {
    clearAll();
  }, [clearAll]);

  const resultLabel = `${filteredItems.length} result${
    filteredItems.length === 1 ? "" : "s"
  }`;
  const liveRef = useRef(null);
  useEffect(() => {
    if (liveRef.current) {
      liveRef.current.textContent = resultLabel;
    }
  }, [resultLabel]);

  const handleSearchChange = useCallback((q) => {
    setFilters((f) => (f.q === q ? f : { ...f, q }));
  }, [setFilters]);

  const handleSelectSuggestion = useCallback((val) => {
    // Ensure selected suggestion is applied even if state update hasn't flushed yet
    applyFilters({ q: val });
  }, [applyFilters]);

  const openDrawer = useCallback((btnRef) => {
    setShowDrawer(true);
    if (btnRef?.current) {
      filterTriggerRef.current = btnRef.current;
    }
  }, [setShowDrawer]);

  const closeDrawer = useCallback(() => {
    setShowDrawer(false);
  }, [setShowDrawer]);

  return (
    <section className="pb-24 md:pb-16">
      {/* Top search + sort for wide screens only */}
      <div className="hidden md:flex sticky top-24 z-30 w-full bg-[color:var(--surface)] rounded-xl p-3 md:p-4 shadow-md items-center gap-3">
        <div className="flex-1">
          <SearchBar
            value={filters.q}
            onChange={handleSearchChange}
            onSelect={handleSelectSuggestion}
            suggestions={titleSuggestions}
            label="Search produce"
            placeholder="Search produce…"
          />
        </div>
        <div>
          <label htmlFor="catalog-sort" className="sr-only">Sort products</label>
          <select
            id="catalog-sort"
            aria-label="Sort products"
            value={filters.sort}
            onChange={(event) => {
              const next = event.target.value;
              // Apply immediately and sync to URL to avoid state race conditions.
              applyFilters({ sort: next });
            }}
            className="w-44 rounded-lg ring-1 ring-[color:var(--surface-2)] focus:ring-2 focus:ring-[color:var(--leaf)] focus:outline-none bg-[color:var(--surface)] text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] px-4 py-2.5 text-sm"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="text-sm text-[color:var(--muted)] mt-4" aria-live="polite" aria-atomic="true">{resultLabel}</div>
      <div ref={liveRef} className="sr-only" aria-live="polite" aria-atomic="true" />
      <FilterChips
        filters={filters}
        onRemove={(key) => {
          const next = { ...filters };
          if (key === "category") next.category = "All";
          else if (key === "subcategory") next.subcategory = "";
          else if (key === "status") next.status = "";
          else if (key === "minPrice") next.minPrice = "";
          else if (key === "maxPrice") next.maxPrice = "";
          else if (key === "q") next.q = "";
          setFilters(next);
          applyFilters(next);
        }}
      />

      {/* Stable two-column layout using CSS module to prevent overlap */}
      <div className={`mt-6 ${styles.productPage}`}>
        {/* Sidebar: sticky within layout; not absolute. Hidden on small screens. */}
        <div className="hidden md:block">
          <div className={styles.filters}>
            <FiltersSidebar
              filters={filters}
              setFilters={setFilters}
              onApply={handleApply}
              onClear={handleReset}
              products={baseItems}
            />
          </div>
        </div>
        {/* Products column: grid via CSS module; ensure minimum height */}
        <div className="min-h-[320px] flex-1">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[color:var(--surface-2)] bg-[color:var(--surface)]/60 p-10 text-center">
              <p className="text-base font-semibold text-[color:var(--foreground)]">No matches found</p>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                Try adjusting your search or filters to see available produce.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-4 rounded-full bg-[color:var(--primary)] px-5 py-2 text-sm font-semibold text-[color:var(--surface)] shadow-sm transition hover:bg-[color:var(--leaf)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)] focus:ring-offset-2"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className={styles.productsGrid}>
              <ProductList
                items={filteredItems}
                pageSize={9}
                resetKey={queryString}
                renderItem={(product) => (
                  <ProductCard item={product} onBid={handleOpenBid} />
                )}
                getItemId={(item) => item.id}
              />
            </div>
          )}
        </div>
      </div>

      <MobileFilterSheet
        open={showDrawer}
        onClose={closeDrawer}
        filters={filters}
        setFilters={setFilters}
        onApply={handleApply}
        onClear={handleReset}
        products={baseItems}
        triggerRef={{ current: filterTriggerRef.current }}
      />

      {/* Sticky bottom bar for mobile */}
      {/* Sticky bottom bar for mobile; safe-area aware. */}
      <StickyFilterBar
        onOpenFilters={(btnRef) => openDrawer(btnRef)}
        activeCount={[filters.category !== "All", !!filters.subcategory, !!filters.status, filters.minPrice !== "" && filters.minPrice != null, filters.maxPrice !== "" && filters.maxPrice != null, !!filters.q].filter(Boolean).length}
        sortValue={filters.sort}
        sortOptions={sortOptions}
        onChangeSort={(val) => {
          // Apply immediately and sync with URL for mobile too.
          applyFilters({ sort: val });
        }}
      />

      <BidModal open={isBidOpen} item={selectedItem} onClose={handleCloseBid} />
    </section>
  );
}
