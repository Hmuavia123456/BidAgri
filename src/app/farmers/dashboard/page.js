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
  listingProgress: [],
  checklist: [],
  logistics: [],
  performance: {
    bidAcceptance: null,
    onTimeDeliveries: null,
    repeatRate: null,
    tip: "",
  },
  farmerName: "",
  farmName: "",
  heroSubtitle: "",
};

export default function FarmersDashboardPage() {
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
      setUserInfo({
        uid: nextUser.uid,
        email: nextUser.email || "",
        displayName: nextUser.displayName || "",
      });
      setFirebaseUser(nextUser);

      try {
        const token = await nextUser.getIdToken();
        const response = await fetch(`/api/farmers/dashboard?farmerId=${nextUser.uid}`, {
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
            listingProgress: Array.isArray(data.listingProgress) ? data.listingProgress : [],
            checklist: Array.isArray(data.checklist) ? data.checklist : [],
            logistics: Array.isArray(data.logistics) ? data.logistics : [],
            performance: {
              bidAcceptance: data.performance?.bidAcceptance ?? null,
              onTimeDeliveries: data.performance?.onTimeDeliveries ?? null,
              repeatRate: data.performance?.repeatRate ?? null,
              tip: data.performance?.tip || "",
            },
            farmerName: data.farmerName || "",
            farmName: data.farmName || "",
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

  const metrics = useMemo(() => (Array.isArray(dashboard.metrics) ? dashboard.metrics : []), [dashboard.metrics]);
  const listingProgress = useMemo(
    () => (Array.isArray(dashboard.listingProgress) ? dashboard.listingProgress : []),
    [dashboard.listingProgress]
  );
  const checklist = useMemo(() => (Array.isArray(dashboard.checklist) ? dashboard.checklist : []), [dashboard.checklist]);
  const logistics = useMemo(() => (Array.isArray(dashboard.logistics) ? dashboard.logistics : []), [dashboard.logistics]);
  const performance = dashboard.performance || {};

  const heroSubtitle =
    dashboard.heroSubtitle ||
    (metrics.length || listingProgress.length
      ? "Monitor bids, inspections, and payouts in real time."
      : "Publish a listing or accept bids to see live updates here.");

  const farmerName =
    dashboard.farmerName ||
    userInfo?.displayName ||
    (userInfo?.email ? userInfo.email.split("@")[0] : "Farmer");

  const farmName = dashboard.farmName || "";

  return (
    <section className="relative min-h-screen bg-[color:var(--background)] pb-20 pt-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[rgba(var(--leaf-rgb),0.08)] via-[color:var(--background)] to-[color:var(--background)]" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 md:px-8">
        <header className="relative overflow-hidden rounded-[32px] border border-[rgba(var(--leaf-rgb),0.2)] bg-white/92 px-6 py-7 shadow-[0_24px_48px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[rgba(var(--leaf-rgb),0.15)] via-transparent to-[rgba(var(--accent-rgb),0.18)] blur-[120px]" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-24 top-[-120px] h-60 w-60 rounded-full bg-[rgba(var(--secondary-rgb),0.25)] blur-[120px]" aria-hidden="true" />
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="w-full max-w-3xl space-y-3 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 self-center rounded-full bg-white/65 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--leaf)] shadow-sm shadow-[rgba(var(--leaf-rgb),0.25)] lg:self-start">
                Farmer workspace
              </span>
              <h1 className="text-balance text-3xl font-bold tracking-tight text-[color:var(--foreground)] drop-shadow-[0_10px_25px_rgba(0,0,0,0.08)] sm:text-4xl">
                Welcome back, {farmerName}
              </h1>
              <p className="mx-auto inline-flex max-w-2xl items-center gap-2 rounded-xl bg-[color:var(--leaf)] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-[rgba(var(--leaf-rgb),0.25)] sm:text-base lg:mx-0">
                {heroSubtitle}
              </p>
              {farmName && (
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--leaf)]">
                  {farmName}
                </p>
              )}
              {authStatus === "unauthenticated" && (
                <p className="inline-flex items-center justify-center gap-2 rounded-full bg-[rgba(var(--leaf-rgb),0.08)] px-3 py-1 text-xs font-semibold text-[color:var(--leaf)] lg:justify-start">
                  Sign in to load your farmer activity.
                </p>
              )}
              {error && (
                <p className="text-xs font-medium text-rose-600">
                  {error} Showing the latest saved values we could find.
                </p>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-3 lg:justify-end">
              <Link
                href="/farmers"
                className="inline-flex items-center justify-center rounded-full border border-[rgba(var(--leaf-rgb),0.25)] bg-white/90 px-5 py-2 text-sm font-semibold text-[color:var(--leaf)] shadow-md shadow-[rgba(var(--leaf-rgb),0.2)] transition-transform hover:-translate-y-0.5 hover:bg-[color:var(--leaf)] hover:text-white"
              >
                View profile
              </Link>
              <Link
                href="/register/farmer"
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--leaf)] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[rgba(var(--leaf-rgb),0.3)] transition-transform hover:-translate-y-0.5 hover:shadow-xl"
              >
                Create new listing
              </Link>
            </div>
          </div>
        </header>

        {loading && (
          <div className="flex items-center gap-2 text-xs text-[color:var(--muted)]">
            Loading latest activity…
          </div>
        )}

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]">
            This week&apos;s pulse
          </h2>
          {metrics.length ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="group relative overflow-hidden rounded-[28px] border border-[rgba(var(--leaf-rgb),0.2)] bg-gradient-to-br from-white via-[rgba(var(--leaf-rgb),0.03)] to-white p-5 shadow-sm shadow-[rgba(var(--leaf-rgb),0.12)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <span className="pointer-events-none absolute -right-12 -top-12 h-24 w-24 rounded-full bg-[rgba(var(--leaf-rgb),0.12)] blur-[60px]" aria-hidden="true" />
                  <span className="text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--muted)]">
                    {metric.label}
                  </span>
                  <div className="mt-2 flex items-center gap-3">
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
              title="Metrics will appear here"
              message="Publish a listing or receive bids to unlock your weekly performance stats."
              actionLabel="Create a listing →"
              actionHref="/register/farmer"
            />
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-[28px] border border-[rgba(var(--leaf-rgb),0.18)] bg-white/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Listing health</h2>
                <Link href="/products" className="text-sm font-medium text-[color:var(--leaf)] hover:text-[color:var(--secondary)]">
                  View marketplace
                </Link>
              </div>
              {listingProgress.length ? (
                <ul className="mt-5 space-y-4">
                  {listingProgress.map((lot) => {
                    const pct = Number(lot.percent ?? 0);
                    return (
                      <li key={lot.id || lot.title} className="overflow-hidden rounded-2xl border border-[rgba(var(--leaf-rgb),0.15)] bg-gradient-to-br from-white via-[rgba(var(--leaf-rgb),0.04)] to-white p-4 shadow-sm shadow-[rgba(var(--leaf-rgb),0.12)]">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-[color:var(--foreground)]">{lot.title || "Untitled lot"}</p>
                          {lot.qa && <QABadge grade={lot.qa} />}
                        </div>
                        <div className="relative mt-3 h-2 w-full overflow-hidden rounded-full bg-white">
                          <span
                            className="block h-2 rounded-full bg-[color:var(--leaf)]"
                            style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }}
                            aria-hidden
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-[color:var(--muted)]">
                          <span>{Math.round(Math.min(Math.max(pct, 0), 100))}% journey complete</span>
                          <span>{lot.bids ?? 0} active bids</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <EmptyState
                  variant="subtle"
                  title="No live listings yet"
                  message="Publish a lot to monitor QA, bids, and progress right here."
                  actionLabel="Start listing →"
                  actionHref="/register/farmer"
                />
              )}
            </div>

            <div className="overflow-hidden rounded-[28px] border border-[rgba(var(--leaf-rgb),0.18)] bg-white/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Action checklist</h2>
              {checklist.length ? (
                <ul className="mt-4 space-y-4">
                  {checklist.map((item) => (
                    <li key={item.id || item.title} className="group overflow-hidden rounded-2xl border border-[rgba(var(--leaf-rgb),0.15)] bg-gradient-to-br from-white via-[rgba(var(--leaf-rgb),0.04)] to-white p-4 shadow-sm shadow-[rgba(var(--leaf-rgb),0.1)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                      <p className="text-sm font-semibold text-[color:var(--foreground)]">{item.title}</p>
                      {item.body && <p className="mt-2 text-sm text-[color:var(--muted)]">{item.body}</p>}
                      {item.href && (
                        <Link href={item.href} className="mt-3 inline-flex items-center text-sm font-semibold text-[color:var(--leaf)] transition-colors group-hover:text-[color:var(--secondary)]">
                          {item.action || "View details"} →
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  variant="subtle"
                  title="No tasks yet"
                  message="Jaise hi BidAgri ko aap se QA approvals, paperwork, ya payments chahiye honge, woh yahan appear honge."
                />
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[28px] border border-[rgba(var(--leaf-rgb),0.18)] bg-white/95 p-6 shadow-sm shadow-[rgba(var(--leaf-rgb),0.08)]">
              <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Upcoming logistics</h2>
              {logistics.length ? (
                <ul className="mt-4 space-y-4">
                  {logistics.map((shipment) => (
                    <li key={shipment.id || shipment.lot} className="rounded-2xl border border-[rgba(var(--leaf-rgb),0.15)] bg-gradient-to-br from-white via-[rgba(var(--leaf-rgb),0.03)] to-white p-4 shadow-[0_12px_24px_rgba(15,23,42,0.08)]">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-semibold text-[color:var(--foreground)]">{shipment.lot || "Unnamed lot"}</p>
                        {shipment.window && <p className="text-xs text-[color:var(--muted)]">{shipment.window}</p>}
                        <p className="inline-flex w-fit rounded-full bg-[rgba(var(--leaf-rgb),0.12)] px-3 py-1 text-xs font-medium text-[color:var(--leaf)]">
                          {shipment.status || "Scheduled"}
                        </p>
                        <span className="text-xs text-[color:var(--muted)]">{shipment.eta || "ETA pending"}</span>
                      </div>
                      {Array.isArray(shipment.events) && shipment.events.length > 0 && (
                        <details className="mt-3 rounded-2xl border border-[rgba(var(--leaf-rgb),0.12)] bg-white/90 p-3 text-xs text-[color:var(--muted)] transition">
                          <summary className="cursor-pointer text-[color:var(--leaf)]">View delivery timeline</summary>
                          <DeliveryTimeline events={shipment.events} className="mt-3" />
                        </details>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  variant="subtle"
                  title="Logistics timeline"
                  message="Jaise hi pickups ya deliveries book karte ho, unka status isi panel me update hota rahega."
                />
              )}
            </div>

            <div className="overflow-hidden rounded-[28px] border border-[rgba(var(--leaf-rgb),0.18)] bg-white/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Performance snapshot</h2>
              {(performance.bidAcceptance ?? performance.onTimeDeliveries ?? performance.repeatRate) != null ? (
                <>
                  <div className="mt-4 space-y-4 text-sm text-[color:var(--muted)]">
                    <PerformanceRow label="Bid acceptance rate" value={performance.bidAcceptance} />
                    <PerformanceRow label="On-time deliveries" value={performance.onTimeDeliveries} />
                    <PerformanceRow label="Buyer repeat rate" value={performance.repeatRate} />
                  </div>
                  <p className="mt-4 text-xs text-[color:var(--muted)]">
                    {performance.tip ||
                      "Tip: lots with verified QA and organised logistics get significantly more invites from high trust buyers."}
                  </p>
                </>
              ) : (
                <EmptyState
                  variant="subtle"
                  title="Performance insights"
                  message="Complete ek delivery cycle ya repeat buyer score haasil karo, phir yahan detailed analytics unlock ho jayein gi."
                />
              )}
            </div>
          </aside>
        </section>
      </div>
    </section>
  );
}

function PerformanceRow({ label, value }) {
  const numeric = typeof value === "number" ? value : null;
  const display = numeric !== null ? `${Math.round(numeric)}%` : "—";
  const width = numeric !== null ? Math.min(Math.max(numeric, 0), 100) : 0;

  return (
    <div>
      <p className="flex items-center justify-between font-semibold text-[color:var(--foreground)]">
        {label}
        <span>{display}</span>
      </p>
      <div className="mt-2 h-1.5 rounded-full bg-[rgba(var(--leaf-rgb),0.12)]">
        <span
          className="block h-1.5 rounded-full bg-[color:var(--leaf)]"
          style={{ width: `${width}%` }}
          aria-hidden
        />
      </div>
    </div>
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
