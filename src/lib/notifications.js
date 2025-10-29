"use server";

import nodemailer from "nodemailer";
import { adminDb, adminMessaging, adminTimestamp } from "@/lib/firebaseAdmin";

const MAIL_QUEUE = "mailQueue";
const PUSH_QUEUE = "pushQueue";

const notificationsDisabled = process.env.NOTIFICATIONS_DISABLED === "true";

const smtpHost = process.env.SMTP_HOST || "";
const smtpPort = Number(process.env.SMTP_PORT || 0) || 587;
const smtpUser = process.env.SMTP_USER || "";
const smtpPass = process.env.SMTP_PASS || "";
const smtpFrom = process.env.SMTP_FROM || smtpUser || "";

let mailTransporter = null;

function normaliseArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function canSendEmailDirect() {
  return Boolean(smtpHost && smtpPort && smtpFrom && (smtpPass || smtpPort === 25));
}

async function getMailer() {
  if (!canSendEmailDirect()) return null;
  if (mailTransporter) return mailTransporter;
  mailTransporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: smtpPass
      ? {
          user: smtpUser,
          pass: smtpPass,
        }
      : undefined,
  });
  return mailTransporter;
}

async function queueEmail({ to, subject, template = "", html, text, data = {}, tags = [] }) {
  if (notificationsDisabled) return null;
  const recipients = normaliseArray(to);
  if (!recipients.length) return null;

  const payload = {
    to: recipients,
    subject: subject || template || "BidAgri update",
    template: template || null,
    data,
    tags: normaliseArray(tags),
    html: html || null,
    text: text || null,
    status: "pending",
    createdAt: adminTimestamp(),
  };

  try {
    return await adminDb.collection(MAIL_QUEUE).add(payload);
  } catch (error) {
    console.error("Failed to queue email notification:", error);
    return null;
  }
}

async function queuePush({ tokens = [], title, body, data = {}, emailTargets = [] }) {
  if (notificationsDisabled) return null;
  const targets = normaliseArray(tokens);
  if (!targets.length && !emailTargets.length) return null;

  const payload = {
    tokens: targets,
    emailTargets,
    title: title || "BidAgri update",
    body: body || "",
    data,
    status: "pending",
    createdAt: adminTimestamp(),
  };

  try {
    return await adminDb.collection(PUSH_QUEUE).add(payload);
  } catch (error) {
    console.error("Failed to queue push notification:", error);
    return null;
  }
}

async function sendEmailNow({ to, subject, html, text }) {
  try {
    const mailer = await getMailer();
    if (!mailer) {
      return false;
    }

    const message = {
      from: smtpFrom,
      to: normaliseArray(to).join(", "),
      subject,
      text: text || html || "",
      html: html || undefined,
    };

    await mailer.sendMail(message);
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

async function sendPushNow({ tokens, title, body, data }) {
  const validTokens = normaliseArray(tokens).filter((token) => token && !token.startsWith("email:"));
  if (!validTokens.length || !adminMessaging) {
    return false;
  }

  try {
    await adminMessaging.sendEachForMulticast({
      tokens: validTokens,
      notification: title || body ? { title, body } : undefined,
      data: Object.entries(data || {}).reduce((acc, [key, value]) => {
        acc[key] = value == null ? "" : String(value);
        return acc;
      }, {}),
    });
    return true;
  } catch (error) {
    console.error("Failed to send FCM message:", error);
    return false;
  }
}

async function deliverEmail(payload) {
  if (notificationsDisabled) return null;
  const recipients = normaliseArray(payload?.to);
  if (!recipients.length) return null;

  const sent = await sendEmailNow({
    to: recipients,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });

  if (!sent) {
    await queueEmail(payload);
  }

  return sent;
}

function chunk(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

async function expandPushTargets(targets) {
  const directTokens = [];
  const emailTargets = new Map();

  targets.forEach((target) => {
    if (!target) return;
    if (typeof target === "string" && target.startsWith("email:")) {
      const email = target.slice("email:".length).toLowerCase();
      if (email) {
        emailTargets.set(email, false);
      }
    } else {
      directTokens.push(target);
    }
  });

  const resolvedTokens = [...new Set(directTokens)];

  if (emailTargets.size) {
    const chunks = chunk([...emailTargets.keys()], 10);
    for (const emailChunk of chunks) {
      try {
        const snapshot = await adminDb
          .collection("notificationTokens")
          .where("email", "in", emailChunk)
          .get();
        snapshot.forEach((doc) => {
          const token = doc.id;
          const docEmail = (doc.data()?.email || "").toLowerCase();
          if (token) {
            resolvedTokens.push(token);
          }
          if (docEmail && emailTargets.has(docEmail)) {
            emailTargets.set(docEmail, true);
          }
        });
      } catch (error) {
        console.error("Failed to resolve email push tokens:", error);
      }
    }
  }

  return {
    tokens: [...new Set(resolvedTokens)],
    unresolvedEmails: [...emailTargets.entries()]
      .filter(([, resolved]) => !resolved)
      .map(([email]) => email),
  };
}

async function deliverPush(payload) {
  if (notificationsDisabled) return null;
  const targets = normaliseArray(payload?.to);
  if (!targets.length) return null;

  const { tokens, unresolvedEmails } = await expandPushTargets(targets);
  const shouldSendNow = tokens.length > 0;
  let sent = false;
  if (shouldSendNow) {
    sent = await sendPushNow({
      tokens,
      title: payload.title,
      body: payload.body,
      data: payload.data,
    });
  }

  if (!sent || unresolvedEmails.length) {
    await queuePush({
      tokens,
      emailTargets: unresolvedEmails,
      title: payload.title,
      body: payload.body,
      data: payload.data,
    });
  }

  return sent;
}

export async function notifyListingPublished({ farmerEmail, farmerName, productTitle, pricePerKg, status }) {
  const subject = `Your listing "${productTitle || "Farmer lot"}" is now live`;
  const friendlyName = farmerName || "Farmer";

  const html = `
    <h2>Assalam o Alaikum ${friendlyName},</h2>
    <p>Aapka listing <strong>${productTitle || "Farmer lot"}</strong> ab BidAgri marketplace par live hai.</p>
    <ul>
      <li>Price: Rs ${Number(pricePerKg || 0).toLocaleString()}/kg</li>
      <li>Status: ${status || "Available"}</li>
    </ul>
    <p>Bidders ko attract karne ke liye photos aur QA data updated rakhein.</p>
    <p>Shukriya!<br/>Team BidAgri</p>
  `;

  await Promise.all([
    deliverEmail({
      to: farmerEmail,
      subject,
      html,
      text: `Assalam o Alaikum ${friendlyName}, aapka listing "${productTitle}" ab live hai. Price Rs ${Number(pricePerKg || 0).toLocaleString()}/kg, status ${status || "Available"}.`,
      template: "listing_published",
      data: {
        farmerName: friendlyName,
        productTitle,
        pricePerKg,
        status,
      },
      tags: ["listing", "publish"],
    }),
    deliverPush({
      to: farmerEmail ? [`email:${farmerEmail}`] : [],
      title: "Listing published",
      body: `${productTitle || "Your lot"} is live at Rs ${Number(pricePerKg || 0).toLocaleString()}/kg.`,
      data: {
        type: "listing_published",
        productTitle,
        status,
      },
    }),
  ]);
}

export async function notifyBidPlaced({
  bidId,
  productTitle,
  pricePerKg,
  quantity,
  buyerEmail,
  buyerName,
  farmerEmail,
  farmerName,
}) {
  const total = Number(pricePerKg || 0) * Number(quantity || 0);
  const buyerFriendlyName = buyerName || (buyerEmail ? buyerEmail.split("@")[0] : "Buyer");
  const farmerFriendlyName = farmerName || "Farmer partner";

  await Promise.all([
    deliverEmail({
      to: buyerEmail,
      subject: `We received your bid on ${productTitle || "a listing"}`,
      html: `
        <h2>Hi ${buyerFriendlyName},</h2>
        <p>Ham ne aapka bid receive kar liya:</p>
        <ul>
          <li>Listing: ${productTitle || "Farmer lot"}</li>
          <li>Price: Rs ${Number(pricePerKg || 0).toLocaleString()}/kg</li>
          <li>Quantity: ${Number(quantity || 0)}</li>
          <li>Total: Rs ${Number(total || 0).toLocaleString()}</li>
        </ul>
        <p>Team BidAgri aapko delivery steps aur QA updates email se bhejti rahegi.</p>
      `,
      text: `Hi ${buyerFriendlyName}, ham ne aapka bid receive kar liya hai. Listing ${productTitle}, price Rs ${Number(pricePerKg || 0).toLocaleString()}/kg, quantity ${Number(quantity || 0)} (total Rs ${Number(total || 0).toLocaleString()}).`,
      template: "bid_confirmation",
      data: {
        buyerName: buyerFriendlyName,
        productTitle,
        pricePerKg,
        quantity,
        total,
        bidId,
      },
      tags: ["bid", "buyer"],
    }),
    deliverEmail({
      to: farmerEmail,
      subject: `New bid on ${productTitle || "your listing"}`,
      html: `
        <h2>Salam ${farmerFriendlyName},</h2>
        <p>${buyerFriendlyName} ne aapki listing par bid lagayi hai:</p>
        <ul>
          <li>Listing: ${productTitle || "Farmer lot"}</li>
          <li>Bid price: Rs ${Number(pricePerKg || 0).toLocaleString()}/kg</li>
          <li>Quantity: ${Number(quantity || 0)}</li>
          <li>Expected payout: Rs ${Number(total || 0).toLocaleString()}</li>
        </ul>
        <p>Dashboard se buyer ka contact details aur aglay steps dekh sakte hain.</p>
      `,
      text: `${farmerFriendlyName}, ${buyerFriendlyName} ne ${productTitle} par bid lagayi hai. Price Rs ${Number(pricePerKg || 0).toLocaleString()}/kg, quantity ${Number(quantity || 0)}, total Rs ${Number(total || 0).toLocaleString()}.`,
      template: "bid_alert_farmer",
      data: {
        farmerName: farmerFriendlyName,
        productTitle,
        pricePerKg,
        quantity,
        total,
        bidId,
        buyerName: buyerFriendlyName,
      },
      tags: ["bid", "farmer"],
    }),
    deliverPush({
      to: buyerEmail ? [`email:${buyerEmail}`] : [],
      title: "Bid submitted",
      body: `Your bid on ${productTitle || "a listing"} is on record.`,
      data: {
        type: "bid_submitted",
        bidId,
        productTitle,
      },
    }),
    deliverPush({
      to: farmerEmail ? [`email:${farmerEmail}`] : [],
      title: "New bid received",
      body: `${buyerFriendlyName} bid Rs ${Number(pricePerKg || 0).toLocaleString()}/kg.`,
      data: {
        type: "bid_received",
        bidId,
        productTitle,
      },
    }),
  ]);
}

export async function notifyDeliveryUpdated({
  deliveryId,
  productTitle,
  buyerEmail,
  buyerName,
  farmerEmail,
  farmerName,
  stepLabel,
  status,
  eta,
}) {
  const subject = `Delivery update: ${productTitle || "Order"}`;
  const bodyLine = stepLabel
    ? `${stepLabel} • ${status === "completed" ? "Completed" : "Updated"}`
    : `Status changed to ${status || "pending"}`;

  const buyerFriendlyName = buyerName || (buyerEmail ? buyerEmail.split("@")[0] : "Buyer");
  const farmerFriendlyName = farmerName || "Farmer partner";

  await Promise.all([
    deliverEmail({
      to: [buyerEmail, farmerEmail],
      subject,
      html: `
        <h2>Delivery update: ${productTitle || "Order"}</h2>
        <p>${bodyLine}${eta ? ` (ETA: ${eta})` : ""}</p>
        <p>Buyer: ${buyerFriendlyName}</p>
        <p>Farmer: ${farmerFriendlyName}</p>
        <p>Delivery ID: ${deliveryId}</p>
      `,
      text: `Delivery update (${productTitle || "Order"}): ${bodyLine}${eta ? `, ETA ${eta}` : ""}. Buyer ${buyerFriendlyName}, Farmer ${farmerFriendlyName}, Delivery ID ${deliveryId}.`,
      template: "delivery_update",
      data: {
        deliveryId,
        productTitle,
        buyerName: buyerFriendlyName,
        farmerName: farmerFriendlyName,
        stepLabel,
        status,
        eta,
      },
      tags: ["delivery"],
    }),
    deliverPush({
      to: [
        buyerEmail ? `email:${buyerEmail}` : null,
        farmerEmail ? `email:${farmerEmail}` : null,
      ].filter(Boolean),
      title: "Delivery timeline updated",
      body: `${productTitle || "Order"} • ${bodyLine}${eta ? ` • ETA ${eta}` : ""}`,
      data: {
        type: "delivery_update",
        deliveryId,
        stepLabel,
        status,
      },
    }),
  ]);
}
