"use client";

import Link from "next/link";
import { memo } from "react";
import ImageWithFallback from "@/components/ImageWithFallback";
import QABadge from "@/components/QABadge";
import { getQAForProduct } from "@/data/qa";

function resolveProductImage(product) {
  const gallery = Array.isArray(product.gallery) ? product.gallery : [];
  const galleryUrl = gallery
    .map((photo) => photo?.url || photo?.publicUrl)
    .find((value) => typeof value === "string" && value.startsWith("http"));
  const docUrl = product.documents?.farmProof?.url || product.documents?.farmProof?.publicUrl;
  const imageCandidates = [galleryUrl, product.image, docUrl, product.imgUrl];
  return (
    imageCandidates.find((value) => typeof value === "string" && value.length > 0) ||
    "/images/placeholder-produce.jpg"
  );
}

function statusTheme(status) {
  if (status === "Available") {
    return "bg-[rgba(var(--leaf-rgb),0.9)] text-white border-transparent";
  }
  if (status === "In Bidding") {
    return "bg-[rgba(var(--accent-rgb),0.9)] text-[#0f172a] border-transparent";
  }
  return "bg-black/80 text-white border-white/40";
}

function ProductCard({ item, onBid }) {
  const qa = getQAForProduct(item.id);
  const coverImage = resolveProductImage(item);
  const statusClasses = statusTheme(item.status);

  return (
    <article className="ui-card group relative overflow-hidden bg-white/95 text-[#0f172a]">
      <Link
        href={`/product/${item.id}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--leaf)]/70 focus-visible:ring-offset-4 focus-visible:ring-offset-white"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <ImageWithFallback
            src={coverImage}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            quality={80}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent opacity-90 mix-blend-normal" />
          <span
            className={`absolute top-4 left-4 inline-flex items-center rounded-full border px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.24em] shadow-lg backdrop-blur ${statusClasses}`}
          >
            {item.status || "Pending"}
          </span>
          <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-1.5 rounded-2xl bg-black/55 px-4 py-2 text-xs font-medium text-white shadow-lg backdrop-blur [&_*]:!text-white sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:text-sm">
            <span className="flex items-center gap-2 leading-snug sm:leading-none">
              <span className="inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-emerald-300" />
              {qa.delivery?.eta || "Flexible delivery"}
            </span>
            <span className="leading-snug sm:text-right sm:leading-none">
              {item.location || "Location on request"}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-4 px-6 pb-6 pt-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="ui-badge bg-[rgba(var(--leaf-rgb),0.12)] text-[color:var(--leaf)]">
                {item.category || "Marketplace lot"}
              </span>
              <h3 className="mt-3 text-lg font-semibold tracking-tight text-[#0f172a] transition-colors duration-300 group-hover:text-[color:var(--leaf)] sm:text-xl">
                {item.title}
              </h3>
            </div>
            <div className="rounded-2xl bg-[rgba(var(--leaf-rgb),0.12)] px-3 py-2 text-right">
              <p className="text-xs uppercase tracking-[0.18em] text-[rgba(var(--leaf-rgb),0.9)]">Price</p>
              <p className="text-lg font-semibold text-[#0f172a]">
                Rs {Number(item.pricePerKg || 0).toLocaleString()}
                <span className="ml-1 text-xs font-normal text-slate-500">/kg</span>
              </p>
            </div>
          </div>
          <p className="line-clamp-2 text-sm text-slate-600">
            {(item.description || item.summary || "Transparent quality metrics and farmer-backed fulfilment.").slice(0, 140)}
          </p>
          <div className="flex items-center justify-between border-t border-[rgba(15,23,42,0.08)] pt-4">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <QABadge grade={qa.grade} verified={qa.verified} />
              <span>{qa.verified ? "Verified lot" : "Awaiting verification"}</span>
            </div>
            <span className="text-sm font-semibold text-slate-700">
              {item.bidsCount ? `${item.bidsCount} bids` : "Be first to bid"}
            </span>
          </div>
        </div>
      </Link>
      <div className="flex items-center justify-between gap-3 border-t border-[rgba(15,23,42,0.08)] bg-white/90 px-6 py-4">
        <div className="flex flex-col text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Reserve</span>
          <span>Rs {Number(item.reservePrice || item.pricePerKg || 0).toLocaleString()}</span>
        </div>
        <button
          type="button"
          onClick={() => onBid(item)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--leaf)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(0,179,134,0.28)] transition-all duration-300 hover:bg-[color:var(--secondary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--leaf)]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Bid Now
        </button>
      </div>
    </article>
  );
}

export default memo(ProductCard);
