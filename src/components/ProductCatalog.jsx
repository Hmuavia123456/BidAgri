"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import BidModal from "@/components/BidModal";

import { PRODUCTS } from "@/data/products";

const categoryOptions = ["All", "Grains", "Nuts", "Fruits", "Vegetables"];
const sortOptions = [
  { value: "Newest", label: "Newest" },
  { value: "PriceLowHigh", label: "Price: Low→High" },
  { value: "PriceHighLow", label: "Price: High→Low" },
];

function ProductCard({ item, onBid }) {
  const statusClasses =
    item.status === "Available"
      ? "bg-green-100 text-green-700"
      : "bg-amber-100 text-amber-700";

  return (
    <article className="group rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
      <Link
        href={`/products/${item.id}`}
        className="block focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <div className="w-full aspect-[4/3] overflow-hidden">
          <img
            src={item.image}
            alt={item.title}
            loading="lazy"
            className="block w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = "/images/placeholder-produce.jpg";
            }}
          />
        </div>
        <div className="p-4 space-y-1 min-h-[116px]">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
            <span className={`${statusClasses} px-2.5 py-1 rounded-full text-xs font-semibold`}>
              {item.status}
            </span>
          </div>
          <p className="text-sm text-gray-500">{item.category}</p>
          <p className="text-sm font-semibold text-green-700">Rs {item.pricePerKg}/kg</p>
          <p className="text-sm text-gray-500">{item.location}</p>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <div className="pt-3">
          <button
            type="button"
            onClick={() => onBid(item)}
            className="w-full rounded-full bg-green-600 text-white px-4 py-2.5 shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Place Bid
          </button>
        </div>
      </div>
    </article>
  );
}

export default function ProductCatalog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("Newest");
  const [isBidOpen, setIsBidOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleOpenBid = (item) => {
    setSelectedItem(item);
    setIsBidOpen(true);
  };

  const handleCloseBid = () => {
    setIsBidOpen(false);
    setSelectedItem(null);
  };

  const baseItems = PRODUCTS;

  const defaultOrder = useMemo(
    () => new Map(baseItems.map((product, index) => [product.id, index])),
    [baseItems]
  );

  const filteredItems = useMemo(() => {
    const trimmedSearch = searchTerm.trim().toLowerCase();

    let filtered = baseItems.filter((product) => {
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;
      const matchesSearch =
        trimmedSearch.length === 0 ||
        product.title.toLowerCase().includes(trimmedSearch) ||
        product.location.toLowerCase().includes(trimmedSearch);

      return matchesCategory && matchesSearch;
    });

    if (sortOption === "PriceLowHigh") {
      filtered = [...filtered].sort((a, b) => a.pricePerKg - b.pricePerKg);
    } else if (sortOption === "PriceHighLow") {
      filtered = [...filtered].sort((a, b) => b.pricePerKg - a.pricePerKg);
    } else {
      filtered = [...filtered].sort(
        (a, b) => defaultOrder.get(a.id) - defaultOrder.get(b.id)
      );
    }

    return filtered;
  }, [baseItems, defaultOrder, searchTerm, selectedCategory, sortOption]);

  const handleReset = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSortOption("Newest");
  };

  const resultLabel = `${filteredItems.length} result${
    filteredItems.length === 1 ? "" : "s"
  }`;

  return (
    <section className="pb-12 md:pb-16">
      <div className="sticky top-20 z-30 w-full bg-white rounded-xl p-3 md:p-4 shadow-md flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex-1">
          <label htmlFor="catalog-search" className="sr-only">
            Search produce
          </label>
          <input
            id="catalog-search"
            aria-label="Search produce"
            type="search"
            placeholder="Search produce…"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-green-500 focus:outline-none bg-white text-gray-800 placeholder:text-gray-400 px-4 py-2.5 text-sm"
          />
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div>
            <label htmlFor="catalog-category" className="sr-only">
              Filter by category
            </label>
            <select
              id="catalog-category"
              aria-label="Filter by category"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="w-full md:w-40 rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-green-500 focus:outline-none bg-white text-gray-800 placeholder:text-gray-400 px-4 py-2.5 text-sm"
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="catalog-sort" className="sr-only">
              Sort products
            </label>
            <select
              id="catalog-sort"
              aria-label="Sort products"
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value)}
              className="w-full md:w-44 rounded-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-green-500 focus:outline-none bg-white text-gray-800 placeholder:text-gray-400 px-4 py-2.5 text-sm"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-500 mt-4">{resultLabel}</div>

      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white/60 p-10 text-center">
          <p className="text-base font-semibold text-gray-700">No matches found</p>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filters to see available produce.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-4 rounded-full bg-green-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {filteredItems.map((product) => (
            <ProductCard key={product.id} item={product} onBid={handleOpenBid} />
          ))}
        </div>
      )}

      <BidModal open={isBidOpen} item={selectedItem} onClose={handleCloseBid} />
    </section>
  );
}
