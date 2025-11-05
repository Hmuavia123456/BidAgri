import Breadcrumbs from "@/components/Breadcrumbs";
import CategorySidebar from "@/components/CategorySidebar";
import CategoryTabs from "@/components/CategoryTabs";
import ProductCatalog from "@/components/ProductCatalog";
import { getSubcategoryBySlugs } from "@/data/categoryUtils";

export async function generateMetadata({ params }) {
  const { category, subcategory } = params;
  const { category: cat, subcategory: sub } = getSubcategoryBySlugs(category, subcategory);
  const title = sub && cat ? `${cat.name} – ${sub.name} | BidAgri` : `Products | BidAgri`;
  const description = sub?.name
    ? `Explore ${sub.name.toLowerCase()} within ${cat?.name || "our catalog"}.`
    : "Browse farm-fresh produce directly from trusted farmers.";
  return { title, description };
}

export default function SubcategoryPage({ params }) {
  const { category, subcategory } = params;
  const { category: cat, subcategory: sub } = getSubcategoryBySlugs(category, subcategory);

  return (
    <section className="w-full min-h-screen bg-[color:var(--background)] overflow-x-hidden pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <Breadcrumbs />
        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[color:var(--primary)]">
            {cat ? `${cat.icon} ${cat.name}` : "Products"}
          </h1>
          {sub && (
            <p className="mt-2 text-base text-[color:var(--muted)]">
              Filtering by <span className="font-semibold">{sub.name}</span>
            </p>
          )}
        </header>
        <CategoryTabs />
        <div className="flex gap-6">
          <CategorySidebar />
          <div className="flex-1">
            <ProductCatalog />
          </div>
        </div>
      </div>
    </section>
  );
}
