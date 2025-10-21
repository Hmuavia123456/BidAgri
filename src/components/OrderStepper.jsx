"use client";

import React from "react";

export default function OrderStepper({ current = 0, className = "" }) {
  const steps = ["Review", "Payment", "Confirm"];

  return (
    <nav aria-label="Checkout progress" className={`w-full max-w-2xl mx-auto ${className}`}>
      <ol className="grid w-full gap-3 justify-items-center sm:grid-cols-3 sm:gap-4 lg:gap-6" role="list">
        {steps.map((label, idx) => {
          const isActive = idx === current;
          const isCompleted = idx < current;
          return (
            <li key={label} className="w-full sm:w-auto">
              <div
                className={`mx-auto flex w-full max-w-[210px] items-center justify-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold shadow-sm transition-all duration-300 whitespace-nowrap sm:px-4 sm:py-3 sm:text-sm md:text-base ${
                  isCompleted
                    ? "border-[color:var(--leaf)] bg-[color:var(--leaf)] text-white translate-y-[-1px] shadow-lg shadow-[rgba(var(--leaf-rgb),0.25)]"
                    : isActive
                    ? "border-[color:var(--secondary)] bg-[color:var(--secondary)] text-white translate-y-[-1px] shadow-lg shadow-[rgba(var(--secondary-rgb),0.25)]"
                    : "border-[#d0d7dd] bg-[#f6f8f9] text-[#1f2933]"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs transition-colors duration-300 ${
                    isCompleted
                      ? "bg-white text-[color:var(--leaf)] border-white"
                    : isActive
                      ? "bg-white text-[color:var(--secondary)] border-white"
                      : "bg-white text-[#1f2933] border-[#d0d7dd]"
                }`}
                >
                  {isCompleted ? "✓" : idx + 1}
                </span>
                <span className="tracking-wide text-[13px] sm:text-sm md:text-base font-semibold text-[#1f2933]">
                  {label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
