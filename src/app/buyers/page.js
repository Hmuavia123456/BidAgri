export const metadata = {
  title: "Buyers | BidAgri",
  description:
    "Buy fresh, verified produce directly from farmers with transparent pricing and secure bidding.",
};

export default function BuyersPage() {
  return (
    <section className="w-full min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-10">
        <header className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-5">
            <h1 className="text-3xl md:text-4xl font-extrabold text-green-900">
              Buy Direct. Save More.
            </h1>
            <p className="text-gray-600 text-lg">
              Experience a transparent and efficient agriculture marketplace where verified farmers and buyers connect directly. Source high-quality produce, negotiate real-time bids, and secure reliable deliveries — all through BidAgri.
            </p>
            <p className="text-gray-600">
              BidAgri helps procurement teams shorten their sourcing cycle, secure fresh produce,
              and collaborate seamlessly with verified farmers.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/products"
                className="rounded-full bg-green-600 text-white px-6 py-2.5 hover:bg-green-700 transition shadow"
              >
                Explore Products
              </a>
              <a
                href="/contact"
                className="rounded-full bg-white text-green-700 px-6 py-2.5 ring-1 ring-green-200 hover:bg-green-50 transition"
              >
                Talk to Us
              </a>
            </div>
          </div>
          <div>
            <img
              src="https://images.unsplash.com/photo-1661152732390-10cef97a1476?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Buyers and farmers trading fresh produce in a local agriculture market"
              className="w-full aspect-[4/3] rounded-2xl object-cover shadow-lg"
              loading="eager"
              decoding="async"
            />
          </div>
        </header>

        <section>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
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
                className="rounded-2xl bg-white p-5 shadow hover:shadow-md transition"
              >
                <div className="text-green-600 font-semibold">{b.title}</div>
                <p className="text-gray-600 mt-1">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
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
              <li key={i} className="rounded-2xl bg-white p-6 shadow flex flex-col gap-3">
                <div className="text-green-700 font-bold">{`${s.number}) ${s.title}`}</div>
                <p className="text-gray-600">{s.desc}</p>
                <a href={s.href} className="text-green-700 font-semibold hover:underline">
                  Learn more
                </a>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl bg-white shadow p-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Built for trust</h2>
          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-gray-600">
            <li>• Secure bidding (demo) and protected data</li>
            <li>• Clear origin: city, province, and farmer profile</li>
            <li>• Quality verification options (manual/AI – coming soon)</li>
            <li>• Dispute assistance & support (demo)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">FAQs</h2>
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
              <div key={i} className="rounded-2xl bg-white p-5 shadow">
                <div className="font-semibold text-gray-900">{f.q}</div>
                <p className="text-gray-600 mt-1 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-12 bg-white">
          <div className="max-w-6xl mx-auto px-4 md:px-8 text-center space-y-8">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900">
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
              <div className="h-10 w-auto flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 120" className="h-10">
                  <text x="0" y="80" fontSize="60" fontFamily="Arial, sans-serif" fill="#002f6c" fontWeight="bold">
                    Farmers
                  </text>
                  <text x="260" y="80" fontSize="60" fontFamily="Arial, sans-serif" fill="#d81e05" fontWeight="bold">
                    Insurance
                  </text>
                  <circle cx="230" cy="45" r="10" fill="#002f6c" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        <section className="text-center">
          <div className="inline-flex flex-col items-center gap-3 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-8 ring-1 ring-green-100 shadow">
            <h2 className="text-xl md:text-2xl font-bold text-green-900">Ready to source directly?</h2>
            <p className="text-gray-600">
              Explore verified listings and place bids with confidence.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="/products"
                className="rounded-full bg-green-600 text-white px-6 py-2.5 hover:bg-green-700 transition shadow"
              >
                Explore Products
              </a>
              <a
                href="/contact"
                className="rounded-full bg-white text-green-700 px-6 py-2.5 ring-1 ring-green-200 hover:bg-green-50 transition"
              >
                Talk to Us
              </a>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
