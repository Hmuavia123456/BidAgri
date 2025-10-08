import FarmerAnimations from "@/components/FarmerAnimations";
import { FadeIn, AnimatedHeading } from "@/components/FarmerMotionWrapper";
import AnimatedTestimonial from "@/components/AnimatedTestimonial";
import EnhancedFarmerRegistrationForm from "@/components/EnhancedFarmerRegistrationForm";

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
        "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=300&q=80",
      quote:
        "BidAgri helped me sell my wheat directly to buyers at a fair price. Payments were instant and secure!",
      rating: 5,
    },
    {
      name: "Sajid Mehmood",
      location: "Okara, Punjab",
      image:
        "https://images.unsplash.com/photo-1573497019419-6c39e1789a34?auto=format&fit=crop&w=300&q=80",
      quote:
        "Through BidAgri, I expanded my market reach beyond my local mandi. Highly recommended!",
      rating: 4,
    },
    {
      name: "Tariq Khan",
      location: "Hyderabad, Sindh",
      image:
        "https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?auto=format&fit=crop&w=300&q=80",
      quote:
        "A transparent and reliable platform for farmers — it’s changed how I do business.",
      rating: 5,
    },
  ];

  return (
    <>
      <section className="bg-green-50 py-20">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-6">
              Empowering Farmers. Enabling Growth.
            </h1>
            <p className="text-gray-700 mb-8 leading-relaxed">
              BidAgri helps farmers sell their produce directly to buyers — no
              middlemen, no unfair pricing. Set your own price, connect with
              verified buyers, and receive secure payments seamlessly.
            </p>
            <div className="space-x-4">
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">
                Start Selling
              </button>
              <button className="border border-green-700 text-green-700 px-6 py-3 rounded-lg hover:bg-green-600 hover:text-white transition">
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
              className="text-3xl md:text-4xl font-bold text-green-800 mb-10"
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
                className="p-8 rounded-2xl bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 shadow-inner shadow-green-200 shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <div className="mx-auto mb-4 h-20 w-20 flex items-center justify-center rounded-full bg-white shadow-lg ring-2 ring-green-200">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/684/684908.png"
                    alt="Fair Pricing"
                    className="h-10 w-10 object-contain"
                  />
                </div>
                <h3 className="text-xl font-semibold text-green-800 mb-3">
                  Fair Pricing
                </h3>
                <p className="text-gray-700 leading-relaxed">
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
                className="p-8 rounded-2xl bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 shadow-inner shadow-green-200 shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <div className="mx-auto mb-4 h-20 w-20 flex items-center justify-center rounded-full bg-white shadow-lg ring-2 ring-green-200">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/2947/2947997.png"
                    alt="Secure Payments"
                    className="h-10 w-10 object-contain"
                  />
                </div>
                <h3 className="text-xl font-semibold text-green-800 mb-3">
                  Secure Payments
                </h3>
                <p className="text-gray-700 leading-relaxed">
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
                className="p-8 rounded-2xl bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 shadow-inner shadow-green-200 shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <div className="mx-auto mb-4 h-20 w-20 flex items-center justify-center rounded-full bg-white shadow-lg ring-2 ring-green-200">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/1998/1998343.png"
                    alt="Wider Reach"
                    className="h-10 w-10 object-contain"
                  />
                </div>
                <h3 className="text-xl font-semibold text-green-800 mb-3">
                  Wider Market Reach
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Connect with verified buyers from across Punjab — expand your
                  business with ease and trust.
                </p>
              </FadeIn>
            </FarmerAnimations>
          </div>
        </div>
      </section>

      <section className="bg-green-50 py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <FarmerAnimations>
            <AnimatedHeading
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold text-green-800 mb-12"
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
                className="p-8 rounded-2xl bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 shadow-inner shadow-green-200 shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <div className="mx-auto mb-3 flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-green-600 to-emerald-500 text-white font-bold">
                  1
                </div>
                <FadeIn
                  whileHover={{ y: -5, scale: 1.1 }}
                  className="mx-auto mb-4 h-20 w-20 flex items-center justify-center rounded-full bg-white shadow-lg ring-2 ring-green-200"
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/1828/1828884.png"
                    alt="Register"
                    className="h-10 w-10 object-contain"
                  />
                </FadeIn>
                <h3 className="text-xl font-semibold text-green-800 mb-3">
                  Register
                </h3>
                <p className="text-gray-700 leading-relaxed">
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
                className="p-8 rounded-2xl bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 shadow-inner shadow-green-200 shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <div className="mx-auto mb-3 flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-green-600 to-emerald-500 text-white font-bold">
                  2
                </div>
                <FadeIn
                  whileHover={{ y: -5, scale: 1.1 }}
                  className="mx-auto mb-4 h-20 w-20 flex items-center justify-center rounded-full bg-white shadow-lg ring-2 ring-green-200"
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/1008/1008887.png"
                    alt="List Your Produce"
                    className="h-10 w-10 object-contain"
                  />
                </FadeIn>
                <h3 className="text-xl font-semibold text-green-800 mb-3">
                  List Your Produce
                </h3>
                <p className="text-gray-700 leading-relaxed">
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
                className="p-8 rounded-2xl bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 shadow-inner shadow-green-200 shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <div className="mx-auto mb-3 flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-green-600 to-emerald-500 text-white font-bold">
                  3
                </div>
                <FadeIn
                  whileHover={{ y: -5, scale: 1.1 }}
                  className="mx-auto mb-4 h-20 w-20 flex items-center justify-center rounded-full bg-white shadow-lg ring-2 ring-green-200"
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/3094/3094899.png"
                    alt="Receive Bids"
                    className="h-10 w-10 object-contain"
                  />
                </FadeIn>
                <h3 className="text-xl font-semibold text-green-800 mb-3">
                  Receive Bids &amp; Get Paid
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Get competitive bids from verified buyers, finalize deals, and
                  receive payments securely online.
                </p>
              </FadeIn>
            </FarmerAnimations>
          </div>
        </div>
      </section>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-green-400 to-transparent my-12" />

      <section className="bg-gradient-to-b from-green-50 to-emerald-100 py-20">
        <div className="max-w-3xl mx-auto px-6 sm:px-8">
          <div className="mb-10 text-center">
            <AnimatedHeading
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-4xl font-bold text-green-900"
            >
              Join BidAgri&apos;s Trusted Farmer Network
            </AnimatedHeading>
            <p className="mt-3 text-gray-600 md:text-lg">
              Share your produce details and let verified buyers reach out within minutes.
            </p>
          </div>
          <EnhancedFarmerRegistrationForm />
        </div>
      </section>

      <section className="bg-gradient-to-b from-emerald-50 via-green-50 to-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-green-800 text-center mb-10">
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
