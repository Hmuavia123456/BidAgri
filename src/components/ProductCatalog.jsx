"use client";

import ProductCard from "@/components/ProductCard";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import FiltersSidebar from "@/components/FiltersSidebar";
import MobileFilterSheet from "@/components/MobileFilterSheet";
import StickyFilterBar from "@/components/StickyFilterBar";
import FilterChips from "@/components/FilterChips";
import SearchBar from "@/components/SearchBar";
import useQueryFilters from "@/hooks/useQueryFilters";
import { getCategories, getCategoryBySlug } from "@/data/categoryUtils";

import BidModal from "@/components/BidModal";
import ProductList from "@/components/ProductList";
import ProductSkeleton from "@/components/ProductSkeleton";

const CATEGORY_DATA = getCategories();
const CATEGORY_NAMES = CATEGORY_DATA.map((c) => c.name);
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
  const [baseItems, setBaseItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const handleOpenBid = useCallback((item) => {
    setSelectedItem(item);
    setIsBidOpen(true);
  }, []);

  const handleCloseBid = () => {
    setIsBidOpen(false);
    setSelectedItem(null);
  };

  useEffect(() => {
    let ignore = false;
    async function loadProducts() {
      setLoading(true);
      setFetchError("");
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          const detail = await response.json().catch(() => null);
          throw new Error(detail?.message || "Unable to load products.");
        }
        const json = await response.json();
        if (!ignore) {
          const normalized = Array.isArray(json?.items)
            ? json.items.map((product) => {
                const gallery = Array.isArray(product.gallery) ? product.gallery : [];
                const galleryUrl = gallery
                  .map((photo) => photo?.url || photo?.publicUrl)
                  .find((value) => typeof value === "string" && value.startsWith("http"));
                const docUrl = product.documents?.farmProof?.url || product.documents?.farmProof?.publicUrl;
                const primaryImage = [galleryUrl, product.image, docUrl, product.imgUrl]
                  .find((value) => typeof value === "string" && value.length > 0);
                return {
                  ...product,
                  image: primaryImage || product.image || product.imgUrl,
                  gallery,
                };
              })
            : [];
          setBaseItems(normalized);
        }
      } catch (error) {
        if (!ignore) {
          setBaseItems([]);
          setFetchError(error?.message || "Failed to load products.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadProducts();
    return () => {
      ignore = true;
    };
  }, []);

  const titleSuggestions = useMemo(
    () => baseItems.map((p) => p?.title ?? ""),
    [baseItems]
  );

  const defaultOrder = useMemo(
    () => new Map(baseItems.map((product, index) => [product.id, index])),
    [baseItems]
  );

  const filteredItems = useMemo(() => {
    const trimmedSearch = (filters.q || "").trim().toLowerCase();

    if (!baseItems.length) {
      return [];
    }

    let filtered = baseItems.filter((product) => {
      const category = product.category || "Farmer Listings";
      const subcategory = product.subcategory || "";
      const title = (product.title || "").toLowerCase();
      const location = (product.location || "").toLowerCase();
      const pricePerKg = Number(product.pricePerKg ?? 0);

      const matchesCategory =
        filters.category === "All" || category === filters.category;
      const matchesSubcategory =
        !filters.subcategory || subcategory === filters.subcategory;
      const matchesSearch =
        trimmedSearch.length === 0 ||
        title.includes(trimmedSearch) ||
        location.includes(trimmedSearch);
      const matchesStatus = !filters.status || product.status === filters.status;
      const priceOkMin = filters.minPrice === "" || pricePerKg >= Number(filters.minPrice);
      const priceOkMax = filters.maxPrice === "" || pricePerKg <= Number(filters.maxPrice);

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
      filtered = [...filtered].sort(
        (a, b) => Number(a.pricePerKg ?? 0) - Number(b.pricePerKg ?? 0)
      );
    } else if (sortOption === "PriceHighLow") {
      filtered = [...filtered].sort(
        (a, b) => Number(b.pricePerKg ?? 0) - Number(a.pricePerKg ?? 0)
      );
    } else if (sortOption === "Popular") {
      filtered = [...filtered].sort((a, b) => {
        const aHot = a.status === "In Bidding" ? 1 : 0;
        const bHot = b.status === "In Bidding" ? 1 : 0;
        if (bHot !== aHot) return bHot - aHot;
        return Number(b.pricePerKg ?? 0) - Number(a.pricePerKg ?? 0);
      });
    } else {
      filtered = [...filtered].sort((a, b) => {
        const orderA = defaultOrder.get(a.id) ?? 0;
        const orderB = defaultOrder.get(b.id) ?? 0;
        return orderA - orderB;
      });
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

  const pathSegments = useMemo(
    () => (pathname || "").split("/").filter(Boolean),
    [pathname]
  );
  const activeCategorySlug = pathSegments[1] || "";
  const activeSubcategorySlug = pathSegments[2] || "";

  const categoryTotals = useMemo(() => {
    return baseItems.reduce((acc, product) => {
      const category = product.category || "Farmer Listings";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
  }, [baseItems]);

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

  {fetchError && (
    <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm" role="alert">
      {fetchError}
    </div>
  )}

  {!loading && !fetchError && baseItems.length === 0 && (
    <p className="mt-6 text-sm text-[color:var(--muted)]">
      No farmer listings are live yet. Once submissions are approved they will appear here automatically.
    </p>
  )}

  <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-[320px_minmax(0,1fr)] md:items-start xl:gap-8">
        <aside className="hidden md:block">
          <div className="sticky top-32 space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-[color:var(--primary)]">
                Categories
              </h2>
              <ul className="mt-4 space-y-2 text-gray-800">
                {CATEGORY_DATA.map((cat) => {
                  const isActiveCat = activeCategorySlug === cat.slug;
                  return (
                    <li key={cat.slug}>
                      <Link
                        href={`/products/${cat.slug}`}
                        prefetch
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-secondary ${
                          isActiveCat
                            ? "bg-[color:var(--surface-2)] text-[color:var(--primary)] shadow-sm"
                            : "text-gray-800 hover:bg-[color:var(--surface-2)]"
                        }`}
                        aria-current={isActiveCat ? "page" : undefined}
                      >
                        <span>{cat.name}</span>
                        <span className="text-xs text-gray-500">
                          {categoryTotals[cat.name] ?? 0}
                        </span>
                      </Link>
                      {isActiveCat && (cat.subcategories?.length ?? 0) > 0 && (
                        <ul className="mt-2 space-y-1 border-l border-gray-200 pl-3">
                          {cat.subcategories.map((sub) => {
                            const isActiveSub =
                              activeSubcategorySlug === sub.slug;
                            return (
                              <li key={sub.slug}>
                                <Link
                                  href={`/products/${cat.slug}/${sub.slug}`}
                                  prefetch
                                  className={`flex w-full items-center justify-between rounded-md px-3 py-1.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-secondary ${
                                    isActiveSub
                                      ? "bg-[color:var(--surface-2)] text-[color:var(--primary)]"
                                      : "text-gray-700 hover:bg-[color:var(--surface-2)]"
                                  }`}
                                  aria-current={
                                    isActiveSub ? "page" : undefined
                                  }
                                >
                                  <span>{sub.name}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <FiltersSidebar
              filters={filters}
              setFilters={setFilters}
              onApply={handleApply}
              onClear={handleReset}
              products={baseItems}
            />
          </div>
        </aside>

        <div className="min-h-[320px]">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <ProductSkeleton key={idx} />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[color:var(--surface-2)] bg-[color:var(--surface)]/60 p-10 text-center">
              <p className="text-base font-semibold text-[color:var(--foreground)]">
                No matches found
              </p>
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
            <ProductList
              items={filteredItems}
              pageSize={9}
              resetKey={queryString}
              renderItem={(product) => (
                <ProductCard item={product} onBid={handleOpenBid} />
              )}
              getItemId={(item) => item.id}
            />
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
