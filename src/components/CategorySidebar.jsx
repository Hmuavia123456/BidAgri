"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getCategories } from "@/data/categoryUtils";

export default function CategorySidebar() {
  const pathname = usePathname();
  const categories = getCategories();

  const [_, base, categorySlug, subcategorySlug] = (pathname || "")
    .split("/");

  const isProducts = base === "products";

  if (!isProducts) return null;

  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-24 rounded-xl border border-[color:var(--surface-2)] bg-[color:var(--surface)] p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-[color:var(--foreground)]">Categories</h2>
        <ul className="space-y-1">
          {categories.map((cat) => {
            const isActiveCat = categorySlug === cat.slug;
            return (
              <li key={cat.slug}>
                <Link
                  href={`/products/${cat.slug}`}
                  prefetch
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)] ${
                    isActiveCat
                      ? "bg-[color:var(--surface-2)] text-[color:var(--leaf)]"
                      : "hover:bg-[color:var(--surface-2)] text-[color:var(--foreground)]"
                  }`}
                  aria-current={isActiveCat ? "page" : undefined}
                >
                  <span className="inline-flex items-center gap-2">
                    {cat.name}
                  </span>
                  <span className="text-xs text-[color:var(--muted)]">{cat.subcategories?.length ?? 0}</span>
                </Link>

                {isActiveCat && (cat.subcategories?.length ?? 0) > 0 && (
                  <ul className="mt-1 space-y-1 pl-8">
                    {cat.subcategories.map((sub) => {
                      const isActiveSub = subcategorySlug === sub.slug;
                      return (
                        <li key={sub.slug}>
                          <Link
                            href={`/products/${cat.slug}/${sub.slug}`}
                            prefetch
                            className={`block rounded-md px-3 py-1.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)] ${
                              isActiveSub
                                ? "bg-[color:var(--surface-2)] text-[color:var(--leaf)]"
                                : "hover:bg-[color:var(--surface-2)] text-[color:var(--foreground)]"
                            }`}
                            aria-current={isActiveSub ? "page" : undefined}
                          >
                            <span className="inline-flex items-center gap-2">
                              {sub.name}
                            </span>
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
    </aside>
  );
}
