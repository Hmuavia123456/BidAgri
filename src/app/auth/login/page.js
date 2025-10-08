export const metadata = {
  title: "Login | BidAgri",
  description:
    "Access your BidAgri account to manage bids, track orders, and coordinate with trading partners.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <section className="pt-24">
        <div className="w-full px-4 md:px-8 max-w-6xl mx-auto text-center py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#14532D]">
            Sign in to BidAgri
          </h1>
          <p className="mt-4 text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            Access your dashboard to review bids, manage listings, and stay connected with partners.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="w-full px-4 md:px-8 max-w-6xl mx-auto flex justify-center">
          <form className="w-full max-w-md space-y-6 rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#14532D]"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="mt-2 w-full rounded-lg border border-green-200 bg-white px-4 py-2 text-sm focus:border-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30"
                placeholder="you@bidagri.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#14532D]"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="mt-2 w-full rounded-lg border border-green-200 bg-white px-4 py-2 text-sm focus:border-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-lg bg-[#16A34A] px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 disabled:cursor-not-allowed disabled:bg-gray-300"
              disabled
            >
              Sign In
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
