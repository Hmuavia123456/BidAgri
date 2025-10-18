import Link from "next/link";
import { notFound } from "next/navigation";

import ProductDetailActions from "@/components/ProductDetailActions";
import ProductTabs from "@/components/ProductTabs";
import ProductHeroImage from "@/components/ProductHeroImage";
import ImageWithFallback from "@/components/ImageWithFallback";
import BidHistory from "@/components/BidHistory";
import WatchlistButton from "@/components/WatchlistButton";
import ShareActions from "@/components/ShareActions";
import QABadge from "@/components/QABadge";
import DeliveryStepper from "@/components/DeliveryStepper";
import { getQAForProduct } from "@/data/qa";
import InspectionHistory from "@/components/InspectionHistory";
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

  const url = `https://bidagri.example/product/${product.id}`; // placeholder domain
  return {
    title: `${product.title} | BidAgri` ,
    description: `${product.title} from ${product.location} — ${product.category} on BidAgri.`,
    openGraph: {
      title: `${product.title} | BidAgri`,
      description: `${product.title} from ${product.location} — ${product.category} on BidAgri.`,
      url,
      images: [{ url: product.image }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} | BidAgri`,
      description: `${product.title} from ${product.location} — ${product.category} on BidAgri.`,
      images: [product.image],
    },
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

  const qa = getQAForProduct(product.id);

  return (
    <section className="w-full min-h-screen bg-white pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-6">
        <nav className="text-sm text-[color:var(--muted)]">
          <Link href="/products" className="transition-colors hover:text-secondary">
            Products
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[color:var(--foreground)] font-medium">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProductHeroImage src={product.image || product.imgUrl} alt={product.title} />

          <div className="rounded-2xl p-6 space-y-4 bg-gradient-to-b from-[color:var(--surface)] to-[color:var(--surface-2)] ring-1 ring-[color:var(--supporting)]/40 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-3xl md:text-4xl font-bold text-[color:var(--primary)]">
                  {product.title}
                </h1>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[color:var(--surface)] text-[color:var(--muted)] text-xs px-3 py-1 ring-1 ring-[color:var(--supporting)]/40">
                    {product.category}
                  </span>
                  <span
                    className={`rounded-full text-xs px-3 py-1 ring-1 ring-[color:var(--supporting)]/40 ${
                      product.status === "Available"
                        ? "bg-[color:var(--surface-2)] text-[color:var(--leaf)]"
                        : "bg-[rgba(var(--accent-rgb),0.18)] text-[color:var(--foreground)]"
                    }`}
                  >
                    {product.status}
                  </span>
                  <QABadge grade={qa.grade} verified={qa.verified} />
                </div>
                <div className="text-[color:var(--foreground)]">
                  <div>
                    <span className="font-semibold">Price:</span> Rs {product.pricePerKg}/kg
                  </div>
                  <div>
                    <span className="font-semibold">Location:</span> {product.location}
                  </div>
                </div>
                <div className="mt-2">
                  <DeliveryStepper current={qa.delivery?.current ?? 0} steps={qa.steps} />
                  <p className="mt-1 text-xs text-[color:var(--muted)]">{qa.delivery?.eta}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--surface)] text-[color:var(--leaf)] px-2 py-1 text-xs ring-1 ring-[color:var(--supporting)]/40">✔ Quality Verified</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--surface)] text-[color:var(--foreground)] px-2 py-1 text-xs ring-1 ring-[color:var(--supporting)]/40">🛡 Buyer Protection</span>
                </div>
                <ShareActions product={product} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ProductDetailActions product={product} />
              <WatchlistButton product={product} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl shadow-sm p-6 space-y-4 bg-gradient-to-b from-[color:var(--surface)] to-[color:var(--surface-2)] ring-1 ring-[color:var(--supporting)]/40">
            <ProductTabs product={product} />
            {/* Inspection list */}
            <section aria-labelledby="inspection-heading" className="pt-2">
              <h3 id="inspection-heading" className="text-lg font-semibold text-[color:var(--foreground)]">Inspection history</h3>
              <InspectionHistory qa={qa} />
            </section>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <BidHistory productId={product.id} />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-[color:var(--foreground)] mb-3">
            Related {product.category}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {related.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl overflow-hidden border border-[color:var(--accent)]/40 bg-white text-[color:var(--foreground)] shadow-lg"
              >
                <Link
                  href={`/product/${item.id}`}
                  className="block focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
                >
                  <div className="w-full aspect-[4/3] overflow-hidden relative">
                    <ImageWithFallback
                      src={item.image || item.imgUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      quality={75}
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 space-y-1">
                    <h4 className="text-base font-semibold text-[color:var(--primary)]">{item.title}</h4>
                    <p className="text-sm text-[color:var(--foreground)]">Rs {item.pricePerKg}/kg</p>
                  </div>
                </Link>
              </article>
            ))}
            {related.length === 0 && (
              <div className="col-span-full text-sm text-[color:var(--muted)]">
                No related items yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// moved to dedicated component for reuse
