"use client";

export default function StatusChips({ value, onChange, counts = {} }) {
  const options = [
    { value: "", label: "All" },
    { value: "Available", label: `Available${counts.Available != null ? ` (${counts.Available})` : ""}` },
    { value: "In Bidding", label: `In Bidding${counts["In Bidding"] != null ? ` (${counts["In Bidding"]})` : ""}` },
  ];
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Availability status">
      {options.map((opt) => {
        const active = value === opt.value || (!value && opt.value === "");
        return (
          <button
            key={opt.value || "all"}
            type="button"
            onClick={() => onChange?.(opt.value)}
            className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm ring-1 transition focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)] ${
              active ? "bg-[color:var(--surface-2)] text-[color:var(--leaf)] ring-[color:var(--surface-2)]" : "bg-[color:var(--surface)] text-[color:var(--foreground)] ring-[color:var(--surface-2)] hover:bg-[color:var(--surface-2)]"
            }`}
            aria-pressed={active}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
