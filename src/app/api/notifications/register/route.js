"use server";

import { adminAuth, adminDb, adminTimestamp } from "@/lib/firebaseAdmin";

async function requireUser(request) {
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
    return { ...decoded, email };
  } catch (error) {
    console.error("Failed to verify user for push token:", error);
    throw Object.assign(new Error("Invalid or expired token."), { status: 401 });
  }
}

function cleanToken(value) {
  const token = String(value ?? "").trim();
  if (!token || token.length < 10) {
    return null;
  }
  return token;
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
    return Response.json({ message: "Body must be JSON." }, { status: 400 });
  }

  const token = cleanToken(body?.token);
  if (!token) {
    return Response.json({ message: "Valid token is required." }, { status: 422 });
  }

  const platform = String(body?.platform || "web").toLowerCase();
  const label = String(body?.label || "").trim();

  await adminDb
    .collection("notificationTokens")
    .doc(token)
    .set(
      {
        token,
        uid: user.uid,
        email: user.email,
        platform,
        label,
        updatedAt: adminTimestamp(),
        createdAt: adminTimestamp(),
      },
      { merge: true }
    );

  return Response.json({ status: "ok" });
}

export async function DELETE(request) {
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
    return Response.json({ message: "Body must be JSON." }, { status: 400 });
  }

  const token = cleanToken(body?.token);
  if (!token) {
    return Response.json({ message: "Valid token is required." }, { status: 422 });
  }

  const docRef = adminDb.collection("notificationTokens").doc(token);
  const snap = await docRef.get();
  if (snap.exists && snap.data()?.uid === user.uid) {
    await docRef.delete();
  }

  return Response.json({ status: "ok" });
}
