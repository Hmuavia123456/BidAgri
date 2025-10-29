"use client";

import { useEffect, useRef, useState } from "react";
import { getToken } from "firebase/messaging";
import { getClientMessaging } from "@/lib/firebaseMessaging";

const STORAGE_KEY = "bidagri-fcm-token";
const STORAGE_UID_KEY = "bidagri-fcm-uid";

function canUseNotifications() {
  if (typeof window === "undefined") return false;
  return "Notification" in window && "serviceWorker" in navigator;
}

async function ensureServiceWorker() {
  const existing = await navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js");
  if (existing?.active) return existing;
  const registration =
    existing || (await navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" }));
  if (registration.active) return registration;
  await navigator.serviceWorker.ready;
  return registration;
}

async function requestPermission() {
  if (!canUseNotifications()) return "unsupported";
  const existing = Notification.permission;
  if (existing === "granted") return existing;
  if (existing === "denied") return existing;
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

export function useRegisterPushToken(firebaseUser) {
  const [status, setStatus] = useState("idle");
  const registeringRef = useRef(false);

  useEffect(() => {
    if (!firebaseUser) {
      registeringRef.current = false;
      return;
    }
    if (!canUseNotifications()) {
      setStatus("unsupported");
      return;
    }
    if (registeringRef.current) return;
    registeringRef.current = true;

    const run = async () => {
      setStatus("checking");
      const permission = await requestPermission();
      if (permission !== "granted") {
        setStatus(permission);
        registeringRef.current = false;
        return;
      }

      const messaging = await getClientMessaging();
      if (!messaging) {
        setStatus("unsupported");
        registeringRef.current = false;
        return;
      }

      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
        console.warn("Missing NEXT_PUBLIC_FIREBASE_VAPID_KEY for push notifications.");
        setStatus("missing_vapid");
        registeringRef.current = false;
        return;
      }

      try {
        const readyRegistration = await ensureServiceWorker();
        const fcmToken = await getToken(messaging, {
          vapidKey,
          serviceWorkerRegistration: readyRegistration,
        });
        if (!fcmToken) {
          setStatus("token_failed");
          registeringRef.current = false;
          return;
        }

        const storedToken = localStorage.getItem(STORAGE_KEY);
        const storedUid = localStorage.getItem(STORAGE_UID_KEY);
        if (storedToken === fcmToken && storedUid === firebaseUser.uid) {
          setStatus("registered");
          registeringRef.current = false;
          return;
        }

        const idToken = await firebaseUser.getIdToken();
        const response = await fetch("/api/notifications/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ token: fcmToken, platform: "web" }),
        });

        if (!response.ok) {
          throw new Error(`Registration failed: ${response.status}`);
        }

        localStorage.setItem(STORAGE_KEY, fcmToken);
        localStorage.setItem(STORAGE_UID_KEY, firebaseUser.uid);
        setStatus("registered");
      } catch (error) {
        console.error("Failed to register push token:", error);
        setStatus("failed");
      } finally {
        registeringRef.current = false;
      }
    };

    run();
  }, [firebaseUser]);

  return status;
}
