export const metadata = {
  title: "Products | BidAgri",
  description: "Browse farm-fresh produce directly from trusted farmers.",
};

import ProductCatalog from "@/components/ProductCatalog";

export default function ProductsPage() {
  return (
    <section className="w-full min-h-screen bg-gray-50 overflow-x-hidden pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <header className="mb-6 md:mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-[#14532D] md:text-4xl">
            Product Marketplace
          </h1>
          <p className="mt-4 text-base text-gray-600 md:text-lg">
            Explore upcoming listings and prepare for bids as we build out the full catalog experience.
          </p>
        </header>
        <ProductCatalog />
      </div>
    </section>
  );
}
