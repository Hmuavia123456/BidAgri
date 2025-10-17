"use client";

import React from "react";

export default function QABadge({ grade = "A", verified = true, className = "" }) {
  const bg = verified ? "bg-[color:var(--surface-2)]" : "bg-[color:var(--surface)]";
  const ring = verified ? "ring-[color:var(--surface-2)]" : "ring-[color:var(--surface-2)]";
  const text = verified ? "text-[color:var(--leaf)]" : "text-[color:var(--muted)]";
  const iconClass = verified ? "text-[color:var(--leaf)]" : "text-[color:var(--muted)]";
  const icon = verified ? (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={`h-4 w-4 ${iconClass}`} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={`h-4 w-4 ${iconClass}`} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full ${bg} ring-1 ${ring} px-2 py-1 text-xs font-medium ${text} ${className}`}
      aria-label={verified ? `Quality verified, grade ${grade}` : "Quality not verified"}
      title={verified ? `Quality verified • Grade ${grade}` : "Quality not verified"}
    >
      {icon}
      <span className="sr-only">QA grade</span>
      <span aria-hidden className="font-semibold">{grade}</span>
    </span>
  );
}
