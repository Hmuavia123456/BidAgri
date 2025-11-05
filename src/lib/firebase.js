import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD_-KaKtq7FxTyQPFTSnYAXYu4RFaIysZw",
  authDomain: "agribids-4e05c.firebaseapp.com",
  projectId: "agribids-4e05c",
  storageBucket: "agribids-4e05c.firebasestorage.app",
  messagingSenderId: "703851803499",
  appId: "1:703851803499:web:5082375b73ac8379b9922e",
};

const existingApps = getApps();
const app = existingApps.length ? getApp() : initializeApp(firebaseConfig);
const didJustInitializeApp = existingApps.length === 0;
const isBrowser = typeof window !== "undefined";

let firestoreInstance;

if (isBrowser) {
  if (didJustInitializeApp) {
    // Some networks and devices block WebSockets; force long polling so Firestore can connect.
    firestoreInstance = initializeFirestore(app, {
      experimentalForceLongPolling: true,
      useFetchStreams: false,
    });
  } else {
    firestoreInstance = getFirestore(app);
  }
} else {
  firestoreInstance = getFirestore(app);
}

export const auth = getAuth(app);
export const db = firestoreInstance;
export default app;
