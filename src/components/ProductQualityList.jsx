"use client";

import React from "react";

const MOCK_PRODUCTS = [
  { name: "Organic Wheat", grade: "A", note: "Top-grade quality" },
  { name: "Basmati Rice", grade: "A-", note: "Premium quality, slightly off-size" },
  { name: "Corn Feed", grade: "B+", note: "Good condition" },
  { name: "Sugarcane", grade: "B", note: "Average quality" },
  { name: "Cotton Bale", grade: "C", note: "Below average" },
  { name: "Lentils", grade: "D", note: "Rejected batch" },
  { name: "Soybeans", grade: "B+", note: "Acceptable quality" },
  { name: "Barley", grade: "A", note: "Premium quality" },
];

const gradeStyles = {
  "A": "bg-[color:var(--leaf)] text-[color:var(--surface)]",
  "A-": "bg-[color:var(--leaf)]/80 text-[color:var(--surface)]",
  "B+": "bg-[color:var(--accent)] text-[color:var(--primary)]",
  "B": "bg-[color:var(--accent)]/80 text-[color:var(--primary)]",
  "C": "bg-[color:var(--supporting)] text-[color:var(--primary)]",
  "D": "bg-[color:var(--primary)] text-[color:var(--surface)]",
};

export default function ProductQualityList() {
  return (
    <section className="w-full py-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-[color:var(--foreground)]">Product Quality Grades</h2>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {MOCK_PRODUCTS.map((item) => (
            <article
              key={item.name}
              className="group rounded-xl border border-[color:var(--supporting)] bg-[color:var(--surface)] p-4 text-center shadow-sm transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-0.5"
            >
              <h3 className="text-sm sm:text-base font-semibold text-[color:var(--foreground)]">{item.name}</h3>

              <div className="mt-3 flex items-center justify-center">
                <span
                  className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${gradeStyles[item.grade]}`}
                  aria-label={`QA Grade ${item.grade}`}
                >
                  {item.grade}
                </span>
              </div>

              <p className="mt-2 text-xs sm:text-sm text-[color:var(--muted)]">{item.note}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
