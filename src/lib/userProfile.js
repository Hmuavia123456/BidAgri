import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

function normaliseEmail(email) {
  return (email || "").toLowerCase().trim();
}

export async function getUserProfile(uid) {
  if (!uid) return null;
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data() || {};
  return {
    id: snap.id,
    ...data,
  };
}

export async function upsertUserProfile({
  uid,
  email,
  displayName,
  role,
  phoneNumber,
  photoURL,
}) {
  if (!uid) throw new Error("User id is required.");
  const ref = doc(db, "users", uid);
  const existingSnap = await getDoc(ref);
  const existing = existingSnap.exists() ? existingSnap.data() : null;
  const resolvedRole = role || existing?.role || "buyer";

  const payload = {
    email: normaliseEmail(email) || existing?.email || "",
    displayName: displayName || existing?.displayName || "",
    photoURL: photoURL ?? existing?.photoURL ?? "",
    phoneNumber: phoneNumber ?? existing?.phoneNumber ?? "",
    role: resolvedRole,
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  };

  if (!existingSnap.exists()) {
    payload.createdAt = serverTimestamp();
  }

  await setDoc(ref, payload, { merge: true });

  return {
    ...(existing || {}),
    ...payload,
    role: resolvedRole,
    uid,
  };
}
