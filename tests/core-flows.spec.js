const { test, expect, request } = require("@playwright/test");
const admin = require("firebase-admin");
const { randomUUID } = require("crypto");
const path = require("path");

const RUN_E2E = process.env.E2E_FIREBASE === "true";

const firebaseConfig = {
  apiKey: "AIzaSyD_-KaKtq7FxTyQPFTSnYAXYu4RFaIysZw",
};

const describeFn = RUN_E2E ? test.describe : test.describe.skip;

describeFn("Core marketplace flow", () => {
  /** @type {request.APIRequestContext} */
  let api;
  let adminIdToken;
  let buyerIdToken;
  let farmerIdToken;
  let submissionId;
  let productId;
  let deliveryId;
  let cleanupTasks = [];

  test.beforeAll(async ({ playwright }) => {
    const serviceAccountPath = path.resolve(process.cwd(), "firebaseServiceAccount.json");
    let serviceAccount;
    try {
      serviceAccount = require(serviceAccountPath);
    } catch (error) {
      throw new Error(
        `Service account file missing at ${serviceAccountPath}. Provide credentials before running E2E tests.`
      );
    }

    if (!admin.apps || !admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    api = await request.newContext({
      baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
      extraHTTPHeaders: {
        "Content-Type": "application/json",
      },
    });

    const adminUid = `admin-e2e-${randomUUID()}`;
    const buyerUid = `buyer-e2e-${randomUUID()}`;
    const farmerUid = `farmer-e2e-${randomUUID()}`;

    adminIdToken = await createIdToken(adminUid, { role: "admin" });
    buyerIdToken = await createIdToken(buyerUid, { role: "buyer" });
    farmerIdToken = await createIdToken(farmerUid, { role: "farmer" });

    // Seed farmer submission
    submissionId = `submission-${randomUUID()}`;
    await admin
      .firestore()
      .collection("farmerSubmissions")
      .doc(submissionId)
      .set({
        status: "pending_review",
        type: "quick_form",
        data: {
          fullName: "E2E Farmer",
          phone: "03001234567",
          email: "farmer-e2e@bidagri.com",
          location: "Test City",
          cropType: "Walnuts",
          message: "Sample produce",
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    cleanupTasks.push(async () => {
      await admin.firestore().collection("farmerSubmissions").doc(submissionId).delete().catch(() => {});
    });
  });

  test.afterAll(async () => {
    for (const task of cleanupTasks.reverse()) {
      await task();
    }
    await api?.dispose();
    try {
      await admin.app().delete();
    } catch {
      // ignore
    }
  });

  test("admin publishes listing, buyer bids, delivery updates notify", async () => {
    // Admin publish
    const publishResponse = await api.post("/api/admin/farmers/publish", {
      headers: {
        Authorization: `Bearer ${adminIdToken}`,
      },
      data: {
        id: submissionId,
        pricePerKg: 1200,
        status: "Available",
      },
    });

    expect(publishResponse.ok()).toBeTruthy();
    const publishJson = await publishResponse.json();
    expect(publishJson.status).toBe("ok");
    expect(publishJson.productId).toBeTruthy();

    productId = publishJson.productId;

    cleanupTasks.push(async () => {
      if (productId) {
        await admin.firestore().collection("products").doc(productId).delete().catch(() => {});
      }
    });

    // Buyer places bid
    const bidResponse = await api.post("/api/bids", {
      headers: {
        Authorization: `Bearer ${buyerIdToken}`,
      },
      data: {
        productId,
        pricePerKg: 1250,
        quantity: 50,
        deliveryOption: "Delivery",
        notes: "Test buyer bid",
        bidderName: "Buyer QA",
        phone: "03012345678",
      },
    });

    expect(bidResponse.ok()).toBeTruthy();
    const bidJson = await bidResponse.json();
    expect(bidJson.status).toBe("ok");
    const bidId = bidJson.bid.id;

    // Wait for delivery record
    deliveryId = await waitForDelivery(bidId, 5000);
    expect(deliveryId).toBeTruthy();

    cleanupTasks.push(async () => {
      if (deliveryId) {
        await admin.firestore().collection("deliveries").doc(deliveryId).delete().catch(() => {});
      }
    });

    // Update delivery timeline
    const deliveryUpdate = await api.patch(`/api/deliveries/${deliveryId}`, {
      headers: {
        Authorization: `Bearer ${adminIdToken}`,
      },
      data: {
        stepIndex: 1,
        eventStatus: "completed",
        detail: "Packed for dispatch",
        eta: "Arriving in 2 days",
      },
    });

    expect(deliveryUpdate.ok()).toBeTruthy();
    const deliveryJson = await deliveryUpdate.json();
    expect(deliveryJson.data.step).toBeGreaterThanOrEqual(1);
    expect(deliveryJson.data.events[1].status).toBe("completed");
  });
});

async function createIdToken(uid, claims = {}) {
  const customToken = await admin.auth().createCustomToken(uid, claims);
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${firebaseConfig.apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: customToken,
        returnSecureToken: true,
      }),
    }
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to exchange custom token: ${body}`);
  }
  const json = await res.json();
  return json.idToken;
}

async function waitForDelivery(bidId, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const snapshot = await admin
      .firestore()
      .collection("deliveries")
      .where("bidId", "==", bidId)
      .limit(1)
      .get();
    if (!snapshot.empty) {
      return snapshot.docs[0].id;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Delivery not created for bid ${bidId}`);
}
