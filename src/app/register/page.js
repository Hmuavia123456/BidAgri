"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "@/components/AuthForm";

const ROLE_OPTIONS = [
  { value: "farmer", label: "Farmer" },
  { value: "buyer", label: "Buyer" },
];

const MODE_OPTIONS = [
  { value: "signup", label: "Create account" },
  { value: "login", label: "Sign in" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState("farmer");
  const [mode, setMode] = useState("signup");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedRole = window.localStorage.getItem("bidagri:role");
    if (storedRole === "farmer" || storedRole === "buyer") {
      setRole(storedRole);
    }
  }, []);

  const pageTitle = useMemo(
    () => (mode === "signup" ? "Create your BidAgri account" : "Welcome back to BidAgri"),
    [mode]
  );

  const pageCaption = useMemo(
    () =>
      mode === "signup"
        ? "Choose your role and unlock the marketplace experience tailored for growers and procurement teams."
        : "Use the email and password you registered with to jump straight into your workspace.",
    [mode]
  );

  const handleSuccess = (payload) => {
    const resolvedRole = payload?.role && typeof payload.role === "string"
      ? payload.role
      : role;
    if (typeof window !== "undefined") {
      window.localStorage.setItem("bidagri:role", resolvedRole);
    }
    const destination = resolvedRole === "admin"
      ? "/admin/dashboard"
      : resolvedRole === "farmer"
      ? "/farmers/dashboard"
      : "/buyers/dashboard";
    router.replace(destination);
    return payload;
  };

  return (
    <section className="relative min-h-screen bg-white pb-20 pt-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[rgba(var(--leaf-rgb),0.12)] via-white to-white" />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 md:px-8">
        <header className="relative overflow-hidden rounded-[32px] border border-[rgba(var(--leaf-rgb),0.18)] bg-white/92 px-6 py-10 text-center shadow-[0_24px_48px_rgba(15,23,42,0.12)] backdrop-blur sm:px-12">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[rgba(var(--leaf-rgb),0.18)] via-transparent to-[rgba(var(--accent-rgb),0.2)] blur-[140px]" aria-hidden="true" />
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--leaf)] shadow-sm">
            Join BidAgri
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-[color:var(--foreground)] sm:text-4xl">
            {pageTitle}
          </h1>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-[color:var(--muted)] sm:text-base">
            {pageCaption}
          </p>
        </header>

        <div className="grid gap-8 rounded-[32px] border border-[rgba(var(--leaf-rgb),0.18)] bg-white/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur lg:grid-cols-[1fr_1.1fr] lg:p-10">
          <div className="space-y-8">
            <section className="rounded-[24px] border border-[rgba(var(--leaf-rgb),0.2)] bg-gradient-to-br from-white via-[rgba(var(--leaf-rgb),0.03)] to-white p-5 shadow-sm shadow-[rgba(var(--leaf-rgb),0.1)]">
              <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--muted)]">
                Choose your journey
              </h2>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                Select the role that matches how you use BidAgri. You can change this later in your profile settings.
              </p>
              <div className="mt-4 flex gap-3">
                {ROLE_OPTIONS.map((option) => {
                  const active = role === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRole(option.value)}
                      className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${
                        active
                          ? "border-[color:var(--leaf)] bg-[rgba(var(--leaf-rgb),0.12)] text-[color:var(--leaf)] shadow-[0_12px_28px_rgba(15,23,42,0.12)]"
                          : "border-[rgba(var(--leaf-rgb),0.2)] bg-white text-[color:var(--muted)] hover:border-[color:var(--leaf)]/60 hover:text-[color:var(--leaf)]"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[24px] border border-[rgba(var(--leaf-rgb),0.2)] bg-gradient-to-br from-white via-[rgba(var(--leaf-rgb),0.03)] to-white p-5 shadow-sm shadow-[rgba(var(--leaf-rgb),0.1)]">
              <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--muted)]">
                Account access
              </h2>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                Already have an account? Switch to sign in. New to the platform? Stay on create account.
              </p>
              <div className="mt-4 inline-flex rounded-full bg-[rgba(var(--leaf-rgb),0.08)] p-1">
                {MODE_OPTIONS.map((option) => {
                  const active = mode === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setMode(option.value)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] transition ${
                        active
                          ? "bg-white text-[color:var(--leaf)] shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
                          : "text-[color:var(--muted)]"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="grid gap-4 rounded-[24px] border border-[rgba(var(--leaf-rgb),0.2)] bg-gradient-to-br from-white via-[rgba(var(--leaf-rgb),0.04)] to-white p-5 shadow-sm shadow-[rgba(var(--leaf-rgb),0.12)] sm:grid-cols-2">
              <div className="rounded-2xl bg-[rgba(var(--leaf-rgb),0.06)] p-4 ring-1 ring-[rgba(var(--leaf-rgb),0.12)]">
                <p className="text-sm font-semibold text-[color:var(--foreground)]">Farmer workspace includes</p>
                <ul className="mt-2 space-y-1 text-sm text-[color:var(--muted)]">
                  <li>• Lot listing & inspection workflow</li>
                  <li>• Live bid management</li>
                  <li>• Payout tracking & logistics</li>
                </ul>
              </div>
              <div className="rounded-2xl bg-[rgba(var(--leaf-rgb),0.06)] p-4 ring-1 ring-[rgba(var(--leaf-rgb),0.12)]">
                <p className="text-sm font-semibold text-[color:var(--foreground)]">Buyer workspace includes</p>
                <ul className="mt-2 space-y-1 text-sm text-[color:var(--muted)]">
                  <li>• Watchlists & bid analytics</li>
                  <li>• Delivery pipeline & QA documents</li>
                  <li>• Supplier performance insights</li>
                </ul>
              </div>
            </section>
          </div>

          <div className="rounded-[28px] border border-[rgba(var(--leaf-rgb),0.2)] bg-white/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur">
            <AuthForm mode={mode} onSuccess={handleSuccess} selectedRole={role} />
          </div>
        </div>
      </div>
    </section>
  );
}
