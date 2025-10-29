"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import QABadge from "@/components/QABadge";
import DeliveryTimeline from "@/components/DeliveryTimeline";
import { auth } from "@/lib/firebase";
import { useRegisterPushToken } from "@/hooks/useRegisterPushToken";

const EMPTY_DASHBOARD = {
  metrics: [],
  watchlist: [],
  checklist: [],
  deliveryPipeline: [],
  supplierNotes: [],
  heroSubtitle: "",
  buyerName: "",
};

export default function BuyersDashboardPage() {
  const [authStatus, setAuthStatus] = useState("loading");
  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (!nextUser) {
        setAuthStatus("unauthenticated");
        setDashboard(EMPTY_DASHBOARD);
        setLoading(false);
        setFirebaseUser(null);
        return;
      }

      setAuthStatus("authenticated");
      setLoading(true);
      setError("");
      setFirebaseUser(nextUser);
      setUserInfo({
        uid: nextUser.uid,
        email: nextUser.email || "",
        displayName: nextUser.displayName || "",
      });
      try {
        const token = await nextUser.getIdToken();
        const response = await fetch(`/api/buyers/dashboard?buyerId=${nextUser.uid}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-User-Email": nextUser.email || "",
            "X-User-Uid": nextUser.uid,
          },
          cache: "no-store",
        });

        if (!response.ok) {
          const detail = await response.json().catch(() => null);
          const message = detail?.message || "Unable to load dashboard data.";
          throw new Error(message);
        }

        const json = await response.json();
        const data = json?.data;
        if (data) {
          setDashboard({
            metrics: Array.isArray(data.metrics) ? data.metrics : [],
            watchlist: Array.isArray(data.watchlist) ? data.watchlist : [],
            checklist: Array.isArray(data.checklist) ? data.checklist : [],
            deliveryPipeline: Array.isArray(data.deliveryPipeline) ? data.deliveryPipeline : [],
            supplierNotes: Array.isArray(data.supplierNotes) ? data.supplierNotes : [],
            buyerName: data.buyerName || "",
            company: data.company || "",
            heroSubtitle: data.heroSubtitle || "",
          });
        } else {
          setDashboard(EMPTY_DASHBOARD);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load dashboard data.");
        setDashboard(EMPTY_DASHBOARD);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useRegisterPushToken(firebaseUser);

  function EmptyState({ title, message, actionLabel, actionHref, variant = "primary" }) {
    const isSubtle = variant === "subtle";
    const containerClass = isSubtle
      ? "flex flex-col gap-3 rounded-2xl border border-[rgba(var(--leaf-rgb),0.2)] bg-[rgba(var(--leaf-rgb),0.08)] px-4 py-6 text-sm text-[color:var(--foreground)]"
      : "flex flex-col gap-3 rounded-[28px] border border-[rgba(var(--leaf-rgb),0.2)] bg-white/95 px-5 py-6 text-sm text-[color:var(--foreground)] shadow-[0_18px_36px_rgba(15,23,42,0.08)]";

    const pillClass = isSubtle
      ? "text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--leaf)]"
      : "inline-flex items-center gap-2 self-start rounded-full bg-[rgba(var(--leaf-rgb),0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--leaf)]";

    return (
      <div className={`mt-4 ${containerClass}`}>
        <span className={pillClass}>{title}</span>
        <p className="max-w-lg">{message}</p>
        {actionHref && actionLabel && (
          <Link
            href={actionHref}
            className={`inline-flex w-fit items-center gap-2 rounded-full ${
              isSubtle ? "bg-white px-4 py-1.5 text-xs font-semibold text-[color:var(--leaf)] shadow-sm shadow-[rgba(var(--leaf-rgb),0.18)] transition hover:text-[color:var(--secondary)]" : "bg-[color:var(--leaf)] px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-[rgba(var(--leaf-rgb),0.2)] transition hover:bg-[color:var(--secondary)]"
            }`}
          >
            {actionLabel}
          </Link>
        )}
      </div>
    );
  }

  const metrics = useMemo(() => (Array.isArray(dashboard.metrics) ? dashboard.metrics : []), [dashboard.metrics]);
  const watchlist = useMemo(() => (Array.isArray(dashboard.watchlist) ? dashboard.watchlist : []), [dashboard.watchlist]);
  const checklist = useMemo(() => (Array.isArray(dashboard.checklist) ? dashboard.checklist : []), [dashboard.checklist]);
  const deliveryPipeline = useMemo(
    () => (Array.isArray(dashboard.deliveryPipeline) ? dashboard.deliveryPipeline : []),
    [dashboard.deliveryPipeline]
  );
  const supplierNotes = useMemo(
    () => (Array.isArray(dashboard.supplierNotes) ? dashboard.supplierNotes : []),
    [dashboard.supplierNotes]
  );

  const heroSubtitle =
    dashboard.heroSubtitle ||
    (metrics.length || watchlist.length || deliveryPipeline.length
      ? "Monitor bids, deliveries, and supplier performance in real time."
      : "Add products to your watchlist and place bids to see activity here.");

  const buyerName =
    dashboard.buyerName ||
    dashboard.company ||
    userInfo?.displayName ||
    (userInfo?.email ? userInfo.email.split("@")[0] : "Buyer");

  return (
    <section className="relative min-h-screen bg-white pb-20 pt-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[rgba(var(--leaf-rgb),0.08)] via-white to-white" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 md:px-8">
        <header className="relative overflow-hidden rounded-[32px] border border-[rgba(var(--leaf-rgb),0.18)] bg-white/92 px-6 py-7 shadow-[0_24px_48px_rgba(15,23,42,0.1)] backdrop-blur">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[rgba(var(--secondary-rgb),0.18)] via-transparent to-[rgba(var(--leaf-rgb),0.12)] blur-[120px]" aria-hidden="true" />
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="w-full max-w-3xl space-y-3 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 self-center rounded-full bg-[rgba(var(--leaf-rgb),0.12)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--leaf)] lg:self-start">
                Buyer workspace
              </span>
              <h1 className="text-balance text-3xl font-bold tracking-tight text-[color:var(--foreground)] sm:text-4xl">
                Welcome back, {buyerName}
              </h1>
              <p className="mx-auto inline-flex max-w-2xl items-center gap-2 rounded-xl bg-[color:var(--leaf)] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-[rgba(var(--leaf-rgb),0.25)] sm:text-base lg:mx-0">
                {heroSubtitle}
              </p>
              {authStatus === "unauthenticated" && (
                <p className="inline-flex items-center justify-center gap-2 rounded-full bg-[rgba(var(--leaf-rgb),0.08)] px-3 py-1 text-xs font-semibold text-[color:var(--leaf)] lg:justify-start">
                  Sign in to load your live activity.
                </p>
              )}
              {error && (
                <p className="text-xs font-medium text-rose-600">
                  {error} Showing latest cached values instead.
                </p>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-3 lg:justify-end">
              <Link
                href="/buyers"
                className="inline-flex items-center justify-center rounded-full border border-[rgba(var(--leaf-rgb),0.25)] bg-white px-5 py-2 text-sm font-semibold text-[color:var(--leaf)] shadow-sm shadow-[rgba(var(--leaf-rgb),0.15)] transition-transform hover:-translate-y-0.5 hover:bg-[rgba(var(--leaf-rgb),0.12)]"
              >
                Sourcing guide
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--leaf)] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[rgba(var(--leaf-rgb),0.3)] transition-transform hover:-translate-y-0.5 hover:shadow-xl"
              >
                Explore new lots
              </Link>
            </div>
          </div>
        </header>

        {loading && (
          <div className="inline-flex w-fit items-center gap-2 self-start rounded-full bg-[rgba(var(--leaf-rgb),0.08)] px-4 py-1.5 text-xs font-semibold text-[color:var(--leaf)]">
            Loading latest activity…
          </div>
        )}

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]">
            Today&apos;s pulse
          </h2>
          {metrics.length ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="group relative overflow-hidden rounded-[28px] border border-[rgba(var(--leaf-rgb),0.2)] bg-gradient-to-br from-white via-[rgba(var(--leaf-rgb),0.04)] to-white p-5 shadow-sm shadow-[rgba(var(--leaf-rgb),0.12)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <span className="pointer-events-none absolute -right-12 -top-12 h-24 w-24 rounded-full bg-[rgba(var(--secondary-rgb),0.12)] blur-[60px]" aria-hidden="true" />
                  <span className="text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--muted)]">
                    {metric.label}
                  </span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-[color:var(--foreground)]">{metric.value ?? "—"}</span>
                    {metric.delta && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(var(--leaf-rgb),0.12)] px-3 py-1 text-xs font-medium text-[color:var(--leaf)]">
                        {metric.delta}
                      </span>
                    )}
                  </div>
                  {metric.caption && <p className="mt-3 text-sm text-[color:var(--muted)]">{metric.caption}</p>}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No activity yet"
              message="Add products to your watchlist and place bids to see live buyer metrics here."
              actionLabel="Browse marketplace →"
              actionHref="/products"
            />
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-[28px] border border-[rgba(var(--leaf-rgb),0.18)] bg-white/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Watchlist</h2>
                <Link href="/products" className="text-sm font-medium text-[color:var(--leaf)] hover:text-[color:var(--secondary)]">
                  View marketplace
                </Link>
              </div>
              {watchlist.length ? (
                <ul className="mt-4 space-y-4">
                  {watchlist.map((lot) => {
                    const key = lot.id || lot.title;
                    const statusLabel = lot.status || "Tracking";
                    const seller = lot.seller || "Seller pending";
                    const price =
                      lot.price ||
                      (typeof lot.pricePerKg === "number" ? `Rs ${lot.pricePerKg.toLocaleString()}/kg` : "Price pending");
                    const href = lot.href || (lot.productId ? `/product/${lot.productId}` : "/products");
                    return (
                      <li
                        key={key}
                        className="flex flex-col gap-2 rounded-2xl border border-[rgba(var(--leaf-rgb),0.15)] bg-gradient-to-br from-white via-[rgba(var(--leaf-rgb),0.03)] to-white p-4 shadow-sm shadow-[rgba(var(--leaf-rgb),0.1)]"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <Link
                            href={href}
                            className="text-sm font-semibold text-[color:var(--foreground)] hover:text-[color:var(--leaf)]"
                          >
                            {lot.title || "Untitled lot"}
                          </Link>
                          <span className="rounded-full bg-[rgba(var(--leaf-rgb),0.12)] px-3 py-1 text-xs font-medium text-[color:var(--leaf)]">
                            {statusLabel}
                          </span>
                        </div>
                        <p className="text-xs text-[color:var(--muted)]">Seller: {seller}</p>
                        <p className="text-xs font-semibold text-[color:var(--foreground)]">{price}</p>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <EmptyState
                  variant="subtle"
                  title="Empty watchlist"
                  message="Add products you are interested in to keep them on your radar."
                  actionLabel="Discover listings →"
                  actionHref="/products"
                />
              )}
            </div>

            <div className="overflow-hidden rounded-[28px] border border-[rgba(var(--leaf-rgb),0.18)] bg-white/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Next steps</h2>
              {checklist.length ? (
                <ul className="mt-4 space-y-4">
                  {checklist.map((item, index) => {
                    const key = item.href || item.title || "task";
                    const href = item.href || "/products";
                    return (
                      <li
                        key={`${key}-${index}`}
                        className="rounded-2xl border border-[rgba(var(--leaf-rgb),0.15)] bg-gradient-to-br from-white via-[rgba(var(--leaf-rgb),0.03)] to-white p-4 shadow-sm shadow-[rgba(var(--leaf-rgb),0.08)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                      >
                        <p className="text-sm font-semibold text-[color:var(--foreground)]">{item.title}</p>
                        <Link href={href} className="mt-2 inline-flex items-center text-sm font-semibold text-[color:var(--leaf)] hover:text-[color:var(--secondary)]">
                          View details →
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <EmptyState
                  variant="subtle"
                  title="No tasks yet"
                  message="We’ll drop reminders here whenever you have QA approvals, payments, or logistics to confirm."
                />
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="overflow-hidden rounded-[28px] border border-[rgba(var(--leaf-rgb),0.18)] bg-white/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Delivery pipeline</h2>
              {deliveryPipeline.length ? (
                <ul className="mt-4 space-y-4">
                  {deliveryPipeline.map((lot) => {
                    const key = lot.id || lot.title;
                    const steps =
                      Array.isArray(lot.steps) && lot.steps.length
                        ? lot.steps
                        : ["Ordered", "Packed", "In transit", "Delivered"];
                    const events = Array.isArray(lot.events) ? lot.events : [];
                    const activeStep = typeof lot.step === "number" ? lot.step : 0;
                    const statusLabel =
                      lot.status || steps[Math.min(activeStep, steps.length - 1)] || "In transit";
                    return (
                      <li
                        key={key}
                        className="rounded-2xl border border-[rgba(var(--leaf-rgb),0.15)] bg-gradient-to-br from-white via-[rgba(var(--leaf-rgb),0.03)] to-white p-4 shadow-sm shadow-[rgba(var(--leaf-rgb),0.08)]"
                      >
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-[color:var(--foreground)]">{lot.title || "Unnamed lot"}</p>
                            <p className="text-xs text-[color:var(--muted)]">Current status: {statusLabel}</p>
                          </div>
                          <span className="text-xs text-[color:var(--muted)]">{lot.eta || "ETA pending"}</span>
                        </div>
                        <div className="mt-3 space-y-2">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[color:var(--muted)]">
                            {steps.map((step, index) => (
                              <span
                                key={`${key}-${step}-${index}`}
                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${
                                  index <= activeStep
                                    ? "bg-[rgba(var(--leaf-rgb),0.12)] text-[color:var(--leaf)]"
                                    : "bg-[rgba(var(--leaf-rgb),0.05)] text-[color:var(--muted)]"
                                }`}
                              >
                                {index + 1}. {step}
                              </span>
                            ))}
                          </div>
                          {events.length > 0 && (
                            <details className="rounded-2xl border border-[rgba(var(--leaf-rgb),0.12)] bg-white/90 p-3 text-xs text-[color:var(--muted)] transition">
                              <summary className="cursor-pointer text-[color:var(--leaf)]">
                                View delivery timeline
                              </summary>
                              <DeliveryTimeline events={events} className="mt-3" />
                            </details>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <EmptyState
                  variant="subtle"
                  title="Logistics timeline"
                  message="Once you schedule pickups or shipments, their milestones will populate this list."
                />
              )}
            </div>

            <div className="overflow-hidden rounded-[28px] border border-[rgba(var(--leaf-rgb),0.18)] bg-white/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Supplier highlights</h2>
              {supplierNotes.length ? (
                <ul className="mt-4 space-y-4">
                  {supplierNotes.map((supplier) => {
                    const key = supplier.id || supplier.farm || supplier.note;
                    const lots = supplier.lotsWon ?? supplier.total ?? 0;
                    const rating = supplier.rating || supplier.score;
                    return (
                      <li
                        key={key}
                        className="rounded-2xl border border-[rgba(var(--leaf-rgb),0.15)] bg-gradient-to-br from-white via-[rgba(var(--leaf-rgb),0.03)] to-white p-4 shadow-sm shadow-[rgba(var(--leaf-rgb),0.08)]"
                      >
                        <div className="flex items-center justify-between text-sm font-semibold text-[color:var(--foreground)]">
                          <span>{supplier.farm || "Supplier"}</span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(var(--leaf-rgb),0.12)] px-3 py-1 text-xs font-medium text-[color:var(--leaf)]">
                            {rating ? `${rating} ★` : `${lots} lots`}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-[color:var(--muted)]">Lots won: {lots}</p>
                        <p className="mt-2 text-sm text-[color:var(--muted)]">{supplier.note || "No notes yet."}</p>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <EmptyState
                  variant="subtle"
                  title="Supplier insights"
                  message="Transact with growers to unlock repeat-rate and rating insights in this panel."
                />
              )}
            </div>
          </aside>
        </section>
      </div>
    </section>
  );

}

function EmptyState({ title, message, actionLabel, actionHref, variant = "primary" }) {
  const isSubtle = variant === "subtle";
  const containerClass = isSubtle
    ? "mt-4 flex flex-col gap-3 rounded-2xl border border-[rgba(var(--leaf-rgb),0.2)] bg-[rgba(var(--leaf-rgb),0.08)] px-4 py-6 text-sm text-[color:var(--foreground)]"
    : "mt-4 flex flex-col gap-3 rounded-[28px] border border-[rgba(var(--leaf-rgb),0.2)] bg-white/95 px-5 py-6 text-sm text-[color:var(--foreground)] shadow-[0_18px_36px_rgba(15,23,42,0.08)]";

  const pillClass = isSubtle
    ? "text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--leaf)]"
    : "inline-flex w-fit items-center gap-2 rounded-full bg-[rgba(var(--leaf-rgb),0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--leaf)]";

  return (
    <div className={containerClass}>
      <span className={pillClass}>{title}</span>
      <p className="max-w-lg">{message}</p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className={`inline-flex w-fit items-center gap-2 rounded-full ${
            isSubtle
              ? "bg-white px-4 py-1.5 text-xs font-semibold text-[color:var(--leaf)] shadow-sm shadow-[rgba(var(--leaf-rgb),0.18)] transition hover:text-[color:var(--secondary)]"
              : "bg-[color:var(--leaf)] px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-[rgba(var(--leaf-rgb),0.2)] transition hover:bg-[color:var(--secondary)]"
          }`}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
