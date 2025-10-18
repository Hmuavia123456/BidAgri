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
        className="rounded-full bg-primary px-6 py-2.5 font-semibold text-white shadow-md shadow-primary/25 transition-colors duration-200 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-base"
      >
        Place Bid
      </button>
      <a href="/products" className="text-primary transition-colors hover:text-secondary">
        Back to Products
      </a>
      <BidModal open={open} onClose={() => setOpen(false)} item={product} />
    </div>
  );
}
