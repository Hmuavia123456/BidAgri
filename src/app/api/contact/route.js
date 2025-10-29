import { adminAuth, adminDb, adminTimestamp } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";
import { getAllowedAdmins } from "@/lib/adminEmails";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_ADMINS = getAllowedAdmins(["admin@bidagri.com"]);
const fallbackMessages = [];

async function safeStoreMessage(payload) {
  if (!adminDb) {
    const fallback = {
      id: `fallback-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      ...payload,
      createdAt: new Date().toISOString(),
    };
    fallbackMessages.push(fallback);
    return { stored: false, fallback };
  }

  try {
    await adminDb.collection("contactMessages").add({
      ...payload,
      createdAt: adminTimestamp(),
    });
    return { stored: true };
  } catch (error) {
    console.error("Failed to persist contact message to Firestore:", error);
    const fallback = {
      id: `fallback-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      ...payload,
      createdAt: new Date().toISOString(),
    };
    fallbackMessages.push(fallback);
    return { stored: false, fallback };
  }
}

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
  if (!adminAuth) {
    throw Object.assign(new Error("Admin auth unavailable."), { status: 503 });
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

  try {
    const { stored } = await safeStoreMessage(result);
    return Response.json(
      {
        status: stored ? "ok" : "queued",
        message: stored
          ? "Message received."
          : "Message received in fallback queue. We’ll sync it as soon as connectivity is restored.",
      },
      { status: stored ? 201 : 200 }
    );
  } catch (error) {
    console.error("Failed to handle contact submission:", error);
    return new Response(JSON.stringify({ message: "Unable to process message right now." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
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

  try {
    if (!adminDb) {
      if (fallbackMessages.length) {
        return Response.json({ items: fallbackMessages, source: "fallback" });
      }
      throw Object.assign(new Error("Admin database unavailable."), { status: 503 });
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
    if (fallbackMessages.length) {
      return Response.json({ items: [...fallbackMessages, ...items], source: "partial" });
    }
    return Response.json({ items });
  } catch (error) {
    console.error("Failed to read contact messages from Firestore:", error);
    if (fallbackMessages.length) {
      return Response.json({ items: fallbackMessages, source: "fallback" });
    }
    return new Response(JSON.stringify({ message: "Unable to load contact messages." }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}
