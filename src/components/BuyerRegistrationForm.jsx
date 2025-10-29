"use client";

import { useState } from "react";

export default function BuyerRegistrationForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    province: "",
    city: "",
    category: "",
    capacity: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState("idle");
  const [submitError, setSubmitError] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (status !== "submitting") {
      setStatus("idle");
      setSubmitError("");
    }
  };

  const validateEmail = (value) => /.+@.+\..+/.test(value);
  const validatePhone = (value) => /^[\d\s+()-]{6,}$/.test(value);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setSubmitError("Please enter your full name.");
    if (!validateEmail(form.email)) return setSubmitError("Please enter a valid email address.");
    if (!validatePhone(form.phone)) return setSubmitError("Please enter a valid contact number.");
    if (!form.province.trim() || !form.city.trim()) return setSubmitError("Please enter your province and city.");
    if (!form.category.trim()) return setSubmitError("Please select a preferred product category.");
    if (!form.capacity.trim()) return setSubmitError("Please enter your purchase capacity or volume.");

    setStatus("submitting");
    setSubmitError("");

    fetch("/api/buyers/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then(async (res) => {
        if (!res.ok) {
          const detail = await res.json().catch(() => null);
          const message = detail?.message || "Unable to submit registration. Please try again.";
          throw new Error(message);
        }
        setSubmitted(true);
        setStatus("success");
      })
      .catch((error) => {
        setStatus("error");
        setSubmitError(error?.message || "Something went wrong. Please retry.");
      });
  };

  if (submitted) {
    return (
      <div className="w-full max-w-xl mx-auto rounded-2xl bg-white p-6 shadow ring-1 ring-[color:var(--surface-2)] text-center">
        <h3 className="text-xl font-semibold text-[color:var(--primary)]">Thank you for registering as a buyer!</h3>
        <p className="mt-3 text-sm text-[color:var(--muted)]">
          We will reach out soon with next steps. You can continue browsing products meanwhile.
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <a href="/products" className="rounded-full bg-[color:var(--primary)] text-[color:var(--background)] px-5 py-2 text-sm shadow hover:bg-[color:var(--accent)] hover:text-[color:var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]">
            Explore Products
          </a>
          <a href="/" className="text-[color:var(--primary)] hover:underline text-sm">Go Home</a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto rounded-2xl bg-white p-6 shadow ring-1 ring-[color:var(--surface-2)]">
      {submitError && (
        <p className="mb-4 rounded-lg border border-[color:var(--accent)]/50 bg-[color:var(--accent)]/10 px-4 py-2 text-sm text-[color:var(--accent)]" role="alert">
          {submitError}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[color:var(--foreground)]">Full Name</label>
          <input id="name" name="name" type="text" value={form.name} onChange={onChange} required className="mt-1 w-full rounded-lg bg-white px-3 py-2 text-sm text-[color:var(--foreground)] ring-1 ring-[color:var(--supporting)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]" />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[color:var(--foreground)]">Email</label>
          <input id="email" name="email" type="email" value={form.email} onChange={onChange} required className="mt-1 w-full rounded-lg bg-white px-3 py-2 text-sm text-[color:var(--foreground)] ring-1 ring-[color:var(--supporting)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]" />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-[color:var(--foreground)]">Contact Number</label>
          <input id="phone" name="phone" type="tel" value={form.phone} onChange={onChange} required className="mt-1 w-full rounded-lg bg-white px-3 py-2 text-sm text-[color:var(--foreground)] ring-1 ring-[color:var(--supporting)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="province" className="block text-sm font-medium text-[color:var(--foreground)]">Province</label>
            <input id="province" name="province" type="text" value={form.province} onChange={onChange} required className="mt-1 w-full rounded-lg bg-white px-3 py-2 text-sm text-[color:var(--foreground)] ring-1 ring-[color:var(--supporting)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]" />
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-[color:var(--foreground)]">City</label>
            <input id="city" name="city" type="text" value={form.city} onChange={onChange} required className="mt-1 w-full rounded-lg bg-white px-3 py-2 text-sm text-[color:var(--foreground)] ring-1 ring-[color:var(--supporting)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]" />
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-[color:var(--foreground)]">Preferred Product Category</label>
          <input id="category" name="category" type="text" value={form.category} onChange={onChange} required className="mt-1 w-full rounded-lg bg-white px-3 py-2 text-sm text-[color:var(--foreground)] ring-1 ring-[color:var(--supporting)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]" />
        </div>

        <div>
          <label htmlFor="capacity" className="block text-sm font-medium text-[color:var(--foreground)]">Purchase Capacity or Volume</label>
          <input id="capacity" name="capacity" type="text" value={form.capacity} onChange={onChange} required className="mt-1 w-full rounded-lg bg-white px-3 py-2 text-sm text-[color:var(--foreground)] ring-1 ring-[color:var(--supporting)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]" />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-[color:var(--foreground)]">Additional Notes (optional)</label>
          <textarea id="notes" name="notes" value={form.notes} onChange={onChange} rows={4} className="mt-1 w-full rounded-lg bg-white px-3 py-2 text-sm text-[color:var(--foreground)] ring-1 ring-[color:var(--supporting)] placeholder:text-[color:var(--muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]" />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full rounded-full bg-[color:var(--primary)] text-[color:var(--background)] px-5 py-2.5 text-sm font-semibold shadow transition hover:bg-[color:var(--accent)] hover:text-[color:var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={status === "submitting"}
            aria-busy={status === "submitting"}
          >
            {status === "submitting" ? "Submitting…" : "Submit Registration"}
          </button>
        </div>
      </div>
    </form>
  );
}
