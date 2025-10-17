"use client";

import React from "react";

export default function DeliveryStepper({ current = 0, steps = ["Ordered", "Packed", "In transit", "Delivered"], className = "" }) {
  return (
    <nav aria-label="Delivery progress" className={`w-full ${className}`}>
      <ol className="flex items-center gap-2 sm:gap-3" role="list">
        {steps.map((label, idx) => {
          const isActive = idx === current;
          const isCompleted = idx < current;
          const dotClasses = isCompleted
            ? "bg-[color:var(--leaf)] text-[color:var(--surface)] border-[color:var(--leaf)]"
            : isActive
            ? "bg-[color:var(--leaf)] text-[color:var(--surface)] border-[color:var(--leaf)]"
            : "bg-[color:var(--surface)] text-[color:var(--muted)] border-[color:var(--accent)]";
          return (
            <li key={label} className="flex items-center">
              <div
                className={`flex items-center gap-2 rounded-full px-2.5 py-1.5 text-xs sm:text-sm border ${
                  isCompleted
                    ? "bg-white border-[color:var(--accent)] text-[color:var(--primary)]"
                    : isActive
                    ? "bg-white border-[color:var(--accent)] text-[color:var(--primary)]"
                    : "bg-white border-[color:var(--accent)] text-[color:var(--muted)]"
                }`}
              >
                <span aria-hidden className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px] ${dotClasses}`}>
                  {isCompleted ? "✓" : idx + 1}
                </span>
                <span>{label}</span>
              </div>
              {idx < steps.length - 1 && (
                <span aria-hidden className="mx-1 sm:mx-2 h-px w-6 sm:w-8 bg-[color:var(--accent)]" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
