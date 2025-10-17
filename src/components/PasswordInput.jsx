"use client";

import { useMemo, useState } from "react";

// Password input with show/hide toggle and strength meter.
// Props:
// - id, name, label, value, onChange, onBlur
// - describedBy: id of error/help element
// - required: boolean
// - placeholder: string
export default function PasswordInput({
  id = "password",
  name = "password",
  label = "Password",
  value,
  onChange,
  onBlur,
  describedBy,
  required = true,
  placeholder = "At least 8 characters",
}) {
  const [visible, setVisible] = useState(false);

  const strength = useMemo(() => {
    const v = value || "";
    let score = 0;
    if (v.length >= 8) score += 1;
    if (/[A-Z]/.test(v)) score += 1;
    if (/[a-z]/.test(v)) score += 1;
    if (/[0-9]/.test(v)) score += 1;
    if (/[^A-Za-z0-9]/.test(v)) score += 1;
    return score; // 0–5
  }, [value]);

  const strengthLabel = ["Too weak", "Weak", "Fair", "Good", "Strong", "Very strong"][strength];
  const strengthColor = [
    "bg-red-500",
    "bg-red-600",
    "bg-yellow-500",
    "bg-[color:var(--leaf)]",
    "bg-[color:var(--primary)]",
    "bg-[color:var(--primary)]",
  ][strength];

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[color:var(--primary)]">
        {label}
      </label>
      <div className="mt-2 relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          aria-describedby={describedBy}
          className="w-full rounded-lg border border-[color:var(--surface-2)] bg-[color:var(--surface)] px-4 py-2 pr-12 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--leaf)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]/30"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-2 my-1 inline-flex items-center rounded-md px-2 text-xs text-[color:var(--leaf)] hover:bg-[color:var(--surface-2)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]/30"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>

      <div className="mt-2" aria-live="polite">
        <div className="h-1.5 w-full rounded bg-[color:var(--surface-2)]">
          <div
            className={`h-1.5 rounded ${strengthColor}`}
            style={{ width: `${(strength / 5) * 100}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-[color:var(--muted)]">Strength: {strengthLabel}</p>
      </div>
    </div>
  );
}
