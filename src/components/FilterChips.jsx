"use client";

// Responsive chip controls for applied filters. Collapses on small screens.
// Dev check: Apply a few filters, then look under the result count.
// You should see chips for each active filter; tapping a chip removes it and syncs the URL.
export default function FilterChips({ filters, onRemove }) {
  const chips = [];
  if (filters.category && filters.category !== "All") chips.push({ key: "category", label: filters.category });
  if (filters.subcategory) chips.push({ key: "subcategory", label: filters.subcategory });
  if (filters.status) chips.push({ key: "status", label: filters.status });
  if (filters.minPrice !== "" && filters.minPrice != null) chips.push({ key: "minPrice", label: `Min Rs ${filters.minPrice}` });
  if (filters.maxPrice !== "" && filters.maxPrice != null) chips.push({ key: "maxPrice", label: `Max Rs ${filters.maxPrice}` });
  if (filters.q) chips.push({ key: "q", label: `“${filters.q}”` });

  if (chips.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2" role="list" aria-label="Active filters">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onRemove?.(chip.key)}
          className="inline-flex items-center gap-2 rounded-full bg-[color:var(--surface-2)] text-[color:var(--leaf)] px-3 py-1.5 text-xs md:text-sm ring-1 ring-[color:var(--surface-2)] hover:bg-[color:var(--surface-2)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]"
          aria-label={`Remove ${chip.label}`}
        >
          <span>{chip.label}</span>
          <span aria-hidden>✕</span>
        </button>
      ))}
    </div>
  );
}
