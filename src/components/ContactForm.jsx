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
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setTouched({ name: true, email: true, message: true });
  };

  return (
    <form
      className="space-y-6 rounded-2xl border border-[color:var(--surface-2)] bg-white p-6 md:p-8 shadow-sm"
      onSubmit={handleSubmit}
      noValidate
    >
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-[color:var(--primary)]">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          className="mt-2 w-full rounded-lg border border-[color:var(--surface-2)] bg-white px-4 py-2 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--leaf)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]/30"
          placeholder="Jane Doe"
        />
        {touched.name && errors.name && (
          <p className="mt-2 text-xs text-[color:var(--accent)]">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[color:var(--primary)]">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
            className="mt-2 w-full rounded-lg border border-[color:var(--surface-2)] bg-white px-4 py-2 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--leaf)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]/30"
          placeholder="hello@company.com"
        />
        {touched.email && errors.email && (
          <p className="mt-2 text-xs text-[color:var(--accent)]">{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-[color:var(--primary)]">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          onBlur={handleBlur}
          rows={5}
          className="mt-2 w-full rounded-lg border border-[color:var(--surface-2)] bg-white px-4 py-2 text-sm text-[color:var(--foreground)] placeholder:text-[color:var(--muted)] focus:border-[color:var(--leaf)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]/30"
          placeholder="Share a brief overview of your inquiry..."
        />
        {touched.message && errors.message && (
          <p className="mt-2 text-xs text-[color:var(--accent)]">{errors.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="inline-flex w-full items-center justify-center rounded-lg bg-[color:var(--leaf)] px-4 py-2 text-sm font-semibold text-[color:var(--surface)] transition-colors duration-200 hover:bg-[color:var(--primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--leaf)]/50 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!isFormValid}
      >
        Send Message
      </button>
    </form>
  );
}
