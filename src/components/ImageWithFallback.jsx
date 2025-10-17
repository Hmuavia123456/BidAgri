"use client";

import { useState, useMemo } from "react";
import Image from "next/image";

// Tiny gray blur placeholder (1x1 px) to avoid CLS before load
const TINY_BLUR =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAICAgICAgICAgIDAwMDBAQEBAQEBAgIBAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgP/2wCEAAQEBAQIBAgICAwICAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwP/wAARCAAQABADASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAgP/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCkAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/2Q==";

export default function ImageWithFallback({
  src,
  alt,
  fallbackSrc = "/images/placeholder-produce.jpg",
  blurDataURL: blurOverride,
  ...props
}) {
  const normalizeSrc = (value) => {
    if (!value || typeof value !== "string") return "/images/placeholder-produce.jpg";
    if (value.startsWith("http")) return value;
    if (value.startsWith("/")) return value;
    return `/images/${value}`;
  };

  const [imgSrc, setImgSrc] = useState(normalizeSrc(src));

  const effectiveAlt = alt || "Product image";

  const { className, ...rest } = props || {};
  const isFill = !!rest.fill;
  const finalWidth = rest.width ?? (isFill ? undefined : 400);
  const finalHeight = rest.height ?? (isFill ? undefined : 300);
  const hasPriority = !!rest.priority;
  const computedLoading = hasPriority ? undefined : (rest.loading ?? "lazy");

  return (
    <Image
      src={imgSrc}
      alt={effectiveAlt}
      onError={() => setImgSrc(normalizeSrc(fallbackSrc))}
      {...rest}
      width={finalWidth}
      height={finalHeight}
      className={`object-cover w-full h-full ${className || ""}`}
      placeholder="blur"
      blurDataURL={blurOverride || TINY_BLUR}
      loading={computedLoading}
    />
  );
}
