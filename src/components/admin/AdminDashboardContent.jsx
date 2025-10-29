"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Inbox, Layers, Leaf, UserCheck } from "lucide-react";
import { auth } from "@/lib/firebase";
import { getAllowedAdmins } from "@/lib/adminEmails";

function formatDate(value) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function countByCategory(items) {
  return items.reduce((acc, entry) => {
    const key = entry.category || "Uncategorised";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function getTopCategories(buyers) {
  const counts = countByCategory(buyers);
  return Object.entries(counts)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);
}

function getRecent(items, limit = 5) {
  return [...items]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, limit);
}

function getSevenDayWindowCount(items) {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return items.filter((item) => {
    const createdAt = new Date(item.createdAt || 0).getTime();
    return createdAt >= sevenDaysAgo;
  }).length;
}

function toText(value) {
  const result = String(value ?? "").trim();
  return result;
}

function normaliseFarmerEntry(entry) {
  if (!entry || typeof entry !== "object") return null;
  const base = {
    id: entry.id,
    type: entry.type || "unknown",
    createdAt: entry.createdAt,
    status: entry.status || "pending_review",
    productId: entry.productId || "",
    publishedAt: entry.publishedAt || null,
  };

  if (entry.type === "quick_form") {
    const data = entry.data ?? {};
    return {
      ...base,
      name: toText(data.fullName),
      phone: toText(data.phone),
      email: toText(data.email),
      location: toText(data.location),
      produce: toText(data.cropType),
      notes: toText(data.message),
    };
  }

  if (entry.type === "onboarding_wizard") {
    const profile = entry.data?.profile ?? {};
    const produce = entry.data?.produce ?? {};
    const documents = entry.data?.documents ?? {};
    return {
      ...base,
      name: toText(profile.fullName),
      phone: toText(profile.phone),
      email: toText(profile.email),
      location: [profile.city, profile.province].map(toText).filter(Boolean).join(", "),
      produce: toText(produce.mainCrops),
      volume: [toText(produce.estimatedVolume), toText(produce.unit)].filter(Boolean).join(" "),
      harvestSeason: toText(produce.harvestSeason),
      notes: toText(produce.note),
      preferredStatus: toText(produce.listingPreference),
      documents,
    };
  }

  return {
    ...base,
    name: "",
    phone: "",
    email: "",
    location: "",
    produce: "",
    notes: "",
  };
}

function extractCrops(produce) {
  if (!produce) return [];
  return produce
    .split(/[,/&]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function getTopFarmerCrops(farmers) {
  const counts = farmers.reduce((acc, farmer) => {
    const crops = extractCrops(farmer.produce);
    crops.forEach((crop) => {
      const key = crop.charAt(0).toUpperCase() + crop.slice(1).toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
    });
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([crop, total]) => ({ crop, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);
}

function LoadingCard({ title }) {
  return (
    <div className="min-h-[140px] rounded-[28px] border border-[rgba(var(--leaf-rgb),0.18)] bg-white/80 p-6 shadow-[0_12px_24px_rgba(15,23,42,0.08)]">
      <p className="text-sm font-semibold text-[color:var(--muted)]">{title}</p>
      <div className="mt-3 h-5 w-24 rounded-full bg-[rgba(var(--leaf-rgb),0.1)]" />
      <div className="mt-4 h-3 w-32 rounded-full bg-[rgba(var(--leaf-rgb),0.08)]" />
    </div>
  );
}

export default function AdminDashboardContent() {
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [buyers, setBuyers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [products, setProducts] = useState([]);
  const [publishingId, setPublishingId] = useState("");
  const allowedAdmins = useMemo(() => getAllowedAdmins(["admin@bidagri.com"]), []);
  const loaderRef = useRef(async () => {});
  const statusRef = useRef("loading");
  const iconMap = useMemo(
    () => ({
      farmers: Leaf,
      buyers: UserCheck,
      inbox: Inbox,
      catalog: Layers,
    }),
    []
  );

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    let isMounted = true;
    async function load(options = {}) {
      const { silent = false } = options;
      try {
        if (!silent) {
          setStatus("loading");
        }

        const user = auth.currentUser;
        const token = user ? await user.getIdToken().catch(() => null) : null;
        const userEmail = user?.email?.toLowerCase() ?? "";
        const allowedSet = new Set(allowedAdmins);
        const emailHeader = allowedSet.has(userEmail) ? userEmail : allowedAdmins[0] ?? userEmail;

        const adminHeaders = {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(emailHeader ? { "X-Admin-Email": emailHeader } : {}),
        };

        const [buyersRes, contactsRes, farmersRes, productsRes] = await Promise.all([
          fetch("/api/buyers/register", { method: "GET", headers: adminHeaders }),
          fetch("/api/contact", { method: "GET", headers: adminHeaders }),
          fetch("/api/farmers/register", { method: "GET", headers: adminHeaders }),
          fetch("/api/products?admin=1", { method: "GET", headers: adminHeaders }),
        ]);

        const buyersJson = await buyersRes.json().catch(() => null);
        if (!buyersRes.ok) throw new Error(buyersJson?.message || "Unable to load buyer registrations.");
        const contactsJson = await contactsRes.json().catch(() => null);
        if (!contactsRes.ok) throw new Error(contactsJson?.message || "Unable to load contact messages.");
        const farmersJson = await farmersRes.json().catch(() => null);
        if (!farmersRes.ok) throw new Error(farmersJson?.message || "Unable to load farmer registrations.");
        const productsJson = await productsRes.json().catch(() => null);
        if (!productsRes.ok) throw new Error(productsJson?.message || "Unable to load product listings.");

        if (!isMounted) return;
        setBuyers(buyersJson?.items ?? []);
        setMessages(contactsJson?.items ?? []);
        setFarmers(farmersJson?.items ?? []);
        setProducts(productsJson?.items ?? []);
        setStatus("ready");
      } catch (err) {
        if (!isMounted) return;
        console.error("Admin dashboard refresh failed:", err);
        setError(err?.message || "Failed to load admin data.");
        setStatus((prev) => (prev === "ready" ? "ready" : "error"));
      }
    }

    loaderRef.current = load;
    load();
    const interval = setInterval(() => load({ silent: statusRef.current === "ready" }), 60_000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [allowedAdmins]);

  const farmerEntries = useMemo(() => farmers.map(normaliseFarmerEntry).filter(Boolean), [farmers]);

  const metrics = useMemo(() => {
    const totalFarmers = farmers.length;
    const freshFarmers = getSevenDayWindowCount(farmers);
    const totalBuyers = buyers.length;
    const freshBuyerLeads = getSevenDayWindowCount(buyers);
    const inboxMessages = messages.length;
    const freshMessages = getSevenDayWindowCount(messages);
    const totalProducts = products.length;
    const productCategories = new Set(products.map((item) => item.category || "Farmer Listings")).size;

    return [
      {
        key: "farmers",
        label: "Farmer onboarding",
        primary: totalFarmers,
        delta: `Last 7 days: ${freshFarmers}`,
      },
      {
        key: "buyers",
        label: "Buyer registrations",
        primary: totalBuyers,
        delta: `Last 7 days: ${freshBuyerLeads}`,
      },
      {
        key: "inbox",
        label: "Support inbox",
        primary: inboxMessages,
        delta: `New this week: ${freshMessages}`,
      },
      {
        key: "catalog",
        label: "Catalogue coverage",
        primary: totalProducts,
        delta: `${productCategories} categories`,
      },
    ];
  }, [buyers, messages, farmers, products]);

  const productSnapshot = useMemo(() => {
    if (!products.length) {
      return {
        averagePrice: 0,
        regions: 0,
        listings: [],
      };
    }

    const sum = products.reduce((acc, item) => acc + Number(item.pricePerKg ?? 0), 0);
    const averagePrice = sum / Math.max(products.length, 1);
    const regionSet = new Set(
      products
        .map((item) => (item.location || ""))
        .map((location) => location.split(",").pop()?.trim())
        .filter(Boolean)
    );

    return {
      averagePrice,
      regions: regionSet.size,
      listings: products.slice(0, 4),
    };
  }, [products]);

  const handlePublish = useCallback(
    async (farmer) => {
      if (!farmer?.id) return;
      const user = auth.currentUser;
      const fallbackEmail = allowedAdmins[0] ?? "";
      if (!fallbackEmail && !user) {
        window.alert("No admin email configured. Please set NEXT_PUBLIC_ADMIN_EMAILS.");
        return;
      }
      const priceInput = window.prompt("Set price per kg (PKR)", "1000");
      if (priceInput === null) return;
      const price = Number(priceInput);
      if (!Number.isFinite(price) || price <= 0) {
        window.alert("Please enter a valid numeric price.");
        return;
      }

      const preferredStatus = String(farmer.preferredStatus || "").toLowerCase();
      let nextStatus =
        preferredStatus === "in bidding"
          ? "In Bidding"
          : preferredStatus === "available"
          ? "Available"
          : "";

      if (nextStatus) {
        const keepPreference = window.confirm(
          `Farmer requested the listing to go live as “${nextStatus}”. Click OK to honor their choice or Cancel to switch.`
        );
        if (!keepPreference) {
          nextStatus = nextStatus === "In Bidding" ? "Available" : "In Bidding";
        }
      } else {
        const confirmStatus = window.confirm(
          "Mark this listing as 'In Bidding'? Click Cancel to keep it 'Available'."
        );
        nextStatus = confirmStatus ? "In Bidding" : "Available";
      }

      setPublishingId(farmer.id);
      try {
        const token = user ? await user.getIdToken().catch(() => null) : null;
        const userEmail = user?.email?.toLowerCase() ?? "";
        const emailHeader = allowedAdmins.includes(userEmail) ? userEmail : fallbackEmail;
        const response = await fetch("/api/admin/farmers/publish", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(emailHeader ? { "X-Admin-Email": emailHeader } : {}),
          },
          body: JSON.stringify({ id: farmer.id, pricePerKg: price, status: nextStatus }),
        });

        if (!response.ok) {
          const detail = await response.json().catch(() => null);
          throw new Error(detail?.message || "Failed to publish listing.");
        }

        // Refresh data after successful publish
        loaderRef.current?.({ silent: false });
      } catch (err) {
        window.alert(err?.message || "Unable to publish listing.");
      } finally {
        setPublishingId("");
      }
    },
    [allowedAdmins]
  );

  const topCategories = useMemo(() => getTopCategories(buyers), [buyers]);
  const topFarmerCrops = useMemo(() => getTopFarmerCrops(farmerEntries), [farmerEntries]);
  const recentRegistrations = useMemo(() => getRecent(buyers, 5), [buyers]);
  const recentFarmers = useMemo(() => getRecent(farmerEntries, 5), [farmerEntries]);
  const recentMessages = useMemo(() => getRecent(messages, 5), [messages]);

  if (status === "loading") {
    return (
      <section className="space-y-8">
        <div className="rounded-[32px] border border-[rgba(var(--leaf-rgb),0.2)] bg-white/95 p-8 shadow-[0_24px_48px_rgba(15,23,42,0.12)]">
          <h1 className="text-2xl font-semibold text-[color:var(--foreground)]">Admin Control Center</h1>
          <p className="mt-2 max-w-2xl text-sm text-[color:var(--muted)]">
            Loading platform activity...
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <LoadingCard title="Farmer onboarding" />
          <LoadingCard title="Buyer registrations" />
          <LoadingCard title="Support inbox" />
          <LoadingCard title="Catalogue coverage" />
        </div>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="mx-auto max-w-xl rounded-[32px] border border-[color:var(--accent)]/40 bg-white/95 p-8 text-center shadow-[0_24px_48px_rgba(244,63,94,0.15)]">
        <h1 className="text-2xl font-semibold text-[color:var(--foreground)]">Unable to load admin data</h1>
        <p className="mt-3 text-sm text-[color:var(--muted)]">{error}</p>
        <button
          type="button"
          onClick={() => {
            setStatus("loading");
            setError("");
            loaderRef.current({ silent: false });
          }}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-[color:var(--leaf)] px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-[rgba(var(--leaf-rgb),0.3)] transition hover:-translate-y-0.5"
        >
          Retry
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-10">
      {error && status === "ready" && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}
      <header className="relative overflow-hidden rounded-[32px] border border-[rgba(var(--leaf-rgb),0.18)] bg-white/95 p-8 shadow-[0_24px_48px_rgba(15,23,42,0.12)]">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[rgba(var(--leaf-rgb),0.12)] via-white to-[rgba(var(--accent-rgb),0.18)] blur-[160px]" aria-hidden />
        <div className="pointer-events-none absolute -left-16 -top-20 h-40 w-40 rounded-full bg-[rgba(var(--secondary-rgb),0.18)] blur-[120px]" aria-hidden />
        <div className="pointer-events-none absolute -right-10 bottom-[-60px] h-44 w-44 rounded-full bg-[rgba(var(--leaf-rgb),0.14)] blur-[110px]" aria-hidden />
        <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(var(--leaf-rgb),0.12)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--leaf)] ring-1 ring-[rgba(var(--leaf-rgb),0.25)]">
          Admin workspace
        </span>
        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[color:var(--foreground)] sm:text-4xl">Admin Control Center</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--muted)] sm:text-base">
              Review onboarding pipelines, unlock buyer demand, and keep support responses on track — refreshed every minute.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-[color:var(--muted)]">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 ring-1 ring-[rgba(var(--leaf-rgb),0.25)]">
              <span className="h-2 w-2 rounded-full bg-[color:var(--leaf)]" /> Live sync enabled
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 ring-1 ring-[rgba(var(--accent-rgb),0.25)]">
              <span className="h-2 w-2 rounded-full bg-[color:var(--accent)]" /> Data snapshot secure
            </span>
          </div>
        </div>
      </header>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]">
          Platform pulse
        </h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = iconMap[metric.key] ?? Leaf;
            return (
              <article
                key={metric.label}
                className="group relative overflow-hidden rounded-[28px] border border-[rgba(var(--leaf-rgb),0.18)] bg-gradient-to-br from-white via-[rgba(var(--leaf-rgb),0.05)] to-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.1)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(15,23,42,0.15)]"
              >
                <span className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-[rgba(var(--leaf-rgb),0.12)] blur-[90px]" aria-hidden="true" />
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(var(--leaf-rgb),0.12)] text-[color:var(--leaf)] ring-1 ring-[rgba(var(--leaf-rgb),0.15)]">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[color:var(--muted)]">
                    {metric.label}
                  </p>
                </div>
                <p className="mt-4 text-3xl font-bold text-[color:var(--foreground)]">
                  {metric.primary}
                </p>
                <p className="mt-2 inline-flex rounded-full bg-[rgba(var(--leaf-rgb),0.12)] px-3 py-1 text-xs font-medium text-[color:var(--leaf)]">
                  {metric.delta}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[28px] border border-[rgba(var(--leaf-rgb),0.2)] bg-white/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.1)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Recent buyer registrations</h2>
            <a href="/buyers" className="text-sm font-medium text-[color:var(--leaf)] hover:text-[color:var(--secondary)]">
              Review buyer profile
            </a>
          </div>
          <p className="mt-1 text-xs text-[color:var(--muted)]">
            Showing the five most recent submissions.
          </p>
          <ul className="mt-5 divide-y divide-[rgba(var(--leaf-rgb),0.12)]">
            {recentRegistrations.length === 0 && (
              <li className="py-6 text-sm text-[color:var(--muted)]">No buyer registrations yet.</li>
            )}
            {recentRegistrations.map((buyer) => (
              <li key={buyer.id} className="flex flex-col gap-1 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">{buyer.name}</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(var(--leaf-rgb),0.12)] px-3 py-1 text-xs font-medium text-[color:var(--leaf)]">
                    <Leaf className="h-3.5 w-3.5" />
                    {buyer.category || "Not specified"}
                  </span>
                </div>
                <p className="text-xs text-[color:var(--muted)]">{buyer.email} • {buyer.phone}</p>
                <p className="text-xs text-[color:var(--muted)]">
                  {buyer.city}, {buyer.province} • {formatDate(buyer.createdAt)}
                </p>
                {buyer.notes && (
                  <p className="text-xs text-[color:var(--foreground)]">Notes: {buyer.notes}</p>
                )}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-[28px] border border-[rgba(var(--leaf-rgb),0.2)] bg-white/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.1)]">
          <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Top buyer interests</h2>
          <p className="mt-1 text-xs text-[color:var(--muted)]">
            Based on registrations received.
          </p>
          <ul className="mt-5 space-y-4">
            {topCategories.length === 0 && (
              <li className="text-sm text-[color:var(--muted)]">No category data yet.</li>
            )}
            {topCategories.map((item) => (
              <li key={item.category} className="rounded-2xl border border-[rgba(var(--leaf-rgb),0.12)] bg-white px-4 py-3 shadow-sm shadow-[rgba(var(--leaf-rgb),0.08)]">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[color:var(--foreground)]">{item.category}</span>
                  <span className="text-xs font-semibold text-[color:var(--leaf)]">{item.total} leads</span>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[rgba(var(--leaf-rgb),0.08)]">
                  <span
                    className="block h-full rounded-full bg-[color:var(--leaf)]"
                    style={{ width: `${Math.min(item.total * 20, 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[28px] border border-[rgba(var(--leaf-rgb),0.2)] bg-white/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.1)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Recent farmer submissions</h2>
            <a href="/farmers" className="text-sm font-medium text-[color:var(--leaf)] hover:text-[color:var(--secondary)]">
              Farmer resources
            </a>
          </div>
          <p className="mt-1 text-xs text-[color:var(--muted)]">
            Latest registrations from both quick forms and onboarding wizard.
          </p>
          <ul className="mt-5 divide-y divide-[rgba(var(--leaf-rgb),0.12)]">
            {recentFarmers.length === 0 && (
              <li className="py-6 text-sm text-[color:var(--muted)]">No farmer submissions yet.</li>
            )}
            {recentFarmers.map((farmer) => (
              <li key={farmer.id} className="flex flex-col gap-1 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">{farmer.name || "Unnamed farmer"}</p>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                      farmer.type === "onboarding_wizard"
                        ? "bg-[rgba(var(--leaf-rgb),0.12)] text-[color:var(--leaf)]"
                        : "bg-[rgba(var(--secondary-rgb),0.12)] text-[color:var(--secondary)]"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-current" />
                    {farmer.type === "onboarding_wizard" ? "Onboarding" : "Quick form"}
                  </span>
                </div>
                <p className="text-xs text-[color:var(--muted)]">
                  {farmer.location || "Location pending"}
                  {farmer.volume ? ` • ${farmer.volume}` : ""}
                  {farmer.harvestSeason ? ` • ${farmer.harvestSeason}` : ""}
                </p>
                <p className="text-xs text-[color:var(--muted)]">
                  {farmer.email || "No email"} • {farmer.phone || "No phone"}
                </p>
                <p className="text-xs text-[color:var(--muted)]">Produce: {farmer.produce || "Not provided"}</p>
                <p className="text-xs text-[color:var(--muted)]">
                  Status:
                  <span
                    className={`ml-2 inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold ${
                      farmer.status === "published"
                        ? "bg-[rgba(var(--leaf-rgb),0.12)] text-[color:var(--leaf)]"
                        : "bg-[rgba(var(--accent-rgb),0.25)] text-[color:var(--primary)]"
                    }`}
                  >
                    {farmer.status.replace(/_/g, " ")}
                  </span>
                </p>
                {farmer.status === "pending_review" && (
                  <button
                    type="button"
                    onClick={() => handlePublish(farmer)}
                    disabled={publishingId === farmer.id}
                    className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-[color:var(--leaf)] px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[color:var(--secondary)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {publishingId === farmer.id ? "Publishing…" : "Approve & Publish"}
                  </button>
                )}
                {farmer.status === "published" && farmer.productId && (
                  <a
                    href={`/product/${farmer.productId}`}
                    className="mt-2 inline-flex w-fit items-center rounded-full border border-[rgba(var(--leaf-rgb),0.2)] px-4 py-1.5 text-xs font-semibold text-[color:var(--leaf)] transition hover:border-[color:var(--secondary)] hover:text-[color:var(--secondary)]"
                  >
                    View listing
                  </a>
                )}
                {farmer.notes && (
                  <p className="text-xs text-[color:var(--foreground)]">Notes: {farmer.notes}</p>
                )}
                {(farmer.documents?.idDoc || farmer.documents?.farmProof) && (
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    {farmer.documents?.idDoc && (
                      farmer.documents.idDoc.url ? (
                        <a
                          href={farmer.documents.idDoc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full bg-[rgba(var(--leaf-rgb),0.16)] px-3 py-1 font-semibold text-[color:var(--leaf)] hover:bg-[rgba(var(--leaf-rgb),0.25)]"
                        >
                          <span aria-hidden>🪪</span>
                          CNIC Preview
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(var(--leaf-rgb),0.1)] px-3 py-1 font-semibold text-[color:var(--leaf)]">
                          <span aria-hidden>🪪</span>
                          CNIC attached (upload pending)
                        </span>
                      )
                    )}
                    {farmer.documents?.farmProof && (
                      farmer.documents.farmProof.url ? (
                        <a
                          href={farmer.documents.farmProof.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full bg-[rgba(var(--secondary-rgb),0.16)] px-3 py-1 font-semibold text-[color:var(--secondary)] hover:bg-[rgba(var(--secondary-rgb),0.25)]"
                        >
                          <span aria-hidden>📄</span>
                          Farm proof
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(var(--secondary-rgb),0.1)] px-3 py-1 font-semibold text-[color:var(--secondary)]">
                          <span aria-hidden>📄</span>
                          Farm proof attached (upload pending)
                        </span>
                      )
                    )}
                  </div>
                )}
                <p className="text-xs text-[color:var(--muted)]">{formatDate(farmer.createdAt)}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-[28px] border border-[rgba(var(--leaf-rgb),0.2)] bg-white/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.1)]">
          <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Top farmer crops</h2>
          <p className="mt-1 text-xs text-[color:var(--muted)]">
            Aggregated from the produce details shared by farmers.
          </p>
          <ul className="mt-5 space-y-4">
            {topFarmerCrops.length === 0 && (
              <li className="text-sm text-[color:var(--muted)]">No crop data yet.</li>
            )}
            {topFarmerCrops.map((item) => (
              <li key={item.crop} className="rounded-2xl border border-[rgba(var(--leaf-rgb),0.12)] bg-white px-4 py-3 shadow-sm shadow-[rgba(var(--leaf-rgb),0.08)]">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[color:var(--foreground)]">{item.crop}</span>
                  <span className="text-xs font-semibold text-[color:var(--leaf)]">{item.total} farmers</span>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[rgba(var(--leaf-rgb),0.08)]">
                  <span
                    className="block h-full rounded-full bg-[color:var(--leaf)]"
                    style={{ width: `${Math.min(item.total * 25, 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <article className="rounded-[28px] border border-[rgba(var(--leaf-rgb),0.2)] bg-white/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.1)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Contact inbox</h2>
            <a href="mailto:info@bidagri.com" className="text-sm font-medium text-[color:var(--leaf)] hover:text-[color:var(--secondary)]">
              Reply to latest
            </a>
          </div>
          <p className="mt-1 text-xs text-[color:var(--muted)]">
            Five most recent support requests.
          </p>
          <ul className="mt-5 space-y-4">
            {recentMessages.length === 0 && (
              <li className="text-sm text-[color:var(--muted)]">No messages yet.</li>
            )}
            {recentMessages.map((msg) => (
              <li key={msg.id} className="rounded-2xl border border-[rgba(var(--leaf-rgb),0.12)] bg-[rgba(var(--leaf-rgb),0.04)] p-4 shadow-sm shadow-[rgba(var(--leaf-rgb),0.1)]">
                <p className="text-sm font-semibold text-[color:var(--foreground)]">{msg.name}</p>
                <p className="text-xs text-[color:var(--muted)]">{msg.email}</p>
                <p className="mt-2 text-sm text-[color:var(--muted)]">{msg.message}</p>
                <p className="mt-3 text-xs text-[color:var(--muted)]">{formatDate(msg.createdAt)}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-[28px] border border-[rgba(var(--leaf-rgb),0.2)] bg-white/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.1)]">
          <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Marketplace snapshot</h2>
          <p className="mt-1 text-xs text-[color:var(--muted)]">
            Live overview of approved farmer listings currently visible on the marketplace.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[rgba(var(--leaf-rgb),0.12)] bg-[rgba(var(--leaf-rgb),0.06)] px-4 py-3">
              <p className="text-sm font-semibold text-[color:var(--foreground)]">Average price per kg</p>
              <p className="mt-2 text-2xl font-bold text-[color:var(--leaf)]">
                {productSnapshot.listings.length > 0
                  ? `Rs ${Math.round(productSnapshot.averagePrice || 0)}`
                  : "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-[rgba(var(--leaf-rgb),0.12)] bg-[rgba(var(--leaf-rgb),0.06)] px-4 py-3">
              <p className="text-sm font-semibold text-[color:var(--foreground)]">Regions covered</p>
              <p className="mt-2 text-2xl font-bold text-[color:var(--leaf)]">
                {productSnapshot.regions}
              </p>
            </div>
          </div>
          {productSnapshot.listings.length === 0 ? (
            <p className="mt-5 text-sm text-[color:var(--muted)]">
              No farmer listings have been published yet. Approve a submission to populate this view.
            </p>
          ) : (
            <ul className="mt-5 space-y-3">
              {productSnapshot.listings.map((item) => (
                <li key={item.id} className="flex items-center justify-between rounded-2xl border border-[rgba(var(--leaf-rgb),0.12)] bg-white px-4 py-3 shadow-sm shadow-[rgba(var(--leaf-rgb),0.1)]">
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--foreground)]">{item.title}</p>
                    <p className="text-xs text-[color:var(--muted)]">{item.location || "Location pending"}</p>
                  </div>
                  <span className="text-xs font-semibold text-[color:var(--leaf)]">
                    Rs {Number(item.pricePerKg ?? 0).toLocaleString()}
                    /{item.unit || "kg"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </section>
  );
}
