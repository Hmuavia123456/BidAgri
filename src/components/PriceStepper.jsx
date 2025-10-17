"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

const PriceStepper = forwardRef(function PriceStepper(
  { value, onChange, min = 1, step = 1, currency = "Rs", label = "Bid Price per kg" },
  ref
) {
  const inputRef = useRef(null);
  const [internal, setInternal] = useState(value ?? "");

  useEffect(() => {
    setInternal(value ?? "");
  }, [value]);

  useImperativeHandle(ref, () => ({ focus: () => inputRef.current?.focus() }));

  const clamp = (num) => {
    if (Number.isNaN(num)) return "";
    return Math.max(min, Math.round(num / step) * step);
  };

  const commit = (next) => {
    const n = Number(next);
    if (Number.isNaN(n)) {
      setInternal("");
      onChange?.("");
      return;
    }
    const c = clamp(n);
    setInternal(String(c));
    onChange?.(String(c));
  };

  const inc = () => commit((Number(internal) || 0) + step);
  const dec = () => commit(Math.max(min, (Number(internal) || 0) - step));

  return (
    <div className="block">
      <label className="block text-xs font-medium text-[color:var(--muted)]">
        {label}
        <div className="mt-1 flex rounded-lg ring-1 ring-[color:var(--accent)] focus-within:ring-2 focus-within:ring-[color:var(--primary)] overflow-hidden">
          <button
            type="button"
            onClick={dec}
            aria-label="Decrease price"
            className="px-3 py-2 text-[color:var(--foreground)] hover:bg-[color:var(--surface-2)] disabled:opacity-50"
          >
            –
          </button>
          <input
            ref={inputRef}
            type="number"
            inputMode="numeric"
            min={min}
            step={step}
            value={internal}
            onChange={(e) => setInternal(e.target.value)}
            onBlur={() => commit(internal)}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                e.preventDefault();
                inc();
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                dec();
              }
            }}
            aria-describedby="price-guidance"
            className="w-full px-3 py-2 bg-[color:var(--surface)] text-[color:var(--foreground)] outline-none"
          />
          <button
            type="button"
            onClick={inc}
            aria-label="Increase price"
            className="px-3 py-2 text-[color:var(--foreground)] hover:bg-[color:var(--surface-2)] disabled:opacity-50"
          >
            +
          </button>
        </div>
      </label>
      <div id="price-guidance" className="mt-1 text-[11px] text-[color:var(--muted)]">
        Use arrows or buttons to adjust. Minimum {currency} {min}, step {currency} {step}.
      </div>
    </div>
  );
});

export default PriceStepper;
