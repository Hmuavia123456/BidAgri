"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getAllowedAdmins } from "@/lib/adminEmails";

const STATUS = {
  LOADING: "loading",
  UNAUTHENTICATED: "unauthenticated",
  FORBIDDEN: "forbidden",
  AUTHORIZED: "authorized",
};

export default function AdminGuard({ children }) {
  const allowedAdmins = useMemo(() => getAllowedAdmins(["admin@bidagri.com"]), []);
  const [status, setStatus] = useState(STATUS.LOADING);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setUserEmail("");
        setStatus(STATUS.UNAUTHENTICATED);
        return;
      }

      const email = firebaseUser.email?.toLowerCase() || "";
      setUserEmail(email);
      const allowed = allowedAdmins.includes(email) || firebaseUser?.customClaims?.role === "admin";
      setStatus(allowed ? STATUS.AUTHORIZED : STATUS.FORBIDDEN);
    });
    return () => unsubscribe();
  }, [allowedAdmins]);

  if (status === STATUS.LOADING) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center gap-3 rounded-3xl border border-[rgba(var(--leaf-rgb),0.15)] bg-white/90 p-8 text-center shadow-[0_24px_48px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--leaf)]">Admin access</p>
        <p className="text-base text-[color:var(--foreground)]/80">Checking your credentials…</p>
      </section>
    );
  }

  if (status === STATUS.UNAUTHENTICATED) {
    return (
      <section className="mx-auto my-16 max-w-2xl rounded-3xl border border-[rgba(var(--leaf-rgb),0.18)] bg-white/95 p-10 text-center shadow-[0_24px_48px_rgba(15,23,42,0.12)]">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--leaf)]">Admin access</p>
        <h1 className="mt-3 text-2xl font-bold text-[color:var(--foreground)]">Sign in to continue</h1>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          This dashboard is limited to BidAgri ops accounts. Please log in with an authorized email.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/auth/login?redirect=/admin/dashboard"
            className="inline-flex items-center rounded-full bg-[color:var(--leaf)] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-[rgba(var(--leaf-rgb),0.25)] transition hover:-translate-y-0.5"
          >
            Go to login
          </Link>
          <Link
            href="/auth/signup"
            className="inline-flex items-center rounded-full border border-[color:var(--leaf)] px-5 py-2 text-sm font-semibold text-[color:var(--leaf)] shadow-sm transition hover:bg-[rgba(var(--leaf-rgb),0.08)]"
          >
            Request access
          </Link>
        </div>
      </section>
    );
  }

  if (status === STATUS.FORBIDDEN) {
    return (
      <section className="mx-auto my-16 max-w-2xl rounded-3xl border border-rose-200 bg-white/95 p-10 text-center shadow-[0_24px_48px_rgba(244,63,94,0.16)]">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-500">Access denied</p>
        <h1 className="mt-3 text-2xl font-bold text-[color:var(--foreground)]">You need admin approval</h1>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          {userEmail
            ? `The account ${userEmail} is not on the approved admin list.`
            : "This account is not on the approved admin list."}{" "}
          Contact the BidAgri ops team to enable dashboard access.
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-flex items-center rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-rose-200 transition hover:-translate-y-0.5"
        >
          Contact support
        </Link>
      </section>
    );
  }

  return children;
}
