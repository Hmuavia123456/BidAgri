"use client";

import { getApps } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";
import app from "@/lib/firebase";

let messagingPromise;

export async function getClientMessaging() {
  if (typeof window === "undefined") return null;
  if (!messagingPromise) {
    messagingPromise = isSupported()
      .then((supported) => {
        if (!supported) return null;
        if (!getApps().length) {
          return null;
        }
        return getMessaging(app);
      })
      .catch(() => null);
  }
  return messagingPromise;
}
