import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";
import { getAllowedAdmins } from "@/lib/adminEmails";

const ALLOWED_ADMINS = getAllowedAdmins(["admin@bidagri.com"]);

async function maybeRequireAdmin(request, includeDrafts) {
  if (!includeDrafts) {
    return null;
  }

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
    const isAdminByEmail = ALLOWED_ADMINS.includes(email);
    if (decoded.role !== "admin" && !isAdminByEmail) {
      throw Object.assign(new Error("Admin privileges required."), { status: 403 });
    }
    return decoded;
  } catch (error) {
    if (error.status) throw error;
    throw Object.assign(new Error("Invalid or expired token."), { status: 401 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const includeDrafts = searchParams.get("admin") === "1";
  const statusFilter = searchParams.get("status");

  try {
    await maybeRequireAdmin(request, includeDrafts);
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: error.status || 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let items = [];

  if (!includeDrafts) {
    const statusBuckets = ["Available", "In Bidding"];
    const snapshots = await Promise.all(
      statusBuckets.map((status) =>
        adminDb.collection("products").where("status", "==", status).get()
      )
    );
    const seen = new Map();
    snapshots.forEach((snapshot) => {
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const createdAt =
          data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : null;
        const updatedAt =
          data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : null;
        const publishedAt =
          data.publishedAt instanceof Timestamp ? data.publishedAt.toDate().toISOString() : null;
        seen.set(doc.id, {
          id: doc.id,
          ...data,
          createdAt,
          updatedAt,
          publishedAt,
        });
      });
    });
    items = Array.from(seen.values()).sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      return bTime - aTime;
    });
  } else {
    let query = adminDb.collection("products").orderBy("createdAt", "desc");
    if (statusFilter) {
      query = query.where("status", "==", statusFilter);
    }
    const snapshot = await query.get();
    items = snapshot.docs.map((doc) => {
      const data = doc.data();
      const createdAt =
        data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : null;
      const updatedAt =
        data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : null;
      const publishedAt =
        data.publishedAt instanceof Timestamp ? data.publishedAt.toDate().toISOString() : null;

      return {
        id: doc.id,
        ...data,
        createdAt,
        updatedAt,
        publishedAt,
      };
    });
  }

  return Response.json({ items });
}
