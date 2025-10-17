import FarmerAnimations from "@/components/FarmerAnimations";
import { FadeIn, AnimatedHeading } from "@/components/FarmerMotionWrapper";
import AnimatedTestimonial from "@/components/AnimatedTestimonial";
// import EnhancedFarmerRegistrationForm from "@/components/EnhancedFarmerRegistrationForm";
import FarmerOnboardingWizard from "@/components/FarmerOnboardingWizard";
import RedesignedFarmerForm from "@/components/RedesignedFarmerForm";
import { ShieldCheck, ShoppingBag } from "lucide-react";

export const metadata = {
  title: "Farmers | BidAgri",
  description:
    "Register as a farmer to list your produce and receive direct bids.",
};

export default function FarmersPage() {
  const successStories = [
    {
      name: "Ali Raza",
      location: "Multan, Punjab",
      image:
        "https://images.unsplash.com/photo-1647440709729-1bb1a01bf061?q=80&w=1173&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      quote:
        "BidAgri helped me sell my wheat directly to buyers at a fair price. Payments were instant and secure!",
      rating: 5,
    },
    {
      name: "Sajid Mehmood",
      location: "Okara, Punjab",
      image:
        "https://images.unsplash.com/photo-1689211035301-525b5c026306?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      quote:
        "Through BidAgri, I expanded my market reach beyond my local mandi. Highly recommended!",
      rating: 4,
    },
    {
      name: "Tariq Khan",
      location: "Hyderabad, Sindh",
      image:
        "https://images.unsplash.com/photo-1596410608550-4bf0ceb439c1?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      quote:
        "A transparent and reliable platform for farmers — it’s changed how I do business.",
      rating: 5,
    },
  ];

  return (
    <>
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-[color:var(--foreground)] mb-6">
              Empowering Farmers. Enabling Growth.
            </h1>
            <p className="text-[color:var(--muted)] mb-8 leading-relaxed">
              BidAgri helps farmers sell their produce directly to buyers — no
              middlemen, no unfair pricing. Set your own price, connect with
              verified buyers, and receive secure payments seamlessly.
            </p>
            <div className="space-x-4">
              <button className="bg-[color:var(--primary)] text-[color:var(--surface)] px-6 py-3 rounded-lg hover:bg-[color:var(--leaf)] transition focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]/50">
                Start Selling
              </button>
              <button className="border border-[color:var(--leaf)] text-[color:var(--leaf)] px-6 py-3 rounded-lg hover:bg-[color:var(--leaf)] hover:text-[color:var(--surface)] transition focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]/30">
                Learn More
              </button>
            </div>
          </div>
          <div className="flex justify-center">
            <img
              src="https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=1000&auto=format&fit=crop"
              alt="Farmer harvesting crops"
              className="rounded-2xl shadow-lg w-full max-w-md object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <FarmerAnimations>
            <AnimatedHeading
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold text-[color:var(--foreground)] mb-10"
            >
              Why Farmers Choose BidAgri
            </AnimatedHeading>
          </FarmerAnimations>
          <div className="grid md:grid-cols-3 gap-8">
            <FarmerAnimations>
              <FadeIn
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ scale: 1.07, rotate: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-gradient-to-br from-[color:var(--surface-2)] via-[color:var(--surface)] to-[color:var(--surface-2)] shadow-inner shadow-[rgba(var(--leaf-rgb),0.2)] shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <div className="mx-auto mb-4 h-20 w-20 flex items-center justify-center rounded-full bg-white shadow-lg ring-2 ring-[color:var(--accent)]">
                  <ShieldCheck className="h-10 w-10 text-[color:var(--primary)]" strokeWidth={1.8} aria-hidden />
                </div>
                <h3 className="text-xl font-semibold text-[color:var(--foreground)] mb-3">
                  Fair Pricing
                </h3>
                <p className="text-[color:var(--muted)] leading-relaxed">
                  Set your own rates and receive the true value for your hard work —
                  no middlemen, no losses.
                </p>
              </FadeIn>
            </FarmerAnimations>

            <FarmerAnimations>
              <FadeIn
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ scale: 1.07, rotate: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-gradient-to-br from-[color:var(--surface-2)] via-[color:var(--surface)] to-[color:var(--surface-2)] shadow-inner shadow-[rgba(var(--leaf-rgb),0.2)] shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <div className="mx-auto mb-4 h-20 w-20 flex items-center justify-center rounded-full bg-white shadow-lg ring-2 ring-[color:var(--accent)]">
                  <ShieldCheck className="h-10 w-10 text-[color:var(--primary)]" strokeWidth={1.8} aria-hidden />
                </div>
                <h3 className="text-xl font-semibold text-[color:var(--foreground)] mb-3">
                  Secure Payments
                </h3>
                <p className="text-[color:var(--muted)] leading-relaxed">
                  Instant and encrypted payment system to ensure safety and
                  reliability for every transaction.
                </p>
              </FadeIn>
            </FarmerAnimations>

            <FarmerAnimations>
              <FadeIn
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ scale: 1.07, rotate: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-gradient-to-br from-[color:var(--surface-2)] via-[color:var(--surface)] to-[color:var(--surface-2)] shadow-inner shadow-[rgba(var(--leaf-rgb),0.2)] shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <div className="mx-auto mb-4 h-20 w-20 flex items-center justify-center rounded-full bg-white shadow-lg ring-2 ring-[color:var(--accent)]">
                  <ShoppingBag className="h-10 w-10 text-[color:var(--primary)]" strokeWidth={1.8} aria-hidden />
                </div>
                <h3 className="text-xl font-semibold text-[color:var(--foreground)] mb-3">
                  Wider Market Reach
                </h3>
                <p className="text-[color:var(--muted)] leading-relaxed">
                  Connect with verified buyers from across Punjab — expand your
                  business with ease and trust.
                </p>
              </FadeIn>
            </FarmerAnimations>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <FarmerAnimations>
            <AnimatedHeading
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold text-[color:var(--foreground)] mb-12"
            >
              How It Works
            </AnimatedHeading>
          </FarmerAnimations>
          <div className="grid md:grid-cols-3 gap-8">
            <FarmerAnimations>
              <FadeIn
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ scale: 1.07, rotate: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-gradient-to-br from-[color:var(--surface-2)] via-[color:var(--surface)] to-[color:var(--surface-2)] shadow-inner shadow-[rgba(var(--leaf-rgb),0.2)] shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <div className="mx-auto mb-3 flex items-center justify-center h-10 w-10 rounded-full bg-[color:var(--primary)] text-[color:var(--surface)] font-bold">
                  1
                </div>
                <FadeIn
                  whileHover={{ y: -5, scale: 1.1 }}
                  className="mx-auto mb-4 h-20 w-20 flex items-center justify-center rounded-full bg-[color:var(--surface)] shadow-lg ring-2 ring-[color:var(--surface-2)]"
                >
                  <ShieldCheck className="h-10 w-10 text-[color:var(--primary)]" strokeWidth={1.8} aria-hidden />
                </FadeIn>
                <h3 className="text-xl font-semibold text-[color:var(--foreground)] mb-3">
                  Register
                </h3>
                <p className="text-[color:var(--muted)] leading-relaxed">
                  Create your free BidAgri farmer account with a few simple steps
                  and verify your profile securely.
                </p>
              </FadeIn>
            </FarmerAnimations>

            <FarmerAnimations>
              <FadeIn
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ scale: 1.07, rotate: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-gradient-to-br from-[color:var(--surface-2)] via-[color:var(--surface)] to-[color:var(--surface-2)] shadow-inner shadow-[rgba(var(--leaf-rgb),0.2)] shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <div className="mx-auto mb-3 flex items-center justify-center h-10 w-10 rounded-full bg-[color:var(--primary)] text-[color:var(--surface)] font-bold">
                  2
                </div>
                <FadeIn
                  whileHover={{ y: -5, scale: 1.1 }}
                  className="mx-auto mb-4 h-20 w-20 flex items-center justify-center rounded-full bg-[color:var(--surface)] shadow-lg ring-2 ring-[color:var(--surface-2)]"
                >
                  <ShoppingBag
                    className="h-10 w-10 text-[color:var(--leaf)] drop-shadow"
                    strokeWidth={1.8}
                    aria-hidden
                  />
                </FadeIn>
                <h3 className="text-xl font-semibold text-[color:var(--foreground)] mb-3">
                  List Your Produce
                </h3>
                <p className="text-[color:var(--muted)] leading-relaxed">
                  Upload details and images of your harvest, set your expected
                  price, and go live instantly.
                </p>
              </FadeIn>
            </FarmerAnimations>

            <FarmerAnimations>
              <FadeIn
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ scale: 1.07, rotate: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-gradient-to-br from-[color:var(--surface-2)] via-[color:var(--surface)] to-[color:var(--surface-2)] shadow-inner shadow-[rgba(var(--leaf-rgb),0.2)] shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <div className="mx-auto mb-3 flex items-center justify-center h-10 w-10 rounded-full bg-[color:var(--primary)] text-[color:var(--surface)] font-bold">
                  3
                </div>
                <FadeIn
                  whileHover={{ y: -5, scale: 1.1 }}
                  className="mx-auto mb-4 h-20 w-20 flex items-center justify-center rounded-full bg-[color:var(--surface)] shadow-lg ring-2 ring-[color:var(--surface-2)]"
                >
                  <ShoppingBag className="h-10 w-10 text-[color:var(--primary)]" strokeWidth={1.8} aria-hidden />
                </FadeIn>
                <h3 className="text-xl font-semibold text-[color:var(--foreground)] mb-3">
                  Receive Bids &amp; Get Paid
                </h3>
                <p className="text-[color:var(--muted)] leading-relaxed">
                  Get competitive bids from verified buyers, finalize deals, and
                  receive payments securely online.
                </p>
              </FadeIn>
            </FarmerAnimations>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-3xl mx-auto px-6 sm:px-8">
          <div className="mb-10 text-center">
            <AnimatedHeading
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold text-[color:var(--foreground)]"
            >
              Join BidAgri&apos;s Trusted Farmer Network
            </AnimatedHeading>
            <p className="mt-3 text-[color:var(--muted)] md:text-lg">
              Share your profile, produce, and documents in a few guided steps.
            </p>
          </div>
          {/* Switched to redesigned single-step farmer form for clarity and alignment */}
          <RedesignedFarmerForm />
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-[color:var(--foreground)] text-center mb-10">
            Farmers Success Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
            {successStories.map((story) => (
              <AnimatedTestimonial key={story.name} story={story} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
