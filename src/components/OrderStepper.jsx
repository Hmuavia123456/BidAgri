"use client";

import React from "react";

export default function OrderStepper({ current = 0, className = "" }) {
  const steps = ["Review", "Payment", "Confirm"];

  return (
    <nav aria-label="Checkout progress" className={`w-full max-w-2xl mx-auto ${className}`}>
      <ol className="flex w-full flex-wrap items-center justify-center gap-3 sm:gap-4 lg:gap-6" role="list">
        {steps.map((label, idx) => {
          const isActive = idx === current;
          const isCompleted = idx < current;
          const baseClasses =
            "mx-auto flex w-full max-w-[280px] min-h-[48px] items-center justify-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold shadow-sm transition-all duration-300 whitespace-nowrap sm:px-6 sm:py-3 sm:text-base md:text-lg";
          const stateClasses = isCompleted
            ? "!border-black !bg-black !text-white translate-y-[-1px] shadow-lg shadow-black/25"
            : isActive
            ? "!border-[color:var(--leaf)] !bg-[color:var(--leaf)] !text-white translate-y-[-1px] shadow-lg shadow-[rgba(var(--leaf-rgb),0.32)]"
            : "!border-[#111827] !bg-[#f3f4f6] !text-[#111827] opacity-90 hover:opacity-100 hover:translate-y-[-1px]";
          const labelColorClass = isCompleted || isActive ? "!text-white" : "text-[#111827]";

          return (
            <li key={label} className="flex w-full justify-center sm:w-auto">
              <div
                className={`${baseClasses} ${stateClasses}`}
              >
                <span
                  aria-hidden="true"
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold transition-colors duration-300 ${
                    isCompleted
                      ? "!border-white !bg-white !text-black"
                    : isActive
                      ? "!border-white !bg-white !text-[color:var(--leaf)]"
                      : "!border-[#111827]/70 !bg-[#f9fafb] !text-[#111827]"
                  }`}
                >
                  {isCompleted ? "✓" : idx + 1}
                </span>
                <span className={`tracking-wide font-semibold ${labelColorClass}`}>
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
