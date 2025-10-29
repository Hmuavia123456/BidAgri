"use client";

import { useState } from "react";

const initialForm = {
  name: "",
  email: "",
  message: "",
};

export default function ContactForm() {
  const [formData, setFormData] = useState(initialForm);
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState("idle");
  const [submitError, setSubmitError] = useState("");

  const errors = {
    name: formData.name.trim() ? "" : "Please enter your name.",
    email: /^\S+@\S+\.\S+$/.test(formData.email)
      ? ""
      : "Enter a valid email address.",
    message: formData.message.trim().length >= 10
      ? ""
      : "Message should be at least 10 characters.",
  };

  const isFormValid = Object.values(errors).every((error) => error === "");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (status !== "submitting") {
      setStatus("idle");
      setSubmitError("");
    }
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setTouched({ name: true, email: true, message: true });
    if (!isFormValid) return;

    setStatus("submitting");
    setSubmitError("");

    fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then(async (res) => {
        if (!res.ok) {
          const detail = await res.json().catch(() => null);
          const message = detail?.message || "Unable to send message. Please try again.";
          throw new Error(message);
        }
        setFormData(initialForm);
        setTouched({});
        setStatus("success");
      })
      .catch((error) => {
        setStatus("error");
        setSubmitError(error?.message || "Something went wrong. Please retry.");
      });
  };

  return (
    <form
      className="space-y-6 rounded-2xl border border-accent/40 bg-base p-6 shadow-sm md:p-8"
      onSubmit={handleSubmit}
      noValidate
    >
      {status === "success" && (
        <p className="rounded-lg border border-[color:var(--leaf)]/40 bg-[color:var(--leaf)]/10 px-4 py-2 text-sm text-[color:var(--leaf)]">
          Thanks! We received your message and will get back to you shortly.
        </p>
      )}
      {submitError && (
        <p className="rounded-lg border border-[color:var(--accent)]/50 bg-[color:var(--accent)]/10 px-4 py-2 text-sm text-[color:var(--accent)]" role="alert">
          {submitError}
        </p>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-dark">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          className="mt-2 w-full rounded-lg border border-accent/40 bg-base px-4 py-2 text-sm text-dark placeholder:text-dark/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Jane Doe"
        />
        {touched.name && errors.name && (
          <p className="mt-2 text-xs text-[color:var(--accent)]">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-dark">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          className="mt-2 w-full rounded-lg border border-accent/40 bg-base px-4 py-2 text-sm text-dark placeholder:text-dark/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="hello@company.com"
        />
        {touched.email && errors.email && (
          <p className="mt-2 text-xs text-[color:var(--accent)]">{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-dark">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          onBlur={handleBlur}
          rows={5}
          className="mt-2 w-full rounded-lg border border-accent/40 bg-base px-4 py-2 text-sm text-dark placeholder:text-dark/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Share a brief overview of your inquiry..."
        />
        {touched.message && errors.message && (
          <p className="mt-2 text-xs text-[color:var(--accent)]">{errors.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-colors duration-200 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-base disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!isFormValid || status === "submitting"}
        aria-busy={status === "submitting"}
      >
        {status === "submitting" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
