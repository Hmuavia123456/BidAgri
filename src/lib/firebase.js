import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD_-KaKtq7FxTyQPFTSnYAXYu4RFaIysZw",
  authDomain: "agribids-4e05c.firebaseapp.com",
  projectId: "agribids-4e05c",
  storageBucket: "agribids-4e05c.firebasestorage.app",
  messagingSenderId: "703851803499",
  appId: "1:703851803499:web:5082375b73ac8379b9922e",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
