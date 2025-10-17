"use client";

import { useState } from "react";

import BidModal from "@/components/BidModal";

export default function ProductDetailActions({ product }) {
  const [open, setOpen] = useState(false);

  if (!product) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 pt-2">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-[color:var(--leaf)] text-[color:var(--surface)] px-6 py-2.5 font-semibold shadow transition-all duration-300 hover:bg-[color:var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]"
      >
        Place Bid
      </button>
      <a href="/products" className="text-[color:var(--leaf)] hover:underline">
        Back to Products
      </a>
      <BidModal open={open} onClose={() => setOpen(false)} item={product} />
    </div>
  );
}
