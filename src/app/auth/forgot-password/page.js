"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
      <section className="pt-24">
        <div className="w-full px-4 md:px-8 max-w-6xl mx-auto text-center py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-semibold text-[color:var(--primary)]">Forgot your password?</h1>
          <p className="mt-4 text-sm md:text-base text-[color:var(--muted)] max-w-2xl mx-auto">
            Enter your email and we will send a reset link. For this demo, you will see a confirmation screen.
          </p>
        </div>
      </section>

      <ForgotClient />
    </div>
  );
}

function ForgotClient() {
  return (
    <section className="py-12 md:py-16">
      <div className="w-full px-4 md:px-8 max-w-6xl mx-auto flex justify-center">
        <ForgotFlow />
      </div>
    </section>
  );
}

function ForgotFlow() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [success, setSuccess] = useState(false);

  const valid = /^\S+@\S+\.\S+$/.test(email);

  return success ? (
    <div className="w-full max-w-md space-y-6 rounded-2xl border border-accent/40 bg-base p-6 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/40 text-primary">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-[color:var(--primary)]">Reset link sent</h2>
      <p className="text-sm text-[color:var(--muted)]">Check your inbox for a link to reset your password.</p>
      <div className="flex justify-center gap-3">
        <Link href="/auth/login" className="rounded-full bg-primary px-6 py-2.5 font-semibold text-white shadow-md shadow-primary/25 transition-colors duration-200 hover:bg-secondary">
          Back to Login
        </Link>
        <Link href="/" className="font-medium text-primary transition-colors hover:text-secondary">
          Go Home
        </Link>
      </div>
    </div>
  ) : (
    <form
      onSubmit={(e) => { e.preventDefault(); if (valid) setSuccess(true); else setTouched(true); }}
      noValidate
      className="w-full max-w-md space-y-6 rounded-2xl border border-[color:var(--supporting)] bg-[color:var(--surface)] p-6 shadow-sm"
    >
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-dark">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
          aria-describedby="forgot-email-error"
          className="mt-2 w-full rounded-lg border border-accent/40 bg-base px-4 py-2 text-sm text-dark placeholder:text-dark/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="you@bidagri.com"
        />
        {touched && !valid && (
          <p id="forgot-email-error" role="alert" className="mt-2 text-xs text-[color:var(--accent)]">Enter a valid email.</p>
        )}
      </div>
      <button
        type="submit"
        disabled={!valid}
        className="inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-colors duration-200 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-base disabled:cursor-not-allowed disabled:opacity-60"
      >
        Send reset link
      </button>
    </form>
  );
}
 
