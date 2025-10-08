import Link from "next/link";
import { notFound } from "next/navigation";

import ProductDetailActions from "@/components/ProductDetailActions";
import { PRODUCTS } from "@/data/products";

export async function generateStaticParams() {
  return PRODUCTS.map((product) => ({ id: product.id }));
}

export function generateMetadata({ params }) {
  const product = PRODUCTS.find((item) => item.id === params.id);

  if (!product) {
    return {
      title: "Product | BidAgri",
      description: "BidAgri product",
    };
  }

  return {
    title: `${product.title} | BidAgri`,
    description: `${product.title} from ${product.location} — ${product.category} on BidAgri.`,
  };
}

export default function ProductDetailPage({ params }) {
  const product = PRODUCTS.find((item) => item.id === params.id);

  if (!product) {
    notFound();
  }

  const related = PRODUCTS.filter(
    (item) => item.category === product.category && item.id !== product.id
  ).slice(0, 4);

  return (
    <section className="w-full min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-6">
        <nav className="text-sm text-gray-500">
          <a href="/products" className="hover:text-green-700">
            Products
          </a>
          <span className="mx-2">/</span>
          <span className="text-gray-700 font-medium">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="w-full aspect-[4/3] overflow-hidden rounded-2xl shadow">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="bg-white rounded-2xl shadow p-6 space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-green-900">
              {product.title}
            </h1>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-gray-100 text-gray-700 text-xs px-3 py-1">
                {product.category}
              </span>
              <span
                className={`rounded-full text-xs px-3 py-1 ${
                  product.status === "Available"
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {product.status}
              </span>
            </div>
            <div className="text-gray-700">
              <div>
                <span className="font-semibold">Price:</span> Rs {product.pricePerKg}/kg
              </div>
              <div>
                <span className="font-semibold">Location:</span> {product.location}
              </div>
            </div>

            <ProductDetailActions product={product} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-3 text-gray-900">Product Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <span className="font-medium">Quality Check:</span> Manual inspection (demo)
            </div>
            <div>
              <span className="font-medium">Logistics:</span> Partner delivery (demo)
            </div>
            <div>
              <span className="font-medium">Moisture (demo):</span> Within acceptable range
            </div>
            <div>
              <span className="font-medium">Packaging:</span> Standard farm packaging
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Related {product.category}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {related.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl overflow-hidden bg-white shadow hover:shadow-md transition"
              >
                <Link
                  href={`/products/${item.id}`}
                  className="block focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <div className="w-full aspect-[4/3] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4 space-y-1">
                    <h4 className="text-base font-semibold text-gray-900">{item.title}</h4>
                    <p className="text-sm text-green-700">Rs {item.pricePerKg}/kg</p>
                  </div>
                </Link>
              </article>
            ))}
            {related.length === 0 && (
              <div className="col-span-full text-sm text-gray-500">
                No related items yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
