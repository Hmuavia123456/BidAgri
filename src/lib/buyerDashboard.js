import { adminDb, adminTimestamp } from "@/lib/firebaseAdmin";
import { fetchBuyerDeliveries } from "@/lib/deliveries";

function normalizeProduct(productSnap) {
  if (!productSnap?.exists) return null;
  const data = productSnap.data() || {};
  return {
    id: productSnap.id,
    title: data.title || "Farmer listing",
    status: data.status || "Available",
    pricePerKg: Number(data.pricePerKg || 0),
    location: data.location || "",
    farmerName: data.farmer?.name || "",
    farmerLocation: data.farmer?.city || "",
    image: data.image || data.gallery?.[0]?.url || null,
  };
}

export async function refreshBuyerDashboard({ buyerUid, buyerEmail }) {
  if (!buyerUid) return null;

  const watchlistSnap = await adminDb
    .collection("watchlists")
    .doc(buyerUid)
    .collection("items")
    .orderBy("addedAt", "desc")
    .limit(12)
    .get();

  const watchlistItems = await Promise.all(
    watchlistSnap.docs.map(async (doc) => {
      const data = doc.data() || {};
      const productId = data.productId || doc.id;
      if (!productId) {
        return {
          id: doc.id,
          productId: "",
          title: "Listing pending",
          status: "Tracking",
          price: "Price pending",
          seller: "Seller pending",
          addedAt: data.addedAt?.toDate?.()?.toISOString?.() || null,
        };
      }
      try {
        const productSnap = await adminDb.collection("products").doc(productId).get();
        const product = normalizeProduct(productSnap);
        if (!product) {
          return {
            id: doc.id,
            productId,
            title: "Listing removed",
            status: "Unavailable",
            price: "Price pending",
            seller: "Seller pending",
            addedAt: data.addedAt?.toDate?.()?.toISOString?.() || null,
          };
        }

        const formattedPrice =
          product.pricePerKg > 0
            ? `Rs ${product.pricePerKg.toLocaleString()}/kg`
            : "Price on request";

        return {
          id: doc.id,
          productId,
          title: product.title,
          status: product.status,
          price: formattedPrice,
          seller: product.farmerName || "Seller pending",
          location: product.location || product.farmerLocation || "",
          image: product.image || null,
          addedAt: data.addedAt?.toDate?.()?.toISOString?.() || null,
        };
      } catch (error) {
        console.error("Failed to enrich watchlist product:", productId, error);
        return {
          id: doc.id,
          productId,
          title: "Listing unavailable",
          status: "Unavailable",
          price: "Price pending",
          seller: "Seller pending",
          addedAt: data.addedAt?.toDate?.()?.toISOString?.() || null,
        };
      }
    })
  );

  const totalWatchlist = watchlistItems.length;
  const biddingLots = watchlistItems.filter((item) => item.status === "In Bidding").length;
  const availableLots = watchlistItems.filter((item) => item.status === "Available").length;

  const metrics = [
    {
      label: "Lots in watchlist",
      value: totalWatchlist,
      caption: totalWatchlist ? "Keep evaluating specs & bids." : "Shortlist lots to begin tracking.",
    },
    {
      label: "Active bidding lots",
      value: biddingLots,
      caption: biddingLots ? "Jump back in before the timer ends." : "Turn alerts on for bidding lots.",
    },
    {
      label: "Ready-to-buy lots",
      value: availableLots,
      caption: availableLots
        ? "Negotiate directly with farmers."
        : "Ask farmers to publish reserve prices.",
    },
  ];

  const checklist = totalWatchlist
    ? [
        {
          title: "Compare reserve vs bid spread",
          href: "/buyers",
        },
        {
          title: "Ping QA for inspection slots",
          href: "/contact",
        },
      ]
    : [
        {
          title: "Add your first lot to watchlist",
          href: "/products",
        },
        {
          title: "Set sourcing filters",
          href: "/products",
        },
      ];

  const supplierNotes = watchlistItems.slice(0, 4).map((item) => ({
    id: item.productId || item.id,
    farm: item.seller || "Supplier",
    lotsWon: biddingLots,
    rating: null,
    note: item.location ? `Origin: ${item.location}` : "Location pending",
  }));

  const deliveries = await fetchBuyerDeliveries(buyerUid, 4).catch((error) => {
    console.error("Failed to load buyer deliveries:", error);
    return [];
  });
  const deliveryPipeline = deliveries.map((delivery) => ({
    id: delivery.id,
    title: delivery.title,
    eta: delivery.eta,
    step: delivery.step,
    steps: delivery.steps,
    status: delivery.status,
    events: delivery.events,
  }));

  const payload = {
    buyerName: buyerEmail ? buyerEmail.split("@")[0] : "",
    heroSubtitle: totalWatchlist
      ? "Stay on top of your shortlisted lots and respond to counter-offers in minutes."
      : "Shortlist lots to build your sourcing pipeline and get notified when bids heat up.",
    metrics,
    watchlist: watchlistItems.slice(0, 6),
    checklist,
    deliveryPipeline,
    supplierNotes,
    updatedAt: adminTimestamp(),
  };

  await adminDb.collection("buyerDashboards").doc(buyerUid).set(payload, { merge: true });
  return payload;
}
