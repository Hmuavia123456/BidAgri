import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

function getServiceAccount() {
  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  if (projectId && clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey };
  }
  return null;
}

function initApp() {
  const existing = getApps();
  if (existing.length) {
    return existing[0];
  }

  const serviceAccount = getServiceAccount();
  if (serviceAccount) {
    return initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.projectId,
    });
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  try {
    return initializeApp(projectId ? { projectId } : {});
  } catch (error) {
    console.error("Failed to initialise Firebase app:", error);
    return null;
  }
}

const adminApp = initApp();

export const adminAuth = (() => {
  if (!adminApp) return null;
  try {
    return getAuth(adminApp);
  } catch (error) {
    console.error("Failed to initialise Firebase auth:", error);
    return null;
  }
})();

export const adminDb = (() => {
  if (!adminApp) return null;
  try {
    return getFirestore(adminApp);
  } catch (error) {
    console.error("Failed to initialise Firebase Firestore:", error);
    return null;
  }
})();

export const adminTimestamp = FieldValue.serverTimestamp;

export const adminMessaging = (() => {
  if (!adminApp) return null;
  try {
    return getMessaging(adminApp);
  } catch (error) {
    console.error("Failed to initialise Firebase messaging:", error);
    return null;
  }
})();
