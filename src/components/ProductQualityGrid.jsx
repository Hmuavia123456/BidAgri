import React from "react";
import ImageWithFallback from "@/components/ImageWithFallback";

const gradeStyles = {
  A: "bg-[color:var(--leaf)] text-[color:var(--surface)]",
  "A-": "bg-[color:var(--leaf)]/80 text-[color:var(--surface)]",
  "B+": "bg-[color:var(--accent)] text-[color:var(--primary)]",
  B: "bg-[color:var(--accent)]/80 text-[color:var(--primary)]",
  C: "bg-[color:var(--supporting)] text-[color:var(--primary)]",
  D: "bg-[color:var(--primary)] text-[color:var(--surface)]",
};

const mockProducts = [
  { name: "Organic Wheat", grade: "A", note: "Top-grade quality", image: "https://via.placeholder.com/150" },
  { name: "Basmati Rice", grade: "A-", note: "Premium quality, slightly off-size", image: "https://via.placeholder.com/150" },
  { name: "Corn Feed", grade: "B+", note: "Good condition", image: "https://via.placeholder.com/150" },
  { name: "Sugarcane", grade: "B", note: "Average quality", image: "https://via.placeholder.com/150" },
  { name: "Cotton Bale", grade: "C", note: "Below average", image: "https://via.placeholder.com/150" },
  { name: "Lentils", grade: "D", note: "Rejected batch", image: "https://via.placeholder.com/150" },
];

const ProductQualityGrid = ({ products = mockProducts }) => {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-[color:var(--foreground)] mb-6 sm:mb-8">
        🌾 Product Quality Grades Overview
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={`${product.name}-${product.grade}`}
            className="rounded-xl overflow-hidden bg-[color:var(--surface)] shadow-lg"
          >
            <div className="relative w-full h-40 sm:h-48">
              <ImageWithFallback
                src={product.image}
                alt={`${product.name} product image`}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            </div>

            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg sm:text-xl font-semibold text-[color:var(--foreground)]">
                  {product.name}
                </h3>
                <span
                  className={`shrink-0 inline-flex items-center rounded-full px-3 py-1 text-xs sm:text-sm font-medium ${
                    gradeStyles[product.grade] || "bg-[color:var(--surface-2)] text-[color:var(--foreground)]"
                  }`}
                  aria-label={`QA Grade ${product.grade}`}
                >
                  {product.grade}
                </span>
              </div>
              <p className="mt-2 text-sm sm:text-base text-[color:var(--muted)]">
                {product.note}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductQualityGrid;
