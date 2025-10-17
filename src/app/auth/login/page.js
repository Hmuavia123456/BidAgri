"use client";

import { useState } from "react";
import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white text-[color:var(--foreground)]">
      <section className="pt-24">
        <div className="w-full px-4 md:px-8 max-w-6xl mx-auto text-center py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-semibold text-[color:var(--primary)]">
            Sign in to BidAgri
          </h1>
          <p className="mt-4 text-sm md:text-base text-[color:var(--foreground)] max-w-2xl mx-auto">
            Access your dashboard to review bids, manage listings, and stay connected with partners.
          </p>
        </div>
      </section>

      <LoginClient />
    </div>
  );
}

function LoginClient() {
  return (
    <section className="py-12 md:py-16">
      <div className="w-full px-4 md:px-8 max-w-6xl mx-auto flex justify-center">
        <AuthFlow mode="login" />
      </div>
    </section>
  );
}

function AuthFlow({ mode }) {
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);
  return success ? (
    <div className="w-full max-w-md space-y-6 rounded-2xl border border-[color:var(--surface-2)] bg-[color:var(--surface)] p-6 shadow-sm text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--surface-2)] text-[color:var(--leaf)]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-[color:var(--primary)]">Signed in successfully</h2>
      <p className="text-sm text-[color:var(--foreground)]">Welcome back{user?.name ? `, ${user.name}` : ""}! You can now continue.</p>
      <div className="flex justify-center gap-3">
        <a href="/products" className="rounded-full bg-[color:var(--leaf)] text-[color:var(--surface)] px-6 py-2.5 hover:bg-[color:var(--primary)] transition shadow">Explore Products</a>
        <a href="/" className="text-[color:var(--leaf)] hover:underline">Go Home</a>
      </div>
    </div>
  ) : (
    <AuthForm mode={mode} onSuccess={(u) => { setUser(u); setSuccess(true); }} />
  );
}
