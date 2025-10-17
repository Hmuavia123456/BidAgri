"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getCategories } from "@/data/categoryUtils";

export default function CategoryTabs() {
  const pathname = usePathname();
  const categories = getCategories();
  const [_, base, categorySlug, subcategorySlug] = (pathname || "").split("/");
  const isProducts = base === "products";
  if (!isProducts) return null;

  return (
    // Mobile tabs: align sticky offset with navbar height to prevent overlap with the search toolbar
    <div className="lg:hidden sticky top-24 z-20 bg-[color:var(--surface)] px-2 py-2 shadow-sm">
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {categories.map((cat) => {
          const isActive = categorySlug === cat.slug;
          return (
            <Link
              key={cat.slug}
              href={`/products/${cat.slug}`}
              prefetch
              className={`inline-flex items-center gap-2 shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                isActive
                  ? "border-[color:var(--leaf)] bg-[color:var(--surface-2)] text-[color:var(--leaf)]"
                  : "border-[color:var(--surface-2)] bg-[color:var(--surface)] text-[color:var(--foreground)] hover:bg-[color:var(--surface-2)]"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {cat.name}
            </Link>
          );
        })}
      </div>

      {categorySlug && (
        <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar">
          {categories
            .find((c) => c.slug === categorySlug)?.subcategories?.map((sub) => {
              const isActiveSub = subcategorySlug === sub.slug;
              return (
                <Link
                  key={sub.slug}
                  href={`/products/${categorySlug}/${sub.slug}`}
                  prefetch
                  className={`inline-flex items-center gap-2 shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    isActiveSub
                      ? "border-[color:var(--leaf)] bg-[color:var(--surface-2)] text-[color:var(--leaf)]"
                      : "border-[color:var(--surface-2)] bg-[color:var(--surface)] text-[color:var(--foreground)] hover:bg-[color:var(--surface-2)]"
                  }`}
                  aria-current={isActiveSub ? "page" : undefined}
                >
                  {sub.name}
                </Link>
              );
            })}
        </div>
      )}
    </div>
  );
}
