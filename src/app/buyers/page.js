export const metadata = {
  title: "Buyers | BidAgri",
  description:
    "Buy fresh, verified produce directly from farmers with transparent pricing and secure bidding.",
};

import Link from "next/link";
import BuyerRegistrationForm from "@/components/BuyerRegistrationForm";

export default function BuyersPage() {
  return (
    <section className="w-full min-h-screen bg-[color:var(--background)] pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-14">
        <header className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[color:var(--primary)]">
              Buy Direct. Save More.
            </h1>
            <p className="text-[color:var(--muted)] text-lg leading-relaxed">
              Experience a transparent and efficient agriculture marketplace where verified farmers and buyers connect directly. Source high-quality produce, negotiate real-time bids, and secure reliable deliveries — all through BidAgri.
            </p>
            <p className="text-[color:var(--muted)] leading-relaxed">
              BidAgri helps procurement teams shorten their sourcing cycle, secure fresh produce, and collaborate seamlessly with verified farmers.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/products"
                className="rounded-full bg-primary px-6 py-2.5 font-semibold text-white shadow-md shadow-primary/25 transition-colors duration-200 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-base"
              >
                Explore Products
              </Link>
              <Link
                href="/contact"
                className="rounded-full bg-accent/40 px-6 py-2.5 font-semibold text-primary ring-1 ring-accent/60 transition-colors duration-200 hover:bg-secondary hover:text-white focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-base"
              >
                Talk to Us
              </Link>
            </div>
          </div>
          <div>
            <img
              src="https://images.unsplash.com/photo-1661152732390-10cef97a1476?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Buyers and farmers trading fresh produce in a local agriculture market"
              className="w-full aspect-[4/3] rounded-2xl object-cover shadow-lg ring-1 ring-[color:var(--supporting)]/40"
              loading="eager"
              decoding="async"
            />
          </div>
        </header>

        <section>
            <h2 className="text-xl md:text-2xl font-bold text-[color:var(--foreground)] mb-4">
              Why buy on BidAgri?
            </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Transparent Pricing",
                desc: "Bid directly with farmers and see true market value.",
              },
              {
                title: "Verified Quality",
                desc: "Optional inspections and clear product details.",
              },
              {
                title: "Fresh & Direct",
                desc: "Shorter supply chain means fresher produce.",
              },
              {
                title: "Reliable Logistics",
                desc: "Partner delivery and tracking (demo).",
              },
            ].map((b, i) => (
              <div
                key={i}
                className="rounded-2xl bg-gradient-to-b from-[color:var(--surface)] to-[color:var(--surface-2)] p-5 shadow-sm ring-1 ring-[color:var(--supporting)]/40 transition"
              >
                <div className="text-[color:var(--leaf)] font-semibold tracking-tight">{b.title}</div>
                <p className="text-[color:var(--muted)] mt-1">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold text-[color:var(--foreground)] mb-4">
            How it works
          </h2>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                number: "1",
                title: "Discover",
                desc: "Search and filter produce that fits your needs.",
                href: "/products",
              },
              {
                number: "2",
                title: "Place Bid",
                desc: "Enter your price/kg and quantity — see live total.",
                href: "/products",
              },
              {
                number: "3",
                title: "Confirm",
                desc: "When accepted, finalize delivery and secure payment (demo).",
                href: "/contact",
              },
            ].map((s, i) => (
              <li key={i} className="rounded-2xl bg-gradient-to-b from-[color:var(--surface)] to-[color:var(--surface-2)] p-6 shadow-sm ring-1 ring-[color:var(--supporting)]/40 flex flex-col gap-3">
                <div className="text-[color:var(--leaf)] font-bold tracking-tight">{`${s.number}) ${s.title}`}</div>
                <p className="text-[color:var(--muted)]">{s.desc}</p>
                <Link href={s.href} className="font-semibold text-primary transition-colors hover:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-base">
                  Learn more
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl bg-white shadow-sm p-6 ring-1 ring-[color:var(--supporting)]/40">
          <h2 className="text-xl md:text-2xl font-bold text-[color:var(--foreground)]">Built for trust</h2>
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-[color:var(--muted)]">
            <li>• Secure bidding (demo) and protected data</li>
            <li>• Clear origin: city, province, and farmer profile</li>
            <li>• Quality verification options (manual/AI – coming soon)</li>
            <li>• Dispute assistance & support (demo)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold text-[color:var(--foreground)] mb-4">FAQs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                q: "Is bidding mandatory?",
                a: "No. For 'Available' items, direct purchase is possible (UI-only demo).",
              },
              {
                q: "How are payments handled?",
                a: "UI-only in this demo. Future versions will support JazzCash/Easypaisa/Cards.",
              },
              {
                q: "How is quality verified?",
                a: "Manual inspection for now; AI-based grading is planned.",
              },
              {
                q: "What are the delivery options?",
                a: "Pickup or delivery via partners (demo).",
              },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl bg-gradient-to-b from-[color:var(--surface)] to-[color:var(--surface-2)] p-5 shadow-sm ring-1 ring-[color:var(--supporting)]/40">
                <div className="font-semibold text-[color:var(--foreground)]">{f.q}</div>
                <p className="text-[color:var(--muted)] mt-1 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-12 bg-[color:var(--background)]">
          <div className="max-w-6xl mx-auto px-4 md:px-8 text-center space-y-8">
            <h3 className="text-lg md:text-xl font-semibold text-[color:var(--foreground)]">
              Trusted by leading organizations and agricultural partners
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-10 opacity-90 hover:opacity-100 transition-all duration-300">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/256px-Google_2015_logo.svg.png"
                alt="Google"
                className="h-10 w-auto object-contain"
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/256px-Amazon_logo.svg.png"
                alt="Amazon"
                className="h-10 w-auto object-contain"
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/256px-Microsoft_logo.svg.png"
                alt="Microsoft"
                className="h-10 w-auto object-contain"
              />
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png"
                alt="Facebook"
                className="h-10 w-auto object-contain"
              />
              <div className="flex h-10 w-auto items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 120" className="h-10">
                  <text x="0" y="80" fontSize="60" fontFamily="Arial, sans-serif" fill="#4CAF50" fontWeight="bold">
                    Farmers
                  </text>
                  <text x="260" y="80" fontSize="60" fontFamily="Arial, sans-serif" fill="#1976D2" fontWeight="bold">
                    Insurance
                  </text>
                  <circle cx="230" cy="45" r="10" fill="#4CAF50" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        <section className="text-center">
          <div className="inline-flex flex-col items-center gap-3 rounded-2xl bg-gradient-to-r from-[color:var(--surface-2)] to-[color:var(--surface)] px-8 py-8 ring-1 ring-[color:var(--supporting)]/40 shadow-sm">
            <h2 className="text-xl md:text-2xl font-bold text-[color:var(--foreground)]">Ready to source directly?</h2>
            <p className="text-[color:var(--muted)]">
              Explore verified listings and place bids with confidence.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/products"
                className="rounded-full bg-primary px-6 py-2.5 font-semibold text-white shadow-md shadow-primary/25 transition-colors duration-200 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-base"
              >
                Explore Products
              </Link>
              <Link
                href="/contact"
                className="rounded-full bg-accent/40 px-6 py-2.5 font-semibold text-primary ring-1 ring-accent/60 transition-colors duration-200 hover:bg-secondary hover:text-white focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-base"
              >
                Talk to Us
              </Link>
            </div>
          </div>
        </section>

        {/* Buyer Registration Form */}
        <section id="register" className="pt-2">
          <div className="max-w-3xl mx-auto text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[color:var(--primary)] tracking-tight">Buyer Registration</h2>
            <p className="text-[color:var(--muted)] mt-2">Please fill in your details and we’ll get back to you.</p>
          </div>
          <BuyerRegistrationForm />
        </section>
      </div>
    </section>
  );
}
