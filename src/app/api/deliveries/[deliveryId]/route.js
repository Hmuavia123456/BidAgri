"use server";

import { getAllowedAdmins } from "@/lib/adminEmails";
import { adminAuth, adminDb, adminTimestamp } from "@/lib/firebaseAdmin";
import { normaliseDeliverySnapshot } from "@/lib/deliveries";
import { notifyDeliveryUpdated } from "@/lib/notifications";

const ALLOWED_ADMINS = getAllowedAdmins(["admin@bidagri.com"]);

async function requireParticipant(request, deliveryDoc) {
  const authHeader = request.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    throw Object.assign(new Error("Authentication required."), { status: 401 });
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    throw Object.assign(new Error("Authentication required."), { status: 401 });
  }

  const decoded = await adminAuth.verifyIdToken(token);
  const email = decoded.email?.toLowerCase() || "";
  const uid = decoded.uid || email;
  const role = decoded.role || "";

  const isAdmin = role === "admin" || ALLOWED_ADMINS.includes(email);
  if (isAdmin) {
    return decoded;
  }

  const buyerUid = deliveryDoc?.buyerUid || "";
  const farmerUid = deliveryDoc?.farmerUid || "";
  if (uid === buyerUid || uid === farmerUid) {
    return decoded;
  }

  throw Object.assign(new Error("Not authorised to update this delivery."), { status: 403 });
}

export async function PATCH(request, { params }) {
  const deliveryId = params?.deliveryId || "";
  if (!deliveryId) {
    return Response.json({ message: "deliveryId is required." }, { status: 422 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Body must be valid JSON." }, { status: 400 });
  }

  const stepIndex =
    Number.isInteger(body?.stepIndex) && body.stepIndex >= 0 ? Number(body.stepIndex) : null;
  const eventStatus = typeof body?.eventStatus === "string" ? body.eventStatus.trim() : null;
  const detail = typeof body?.detail === "string" ? body.detail.trim() : null;
  const etaUpdate = typeof body?.eta === "string" ? body.eta.trim() : null;
  const windowUpdate = typeof body?.window === "string" ? body.window.trim() : null;
  const statusUpdate = typeof body?.status === "string" ? body.status.trim() : null;
  const stepOverride =
    Number.isInteger(body?.currentStep) && body.currentStep >= 0
      ? Number(body.currentStep)
      : null;

  if (
    stepIndex === null &&
    !etaUpdate &&
    !windowUpdate &&
    !statusUpdate &&
    stepOverride === null
  ) {
    return Response.json(
      {
        message:
          "Nothing to update. Provide stepIndex, currentStep, status, eta, or window fields.",
      },
      { status: 422 }
    );
  }

  const docRef = adminDb.collection("deliveries").doc(deliveryId);
  const snap = await docRef.get();
  if (!snap.exists) {
    return Response.json({ message: "Delivery not found." }, { status: 404 });
  }

  const deliveryData = snap.data() || {};

  try {
    await requireParticipant(request, deliveryData);
  } catch (error) {
    return Response.json({ message: error.message }, { status: error.status || 401 });
  }

  const events = Array.isArray(deliveryData.events) ? [...deliveryData.events] : [];
  let stepLabel = "";
  if (stepIndex !== null && events[stepIndex]) {
    const event = { ...events[stepIndex] };
    if (detail) {
      event.detail = detail;
    }
    if (eventStatus) {
      event.status = eventStatus;
      event.timestamp =
        eventStatus === "completed" ? adminTimestamp() : event.timestamp || null;
    }
    stepLabel = event.label || stepLabel;
    events[stepIndex] = event;
  }

  const updates = {
    updatedAt: adminTimestamp(),
  };

  if (events.length) {
    updates.events = events;
  }
  if (etaUpdate) {
    updates.eta = etaUpdate;
  }
  if (windowUpdate) {
    updates.window = windowUpdate;
  }
  if (statusUpdate) {
    updates.status = statusUpdate;
  }
  if (stepOverride !== null) {
    updates.currentStep = stepOverride;
  } else if (stepIndex !== null && eventStatus === "completed") {
    updates.currentStep = Math.max(stepIndex, Number(deliveryData.currentStep || 0));
  }

  await docRef.update(updates);

  const updatedSnap = await docRef.get();
  const normalised = normaliseDeliverySnapshot(updatedSnap);

  notifyDeliveryUpdated({
    deliveryId,
    productTitle: normalised.title,
    buyerEmail: normalised.buyerEmail,
    buyerName: normalised.buyerName,
    farmerEmail: normalised.farmerEmail,
    farmerName: normalised.farmerName,
    stepLabel: stepLabel || (normalised.steps || [])[normalised.step] || "",
    status: normalised.status,
    eta: normalised.eta,
  }).catch((error) => {
    console.error("Failed to dispatch delivery notifications:", error);
  });

  return Response.json({ data: normalised });
}
