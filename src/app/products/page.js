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
          <p className="mt-4 text-base text-[color:var(--muted)] md:text-lg">
            Explore upcoming listings and prepare for bids as we build out the full catalog experience.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.slice(0, 6).flatMap((cat) =>
              (cat.subcategories || []).slice(0, 2).map((sub) => (
                <Link
                  key={`${cat.slug}-${sub.slug}`}
                  href={`/products/${cat.slug}/${sub.slug}`}
                  prefetch
                  className="inline-flex items-center gap-2 rounded-full bg-[color:var(--surface-2)] px-3 py-1.5 text-sm text-[color:var(--leaf)] ring-1 ring-[color:var(--surface-2)] hover:bg-[color:var(--surface-2)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]"
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
