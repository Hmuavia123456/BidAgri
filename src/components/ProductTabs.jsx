"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import ImageWithFallback from "@/components/ImageWithFallback";

// Accessible Tabs that collapse to accordions on small screens
export default function ProductTabs({ product }) {
  const tabListRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const baseId = useId();

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  const tabs = useMemo(
    () => [
      { id: `${baseId}-details`, label: "Details", content: <DetailsTab product={product} /> },
      { id: `${baseId}-quality`, label: "Quality", content: <QualityTab product={product} /> },
      { id: `${baseId}-logistics`, label: "Logistics", content: <LogisticsTab product={product} /> },
      { id: `${baseId}-reviews`, label: "Reviews", content: <ReviewsTab product={product} /> },
    ],
    [product, baseId]
  );

  const onKeyDown = (e) => {
    if (!tabListRef.current) return;
    const tabsEls = Array.from(tabListRef.current.querySelectorAll('[role="tab"]'));
    const currentIndex = tabsEls.findIndex((el) => el === document.activeElement);
    if (currentIndex === -1) return;
    let nextIndex = currentIndex;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = (currentIndex + 1) % tabsEls.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex = (currentIndex - 1 + tabsEls.length) % tabsEls.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = tabsEls.length - 1;
        break;
      case "Enter":
      case " ":
        // Activate the focused tab
        setActiveIndex(currentIndex);
        return;
      default:
        return;
    }
    e.preventDefault();
    tabsEls[nextIndex]?.focus();
    setActiveIndex(nextIndex);
  };

  if (isMobile) {
    return (
      <div className="space-y-2" data-testid="product-accordions">
        {tabs.map((tab, idx) => (
          <details key={tab.id} className="group rounded-xl ring-1 ring-[color:var(--supporting)]/40 bg-[color:var(--surface)] open:shadow-sm" open={idx === 0}>
            <summary className="cursor-pointer list-none px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between">
              <span className="font-medium text-[color:var(--foreground)]">{tab.label}</span>
              <span className="ml-2 text-[color:var(--muted)] group-open:rotate-180 transition">▾</span>
            </summary>
            <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-sm text-[color:var(--foreground)]">
              {tab.content}
            </div>
          </details>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Product information"
        aria-orientation="horizontal"
        ref={tabListRef}
        onKeyDown={onKeyDown}
        className="flex gap-2 border-b border-[color:var(--supporting)]/40"
      >
        {tabs.map((tab, idx) => (
          <button
            key={tab.id}
            id={`${tab.id}-tab`}
            role="tab"
            aria-selected={activeIndex === idx}
            aria-controls={`${tab.id}-panel`}
            tabIndex={activeIndex === idx ? 0 : -1}
            type="button"
            onClick={() => setActiveIndex(idx)}
            className={`relative -mb-px px-3 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] rounded-t ${
              activeIndex === idx
                ? "text-[color:var(--leaf)] border-b-2 border-[color:var(--leaf)]"
                : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, idx) => (
        <div
          key={tab.id}
          id={`${tab.id}-panel`}
          role="tabpanel"
          aria-labelledby={`${tab.id}-tab`}
          hidden={activeIndex !== idx}
          className="pt-4"
        >
          {activeIndex === idx && <div className="text-sm text-[color:var(--foreground)]">{tab.content}</div>}
        </div>
      ))}
    </div>
  );
}

function DetailsTab({ product }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <span className="font-medium">Category:</span> {product.category}
      </div>
      <div>
        <span className="font-medium">Location:</span> {product.location}
      </div>
      <div>
        <span className="font-medium">Base Price:</span> Rs {product.pricePerKg}/kg
      </div>
      <div>
        <span className="font-medium">Status:</span> {product.status}
      </div>
      <p className="sm:col-span-2 text-[color:var(--muted)]">
        {product.title} listed on BidAgri. Fresh, farm-sourced, and ready for trade.
      </p>
    </div>
  );
}

function QualityTab({ product }) {
  return (
    <div className="space-y-3">
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <li className="flex items-center gap-2"><span className="text-[color:var(--leaf)]">✔</span> Verified quality checks</li>
        <li className="flex items-center gap-2"><span className="text-[color:var(--leaf)]">✔</span> Moisture within acceptable range</li>
        <li className="flex items-center gap-2"><span className="text-[color:var(--leaf)]">✔</span> Standardized packaging</li>
        <li className="flex items-center gap-2"><span className="text-[color:var(--leaf)]">✔</span> Seller reputation available</li>
      </ul>
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="relative h-24 w-full overflow-hidden rounded-lg">
            <ImageWithFallback
              src={product.image || product.imgUrl}
              alt={`Inspection snapshot ${i + 1}`}
              fill
              sizes="(max-width: 640px) 30vw, 20vw"
              quality={70}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function LogisticsTab() {
  return (
    <div className="space-y-2">
      <p>Partner logistics available nationwide with transparent pricing.</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Pickup within 48 hours of order</li>
        <li>Cold-chain options for perishables</li>
        <li>Live tracking with SMS updates</li>
      </ul>
    </div>
  );
}

function ReviewsTab() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-[color:var(--accent)]">★★★★★</span>
        <span className="text-sm text-[color:var(--muted)]">4.8 average (12 reviews)</span>
      </div>
      <div className="space-y-2">
        <Review name="Buyer 1" text="Excellent quality and timely delivery." />
        <Review name="Buyer 2" text="As described. Smooth transaction." />
      </div>
    </div>
  );
}

function Review({ name, text }) {
  return (
    <div className="rounded-lg ring-1 ring-[color:var(--supporting)]/40 bg-[color:var(--surface)] p-3">
      <div className="font-medium text-[color:var(--foreground)]">{name}</div>
      <div className="text-[color:var(--muted)] text-sm">{text}</div>
    </div>
  );
}
