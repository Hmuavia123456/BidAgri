"use client";

import ImageWithFallback from "@/components/ImageWithFallback";

export default function ProductHeroImage({ src, alt }) {
  // Maintains 4:3 aspect to avoid CLS, preloads for LCP.
  return (
    <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl shadow">
      <ImageWithFallback
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        priority
        quality={85}
      />
    </div>
  );
}
