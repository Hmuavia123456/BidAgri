import { adminAuth, adminDb, adminTimestamp } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";
import { getAllowedAdmins } from "@/lib/adminEmails";

const ALLOWED_ADMINS = getAllowedAdmins(["admin@bidagri.com"]);

function validate(body) {
  if (!body || typeof body !== "object") {
    return "Invalid payload.";
  }
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!name) return "Name is required.";
  if (!/.+@.+\..+/.test(email)) return "Valid email is required.";
  if (message.length < 10) return "Message must be at least 10 characters.";

  return { name, email, message };
}

async function requireAdmin(request) {
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

export async function POST(request) {
  let parsed;
  try {
    parsed = await request.json();
  } catch {
    return new Response(JSON.stringify({ message: "Request body must be JSON." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const result = validate(parsed);
  if (typeof result === "string") {
    return new Response(JSON.stringify({ message: result }), {
      status: 422,
      headers: { "Content-Type": "application/json" },
    });
  }

  await adminDb.collection("contactMessages").add({
    ...result,
    createdAt: adminTimestamp(),
  });

  return Response.json({ status: "ok", message: "Message received." }, { status: 201 });
}

export async function GET(request) {
  try {
    await requireAdmin(request);
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: error.status || 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const snapshot = await adminDb
    .collection("contactMessages")
    .orderBy("createdAt", "desc")
    .get();
  const items = snapshot.docs.map((doc) => {
    const data = doc.data();
    const createdAt =
      data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : null;
    return { id: doc.id, ...data, createdAt };
  });
  return Response.json({ items });
}
