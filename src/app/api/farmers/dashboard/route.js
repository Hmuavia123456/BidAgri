import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { getAllowedAdmins } from "@/lib/adminEmails";
import { fetchFarmerLogistics } from "@/lib/deliveries";

const ALLOWED_ADMINS = getAllowedAdmins(["admin@bidagri.com"]);

async function requireFarmer(request) {
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
    const uid = decoded.uid || email;
    const isAdmin = decoded.role === "admin" || ALLOWED_ADMINS.includes(email);
    return { ...decoded, email, uid, isAdmin };
  } catch (error) {
    console.error("Failed to verify farmer identity:", error);
    throw Object.assign(new Error("Invalid or expired token."), { status: 401 });
  }
}

export async function GET(request) {
  let user;
  try {
    user = await requireFarmer(request);
  } catch (error) {
    return Response.json({ message: error.message }, { status: error.status || 401 });
  }

  const { searchParams } = new URL(request.url);
  const requestedFarmerId = (searchParams.get("farmerId") || "").trim();
  const farmerId = requestedFarmerId || user.uid;

  if (!farmerId) {
    return Response.json({ message: "farmerId is required." }, { status: 400 });
  }

  const effectiveEmail = (user.email || "").toLowerCase();
  const isAdmin = user.isAdmin || ALLOWED_ADMINS.includes(effectiveEmail);
  if (requestedFarmerId && requestedFarmerId !== user.uid && !isAdmin) {
    return Response.json({ message: "Not authorized to view this dashboard." }, { status: 403 });
  }

  try {
    const snapshot = await adminDb.collection("farmerDashboards").doc(farmerId).get();
    if (!snapshot.exists) {
      return Response.json({ data: null });
    }
    const data = snapshot.data();
    let logistics = Array.isArray(data.logistics) ? data.logistics : [];
    try {
      const liveLogistics = await fetchFarmerLogistics(farmerId, 4);
      if (liveLogistics.length) {
        logistics = liveLogistics;
      }
    } catch (err) {
      console.error("Failed to load farmer logistics:", err);
    }
    return Response.json({ data: { ...data, logistics, id: farmerId } });
  } catch (error) {
    console.error("Failed to load farmer dashboard:", error);
    return Response.json({ message: "Unable to load dashboard data." }, { status: 500 });
  }
}
