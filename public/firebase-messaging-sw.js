importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyD_-KaKtq7FxTyQPFTSnYAXYu4RFaIysZw",
  authDomain: "agribids-4e05c.firebaseapp.com",
  projectId: "agribids-4e05c",
  storageBucket: "agribids-4e05c.firebasestorage.app",
  messagingSenderId: "703851803499",
  appId: "1:703851803499:web:5082375b73ac8379b9922e",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload?.notification?.title || "BidAgri update";
  const body = payload?.notification?.body || "New notification received.";
  const data = payload?.data || {};

  self.registration.showNotification(title, {
    body,
    data,
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(target);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(target);
      }
      return null;
    })
  );
});
