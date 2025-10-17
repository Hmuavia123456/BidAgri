"use client";

import React from "react";

export default function OrderStepper({ current = 0, className = "" }) {
  const steps = ["Review", "Payment", "Confirm"];

  return (
    <nav aria-label="Checkout progress" className={`w-full ${className}`}>
      <ol className="flex items-center justify-center gap-3 sm:gap-5" role="list">
        {steps.map((label, idx) => {
          const isActive = idx === current;
          const isCompleted = idx < current;
          return (
            <li key={label} className="flex items-center">
              <div
                className={`flex items-center gap-2 rounded-full px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base border ${
                  isCompleted
                    ? "bg-white border-[color:var(--accent)] text-[color:var(--primary)]"
                    : isActive
                    ? "bg-white border-[color:var(--accent)] text-[color:var(--primary)]"
                    : "bg-white border-[color:var(--accent)] text-[color:var(--muted)]"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs ${
                    isCompleted
                      ? "bg-[color:var(--leaf)] text-[color:var(--surface)] border-[color:var(--leaf)]"
                      : isActive
                      ? "bg-[color:var(--leaf)] text-[color:var(--surface)] border-[color:var(--leaf)]"
                      : "bg-[color:var(--surface)] text-[color:var(--muted)] border-[color:var(--accent)]"
                  }`}
                >
                  {isCompleted ? "✓" : idx + 1}
                </span>
                <span>{label}</span>
              </div>
              {idx < steps.length - 1 && (
                <span
                  aria-hidden
                  className="mx-2 sm:mx-3 h-px w-6 sm:w-10 bg-[color:var(--accent)]"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
