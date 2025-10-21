export const metadata = {
  title: "Contact | BidAgri",
  description:
    "Reach out to the BidAgri team for partnership inquiries, support questions, or platform feedback.",
};
import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-[color:var(--foreground)]">
      <section className="pt-24 sm:pt-28 md:pt-32">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 text-center sm:px-6 sm:py-10 md:px-8 md:py-12">
          <h1 className="text-3xl font-semibold text-[color:var(--primary)] sm:text-4xl md:text-5xl">
            Contact Us
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-[color:var(--foreground)] sm:text-base">
            Let us know how we can help your team connect with growers and streamline procurement. We typically respond within two business days.
          </p>
        </div>
      </section>

      <section className="pb-16 pt-4 sm:pb-20 sm:pt-8 md:pb-24 md:pt-10">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 md:px-8">
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
