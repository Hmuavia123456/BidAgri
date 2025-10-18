"use client";

import Link from "next/link";
import { memo } from "react";
import ImageWithFallback from "@/components/ImageWithFallback";
import QABadge from "@/components/QABadge";
import { getQAForProduct } from "@/data/qa";

function ProductCard({ item, onBid }) {
  const qa = getQAForProduct(item.id);
  const statusClasses =
    item.status === "Available"
      ? "bg-accent/40 text-primary"
      : "bg-light text-dark/80";

  return (
    <article className="overflow-hidden rounded-2xl border border-accent/40 bg-base text-dark shadow-sm">
      <Link
        href={`/product/${item.id}`}
        className="block focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-base"
      >
        <div className="w-full aspect-[4/3] overflow-hidden relative">
          <ImageWithFallback
            src={item.image || item.imgUrl}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            quality={75}
            className="object-cover"
          />
          <span className={`${statusClasses} absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ring-1 ring-accent/40`}>{item.status}</span>
        </div>
        <div className="p-4 space-y-2 min-h-[150px]">
          <h3 className="text-base font-semibold tracking-tight text-dark md:text-lg">
            {item.title}
          </h3>
          <p className="text-sm text-dark/70">{item.category}</p>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-dark">Rs {item.pricePerKg}/kg</p>
            <span className="text-xs text-dark/60">{qa.delivery?.eta || "ETA unavailable"}</span>
          </div>
          <p className="text-sm text-dark/60">{item.location}</p>
          <div className="pt-1 flex items-center justify-between">
            <QABadge grade={qa.grade} verified={qa.verified} />
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <div className="pt-3">
          <button
            type="button"
            onClick={() => onBid(item)}
            className="w-full rounded-full bg-primary px-4 py-2.5 font-semibold text-white shadow-md shadow-primary/30 transition-all duration-300 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-base disabled:cursor-not-allowed disabled:opacity-50"
          >
            Bid Now
          </button>
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);
