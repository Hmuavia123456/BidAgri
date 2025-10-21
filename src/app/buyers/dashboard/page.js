"use client";

import Link from "next/link";
import QABadge from "@/components/QABadge";

const METRICS = [
  { label: "Active bids", value: 7, caption: "2 expiring today" },
  { label: "Lots shortlisted", value: 12, caption: "Updated 4 mins ago" },
  { label: "Average win price", value: "Rs 1,040/kg", caption: "↓ 4% vs last month" },
  { label: "Deliveries in transit", value: 3, caption: "ETA within 48hrs" },
];

const WATCHLIST = [
  { title: "Premium Wheat", seller: "Ali Raza", status: "In review", price: "Rs 920/kg" },
  { title: "Walnuts", seller: "Sajid Mehmood", status: "New bids", price: "Rs 1,280/kg" },
  { title: "Mango Sindhri", seller: "Tariq Khan", status: "Closing soon", price: "Rs 310/kg" },
];

const CHECKLIST = [
  { title: "Approve QA report for Fresh Almonds", href: "/products/almonds" },
  { title: "Schedule pickup window for Wheat", href: "/products/wheat" },
  { title: "Upload payment confirmation (Walnuts)", href: "/products/walnuts" },
];

const SUPPLIER_NOTES = [
  {
    farm: "Ali Raza Farms",
    lotsWon: 4,
    rating: "4.8",
    note: "Consistent moisture control and on-time dispatch.",
  },
  {
    farm: "Balochistan Agro",
    lotsWon: 2,
    rating: "4.5",
    note: "Recommended for nuts & dry fruits. Communicates early.",
  },
  {
    farm: "Punjab Fresh Co-op",
    lotsWon: 5,
    rating: "4.9",
    note: "Great cold-chain partnerships and QC documentation.",
  },
];

const DELIVERY_PIPELINE = [
  { title: "Fresh Almonds", step: 2, steps: ["Ordered", "Packed", "In transit", "Delivered"], eta: "ETA 24 Oct" },
  { title: "Premium Wheat", step: 1, steps: ["Ordered", "Packed", "In transit", "Delivered"], eta: "Packing 22 Oct" },
  { title: "Walnuts", step: 3, steps: ["Ordered", "Packed", "In transit", "Delivered"], eta: "Arrives 21 Oct" },
];

export default function BuyersDashboardPage() {
  return (
    <section className="relative min-h-screen bg-white pb-20 pt-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[rgba(var(--leaf-rgb),0.08)] via-white to-white" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 md:px-8">
        <header className="relative overflow-hidden rounded-[32px] border border-[rgba(var(--leaf-rgb),0.18)] bg-white/92 px-6 py-7 shadow-[0_24px_48px_rgba(15,23,42,0.1)] backdrop-blur">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[rgba(var(--secondary-rgb),0.18)] via-transparent to-[rgba(var(--leaf-rgb),0.12)] blur-[120px]" aria-hidden="true" />
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(var(--leaf-rgb),0.12)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--leaf)]">
                Buyer workspace
              </span>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-[color:var(--foreground)] sm:text-4xl">
                Welcome back, Horizon Foods
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--muted)] sm:text-base">
                Monitor bids, deliveries, and supplier performance. BidAgri keeps procurement transparent and fast.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/buyers"
                className="inline-flex items-center justify-center rounded-full border border-[rgba(var(--leaf-rgb),0.25)] bg-white px-5 py-2 text-sm font-semibold text-[color:var(--leaf)] shadow-sm shadow-[rgba(var(--leaf-rgb),0.15)] transition-transform hover:-translate-y-0.5 hover:bg-[rgba(var(--leaf-rgb),0.12)]"
              >
                Sourcing guide
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--leaf)] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[rgba(var(--leaf-rgb),0.3)] transition-transform hover:-translate-y-0.5 hover:shadow-xl"
              >
                Explore new lots
              </Link>
            </div>
          </div>
        </header>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]">
            Today&apos;s pulse
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {METRICS.map((metric) => (
              <div
                key={metric.label}
                className="group relative overflow-hidden rounded-[28px] border border-[rgba(var(--leaf-rgb),0.2)] bg-gradient-to-br from-white via-[rgba(var(--leaf-rgb),0.04)] to-white p-5 shadow-sm shadow-[rgba(var(--leaf-rgb),0.12)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="pointer-events-none absolute -right-12 -top-12 h-24 w-24 rounded-full bg-[rgba(var(--secondary-rgb),0.12)] blur-[60px]" aria-hidden="true" />
                <span className="text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--muted)]">
                  {metric.label}
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[color:var(--foreground)]">{metric.value}</span>
                </div>
                <p className="mt-3 text-sm text-[color:var(--muted)]">{metric.caption}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-[28px] border border-[rgba(var(--leaf-rgb),0.18)] bg-white/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Watchlist</h2>
                <Link href="/products" className="text-sm font-medium text-[color:var(--leaf)] hover:text-[color:var(--secondary)]">
                  View marketplace
                </Link>
              </div>
              <ul className="mt-4 space-y-4">
                {WATCHLIST.map((lot) => (
                  <li key={lot.title} className="flex flex-col gap-2 rounded-2xl border border-[rgba(var(--leaf-rgb),0.15)] bg-gradient-to-br from-white via-[rgba(var(--leaf-rgb),0.03)] to-white p-4 shadow-sm shadow-[rgba(var(--leaf-rgb),0.1)]">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[color:var(--foreground)]">{lot.title}</p>
                      <span className="rounded-full bg-[rgba(var(--leaf-rgb),0.12)] px-3 py-1 text-xs font-medium text-[color:var(--leaf)]">
                        {lot.status}
                      </span>
                    </div>
                    <p className="text-xs text-[color:var(--muted)]">Seller: {lot.seller}</p>
                    <p className="text-xs font-semibold text-[color:var(--foreground)]">{lot.price}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-[rgba(var(--leaf-rgb),0.18)] bg-white/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Next steps</h2>
              <ul className="mt-4 space-y-4">
                {CHECKLIST.map((item) => (
                  <li key={item.title} className="rounded-2xl border border-[rgba(var(--leaf-rgb),0.15)] bg-gradient-to-br from-white via-[rgba(var(--leaf-rgb),0.03)] to-white p-4 shadow-sm shadow-[rgba(var(--leaf-rgb),0.08)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                    <p className="text-sm font-semibold text-[color:var(--foreground)]">{item.title}</p>
                    <Link href={item.href} className="mt-2 inline-flex items-center text-sm font-semibold text-[color:var(--leaf)] hover:text-[color:var(--secondary)]">
                      View details →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="overflow-hidden rounded-[28px] border border-[rgba(var(--leaf-rgb),0.18)] bg-white/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Delivery pipeline</h2>
              <ul className="mt-4 space-y-4">
                {DELIVERY_PIPELINE.map((lot) => (
                  <li key={lot.title} className="rounded-2xl border border-[rgba(var(--leaf-rgb),0.15)] bg-gradient-to-br from-white via-[rgba(var(--leaf-rgb),0.03)] to-white p-4 shadow-sm shadow-[rgba(var(--leaf-rgb),0.08)]">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[color:var(--foreground)]">{lot.title}</p>
                      <span className="text-xs text-[color:var(--muted)]">{lot.eta}</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-[color:var(--muted)]">
                        {lot.steps.map((step, index) => (
                          <span
                            key={step}
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${
                              index <= lot.step ? "bg-[rgba(var(--leaf-rgb),0.12)] text-[color:var(--leaf)]" : "bg-[rgba(var(--leaf-rgb),0.05)] text-[color:var(--muted)]"
                            }`}
                          >
                            {index + 1}. {step}
                          </span>
                        ))}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-[rgba(var(--leaf-rgb),0.18)] bg-white/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Supplier highlights</h2>
              <ul className="mt-4 space-y-4">
                {SUPPLIER_NOTES.map((supplier) => (
                  <li key={supplier.farm} className="rounded-2xl border border-[rgba(var(--leaf-rgb),0.15)] bg-gradient-to-br from-white via-[rgba(var(--leaf-rgb),0.03)] to-white p-4 shadow-sm shadow-[rgba(var(--leaf-rgb),0.08)]">
                    <div className="flex items-center justify-between text-sm font-semibold text-[color:var(--foreground)]">
                      <span>{supplier.farm}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(var(--leaf-rgb),0.12)] px-3 py-1 text-xs font-medium text-[color:var(--leaf)]">
                        {supplier.rating} ★
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-[color:var(--muted)]">Lots won: {supplier.lotsWon}</p>
                    <p className="mt-2 text-sm text-[color:var(--muted)]">{supplier.note}</p>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </section>
  );

}