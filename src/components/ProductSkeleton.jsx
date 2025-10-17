"use client";

export default function ProductSkeleton({ count = 9 }) {
  const items = Array.from({ length: count });
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
      {items.map((_, idx) => (
        <article
          key={idx}
        className="rounded-2xl overflow-hidden bg-[color:var(--surface)] shadow-sm animate-pulse"
          aria-hidden
        >
          <div className="w-full aspect-[4/3] bg-[color:var(--surface-2)]" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-[color:var(--surface-2)] rounded w-3/4" />
            <div className="h-3 bg-[color:var(--surface-2)] rounded w-1/3" />
            <div className="h-4 bg-[color:var(--surface-2)] rounded w-1/2" />
            <div className="h-3 bg-[color:var(--surface-2)] rounded w-2/3" />
          </div>
          <div className="px-4 pb-4">
            <div className="h-10 bg-[color:var(--surface-2)] rounded-full" />
          </div>
        </article>
      ))}
    </div>
  );
}
