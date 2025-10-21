"use client";

import Link from "next/link";
import QABadge from "@/components/QABadge";

const METRICS = [
  { label: "Active listings", value: 6, delta: "+2 new this week" },
  { label: "Bids awaiting action", value: 9, delta: "3 closing today" },
  { label: "Average bid price", value: "Rs 1,120", delta: "↑ 7% vs last lot" },
  { label: "Payouts in progress", value: "Rs 540K", delta: "2 disbursements scheduled" },
];

const UPCOMING_LOGISTICS = [
  {
    id: "shp-01",
    lot: "Premium Wheat",
    window: "Pickup • 22 Oct",
    status: "Driver assigned",
  },
  {
    id: "shp-02",
    lot: "Walnuts",
    window: "Delivery • 24 Oct",
    status: "Awaiting QA release",
  },
  {
    id: "shp-03",
    lot: "Basmati Rice",
    window: "Pickup • 25 Oct",
    status: "Documents uploaded",
  },
];

const CHECKLIST = [
  {
    title: "Upload new inspection photos",
    body: "Fresh Almonds lot can move to verified status after media update.",
    action: "Upload now",
    href: "/farmers#inspections",
  },
  {
    title: "Confirm transport partner",
    body: "Confirm carrier for Mango Sindhri to lock in shipment window.",
    action: "View options",
    href: "/contact",
  },
  {
    title: "Respond to buyer question",
    body: "Buyer #112 asked about moisture levels on Premium Wheat.",
    action: "Open conversation",
    href: "/products",
  },
];

const LISTING_PROGRESS = [
  { title: "Fresh Almonds", percent: 82, qa: "A", bids: 5 },
  { title: "Premium Wheat", percent: 64, qa: "A-", bids: 3 },
  { title: "Walnuts", percent: 48, qa: "B+", bids: 2 },
];

export default function FarmersDashboardPage() {
  return (
    <section className="relative min-h-screen bg-white pb-20 pt-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[rgba(var(--leaf-rgb),0.08)] via-white to-white" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 md:px-8">
        <header className="relative overflow-hidden rounded-[32px] border border-[rgba(var(--leaf-rgb),0.2)] bg-white/92 px-6 py-7 shadow-[0_24px_48px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[rgba(var(--leaf-rgb),0.15)] via-transparent to-[rgba(var(--accent-rgb),0.18)] blur-[120px]" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-24 top-[-120px] h-60 w-60 rounded-full bg-[rgba(var(--secondary-rgb),0.25)] blur-[120px]" aria-hidden="true" />
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/65 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--leaf)] shadow-sm shadow-[rgba(var(--leaf-rgb),0.25)]">
                Farmer workspace
              </span>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-[color:var(--foreground)] drop-shadow-[0_10px_25px_rgba(0,0,0,0.08)] sm:text-4xl">
                Good morning, Ali Raza
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--muted)] sm:text-base">
                Track bids, inspections, and logistics in one view. Keep your lots in the spotlight and accelerate payouts.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/farmers"
                className="inline-flex items-center justify-center rounded-full border border-[rgba(var(--leaf-rgb),0.25)] bg-white/90 px-5 py-2 text-sm font-semibold text-[color:var(--leaf)] shadow-md shadow-[rgba(var(--leaf-rgb),0.2)] transition-transform hover:-translate-y-0.5 hover:bg-[color:var(--leaf)] hover:text-white"
              >
                View profile
              </Link>
              <Link
                href="/register/farmer"
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--leaf)] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[rgba(var(--leaf-rgb),0.3)] transition-transform hover:-translate-y-0.5 hover:shadow-xl"
              >
                Create new listing
              </Link>
            </div>
          </div>
        </header>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]">
            This week&apos;s pulse
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {METRICS.map((metric) => (
              <div
                key={metric.label}
                className="group relative overflow-hidden rounded-[28px] border border-[rgba(var(--leaf-rgb),0.2)] bg-gradient-to-br from-white via-[rgba(var(--leaf-rgb),0.03)] to-white p-5 shadow-sm shadow-[rgba(var(--leaf-rgb),0.12)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="pointer-events-none absolute -right-12 -top-12 h-24 w-24 rounded-full bg-[rgba(var(--leaf-rgb),0.12)] blur-[60px]" aria-hidden="true" />
                <span className="text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--muted)]">
                  {metric.label}
                </span>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-3xl font-bold text-[color:var(--foreground)]">{metric.value}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(var(--leaf-rgb),0.12)] px-3 py-1 text-xs font-medium text-[color:var(--leaf)]">
                    Live
                  </span>
                </div>
                <p className="mt-3 text-sm text-[color:var(--muted)]">{metric.delta}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-[28px] border border-[rgba(var(--leaf-rgb),0.18)] bg-white/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Listing health</h2>
                <Link href="/products" className="text-sm font-medium text-[color:var(--leaf)] hover:text-[color:var(--secondary)]">
                  View marketplace
                </Link>
              </div>
              <ul className="mt-5 space-y-4">
                {LISTING_PROGRESS.map((lot) => (
                  <li key={lot.title} className="overflow-hidden rounded-2xl border border-[rgba(var(--leaf-rgb),0.15)] bg-gradient-to-br from-white via-[rgba(var(--leaf-rgb),0.04)] to-white p-4 shadow-sm shadow-[rgba(var(--leaf-rgb),0.12)]">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[color:var(--foreground)]">{lot.title}</p>
                      <QABadge grade={lot.qa} />
                    </div>
                    <div className="relative mt-3 h-2 w-full overflow-hidden rounded-full bg-white">
                      <span
                        className="block h-2 rounded-full bg-[color:var(--leaf)]"
                        style={{ width: `${lot.percent}%` }}
                        aria-hidden
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-[color:var(--muted)]">
                      <span>{lot.percent}% journey complete</span>
                      <span>{lot.bids} active bids</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-[rgba(var(--leaf-rgb),0.18)] bg-white/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Action checklist</h2>
              <ul className="mt-4 space-y-4">
                {CHECKLIST.map((item) => (
                  <li key={item.title} className="group overflow-hidden rounded-2xl border border-[rgba(var(--leaf-rgb),0.15)] bg-gradient-to-br from-white via-[rgba(var(--leaf-rgb),0.04)] to-white p-4 shadow-sm shadow-[rgba(var(--leaf-rgb),0.1)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                    <p className="text-sm font-semibold text-[color:var(--foreground)]">{item.title}</p>
                    <p className="mt-2 text-sm text-[color:var(--muted)]">{item.body}</p>
                    <Link href={item.href} className="mt-3 inline-flex items-center text-sm font-semibold text-[color:var(--leaf)] transition-colors group-hover:text-[color:var(--secondary)]">
                      {item.action} →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[28px] border border-[rgba(var(--leaf-rgb),0.18)] bg-white/95 p-6 shadow-sm shadow-[rgba(var(--leaf-rgb),0.08)]">
              <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Upcoming logistics</h2>
              <ul className="mt-4 space-y-4">
                {UPCOMING_LOGISTICS.map((shipment) => (
                  <li key={shipment.id} className="rounded-2xl border border-[rgba(var(--leaf-rgb),0.15)] bg-gradient-to-br from-white via-[rgba(var(--leaf-rgb),0.03)] to-white p-4 shadow-[0_12px_24px_rgba(15,23,42,0.08)]">
                    <p className="text-sm font-semibold text-[color:var(--foreground)]">{shipment.lot}</p>
                    <p className="text-xs text-[color:var(--muted)]">{shipment.window}</p>
                    <p className="mt-2 inline-flex rounded-full bg-[rgba(var(--leaf-rgb),0.12)] px-3 py-1 text-xs font-medium text-[color:var(--leaf)]">
                      {shipment.status}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-[rgba(var(--leaf-rgb),0.18)] bg-white/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Performance snapshot</h2>
              <div className="mt-4 space-y-4 text-sm text-[color:var(--muted)]">
                <div>
                  <p className="flex items-center justify-between font-semibold text-[color:var(--foreground)]">
                    Bid acceptance rate
                    <span>74%</span>
                  </p>
                  <div className="mt-2 h-1.5 rounded-full bg-[rgba(var(--leaf-rgb),0.12)]">
                    <span className="block h-1.5 rounded-full bg-[color:var(--leaf)]" style={{ width: "74%" }} aria-hidden />
                  </div>
                </div>
                <div>
                  <p className="flex items-center justify-between font-semibold text-[color:var(--foreground)]">
                    On-time deliveries
                    <span>92%</span>
                  </p>
                  <div className="mt-2 h-1.5 rounded-full bg-[rgba(var(--leaf-rgb),0.12)]">
                    <span className="block h-1.5 rounded-full bg-[color:var(--leaf)]" style={{ width: "92%" }} aria-hidden />
                  </div>
                </div>
                <div>
                  <p className="flex items-center justify-between font-semibold text-[color:var(--foreground)]">
                    Buyer repeat rate
                    <span>43%</span>
                  </p>
                  <div className="mt-2 h-1.5 rounded-full bg-[rgba(var(--leaf-rgb),0.12)]">
                    <span className="block h-1.5 rounded-full bg-[color:var(--leaf)]" style={{ width: "43%" }} aria-hidden />
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs text-[color:var(--muted)]">
                Tip: lots with verified QA and logistics get 2.1x more invites from high trust buyers.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </section>
  );
}
