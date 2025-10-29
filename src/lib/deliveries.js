import { adminDb, adminTimestamp } from "@/lib/firebaseAdmin";

const DEFAULT_STEPS = ["Order confirmed", "Packed", "In transit", "Delivered"];

function toEvent(label, detail = "", status = "pending") {
  return {
    label,
    detail,
    status,
    timestamp: status === "completed" ? new Date().toISOString() : null,
  };
}

export async function createDeliveryFromBid({
  bidId,
  productId,
  productTitle,
  farmerUid,
  farmerName,
  farmerEmail,
  buyerUid,
  buyerName,
  buyerEmail,
  deliveryOption,
  quantity,
  pricePerKg,
}) {
  if (!bidId || !productId || !buyerUid || !farmerUid) {
    return null;
  }

  const docRef = adminDb.collection("deliveries").doc();
  const eta =
    deliveryOption === "Delivery"
      ? "Dispatching in 48h"
      : "Pickup schedule pending";
  const window =
    deliveryOption === "Delivery"
      ? "Partner courier handles delivery"
      : "BidAgri hub pickup slot to be assigned";

  const events = [
    {
      label: "Order confirmed",
      detail: `Bid placed at Rs ${Number(pricePerKg || 0).toLocaleString()}/kg for ${quantity} units.`,
      status: "completed",
      timestamp: new Date().toISOString(),
    },
    toEvent("Packed"),
    toEvent("In transit"),
    toEvent("Delivered"),
  ];

  await docRef.set({
    bidId,
    productId,
    productTitle: productTitle || "Farmer lot",
    farmerUid,
    farmerName: farmerName || "",
    farmerEmail: farmerEmail || "",
    buyerUid,
    buyerName: buyerName || buyerEmail || "",
    buyerEmail: buyerEmail || "",
    steps: DEFAULT_STEPS,
    currentStep: 0,
    status: "Order confirmed",
    deliveryOption,
    quantity,
    pricePerKg,
    eta,
    window,
    events,
    createdAt: adminTimestamp(),
    updatedAt: adminTimestamp(),
  });

  return { id: docRef.id };
}

function formatDelivery(doc) {
  const data = doc.data() || {};
  const events =
    Array.isArray(data.events) && data.events.length
      ? data.events.map((event) => {
          const raw = event || {};
          const source = raw.timestamp;
          let isoTimestamp = null;
          if (source?.toDate instanceof Function) {
            isoTimestamp = source.toDate().toISOString();
          } else if (typeof source?.seconds === "number") {
            isoTimestamp = new Date(source.seconds * 1000).toISOString();
          } else if (typeof source === "string") {
            isoTimestamp = source;
          }
          return {
            label: raw.label || "Milestone",
            detail: raw.detail || "",
            status: raw.status || "pending",
            timestamp: isoTimestamp,
          };
        })
      : [];
  return {
    id: doc.id,
    productId: data.productId,
    title: data.productTitle || "Farmer lot",
    eta: data.eta || "ETA pending",
    step: Number(data.currentStep || 0),
    steps: Array.isArray(data.steps) && data.steps.length ? data.steps : DEFAULT_STEPS,
    status: data.status || "Order confirmed",
    window: data.window || "",
    events,
    buyerEmail: data.buyerEmail || "",
    buyerName: data.buyerName || "",
    farmerEmail: data.farmerEmail || "",
    farmerName: data.farmerName || "",
    updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || null,
  };
}

export async function fetchBuyerDeliveries(buyerUid, limit = 4) {
  if (!buyerUid) return [];
  const snapshot = await adminDb
    .collection("deliveries")
    .where("buyerUid", "==", buyerUid)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map(formatDelivery);
}

export async function fetchFarmerLogistics(farmerUid, limit = 4) {
  if (!farmerUid) return [];
  const snapshot = await adminDb
    .collection("deliveries")
    .where("farmerUid", "==", farmerUid)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => {
    const delivery = formatDelivery(doc);
    return {
      id: delivery.id,
      lot: delivery.title,
      window: delivery.window,
      status: delivery.status,
      eta: delivery.eta,
      step: delivery.step,
      steps: delivery.steps,
      events: delivery.events,
    };
  });
}

export function normaliseDeliverySnapshot(doc) {
  return formatDelivery(doc);
}
