export const metadata = {
  title: "Products | BidAgri",
  description: "Browse farm-fresh produce directly from trusted farmers.",
};

import ProductCatalog from "@/components/ProductCatalog";
import CategoryTabs from "@/components/CategoryTabs";
import Breadcrumbs from "@/components/Breadcrumbs";
import Link from "next/link";
import { getCategories } from "@/data/categoryUtils";
import { Suspense } from "react";

export default function ProductsPage() {
  const categories = getCategories();
  return (
    <section className="w-full min-h-screen bg-white overflow-x-hidden pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <Breadcrumbs />
        <header className="mb-6 md:mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-[color:var(--primary)] md:text-4xl">
            Product Marketplace
          </h1>
          <p
            className="mt-4 inline-flex max-w-2xl items-center gap-2 rounded-xl bg-[color:var(--leaf)] px-4 py-2 text-base font-semibold text-white !text-white shadow-sm shadow-[rgba(var(--leaf-rgb),0.25)] md:text-lg [&_*]:!text-white"
            style={{ color: "#ffffff" }}
          >
            <span className="text-white !text-white" style={{ color: "#ffffff" }}>
              Explore upcoming listings and prepare for bids as we build out the full catalog experience.
            </span>
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {categories.slice(0, 6).flatMap((cat) =>
              (cat.subcategories || []).slice(0, 2).map((sub) => (
                <Link
                  key={`${cat.slug}-${sub.slug}`}
                  href={`/products/${cat.slug}/${sub.slug}`}
                  prefetch
                  className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-secondary hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-white md:text-base"
                >
                  {cat.name}: {sub.name}
                </Link>
              ))
            )}
          </div>
        </header>
        {/* Wrap client components using useSearchParams/usePathname in Suspense */}
        <Suspense fallback={<div className="mt-6 text-sm text-[color:var(--muted)]">Loading products…</div>}>
          <CategoryTabs />
          <div className="flex gap-6">
            <div className="flex-1">
              <ProductCatalog />
            </div>
          </div>
        </Suspense>
      </div>
    </section>
  );
}
