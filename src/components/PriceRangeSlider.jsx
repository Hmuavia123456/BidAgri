"use client";

import { useEffect, useId, useMemo, useState } from "react";

export default function PriceRangeSlider({
  min = 0,
  max = 2000,
  step = 10,
  value,
  onChange,
  label = "Price range",
}) {
  const id = useId();
  const [internal, setInternal] = useState({ min: value?.min ?? "", max: value?.max ?? "" });

  useEffect(() => {
    setInternal({ min: value?.min ?? "", max: value?.max ?? "" });
  }, [value?.min, value?.max]);

  const percent = (v) => ((v - min) / (max - min)) * 100;

  const left = useMemo(() => (internal.min !== "" ? percent(Number(internal.min)) : 0), [internal.min]);
  const right = useMemo(() => (internal.max !== "" ? percent(Number(internal.max)) : 100), [internal.max]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-[color:var(--foreground)]" htmlFor={`${id}-min`}>{label}</label>
        <div className="text-xs text-[color:var(--muted)]">Rs {internal.min || min} – {internal.max || max}</div>
      </div>
      <div className="price-range relative h-8">
        <div className="absolute inset-x-0 top-3 h-1 rounded bg-[color:var(--accent)]/30" aria-hidden />
        <div
          className="absolute top-3 h-1 rounded bg-[color:var(--accent)]"
          style={{ left: `${left}%`, right: `${100 - right}%` }}
          aria-hidden
        />
        <input
          type="range"
          id={`${id}-min`}
          min={min}
          max={max}
          step={step}
          value={internal.min === "" ? min : internal.min}
          onChange={(e) => {
            const next = Math.min(Number(e.target.value), internal.max === "" ? max : Number(internal.max));
            const v = { ...internal, min: next };
            setInternal(v);
            onChange?.({ min: v.min, max: v.max });
          }}
          className="absolute top-3 left-0 w-full h-1 appearance-none bg-transparent pointer-events-auto"
          aria-label="Minimum price"
        />
        <input
          type="range"
          id={`${id}-max`}
          min={min}
          max={max}
          step={step}
          value={internal.max === "" ? max : internal.max}
          onChange={(e) => {
            const next = Math.max(Number(e.target.value), internal.min === "" ? min : Number(internal.min));
            const v = { ...internal, max: next };
            setInternal(v);
            onChange?.({ min: v.min, max: v.max });
          }}
          className="absolute top-3 left-0 w-full h-1 appearance-none bg-transparent pointer-events-auto"
          aria-label="Maximum price"
        />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex items-center gap-1">
          <label htmlFor={`${id}-min-input`} className="sr-only">Min price</label>
          <span className="text-xs text-[color:var(--muted)]">Min:</span>
          <input
            id={`${id}-min-input`}
            type="number"
            min={min}
            max={max}
            step={step}
            value={internal.min}
            onChange={(e) => {
              const val = e.target.value === "" ? "" : Math.max(min, Math.min(Number(e.target.value), internal.max === "" ? max : Number(internal.max)));
              const v = { ...internal, min: val };
              setInternal(v);
              onChange?.({ min: v.min, max: v.max });
            }}
            className="w-24 rounded-md border border-[color:var(--accent)] px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]"
            inputMode="numeric"
          />
        </div>
        <div className="flex items-center gap-1">
          <label htmlFor={`${id}-max-input`} className="sr-only">Max price</label>
          <span className="text-xs text-[color:var(--muted)]">Max:</span>
          <input
            id={`${id}-max-input`}
            type="number"
            min={min}
            max={max}
            step={step}
            value={internal.max}
            onChange={(e) => {
              const val = e.target.value === "" ? "" : Math.min(max, Math.max(Number(e.target.value), internal.min === "" ? min : Number(internal.min)));
              const v = { ...internal, max: val };
              setInternal(v);
              onChange?.({ min: v.min, max: v.max });
            }}
            className="w-24 rounded-md border border-[color:var(--accent)] px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]"
            inputMode="numeric"
          />
        </div>
      </div>
    </div>
  );
}
