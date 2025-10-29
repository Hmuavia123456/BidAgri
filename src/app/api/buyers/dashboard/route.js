import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { getAllowedAdmins } from "@/lib/adminEmails";
import { refreshBuyerDashboard } from "@/lib/buyerDashboard";

const ALLOWED_ADMINS = getAllowedAdmins(["admin@bidagri.com"]);

async function requireBuyer(request) {
  const authHeader = request.headers.get("authorization") || "";

  if (!authHeader.startsWith("Bearer ")) {
    throw Object.assign(new Error("Authentication required."), { status: 401 });
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    throw Object.assign(new Error("Authentication required."), { status: 401 });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const email = decoded.email?.toLowerCase() || "";
    const uid = decoded.uid || email;
    const isAdmin = decoded.role === "admin" || ALLOWED_ADMINS.includes(email);
    return { ...decoded, email, uid, isAdmin };
  } catch (error) {
    console.error("Failed to verify buyer identity:", error);
    throw Object.assign(new Error("Invalid or expired token."), { status: 401 });
  }
}

async function buildBuyerFallback() {
  const snapshot = await adminDb
    .collection("products")
    .where("status", "in", ["Available", "In Bidding"])
    .orderBy("createdAt", "desc")
    .limit(8)
    .get();

  const items = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title || "Farmer listing",
      status: data.status || "Available",
      pricePerKg: Number(data.pricePerKg || 0),
      farmer: data.farmer || {},
      location: data.location || "",
    };
  });

  const liveLots = items.length;
  const biddingLots = items.filter(
    (item) => String(item.status || "").toLowerCase() === "in bidding"
  ).length;
  const averagePrice =
    items.length > 0
      ? Math.round(
          items.reduce((total, item) => total + Number(item.pricePerKg || 0), 0) / items.length
        )
      : null;

  const metrics = [
    {
      label: "Live marketplace lots",
      value: liveLots,
      caption: "Fresh produce currently open for buyers.",
    },
    {
      label: "Lots in bidding",
      value: biddingLots,
      caption: "Auctions you can join immediately.",
    },
    {
      label: "Average reserve price",
      value: averagePrice ? `Rs ${averagePrice.toLocaleString()}/kg` : "Awaiting prices",
      caption: averagePrice ? "Across the latest listings" : "Publish price expectations to compare.",
    },
  ];

  const watchlist = items.slice(0, 3).map((item) => ({
    id: item.id,
    title: item.title,
    seller: item.farmer?.name || "Seller pending",
    status: item.status || "Tracking",
    price:
      item.pricePerKg > 0
        ? `Rs ${Number(item.pricePerKg).toLocaleString()}/kg`
        : "Price on request",
    productId: item.id,
  }));

  const checklist = [
    {
      title: "Shortlist a lot for bidding",
      href: "/products",
    },
    {
      title: "Set your quality filters",
      href: "/products",
    },
  ];

  const supplierNotes = items.slice(0, 4).map((item) => ({
    id: item.id,
    farm: item.farmer?.name || item.location || "Supplier",
    lotsWon: Math.max(biddingLots, 0),
    rating: item.farmer?.rating || null,
    note: item.location ? `Origin: ${item.location}` : "New supplier – ask for QA history.",
  }));

  return {
    buyerName: "",
    heroSubtitle: "Fresh lots are live every hour. Track your shortlist and place competitive bids.",
    metrics,
    watchlist,
    checklist,
    deliveryPipeline: [],
    supplierNotes,
  };
}

export async function GET(request) {
  let user;
  try {
    user = await requireBuyer(request);
  } catch (error) {
    return Response.json({ message: error.message }, { status: error.status || 401 });
  }

  const { searchParams } = new URL(request.url);
  const requestedBuyerId = (searchParams.get("buyerId") || "").trim();
  const buyerId = requestedBuyerId || user.uid;

  if (!buyerId) {
    return Response.json({ message: "buyerId is required." }, { status: 400 });
  }

  const effectiveEmail = (user.email || "").toLowerCase();
  const isAdmin = user.isAdmin || ALLOWED_ADMINS.includes(effectiveEmail);
  if (requestedBuyerId && requestedBuyerId !== user.uid && !isAdmin) {
    return Response.json({ message: "Not authorized to view this dashboard." }, { status: 403 });
  }

  try {
    let snapshot = await adminDb.collection("buyerDashboards").doc(buyerId).get();
    const fallback = await buildBuyerFallback();

    if (!snapshot.exists) {
      try {
        await refreshBuyerDashboard({ buyerUid: buyerId, buyerEmail: user.email || "" });
        snapshot = await adminDb.collection("buyerDashboards").doc(buyerId).get();
      } catch (err) {
        console.error("Failed to build buyer dashboard on demand:", err);
      }
      if (!snapshot.exists) {
        return Response.json({ data: fallback });
      }
    }
    const data = snapshot.data();
    const merged = {
      ...fallback,
      ...data,
      metrics: Array.isArray(data.metrics) && data.metrics.length ? data.metrics : fallback.metrics,
      watchlist:
        Array.isArray(data.watchlist) && data.watchlist.length ? data.watchlist : fallback.watchlist,
      checklist:
        Array.isArray(data.checklist) && data.checklist.length ? data.checklist : fallback.checklist,
      deliveryPipeline:
        Array.isArray(data.deliveryPipeline) && data.deliveryPipeline.length
          ? data.deliveryPipeline
          : fallback.deliveryPipeline,
      supplierNotes:
        Array.isArray(data.supplierNotes) && data.supplierNotes.length
          ? data.supplierNotes
          : fallback.supplierNotes,
      buyerName: data.buyerName || fallback.buyerName,
      heroSubtitle: data.heroSubtitle || fallback.heroSubtitle,
      id: buyerId,
    };
    return Response.json({ data: merged });
  } catch (error) {
    console.error("Failed to load buyer dashboard:", error);
    return Response.json({ message: "Unable to load dashboard data." }, { status: 500 });
  }
}
