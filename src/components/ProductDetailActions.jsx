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
        className="rounded-full bg-green-600 text-white px-6 py-2.5 hover:bg-green-700 transition shadow"
      >
        Place Bid
      </button>
      <a href="/products" className="text-green-700 hover:underline">
        Back to Products
      </a>
      <BidModal open={open} onClose={() => setOpen(false)} item={product} />
    </div>
  );
}
