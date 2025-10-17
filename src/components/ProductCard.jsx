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
      ? "bg-[color:var(--surface-2)] text-[color:var(--leaf)]"
      : "bg-[rgba(var(--accent-rgb),0.18)] text-[color:var(--foreground)]";

  return (
    <article className="group rounded-2xl overflow-hidden bg-white text-[color:var(--foreground)] border border-[color:var(--accent)]/40 shadow-lg hover:shadow-2xl transition-all duration-300 transform-gpu hover:scale-105">
      <Link href={`/product/${item.id}`} className="block focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]">
        <div className="w-full aspect-[4/3] overflow-hidden relative">
          <ImageWithFallback
            src={item.image || item.imgUrl}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            quality={75}
            className="transition-transform duration-300 ease-out will-change-transform group-hover:scale-105 group-hover:rotate-[0.5deg]"
          />
          <span className={`${statusClasses} absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ring-1 ring-[color:var(--supporting)]/30`}>{item.status}</span>
        </div>
        <div className="p-4 space-y-2 min-h-[150px]">
          <h3 className="text-base md:text-lg font-semibold tracking-tight text-[color:var(--primary)] transition-colors">
            {item.title}
          </h3>
          <p className="text-sm text-[color:var(--muted)]">{item.category}</p>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[color:var(--foreground)]">Rs {item.pricePerKg}/kg</p>
            <span className="text-xs text-[color:var(--muted)]">{qa.delivery?.eta || "ETA unavailable"}</span>
          </div>
          <p className="text-sm text-[color:var(--muted)]">{item.location}</p>
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
            className="w-full rounded-full bg-[color:var(--leaf)] text-[color:var(--surface)] px-4 py-2.5 font-semibold shadow transition-all duration-300 hover:bg-[color:var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Bid Now
          </button>
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);
