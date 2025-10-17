import Breadcrumbs from "@/components/Breadcrumbs";
import CategorySidebar from "@/components/CategorySidebar";
import CategoryTabs from "@/components/CategoryTabs";
import ProductCatalog from "@/components/ProductCatalog";
import { getCategoryBySlug } from "@/data/categoryUtils";

export async function generateMetadata({ params }) {
  const { category } = params;
  const cat = getCategoryBySlug(category);
  const title = cat ? `${cat.name} | BidAgri Products` : `Products | BidAgri`;
  const description = cat?.description || "Browse farm-fresh produce directly from trusted farmers.";
  return { title, description };
}

export default function CategoryPage({ params }) {
  const { category } = params;
  const cat = getCategoryBySlug(category);

  return (
    <section className="w-full min-h-screen bg-white overflow-x-hidden pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <Breadcrumbs />
        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[color:var(--primary)]">
            {cat ? cat.icon + " " + cat.name : "Products"}
          </h1>
          {cat?.description && (
            <p className="mt-3 text-base text-[color:var(--muted)]">{cat.description}</p>
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
