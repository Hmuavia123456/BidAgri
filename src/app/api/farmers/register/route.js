import { adminAuth, adminDb, adminTimestamp } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";
import { getAllowedAdmins } from "@/lib/adminEmails";

const ALLOWED_ADMINS = getAllowedAdmins(["admin@bidagri.com"]);

function cleanString(value, fallback = "") {
  return String(value ?? fallback).trim();
}

function sanitizeQuickForm(body) {
  const cleaned = {
    fullName: cleanString(body.fullName),
    cropType: cleanString(body.cropType),
    location: cleanString(body.location),
    phone: cleanString(body.phone),
    email: cleanString(body.email).toLowerCase(),
    message: cleanString(body.message),
  };

  if (!cleaned.fullName) return "Full name is required.";
  if (!cleaned.cropType) return "Crop type is required.";
  if (!cleaned.location) return "Location is required.";
  if (!/^03\d{9}$/.test(cleaned.phone)) return "Phone must follow 03XXXXXXXXX.";
  if (!/.+@.+\..+/.test(cleaned.email)) return "Valid email is required.";

  return cleaned;
}

function sanitizeWizardForm(body) {
  const profile = body?.profile ?? {};
  const produce = body?.produce ?? {};
  const documents = body?.documents ?? {};

  const cleanedProfile = {
    fullName: cleanString(profile.fullName),
    phone: cleanString(profile.phone),
    email: cleanString(profile.email).toLowerCase(),
    province: cleanString(profile.province),
    city: cleanString(profile.city),
  };

  if (!cleanedProfile.fullName) return "Profile full name is required.";
  if (!/^03\d{9}$/.test(cleanedProfile.phone)) return "Profile phone must follow 03XXXXXXXXX.";
  if (!/.+@.+\..+/.test(cleanedProfile.email)) return "Profile email must be valid.";
  if (!cleanedProfile.province) return "Profile province is required.";
  if (!cleanedProfile.city) return "Profile city is required.";

  const cleanedProduce = {
    mainCrops: cleanString(produce.mainCrops),
    estimatedVolume: cleanString(produce.estimatedVolume),
    unit: cleanString(produce.unit || "kg"),
    harvestSeason: cleanString(produce.harvestSeason),
    note: cleanString(produce.note),
    listingPreference: cleanString(produce.listingPreference || "In Bidding"),
  };

  if (!cleanedProduce.mainCrops) return "Produce crops information is required.";
  if (!cleanedProduce.estimatedVolume) return "Produce volume is required.";
  if (!cleanedProduce.harvestSeason) return "Harvest season selection is required.";
  if (!["Available", "In Bidding"].includes(cleanedProduce.listingPreference)) {
    cleanedProduce.listingPreference = "In Bidding";
  }

  const toMeta = (fileLike) => {
    if (!fileLike) return null;
    const meta = {
      name: cleanString(fileLike.name),
      size: Number(fileLike.size) || null,
      type: cleanString(fileLike.type),
      key: cleanString(fileLike.key),
      url: cleanString(fileLike.url),
    };
    if (!meta.url && !meta.key && !meta.name) {
      return null;
    }
    return meta;
  };

  const toMetaArray = (list) => {
    if (!Array.isArray(list)) return [];
    return list.map(toMeta).filter(Boolean);
  };

  const cleanedDocuments = {
    idDoc: toMeta(documents.idDoc),
    farmProof: toMeta(documents.farmProof),
  };

  const producePhotos = toMetaArray(produce.producePhotos);
  if (!producePhotos.length) return "At least one produce photo is required.";

  cleanedProduce.producePhotos = producePhotos;

  return {
    profile: cleanedProfile,
    produce: cleanedProduce,
    documents: cleanedDocuments,
  };
}

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
    return await adminAuth.verifyIdToken(token);
  } catch (error) {
    console.error("Failed to verify ID token:", error);
    throw Object.assign(new Error("Invalid or expired token."), { status: 401 });
  }
}

async function requireAdmin(request) {
  const decoded = await requireUser(request);
  const email = decoded.email?.toLowerCase() || "";
  const isAdminByEmail = ALLOWED_ADMINS.includes(email);
  if (decoded.role !== "admin" && !isAdminByEmail) {
    throw Object.assign(new Error("Admin privileges required."), { status: 403 });
  }
  return decoded;
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

  let user;
  try {
    user = await requireUser(request);
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: error.status || 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const source = cleanString(parsed?.source || parsed?.formType || "unknown");
  let payload;

  if (source === "quick_form") {
    const result = sanitizeQuickForm(parsed);
    if (typeof result === "string") {
      return new Response(JSON.stringify({ message: result }), {
        status: 422,
        headers: { "Content-Type": "application/json" },
      });
    }
    payload = { type: "quick_form", data: result };
  } else if (source === "onboarding_wizard") {
    const result = sanitizeWizardForm(parsed);
    if (typeof result === "string") {
      return new Response(JSON.stringify({ message: result }), {
        status: 422,
        headers: { "Content-Type": "application/json" },
      });
    }
    payload = { type: "onboarding_wizard", data: result };
  } else {
    return new Response(JSON.stringify({ message: "Unknown farmer registration source." }), {
      status: 422,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (payload.type === "onboarding_wizard") {
    payload.data.profile = {
      ...payload.data.profile,
      uid: user.uid,
      authEmail: user.email || payload.data.profile.email,
    };
  } else {
    payload.data.uid = user.uid;
    payload.data.authEmail = user.email || payload.data.email;
  }

  try {
    const record = {
      ...payload,
      status: "pending_review",
      createdAt: adminTimestamp(),
      updatedAt: adminTimestamp(),
      submittedBy: {
        uid: user.uid,
        email: user.email || null,
      },
    };

    const docRef = await adminDb.collection("farmerSubmissions").add(record);

    return Response.json(
      { status: "ok", message: "Farmer registration received.", id: docRef.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving farmer submission:", error);
    return Response.json(
      { message: "Failed to save submission. Please try again." },
      { status: 500 }
    );
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

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let query = adminDb.collection("farmerSubmissions").orderBy("createdAt", "desc");
  if (status) {
    query = query.where("status", "==", status);
  }

  const snapshot = await query.get();

  const items = snapshot.docs.map((doc) => {
    const data = doc.data();
    const createdAt =
      data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : null;
    const updatedAt =
      data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : null;
    return {
      id: doc.id,
      ...data,
      createdAt,
      updatedAt,
    };
  });

  return Response.json({ items });
}
