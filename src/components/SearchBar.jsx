"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import useDebouncedValue from "@/hooks/useDebouncedValue";

function SearchBar({
  value,
  onChange,
  onSelect,
  suggestions = [],
  placeholder = "Search produce…",
  label = "Search",
}) {
  const [input, setInput] = useState(value || "");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const debounced = useDebouncedValue(input, 250);

  useEffect(() => {
    const next = value || "";
    if (next !== input) setInput(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // FIX: Prevent re-render loop ("Maximum update depth exceeded")
  // Only notify parent when the debounced value changes, not when the prop `value` changes.
  // Including `value` in deps caused a ping-pong: parent updates `value`, this effect ran again
  // with stale `debounced` and fired `onChange`, fighting the parent. We now depend solely on
  // `debounced` and guard against redundant updates by comparing to the latest `value`.
  useEffect(() => {
    const current = value || "";
    if (debounced !== current) onChange?.(debounced);
    // Intentionally exclude `value` and `onChange` from deps to avoid effect re-installs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const filtered = useMemo(() => {
    const q = input.trim().toLowerCase();
    if (!q) return [];
    const uniq = Array.from(new Set(suggestions));
    return uniq
      .filter((s) => s.toLowerCase().includes(q))
      .slice(0, 8);
  }, [input, suggestions]);

  const handleKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (open && activeIndex >= 0 && filtered[activeIndex]) {
        e.preventDefault();
        const val = filtered[activeIndex];
        setInput(val);
        onChange?.(val);
        onSelect?.(val);
        setOpen(false);
      } else {
        onChange?.(input);
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const id = "search-typeahead";

  return (
    <div className="relative" role="combobox" aria-expanded={open} aria-owns={`${id}-list`} aria-haspopup="listbox">
      <label htmlFor={id} className="sr-only">{label}</label>
      <input
        id={id}
        ref={inputRef}
        type="search"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => input && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-lg ring-1 ring-[color:var(--supporting)] focus:ring-2 focus:ring-[color:var(--accent)] focus:outline-none bg-[color:var(--surface)] text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] px-4 py-2.5 text-sm"
        role="searchbox"
        aria-autocomplete="list"
        aria-controls={`${id}-list`}
        aria-activedescendant={activeIndex >= 0 ? `${id}-opt-${activeIndex}` : undefined}
      />
      {open && filtered.length > 0 && (
        <ul
          id={`${id}-list`}
          ref={listRef}
          role="listbox"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md bg-[color:var(--surface)] py-1 text-sm shadow-lg ring-1 ring-[color:var(--supporting)]/40"
        >
          {filtered.map((s, idx) => (
            <li
              id={`${id}-opt-${idx}`}
              key={s}
              role="option"
              aria-selected={idx === activeIndex}
              className={`cursor-pointer select-none px-3 py-2 ${
                idx === activeIndex ? "bg-[rgba(var(--primary-rgb),0.08)] text-[color:var(--leaf)]" : "text-[color:var(--foreground)] hover:bg-[color:var(--surface-2)]"
              }`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setInput(s);
                onChange?.(s);
                onSelect?.(s);
                setOpen(false);
                setActiveIndex(-1);
              }}
              onMouseEnter={() => setActiveIndex(idx)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default memo(SearchBar);
