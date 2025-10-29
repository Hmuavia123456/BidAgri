import { adminAuth, adminDb, adminTimestamp } from "@/lib/firebaseAdmin";
import { getAllowedAdmins } from "@/lib/adminEmails";
import { notifyListingPublished } from "@/lib/notifications";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1582515073490-dc0c84f0ca04?q=80&w=1200&auto=format&fit=crop";
const DEFAULT_PRODUCE_IMAGE =
  "https://images.unsplash.com/photo-1506806732259-39c2d0268443?q=80&w=1200&auto=format&fit=crop";

const ALLOWED_ADMINS = getAllowedAdmins(["admin@bidagri.com"]);

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
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

function listingPercent(status = "") {
  switch ((status || "").toLowerCase()) {
    case "in bidding":
      return 70;
    case "sold":
    case "completed":
      return 100;
    case "available":
      return 45;
    default:
      return 25;
  }
}

function buildFarmerChecklist(products) {
  if (!products.length) {
    return [
      {
        title: "Publish your first lot",
        body: "List a crop with clear photos and reserve price to unlock buyer interest.",
        action: "Create listing",
        href: "/register/farmer",
      },
    ];
  }
  const hasBidding = products.some(
    (item) => String(item.status || "").toLowerCase() === "in bidding"
  );
  const checklist = [];
  if (!hasBidding) {
    checklist.push({
      title: "Move a lot into bidding",
      body: "Switch at least one active listing to “In Bidding” so buyers can start placing offers.",
      action: "Manage listings",
      href: "/farmers/dashboard",
    });
  }
  checklist.push({
    title: "Add recent inspection photos",
    body: "Fresh visuals help buyers verify quality and increases trust.",
    action: "Update gallery",
    href: "/farmers/dashboard",
  });
  return checklist;
}

async function refreshFarmerDashboard({ profile = {}, produce = {}, farmerUid }) {
  if (!farmerUid) return;
  const productsSnap = await adminDb
    .collection("products")
    .where("farmerUid", "==", farmerUid)
    .get();

  const products = productsSnap.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() ?? new Date(a.createdAt || 0).getTime();
      const bTime = b.createdAt?.toMillis?.() ?? new Date(b.createdAt || 0).getTime();
      return bTime - aTime;
    });

  const activeProducts = products.filter((item) =>
    ["available", "in bidding"].includes(String(item.status || "").toLowerCase())
  );
  const biddingProducts = products.filter(
    (item) => String(item.status || "").toLowerCase() === "in bidding"
  );

  const averageAsk =
    activeProducts.length > 0
      ? Math.round(
          activeProducts.reduce((total, item) => total + Number(item.pricePerKg || 0), 0) /
            activeProducts.length
        )
      : null;

  const metrics = [
    {
      label: "Active listings",
      value: activeProducts.length,
      caption: "Lots visible to buyers right now.",
    },
    {
      label: "Lots in bidding",
      value: biddingProducts.length,
      caption: "Conversions currently open.",
    },
    {
      label: "Average ask",
      value: averageAsk ? `Rs ${averageAsk.toLocaleString()}` : "Set price",
      caption: averageAsk ? "Average reserve price" : "Add prices to improve discovery.",
    },
  ];

  const listingProgress = products.slice(0, 5).map((product) => ({
    id: product.id,
    title: product.title,
    percent: listingPercent(product.status),
    qa: product.qa?.grade || "Pending",
    bids: Number(product.bidsCount || 0),
  }));

  const checklist = buildFarmerChecklist(products);

  await adminDb
    .collection("farmerDashboards")
    .doc(farmerUid)
    .set(
      {
        farmerName: profile.fullName || "",
        farmName: [profile.city, profile.province].filter(Boolean).join(", "),
        heroSubtitle:
          produce.note?.trim() ||
          "Track bids, inspections, and payouts in real time. Publish more lots to stay visible.",
        metrics,
        listingProgress,
        checklist,
        logistics: [],
        performance: {
          bidAcceptance:
            biddingProducts.length && products.length
              ? Math.min(Math.round((biddingProducts.length / products.length) * 100), 100)
              : null,
          onTimeDeliveries: null,
          repeatRate: null,
          tip:
            "Responsive answers and updated photos boost buyer trust. Keep your lot details fresh.",
        },
        updatedAt: adminTimestamp(),
      },
      { merge: true }
    );
}

export async function POST(request) {
  try {
    await requireAdmin(request);
  } catch (error) {
    return Response.json({ message: error.message }, { status: error.status || 401 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ message: "Request body must be JSON." }, { status: 400 });
  }

  const submissionId = String(payload?.id ?? payload?.submissionId ?? "").trim();
  const price = toNumber(payload?.pricePerKg);
  const statusInput = String(payload?.status ?? "").trim();

  if (!submissionId) {
    return Response.json({ message: "Submission id is required." }, { status: 422 });
  }
  if (price === null) {
    return Response.json({ message: "Valid pricePerKg is required." }, { status: 422 });
  }

  const submissionRef = adminDb.collection("farmerSubmissions").doc(submissionId);
  const submissionSnap = await submissionRef.get();
  if (!submissionSnap.exists) {
    return Response.json({ message: "Submission not found." }, { status: 404 });
  }

  const submission = submissionSnap.data();
  const baseData = submission?.data ?? {};
  const profile = submission.type === "onboarding_wizard" ? baseData.profile ?? {} : baseData;
  const produce = submission.type === "onboarding_wizard" ? baseData.produce ?? {} : {};
  const documents = submission.type === "onboarding_wizard" ? baseData.documents ?? {} : {};
  const producePhotos = submission.type === "onboarding_wizard" && Array.isArray(produce.producePhotos)
    ? produce.producePhotos.filter((photo) => photo?.url)
    : [];

  const titleFallback =
    submission.type === "onboarding_wizard"
      ? `${produce.mainCrops ?? "Farmer listing"}`
      : `${baseData.cropType ?? "Farmer listing"}`;

  const location =
    submission.type === "onboarding_wizard"
      ? [profile.city, profile.province].filter(Boolean).join(", ")
      : baseData.location ?? "";

  const productPayload = {
    submissionId,
    title: titleFallback || "Farmer listing",
    category: "Farmer Listings",
    subcategory:
      submission.type === "onboarding_wizard" ? produce.harvestSeason ?? "" : "",
    status: statusInput || produce.listingPreference || "Available",
    pricePerKg: price,
    unit:
      submission.type === "onboarding_wizard"
        ? produce.unit ?? "kg"
        : baseData.unit ?? "unit",
    estimatedVolume:
      submission.type === "onboarding_wizard"
        ? produce.estimatedVolume ?? ""
        : baseData.capacity ?? "",
    location,
    description:
      submission.type === "onboarding_wizard"
      ? produce.note ?? ""
      : baseData.message ?? "",
    image: producePhotos[0]?.url || documents.farmProof?.url || DEFAULT_PRODUCE_IMAGE,
    gallery: producePhotos,
    farmerUid: profile.uid || submission.submittedBy?.uid || "",
    bidsCount: 0,
    highestBid: price,
    minimumIncrement: Number(produce.minimumIncrement || baseData.minimumIncrement || 10),
    documents,
    farmer: {
      name: profile.fullName ?? baseData.fullName ?? "",
      phone: profile.phone ?? baseData.phone ?? "",
      email: profile.email ?? baseData.email ?? "",
    },
    createdAt: adminTimestamp(),
    updatedAt: adminTimestamp(),
    publishedAt: adminTimestamp(),
  };

  const productRef = await adminDb.collection("products").add(productPayload);

  await refreshFarmerDashboard({
    profile,
    produce,
    farmerUid: productPayload.farmerUid,
  });

  await submissionRef.update({
    status: "published",
    productId: productRef.id,
    publishedAt: adminTimestamp(),
    updatedAt: adminTimestamp(),
  });

  notifyListingPublished({
    farmerEmail: productPayload.farmer?.email || "",
    farmerName: productPayload.farmer?.name || "",
    productTitle: productPayload.title,
    pricePerKg: price,
    status: productPayload.status,
  }).catch((error) => {
    console.error("Failed to dispatch listing published notification:", error);
  });

  return Response.json(
    { status: "ok", message: "Listing published.", productId: productRef.id },
    { status: 200 }
  );
}
