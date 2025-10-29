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
import { adminDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1582515073490-dc0c84f0ca04?q=80&w=1200&auto=format&fit=crop";

function toIso(value) {
  return value instanceof Timestamp ? value.toDate().toISOString() : null;
}

function transformProductDoc(docSnap) {
  const data = docSnap.data() ?? {};
  return {
    id: docSnap.id,
    ...data,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
    publishedAt: toIso(data.publishedAt),
  };
}

async function getProductById(id) {
  if (!id) return null;
  const ref = adminDb.collection("products").doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  return transformProductDoc(snap);
}

async function getRelatedProducts(excludeId) {
  const snapshot = await adminDb
    .collection("products")
    .orderBy("createdAt", "desc")
    .limit(6)
    .get();
  return snapshot.docs.map(transformProductDoc).filter((product) => product.id !== excludeId).slice(0, 4);
}

export async function generateMetadata(props) {
  const params = await props.params;
  const product = await getProductById(params.id);

  if (!product) {
    return {
      title: "Product | BidAgri",
      description: "BidAgri product",
    };
  }

  const url = `https://bidagri.example/product/${product.id}`;
  return {
    title: `${product.title} | BidAgri`,
    description: `${product.title} from ${product.location || "Location pending"} — ${product.category || "Farmer listings"} on BidAgri.`,
    openGraph: {
      title: `${product.title} | BidAgri`,
      description: `${product.title} from ${product.location || "Location pending"} — ${product.category || "Farmer listings"} on BidAgri.`,
      url,
      images: [{ url: product.image || DEFAULT_IMAGE }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} | BidAgri`,
      description: `${product.title} from ${product.location || "Location pending"} — ${product.category || "Farmer listings"} on BidAgri.`,
      images: [product.image || DEFAULT_IMAGE],
    },
  };
}

export default async function ProductDetailPage(props) {
  const params = await props.params;
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  const related = await getRelatedProducts(product.id);
  const qa = getQAForProduct(product.id);

  const galleryEntries = Array.isArray(product.gallery) ? product.gallery : [];
  const galleryUrls = galleryEntries
    .map((photo) => photo?.url || photo?.publicUrl)
    .filter((value) => typeof value === "string" && value.length > 0);
  const provideHeroImage = () => {
    const candidates = [
      galleryUrls[0],
      product.image,
      product.documents?.farmProof?.url,
      product.documents?.farmProof?.publicUrl,
      product.imgUrl,
      DEFAULT_IMAGE,
    ];
    const chosen = candidates.find((value) => typeof value === "string" && value.startsWith("http"));
    return chosen || DEFAULT_IMAGE;
  };
  const heroImage = provideHeroImage();
  const galleryImages = galleryUrls.length
    ? galleryUrls.map((url, index) => ({ url, name: `${product.title} ${index + 1}` }))
    : product.image
    ? [{ url: product.image, name: product.title }]
    : [];

  const pricePerKg = Number(product.pricePerKg ?? 0);
  const priceDisplay = pricePerKg > 0 ? `Rs ${pricePerKg.toLocaleString()}` : "Price on request";
  const locationDisplay = product.location || "Location pending";
  const statusDisplay = product.status || "Pending review";
  const bidsCount = Number(product.bidsCount || 0);
  const highestBidValue = Number(product.highestBid || 0);
  const highestBidDisplay = highestBidValue > 0 ? `Rs ${highestBidValue.toLocaleString()}` : "No bids yet";
  const bidsCaption =
    highestBidValue > 0 ? `${bidsCount} bid${bidsCount === 1 ? "" : "s"} placed` : "Be the first to bid";
  const statusHighlight =
    statusDisplay === "Available"
      ? {
          badge: "bg-[rgba(var(--leaf-rgb),0.15)] text-[color:var(--leaf)]",
        }
      : statusDisplay === "In Bidding"
      ? {
          badge: "bg-[rgba(var(--accent-rgb),0.24)] !text-black",
        }
      : null;
  const detailStatusClass = statusHighlight
    ? `inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${statusHighlight.badge}`
    : "font-semibold text-[color:var(--foreground)]";

  const highlightToneClass = (tone) => {
    switch (tone) {
      case "accent":
        return "bg-gradient-to-br from-white via-[rgba(var(--accent-rgb),0.05)] to-white border-[rgba(var(--accent-rgb),0.32)]";
      case "leaf":
        return "bg-gradient-to-br from-white via-[rgba(var(--leaf-rgb),0.06)] to-white border-[rgba(var(--leaf-rgb),0.26)]";
      default:
        return "bg-gradient-to-br from-white via-[rgba(var(--leaf-rgb),0.04)] to-white border-[rgba(var(--leaf-rgb),0.18)]";
    }
  };
  const subtleTextClass = "!text-black";

  const primaryHighlights = [
    {
      label: "Price per kg",
      value: priceDisplay,
      caption: "Farmer listed reserve price",
      tone: "leaf",
    },
    {
      label: "Highest bid",
      value: highestBidDisplay,
      caption: bidsCaption,
      tone: highestBidValue > 0 ? "accent" : "neutral",
      highlight: highestBidValue > 0 ? statusHighlight : null,
    },
    {
      label: "Location",
      value: locationDisplay,
      caption: "Direct farm pickup & partner logistics",
      tone: "neutral",
    },
    {
      label: "Availability",
      value: statusDisplay,
      caption:
        statusDisplay === "Available"
          ? "Ready for shipment"
          : statusDisplay === "In Bidding"
          ? "Live auction in progress"
          : "Pending review",
      highlight: statusHighlight,
      tone:
        statusDisplay === "In Bidding" ? "accent" : statusDisplay === "Available" ? "leaf" : "neutral",
    },
    {
      label: "Quality grade",
      value: qa.grade,
      caption: qa.verified ? "Verified by BidAgri QA team" : "Awaiting verification",
      tone: qa.verified ? "leaf" : "neutral",
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

  const deliveryWindow = qa.delivery?.eta || product.deliveryWindow || "Dispatch in 48h";
  const summaryBullets = [
    {
      title: qa.verified ? "QA verified" : "QA review pending",
      subtitle: qa.verified
        ? "Quality checks cleared by BidAgri inspectors."
        : "Our QA team reviews each lot before release.",
      tone: qa.verified ? "leaf" : "neutral",
    },
    {
      title: bidsCount > 0 ? `${bidsCount} active bid${bidsCount === 1 ? "" : "s"}` : "Open for bids",
      subtitle:
        highestBidValue > 0
          ? `Top offer currently at ${highestBidDisplay}/kg.`
          : "Place the first offer to unlock negotiations.",
      tone: "accent",
    },
    {
      title: "Logistics ready",
      subtitle: deliveryWindow,
      tone: "leaf",
    },
  ];

  return (
    <section className="bg-gradient-to-b from-white via-[rgba(var(--leaf-rgb),0.05)] to-white pb-20 pt-24">
      <div className="mx-auto max-w-6xl space-y-12 px-4 sm:px-6 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-sm text-[color:var(--muted)] sm:gap-3 sm:text-base"
        >
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-semibold text-[color:var(--leaf)] shadow-[0_10px_22px_rgba(15,23,42,0.12)] transition hover:bg-[rgba(var(--leaf-rgb),0.12)] hover:text-[color:var(--secondary)]"
          >
            Products
          </Link>
          <span aria-hidden className="text-[color:var(--muted)]">/</span>
          <span className="max-w-full truncate font-semibold text-[color:var(--foreground)]" title={product.title}>
            {product.title}
          </span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:items-start">
          <div className="space-y-8">
            <div className="overflow-hidden rounded-3xl border border-[rgba(var(--leaf-rgb),0.16)] bg-white shadow-[0_20px_36px_rgba(15,23,42,0.12)]">
              <ProductHeroImage src={heroImage} alt={product.title} />
              <div className="space-y-3 border-t border-[rgba(var(--leaf-rgb),0.12)] px-6 py-6 sm:px-8">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--leaf)]">
                  {product.category || "Farmer listings"}
                </p>
                <h1 className="text-3xl font-semibold text-[color:var(--foreground)] sm:text-4xl md:text-5xl">
                  {product.title}
                </h1>
                <p className={`max-w-3xl text-sm leading-relaxed ${subtleTextClass} sm:text-base`}>
                  Fresh lot curated by BidAgri specialists. Transparent quality metrics and delivery commitments included below.
                </p>
              </div>
            </div>

            {galleryImages.length > 1 && (
              <div className="rounded-3xl border border-[rgba(var(--leaf-rgb),0.14)] bg-white p-6 shadow-[0_16px_32px_rgba(15,23,42,0.08)] sm:p-8">
                <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Lot gallery</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {galleryImages.map((item, index) => {
                    const url = item?.url || item;
                    if (!url) return null;
                    return (
                      <div
                        key={`${url}-${index}`}
                        className="overflow-hidden rounded-2xl border border-[rgba(var(--leaf-rgb),0.12)] bg-white shadow-sm shadow-[rgba(15,23,42,0.08)]"
                      >
                        <ImageWithFallback
                          src={url}
                          alt={`${product.title} photo ${index + 1}`}
                          width={600}
                          height={420}
                          quality={80}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="rounded-3xl border border-[rgba(var(--accent-rgb),0.16)] bg-white p-6 shadow-[0_20px_36px_rgba(var(--accent-rgb),0.15)] sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-2xl">
                  <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Lot snapshot</h2>
                  <p className={`mt-2 text-sm ${subtleTextClass} sm:text-base`}>
                    Bid-ready produce with transparent QA, logistics, and payment protection. Review the quick summary or jump straight into bidding.
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {summaryBullets.map((item) => {
                  const toneClass =
                    item.tone === "leaf"
                      ? "bg-[rgba(var(--leaf-rgb),0.12)]"
                      : item.tone === "accent"
                      ? "bg-[rgba(var(--accent-rgb),0.12)]"
                      : "bg-white";
                  return (
                    <div
                      key={item.title}
                      className={`rounded-2xl border border-[rgba(var(--leaf-rgb),0.12)] p-4 text-sm text-[color:var(--foreground)] shadow-sm shadow-[rgba(15,23,42,0.08)] ${toneClass}`}
                    >
                      <p className="font-semibold">{item.title}</p>
                      <p className={`mt-1 text-xs ${subtleTextClass}`}>{item.subtitle}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {primaryHighlights.map(({ label, value, caption, highlight, tone }) => (
                <div
                  key={label}
                  className={`rounded-3xl border p-5 shadow-[0_18px_32px_rgba(15,23,42,0.08)] ${highlightToneClass(tone)}`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">{label}</p>
                  {highlight ? (
                    <p className="mt-3 text-2xl font-bold text-[color:var(--foreground)]">
                      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-base font-semibold ${highlight.badge}`}>
                        {value}
                      </span>
                    </p>
                  ) : (
                    <p className="mt-3 text-2xl font-bold text-[color:var(--foreground)]">{value}</p>
                  )}
                  <p className={`mt-2 text-sm leading-relaxed ${subtleTextClass}`}>{caption}</p>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-[rgba(var(--leaf-rgb),0.12)] bg-white p-6 shadow-[0_18px_34px_rgba(15,23,42,0.08)] sm:p-8">
              <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Why growers love this listing</h2>
              <ul className="mt-4 grid gap-4 sm:grid-cols-3">
                {sellingPoints.map((point) => (
                  <li key={point.title} className="rounded-2xl border border-[rgba(var(--leaf-rgb),0.12)] bg-white/90 p-4 shadow-sm shadow-[rgba(15,23,42,0.08)]">
                    <p className="text-sm font-semibold text-[color:var(--foreground)]">{point.title}</p>
                    <p className={`mt-2 text-sm leading-relaxed ${subtleTextClass}`}>{point.description}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-[rgba(var(--accent-rgb),0.16)] bg-white p-6 shadow-[0_18px_34px_rgba(var(--accent-rgb),0.14)] sm:p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Logistics & delivery</h2>
                  <p className={`mt-1 text-sm ${subtleTextClass}`}>
                    Live tracking of shipment milestones once your bid is accepted.
                  </p>
                </div>
                <DeliveryStepper current={qa.delivery?.current ?? 0} steps={qa.steps} className="w-full lg:w-auto" />
              </div>
              <p className={`mt-3 text-xs ${subtleTextClass}`}>{deliveryWindow}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs">
                <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(var(--leaf-rgb),0.14)] px-3 py-1 font-medium text-[color:var(--leaf)]">
                  End-to-end tracking
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(var(--leaf-rgb),0.14)] px-3 py-1 font-medium text-[color:var(--leaf)]">
                  Cold chain partners
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(var(--leaf-rgb),0.14)] px-3 py-1 font-medium text-[color:var(--leaf)]">
                  Digital proof of delivery
                </span>
              </div>
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-[rgba(var(--leaf-rgb),0.16)] bg-white p-6 shadow-[0_24px_44px_rgba(15,23,42,0.12)] sm:p-8">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[color:var(--muted)]">Current lot</p>
                  <h2 className="text-2xl font-semibold text-[color:var(--primary)]">{product.title}</h2>
                  <p className="text-sm text-[color:var(--muted)]">Origin: {product.location || "Location pending"}</p>
                </div>
                <QABadge grade={qa.grade} verified={qa.verified} />
              </div>

              <dl className="mt-6 space-y-3 text-sm text-[color:var(--foreground)]">
                <div className="flex items-center justify-between">
                  <dt className="text-[color:var(--muted)]">Base price</dt>
                  <dd className="font-semibold">{priceDisplay}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[color:var(--muted)]">Status</dt>
                  <dd className={detailStatusClass}>{statusDisplay}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[color:var(--muted)]">Highest bid</dt>
                  <dd className="font-semibold">{highestBidDisplay}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[color:var(--muted)]">Category</dt>
                  <dd className="font-semibold">{product.category || "Farmer listings"}</dd>
                </div>
              </dl>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <ProductDetailActions product={product} />
                <WatchlistButton product={product} />
                <ShareActions product={product} />
              </div>
            </div>

            <div className="rounded-3xl border border-[rgba(var(--leaf-rgb),0.12)] bg-white p-4 shadow-[0_18px_34px_rgba(15,23,42,0.1)] sm:p-6">
              <BidHistory productId={product.id} />
            </div>
          </aside>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr]">
          <div className="rounded-3xl border border-[rgba(var(--leaf-rgb),0.14)] bg-white p-6 shadow-[0_20px_36px_rgba(15,23,42,0.1)] sm:p-8">
            <ProductTabs product={product} />
            <section aria-labelledby="inspection-heading" className="mt-8">
              <h3 id="inspection-heading" className="text-lg font-semibold text-[color:var(--foreground)]">
                Inspection history
              </h3>
              <InspectionHistory qa={qa} />
            </section>
          </div>

          <div className="rounded-3xl border border-[rgba(var(--leaf-rgb),0.12)] bg-white p-6 shadow-[0_20px_36px_rgba(15,23,42,0.08)] sm:p-8">
            <h3 className="text-lg font-semibold text-[color:var(--foreground)]">Checklist before bidding</h3>
            <ul className={`mt-4 space-y-3 text-sm ${subtleTextClass}`}>
              <li>• Confirm desired quantity and preferred pickup dates.</li>
              <li>• Review latest inspection proofs provided by BidAgri QA.</li>
              <li>• Clarify payment method (escrow / direct) with the seller if needed.</li>
              <li>• Arrange logistics partner or request BidAgri managed delivery.</li>
            </ul>
          </div>
        </div>

        <div className="rounded-3xl border border-[rgba(var(--leaf-rgb),0.12)] bg-white p-6 shadow-[0_20px_36px_rgba(15,23,42,0.08)] sm:p-8">
          <h3 className="text-lg font-semibold text-[color:var(--foreground)]">Related {product.category}</h3>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-3xl border border-[rgba(var(--leaf-rgb),0.18)] bg-white shadow-[0_16px_30px_rgba(15,23,42,0.1)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_24px_38px_rgba(15,23,42,0.14)]"
              >
                <Link
                  href={`/product/${item.id}`}
                  className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/60"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <ImageWithFallback
                      src={item.image || item.imgUrl || DEFAULT_IMAGE}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      quality={75}
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="space-y-1 p-4">
                    <h4 className="text-base font-semibold text-[color:var(--primary)]">{item.title}</h4>
                    <p className={`text-sm ${subtleTextClass}`}>
                      {Number(item.pricePerKg ?? 0) > 0
                        ? `Rs ${Number(item.pricePerKg ?? 0).toLocaleString()}/${item.unit || "kg"}`
                        : "Price on request"}
                    </p>
                  </div>
                </Link>
              </article>
            ))}
            {related.length === 0 && (
              <div className={`col-span-full text-sm ${subtleTextClass}`}>No related items yet.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
