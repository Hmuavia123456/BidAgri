export const metadata = {
  title: "Contact | BidAgri",
  description:
    "Reach out to the BidAgri team for partnership inquiries, support questions, or platform feedback.",
};
import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-[color:var(--foreground)]">
      <section className="pt-24">
        <div className="w-full px-4 md:px-8 max-w-6xl mx-auto text-center py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-semibold text-[color:var(--primary)]">
            Contact Us
          </h1>
          <p className="mt-4 text-sm md:text-base text-[color:var(--foreground)] max-w-2xl mx-auto">
            Let us know how we can help your team connect with growers and streamline procurement. We typically respond within two business days.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="w-full px-4 md:px-8 max-w-6xl mx-auto">
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
