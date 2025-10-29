import { adminAuth, adminDb, adminTimestamp } from "@/lib/firebaseAdmin";
import { refreshBuyerDashboard } from "@/lib/buyerDashboard";

function normaliseId(value) {
  return (value || "").trim();
}

async function requireUser(request) {
  const authHeader = request.headers.get("authorization") || "";
  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token) {
      const decoded = await adminAuth.verifyIdToken(token);
      return { uid: decoded.uid, email: decoded.email?.toLowerCase() || "" };
    }
  }
  throw Object.assign(new Error("Authentication required"), { status: 401 });
}

function watchlistCollection(uid) {
  return adminDb.collection("watchlists").doc(uid).collection("items");
}

export async function GET(request) {
  let user;
  try {
    user = await requireUser(request);
  } catch (error) {
    return Response.json({ message: error.message }, { status: error.status || 401 });
  }

  const snapshot = await watchlistCollection(user.uid).get();
  const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return Response.json({ items });
}

export async function POST(request) {
  let user;
  try {
    user = await requireUser(request);
  } catch (error) {
    return Response.json({ message: error.message }, { status: error.status || 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Request must be JSON" }, { status: 400 });
  }

  const productId = normaliseId(body?.productId);
  if (!productId) {
    return Response.json({ message: "productId is required" }, { status: 422 });
  }

  const itemDoc = watchlistCollection(user.uid).doc(productId);
  await itemDoc.set(
    {
      productId,
      addedAt: adminTimestamp(),
    },
    { merge: true }
  );

  refreshBuyerDashboard({ buyerUid: user.uid, buyerEmail: user.email }).catch((error) => {
    console.error("Failed to refresh buyer dashboard after watchlist add:", error);
  });

  return Response.json({ status: "ok" });
}

export async function DELETE(request) {
  let user;
  try {
    user = await requireUser(request);
  } catch (error) {
    return Response.json({ message: error.message }, { status: error.status || 401 });
  }

  const { searchParams } = new URL(request.url);
  const productId = normaliseId(searchParams.get("productId"));
  if (!productId) {
    return Response.json({ message: "productId query parameter required" }, { status: 422 });
  }

  await watchlistCollection(user.uid).doc(productId).delete();
  refreshBuyerDashboard({ buyerUid: user.uid, buyerEmail: user.email }).catch((error) => {
    console.error("Failed to refresh buyer dashboard after watchlist delete:", error);
  });

  return Response.json({ status: "ok" });
}
