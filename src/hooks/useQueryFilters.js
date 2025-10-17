"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Manages filter state synchronized with URL query params.
// Designed to be simple to replace when a server-side search API exists.
export default function useQueryFilters(initial = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState(() => ({
    q: initial.q || "",
    category: initial.category || "All",
    subcategory: initial.subcategory || "",
    status: initial.status || "", // Available | In Bidding
    minPrice: initial.minPrice ?? "",
    maxPrice: initial.maxPrice ?? "",
    sort: initial.sort || "Newest",
    moreOpen: false,
  }));

  // Read from URL on mount and whenever searchParams changes
  useEffect(() => {
    const next = {
      q: searchParams.get("q") || "",
      category: searchParams.get("category") || "All",
      subcategory: searchParams.get("subcategory") || "",
      status: searchParams.get("status") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      sort: searchParams.get("sort") || "Newest",
    };
    setFilters((prev) => {
      const isSame =
        prev.q === next.q &&
        prev.category === next.category &&
        (prev.subcategory || "") === (next.subcategory || "") &&
        prev.status === next.status &&
        String(prev.minPrice ?? "") === String(next.minPrice ?? "") &&
        String(prev.maxPrice ?? "") === String(next.maxPrice ?? "") &&
        prev.sort === next.sort;
      if (isSame) return prev;
      return { ...prev, ...next };
    });
  }, [searchParams]);

  // Build a query string from current filters
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.category && filters.category !== "All")
      params.set("category", filters.category);
    if (filters.subcategory) params.set("subcategory", filters.subcategory);
    if (filters.status) params.set("status", filters.status);
    if (filters.minPrice !== "" && filters.minPrice != null)
      params.set("minPrice", String(filters.minPrice));
    if (filters.maxPrice !== "" && filters.maxPrice != null)
      params.set("maxPrice", String(filters.maxPrice));
    if (filters.sort && filters.sort !== "Newest") params.set("sort", filters.sort);
    return params.toString();
  }, [filters]);

  const applyFilters = (nextFilters) => {
    const merged = { ...filters, ...nextFilters };
    const params = new URLSearchParams();
    if (merged.q) params.set("q", merged.q);
    if (merged.category && merged.category !== "All")
      params.set("category", merged.category);
    if (merged.subcategory) params.set("subcategory", merged.subcategory);
    if (merged.status) params.set("status", merged.status);
    if (merged.minPrice !== "" && merged.minPrice != null)
      params.set("minPrice", String(merged.minPrice));
    if (merged.maxPrice !== "" && merged.maxPrice != null)
      params.set("maxPrice", String(merged.maxPrice));
    if (merged.sort && merged.sort !== "Newest") params.set("sort", merged.sort);

    const qs = params.toString();
    const currentQs = searchParams.toString();
    const href = qs ? `${pathname}?${qs}` : pathname;

    // Avoid redundant state updates and URL changes if nothing changed
    const isSameState =
      filters.q === merged.q &&
      filters.category === merged.category &&
      (filters.subcategory || "") === (merged.subcategory || "") &&
      filters.status === merged.status &&
      String(filters.minPrice ?? "") === String(merged.minPrice ?? "") &&
      String(filters.maxPrice ?? "") === String(merged.maxPrice ?? "") &&
      filters.sort === merged.sort;

    if (!isSameState) {
      setFilters(merged);
    }
    if (qs !== currentQs) {
      router.replace(href, { scroll: false });
    }
  };

  const clearAll = () => {
    const cleared = {
      q: "",
      category: "All",
      subcategory: "",
      status: "",
      minPrice: "",
      maxPrice: "",
      sort: "Newest",
      moreOpen: false,
    };
    setFilters(cleared);
    router.replace(pathname, { scroll: false });
  };

  return { filters, setFilters, applyFilters, clearAll, queryString };
}
