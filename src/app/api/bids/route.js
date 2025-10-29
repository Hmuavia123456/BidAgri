import { adminAuth, adminDb, adminTimestamp } from "@/lib/firebaseAdmin";
import { createDeliveryFromBid } from "@/lib/deliveries";
import { refreshBuyerDashboard } from "@/lib/buyerDashboard";
import { notifyBidPlaced } from "@/lib/notifications";

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function normaliseString(value) {
  return String(value ?? "").trim();
}

async function requireUser(request) {
  const authHeader = request.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    throw Object.assign(new Error("Authentication required"), { status: 401 });
  }
  const token = authHeader.slice(7).trim();
  if (!token) {
    throw Object.assign(new Error("Authentication required"), { status: 401 });
  }
  const decoded = await adminAuth.verifyIdToken(token);
  return {
    uid: decoded.uid,
    email: decoded.email?.toLowerCase() || "",
    role: decoded.role || "",
  };
}

async function fetchUserProfile(uid) {
  if (!uid) return null;
  const ref = adminDb.collection("users").doc(uid);
  const snap = await ref.get();
  return snap.exists ? snap.data() : null;
}

function toBidResponse(doc) {
  const data = doc.data() || {};
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate?.().toISOString?.() || data.createdAt || null,
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const productId = normaliseString(searchParams.get("productId"));
  const limit = Number(searchParams.get("limit")) || 20;

  if (!productId) {
    return Response.json({ message: "productId is required" }, { status: 422 });
  }

  const bidsSnap = await adminDb
    .collection("products")
    .doc(productId)
    .collection("bids")
    .orderBy("bidPerKg", "desc")
    .limit(Math.min(Math.max(limit, 1), 100))
    .get();

  const items = bidsSnap.docs.map(toBidResponse);
  return Response.json({ items });
}

export async function POST(request) {
  let authUser;
  try {
    authUser = await requireUser(request);
  } catch (error) {
    return Response.json({ message: error.message }, { status: error.status || 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Request must be JSON" }, { status: 400 });
  }

  const productId = normaliseString(body?.productId);
  if (!productId) {
    return Response.json({ message: "productId is required" }, { status: 422 });
  }

  const pricePerKg = toNumber(body?.pricePerKg);
  const quantity = toNumber(body?.quantity);
  const deliveryOption = normaliseString(body?.deliveryOption || "Pickup");
  const notes = normaliseString(body?.notes);
  const bidderName = normaliseString(body?.bidderName);
  const phone = normaliseString(body?.phone);

  if (!Number.isFinite(pricePerKg) || pricePerKg <= 0) {
    return Response.json({ message: "Valid pricePerKg required" }, { status: 422 });
  }
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return Response.json({ message: "Quantity must be greater than zero" }, { status: 422 });
  }
  if (!/^03\d{9}$/.test(phone)) {
    return Response.json({ message: "Phone must be in 03XXXXXXXXX format" }, { status: 422 });
  }

  const userProfile = (await fetchUserProfile(authUser.uid)) || {};
  const userRole = authUser.role || userProfile.role || "buyer";
  const isAdmin = userRole === "admin";
  if (!isAdmin && userRole !== "buyer") {
    return Response.json({ message: "Only buyers can place bids" }, { status: 403 });
  }

  const productRef = adminDb.collection("products").doc(productId);
  const bidsRef = productRef.collection("bids");

  try {
    const result = await adminDb.runTransaction(async (tx) => {
      const productSnap = await tx.get(productRef);
      if (!productSnap.exists) {
        throw Object.assign(new Error("Product not found"), { status: 404 });
      }
      const productData = productSnap.data() || {};
      const minIncrement = Number(productData.minimumIncrement || 10);
      const highestBid = Number(productData.highestBid || productData.pricePerKg || 0);
      const requiredBid = highestBid ? highestBid + minIncrement : productData.pricePerKg || 0;

      if (!isAdmin && pricePerKg < requiredBid) {
        throw Object.assign(
          new Error(`Bid must be at least Rs ${requiredBid.toLocaleString()}`),
          { status: 422 }
        );
      }

      const total = pricePerKg * quantity;
      const bidDoc = bidsRef.doc();
      const payload = {
        bidPerKg: pricePerKg,
        quantity,
        total,
        deliveryOption,
        notes,
        bidderUid: authUser.uid,
        bidderName: bidderName || userProfile.displayName || authUser.email?.split("@")[0] || "",
        bidderPhone: phone,
        createdAt: adminTimestamp(),
      };

      tx.set(bidDoc, payload);
      tx.update(productRef, {
        highestBid: Math.max(highestBid, pricePerKg),
        bidsCount: Number(productData.bidsCount || 0) + 1,
        updatedAt: adminTimestamp(),
      });

      const farmerEmail =
        productData.farmer?.email ||
        productData.farmerEmail ||
        productData.profile?.email ||
        productData.contactEmail ||
        "";

      const productMeta = {
        id: productRef.id,
        title: productData.title || productData.cropType || "Farmer lot",
        farmerUid: productData.farmerUid || "",
        farmerName:
          productData.farmer?.name ||
          productData.farmerName ||
          productData.profile?.fullName ||
          "",
        farmerEmail,
      };

      return { id: bidDoc.id, ref: bidDoc, product: productMeta };
    });
    const bidSnap = await result.ref.get();
    const bidResponse = toBidResponse(bidSnap);

    if (result.product?.farmerUid) {
      createDeliveryFromBid({
        bidId: bidResponse.id,
        productId: result.product.id,
        productTitle: result.product.title,
        farmerUid: result.product.farmerUid,
        farmerName: result.product.farmerName,
        farmerEmail: result.product.farmerEmail,
        buyerUid: authUser.uid,
        buyerName: bidResponse.bidderName,
        buyerEmail: authUser.email,
        deliveryOption,
        quantity,
        pricePerKg,
      })
        .then(() => {
          refreshBuyerDashboard({ buyerUid: authUser.uid, buyerEmail: authUser.email }).catch(
            (err) => {
              console.error("Failed to refresh buyer dashboard after bid:", err);
            }
          );

          notifyBidPlaced({
            bidId: bidResponse.id,
            productTitle: result.product.title,
            pricePerKg,
            quantity,
            buyerEmail: authUser.email,
            buyerName: bidResponse.bidderName,
            farmerEmail: result.product.farmerEmail,
            farmerName: result.product.farmerName,
          }).catch((err) => {
            console.error("Failed to dispatch bid notifications:", err);
          });
        })
        .catch((err) => {
          console.error("Failed to create delivery record:", err);
        });
    }

    return Response.json({ status: "ok", bid: bidResponse });
  } catch (error) {
    const status = error?.status || 500;
    return Response.json({ message: error.message || "Failed to place bid" }, { status });
  }
}
