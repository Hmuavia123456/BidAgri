"use client";

import Link from "next/link";

const STEPS = [
  {
    title: "List Your Produce",
    description:
      "Create transparent listings with photos, quality grades, and reserve prices so buyers know exactly what they are bidding on.",
  },
  {
    title: "Review Live Bids",
    description:
      "Stay informed with real-time notifications, analytics, and offer comparisons that highlight the best deal for every lot.",
  },
  {
    title: "Coordinate Delivery",
    description:
      "Book inspections, sync with logistics partners, and capture digital proof-of-delivery documentation right inside BidAgri.",
  },
  {
    title: "Settle Confidently",
    description:
      "Funds land in your account within 48 hours—complete with detailed records for compliance, auditing, and future planning.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
      <section className="pt-[108px] sm:pt-32 md:pt-36">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 text-center sm:px-6 sm:py-12 md:px-8 md:py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(var(--leaf-rgb),0.2)] bg-[rgba(var(--leaf-rgb),0.08)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--leaf)] sm:text-[13px]">
            Trusted by growers & buyers
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-[color:var(--foreground)] sm:text-4xl md:text-5xl">
            How BidAgri Works
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-[color:var(--muted)] sm:text-base">
            BidAgri connects producers and buyers through an honest, data-driven auction experience. Here’s what the journey looks like from first listing to final payout.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/buyers#register"
              className="inline-flex min-w-[10rem] items-center justify-center rounded-full bg-[color:var(--leaf)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(var(--leaf-rgb),0.25)] transition-all duration-300 hover:scale-[1.02] hover:bg-[color:var(--secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--leaf)] focus-visible:ring-offset-2 focus-visible:ring-offset-white md:text-base"
            >
              Start in minutes
            </Link>
            <Link
              href="#steps"
              className="inline-flex min-w-[10rem] items-center justify-center rounded-full border border-[color:var(--leaf)] bg-white px-6 py-3 text-sm font-semibold text-[color:var(--leaf)] shadow-md shadow-[rgba(var(--leaf-rgb),0.18)] transition-all duration-300 hover:bg-[rgba(var(--leaf-rgb),0.08)] hover:text-[color:var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--leaf)] focus-visible:ring-offset-2 focus-visible:ring-offset-white md:text-base"
            >
              View the steps
            </Link>
          </div>
        </div>
      </section>

      <section id="steps" className="relative isolate px-4 pb-20 sm:px-6 md:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[rgba(var(--leaf-rgb),0.08)] via-transparent to-[rgba(var(--accent-rgb),0.12)]" aria-hidden="true" />
        <div className="mx-auto grid w-full max-w-6xl gap-6 md:grid-cols-2">
          {STEPS.map(({ title, description }, index) => (
            <article
              key={title}
              className="group relative flex flex-col gap-4 overflow-hidden rounded-3xl border border-[rgba(var(--leaf-rgb),0.15)] bg-white/95 p-6 shadow-lg shadow-[rgba(var(--leaf-rgb),0.12)] transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-xl sm:p-7"
            >
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white via-transparent to-[rgba(var(--leaf-rgb),0.08)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(var(--leaf-rgb),0.12)] text-lg font-semibold text-[color:var(--leaf)]">
                {index + 1}
              </span>
              <h2 className="text-xl font-semibold text-[color:var(--foreground)]">{title}</h2>
              <p className="text-sm leading-relaxed text-[color:var(--muted)]">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 md:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 rounded-3xl border border-[rgba(var(--leaf-rgb),0.12)] bg-white/90 px-6 py-6 text-center shadow-lg shadow-[rgba(var(--leaf-rgb),0.1)] backdrop-blur sm:flex-row sm:items-center sm:text-left sm:px-10 sm:py-8">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-[color:var(--foreground)] sm:text-3xl">
              Ready to see the marketplace in action?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)] sm:text-base">
              Book a guided walkthrough with our onboarding team and get paired with buyers or growers that fit your goals.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex min-w-[10rem] items-center justify-center rounded-full bg-[color:var(--leaf)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(var(--leaf-rgb),0.25)] transition-all duration-300 hover:scale-[1.02] hover:bg-[color:var(--secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--leaf)] focus-visible:ring-offset-2 focus-visible:ring-offset-white md:text-base"
          >
            Talk to our team
          </Link>
        </div>
      </section>
    </div>
  );
}
