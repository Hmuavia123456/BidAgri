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

  const primaryHighlights = [
    {
      label: "Price per kg",
      value: `Rs ${product.pricePerKg}`,
      caption: "Farmer listed reserve price",
    },
    {
      label: "Location",
      value: product.location,
      caption: "Direct farm pickup & partner logistics",
    },
    {
      label: "Availability",
      value: product.status,
      caption: product.status === "Available" ? "Ready for shipment" : "Live auction in progress",
      accent: product.status === "Available" ? "text-[color:var(--leaf)]" : "text-[color:var(--foreground)]",
    },
    {
      label: "Quality grade",
      value: qa.grade,
      caption: qa.verified ? "Verified by BidAgri QA team" : "Awaiting verification",
    },
  ];

  const sellingPoints = [
    {
      title: "End-to-end traceability",
      description: "Track inspections, paperwork, and delivery milestones through a single shared timeline.",
    },
    {
      title: "Flexible inspections",
      description: "Schedule on-site inspections or request virtual evidence using our approved auditors.",
    },
    {
      title: "Escrow-ready settlements",
      description: "Funds released within 48 hours once proof-of-delivery is captured inside BidAgri.",
    },
  ];

  return (
    <section className="relative min-h-screen bg-white pb-20 pt-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[rgba(var(--leaf-rgb),0.12)] via-white to-white" aria-hidden="true" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 md:px-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-3">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[color:var(--leaf)] shadow-[0_8px_24px_rgba(15,23,42,0.12)] transition-colors hover:bg-[rgba(var(--leaf-rgb),0.08)] hover:text-[color:var(--secondary)]"
          >
            Products
          </Link>
          <span aria-hidden className="text-sm text-[color:var(--muted)]">›</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
            {product.title}
          </span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <div className="group relative overflow-hidden rounded-[32px] border border-[rgba(var(--leaf-rgb),0.18)] bg-white shadow-xl shadow-[rgba(var(--leaf-rgb),0.12)]">
              <ProductHeroImage src={product.image || product.imgUrl} alt={product.title} />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" aria-hidden="true" />
              <div className="absolute inset-x-0 bottom-0 z-[2] p-6 sm:p-8">
                <div
                  data-hero-overlay
                  className="flex flex-col gap-2 rounded-2xl bg-white/10 px-6 py-5 text-white shadow-lg shadow-black/20 ring-1 ring-white/20 backdrop-blur-sm transition-all duration-300 data-[state=hidden]:pointer-events-none data-[state=hidden]:translate-y-2 data-[state=hidden]:opacity-0"
                >
                  <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.35em] text-white/90">
                    <span className="rounded-full bg-white/20 px-3 py-1">{product.category}</span>
                    <span className="rounded-full bg-white/20 px-3 py-1">{product.status}</span>
                    <QABadge grade={qa.grade} verified={qa.verified} className="text-white bg-white/20 ring-white/20" />
                  </div>
                  <h1 className="mt-3 text-balance text-3xl font-semibold leading-tight text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.55)] sm:text-4xl md:text-5xl">
                    {product.title}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">
                    Fresh lot curated by BidAgri specialists. Transparent quality metrics and delivery commitments included below.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {primaryHighlights.map(({ label, value, caption, accent }) => (
                <div
                  key={label}
                  className="rounded-3xl border border-[rgba(var(--leaf-rgb),0.2)] bg-white/90 p-5 shadow-sm shadow-[rgba(var(--leaf-rgb),0.08)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]">
                    {label}
                  </p>
                  <p className={`mt-2 text-2xl font-bold text-[color:var(--foreground)] ${accent || ""}`}>
                    {value}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">
                    {caption}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-[28px] border border-[rgba(var(--leaf-rgb),0.18)] bg-white/95 p-6 shadow-sm shadow-[rgba(var(--leaf-rgb),0.1)]">
              <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Why growers love this listing</h2>
              <ul className="mt-4 grid gap-4 sm:grid-cols-3">
                {sellingPoints.map((point) => (
                  <li key={point.title} className="rounded-2xl bg-[rgba(var(--leaf-rgb),0.05)] p-4 ring-1 ring-[rgba(var(--leaf-rgb),0.12)]">
                    <p className="text-sm font-semibold text-[color:var(--foreground)]">{point.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-[color:var(--muted)]">{point.description}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[28px] border border-[rgba(var(--leaf-rgb),0.18)] bg-white/95 p-6 shadow-sm shadow-[rgba(var(--leaf-rgb),0.08)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Logistics & delivery</h2>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">Live tracking of shipment milestones once your bid is accepted.</p>
                </div>
                <DeliveryStepper current={qa.delivery?.current ?? 0} steps={qa.steps} className="w-full max-w-lg" />
              </div>
              <p className="mt-2 text-xs text-[color:var(--muted)]">{qa.delivery?.eta}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(var(--leaf-rgb),0.12)] px-3 py-1 font-medium text-[color:var(--leaf)]">✔ End-to-end tracking</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(var(--leaf-rgb),0.12)] px-3 py-1 font-medium text-[color:var(--leaf)]">🚚 Cold chain partners</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(var(--leaf-rgb),0.12)] px-3 py-1 font-medium text-[color:var(--leaf)]">🧾 Digital POD</span>
              </div>
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28">
            <div className="rounded-[28px] border border-[rgba(var(--leaf-rgb),0.2)] bg-white/95 p-6 shadow-lg shadow-[rgba(var(--leaf-rgb),0.12)]">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[color:var(--muted)]">Current lot</p>
                    <h2 className="text-2xl font-semibold text-[color:var(--primary)]">{product.title}</h2>
                    <p className="text-sm text-[color:var(--muted)]">Origin: {product.location}</p>
                  </div>
                  <QABadge grade={qa.grade} verified={qa.verified} />
                </div>

                <div className="space-y-3 rounded-2xl bg-[rgba(var(--leaf-rgb),0.05)] p-4 ring-1 ring-[rgba(var(--leaf-rgb),0.12)]">
                  <div className="flex items-center justify-between text-sm text-[color:var(--foreground)]">
                    <span>Base price</span>
                    <strong>Rs {product.pricePerKg}/kg</strong>
                  </div>
                  <div className="flex items-center justify-between text-sm text-[color:var(--foreground)]">
                    <span>Status</span>
                    <strong className="text-[color:var(--leaf)]">{product.status}</strong>
                  </div>
                  <div className="flex items-center justify-between text-sm text-[color:var(--foreground)]">
                    <span>Category</span>
                    <strong>{product.category}</strong>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <ProductDetailActions product={product} />
                  <WatchlistButton product={product} />
                  <ShareActions product={product} />
                </div>
              </div>
            </div>

            <BidHistory productId={product.id} />
          </aside>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6 rounded-[28px] border border-[rgba(var(--leaf-rgb),0.18)] bg-white/95 p-6 shadow-sm shadow-[rgba(var(--leaf-rgb),0.08)]">
            <ProductTabs product={product} />
            <section aria-labelledby="inspection-heading" className="pt-2">
              <h3 id="inspection-heading" className="text-lg font-semibold text-[color:var(--foreground)]">Inspection history</h3>
              <InspectionHistory qa={qa} />
            </section>
          </div>

          <div className="rounded-[28px] border border-[rgba(var(--leaf-rgb),0.18)] bg-white/95 p-6 shadow-sm shadow-[rgba(var(--leaf-rgb),0.08)]">
            <h3 className="text-lg font-semibold text-[color:var(--foreground)]">Checklist before bidding</h3>
            <ul className="mt-4 space-y-3 text-sm text-[color:var(--muted)]">
              <li>• Confirm desired quantity and preferred pickup dates.</li>
              <li>• Review latest inspection proofs provided by BidAgri QA.</li>
              <li>• Clarify payment method (escrow / direct) with the seller if needed.</li>
              <li>• Arrange logistics partner or request BidAgri managed delivery.</li>
            </ul>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold text-[color:var(--foreground)]">
            Related {product.category}
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-3xl border border-[rgba(var(--leaf-rgb),0.2)] bg-white shadow-lg shadow-[rgba(var(--leaf-rgb),0.12)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <Link
                  href={`/product/${item.id}`}
                  className="block focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/60"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <ImageWithFallback
                      src={item.image || item.imgUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      quality={75}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-1 p-4">
                    <h4 className="text-base font-semibold text-[color:var(--primary)]">{item.title}</h4>
                    <p className="text-sm text-[color:var(--muted)]">Rs {item.pricePerKg}/kg</p>
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
