"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  const router = useRouter();
  const [roleFromStorage, setRoleFromStorage] = useState("farmer");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("bidagri:role");
    if (saved === "buyer" || saved === "farmer") {
      setRoleFromStorage(saved);
    }
  }, []);

  const handleSuccess = (payload) => {
    const resolvedRole = payload?.role && typeof payload.role === "string"
      ? payload.role
      : roleFromStorage;
    if (typeof window !== "undefined") {
      window.localStorage.setItem("bidagri:role", resolvedRole);
    }
    const destination = resolvedRole === "admin"
      ? "/admin/dashboard"
      : resolvedRole === "buyer"
      ? "/buyers/dashboard"
      : "/farmers/dashboard";
    router.replace(destination);
  };

  return (
    <section className="relative min-h-screen bg-white pb-20 pt-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[rgba(var(--leaf-rgb),0.12)] via-white to-white" />

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 md:px-8">
        <header className="relative overflow-hidden rounded-[32px] border border-[rgba(var(--leaf-rgb),0.18)] bg-white/92 px-6 py-10 text-center shadow-[0_24px_48px_rgba(15,23,42,0.12)] backdrop-blur sm:px-12">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[rgba(var(--leaf-rgb),0.18)] via-transparent to-[rgba(var(--accent-rgb),0.2)] blur-[140px]" aria-hidden />
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--leaf)] shadow-sm">
            Welcome back
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-[color:var(--foreground)] sm:text-4xl">
            Sign in to BidAgri
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[color:var(--muted)] sm:text-base">
            Access your farmer or buyer workspace, track bids, and stay in sync with your supply chain partners.
          </p>
        </header>

        <div className="rounded-[32px] border border-[rgba(var(--leaf-rgb),0.18)] bg-white/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur lg:px-12 lg:py-10">
          <div className="mx-auto flex max-w-3xl flex-col gap-8 lg:flex-row lg:items-start">
            <div className="flex-1 space-y-4">
              <h2 className="text-lg font-semibold text-[color:var(--foreground)]">
                Log in to continue
              </h2>
              <p className="text-sm text-[color:var(--muted)] leading-relaxed">
                We remembered your last selected role (
                <span className="font-semibold text-[color:var(--leaf)]">{roleFromStorage}</span>
                ). Once you sign in, we will take you straight to your personalised dashboard.
              </p>
              <p className="text-xs text-[color:var(--muted)]">
                Need a new account?{" "}
                <Link href="/register" className="font-semibold text-[color:var(--leaf)] underline-offset-2 transition hover:text-[color:var(--secondary)] hover:underline">
                  Create one here
                </Link>
                .
              </p>
            </div>

            <div className="flex-1">
              <AuthForm mode="login" onSuccess={handleSuccess} selectedRole={roleFromStorage} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
