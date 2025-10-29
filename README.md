This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment variables

Create a `.env.local` with any secrets you need (see `.env.example` for all required keys). For Firebase Admin access you must paste your service-account credentials:

```
FIREBASE_ADMIN_PROJECT_ID=your-firebase-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=service-account@example.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nABC123...\\n-----END PRIVATE KEY-----\\n"
```

If you enable S3 uploads (see below), you'll need at minimum:

```
AWS_S3_REGION=ap-south-1
AWS_S3_BUCKET=your-bucket-name
AWS_S3_ACCESS_KEY_ID=AKIAXXXX
AWS_S3_SECRET_ACCESS_KEY=xxxxxxxx
# Optional override if you use CloudFront/custom domain
# AWS_S3_PUBLIC_URL=https://cdn.yourdomain.com
```

#### Notifications (SMTP + FCM)

Email + push alerts require SMTP plus Firebase Cloud Messaging configuration:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=alerts@example.com
SMTP_PASS=app-password-without-spaces
SMTP_FROM=alerts@example.com
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-firebase-web-push-key
```

- Gmail use-case: enable 2-Step Verification → generate an App Password (`Google Account ▸ Security ▸ App passwords`). Paste the 16 character password **without** spaces.
- VAPID key: Firebase Console ▸ Project settings ▸ Cloud Messaging ▸ Web configuration.
- Set `NOTIFICATIONS_DISABLED=true` if you need to silence outbound email/push while developing locally.

Restart `npm run dev` after editing `.env.local` so the runtime picks up the changes.

Firestore (for farmer submissions, buyer leads, contact messages, and published products) uses the existing Firebase web config baked into `src/lib/firebase.js`. Make sure Firestore is enabled in your Firebase project and that rules allow your server routes (running with the Firebase SDK) to read/write the relevant collections (`farmerSubmissions`, `products`, `buyerRegistrations`, `contactMessages`).

## Checkout Mock Flow (Frontend)

This repo includes a polished mock checkout flow built with Next.js App Router and Tailwind CSS.

- Pages:
  - `src/app/checkout/page.js`: Summary + payment method selection
  - `src/app/checkout/receipt/[id]/page.js`: Confirmation receipt
- Components:
  - `src/components/OrderStepper.jsx`: Progress indicator (Review → Payment → Confirm)
  - `src/components/CheckoutSummary.jsx`: Line items, fees, promo code
  - `src/components/PaymentMethods.jsx`: JazzCash/Easypaisa/Card/NetBanking (mocked)

Notes:
- No real payment providers are integrated. The flow simulates success/failure (~20% failure chance) and stores a receipt payload in `localStorage` keyed by `receipt:{orderId}`.
- Designed to be ready for SDK integration later: the pay handler centralizes the flow and builds a receipt payload.

### Manual Test Checklist

Happy Path:
- Navigate to `/checkout`.
- Review items and fees; try applying promo `BID10` (should reduce service fee by ~10%).
- Select each payment method; verify mock details show.
- Click `Confirm & Pay`; on success, you should be redirected to the receipt page.
- On the receipt page, verify:
  - Status shows as `Paid`.
  - Items, fees, and total are correct.
  - Copy order ID button works; print button opens the browser print dialog.
  - Continue shopping returns to home.

Failure Path:
- From `/checkout`, click `Confirm & Pay` until a failure occurs (simulated).
- Verify a red error box appears with `Payment Error` and descriptive message.
- Click `Retry Payment` to attempt again; confirm that the button enters a loading state.
- Optionally `Dismiss` the error.

Accessibility & Responsiveness:
- Tab through inputs and buttons; radio selection for payment methods should be keyboard accessible.
- Check on mobile widths; cards and summary stack vertically without overlap; CTA remains visible.

Trust & Help:
- Confirm trust badges render near the CTA and security copy is present.
- Click `Contact support` link to ensure help is discoverable.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Notifications demo

This project includes a client-side notifications system with a global provider, header bell, dropdown panel, and toasts for high-priority events.

- Bell shows unread count; click to open a keyboard-accessible panel.
- Panel lists notifications grouped by day with read/unread state and actions.
- High-priority events show toasts with an accessible aria-live region.

### Simulate events

- Use the "Simulate" button in the header (desktop and mobile menus) to trigger sample notifications. This calls a client-side publisher and will increment the badge, list items, and show toasts for high priority.
- Alternatively, fetch sample payloads from `GET /api/notify/mock` for local testing.

### Accessibility

- Panel is a focus-trapped dialog, closable with Escape.
 - Screen readers announce toasts via `aria-live=assertive`.
 - All controls have keyboard focus styles and ARIA labels.

## Media uploads with AWS S3

Farmer onboarding now uploads supporting documents directly to Amazon S3 via presigned URLs.

1. Create an S3 bucket (recommended: enable public-read on the `uploads/` prefix or serve via CloudFront).
2. Create an IAM user with `s3:PutObject`/`s3:GetObject` on that bucket and note the access key/secret.
3. Add the S3 environment variables (above) to `.env.local` and restart `npm run dev`.
4. The client `FileUploader` component calls `/api/storage/presign` to get a signed `PUT` URL, uploads the file, then stores the returned `key`/`publicUrl` alongside metadata.
5. Submissions are persisted in `var/data/farmerRegistrations.json`; each record now includes document metadata (`key`, `url`, `type`, `size`) so admins can review assets securely.

If you serve media through a CDN, set `AWS_S3_PUBLIC_URL` to the CDN origin so the dashboard displays the correct link.

## Firestore data flow

- Farmer onboarding and quick forms now write to `farmerSubmissions` in Firestore with a `pending_review` status.
- Admin approval uses `/api/admin/farmers/publish` to set status to `published` and create a corresponding document in the `products` collection.
- `/api/products` exposes published listings for the marketplace UI; `/api/products?admin=1` returns everything for dashboard analytics.
- Buyer and contact forms persist to `buyerRegistrations` and `contactMessages` collections respectively.

Make sure your Firestore security rules allow the Next.js server (running with the Firebase client SDK) to read/write these collections. For local development during prototyping you can start with permissive rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write;
    }
  }
}
```

Harden them before shipping to production by restricting access to authenticated admin users only.

### Required composite indexes

Some dashboard/API queries combine status filters with `createdAt` ordering, so Firestore needs composite indexes. The minimal set is checked in under `firestore.indexes.json`:

- `farmerSubmissions`: `status ASC` + `createdAt DESC` (used by admin farmer review table)
- `products`: `status ASC` + `createdAt DESC` (used by admin catalog filter + buyer fallback query)
- `deliveries`: `buyerUid ASC` + `createdAt DESC`
- `deliveries`: `farmerUid ASC` + `createdAt DESC`

Install them via Firebase CLI (`firebase deploy --only firestore:indexes`) or paste them in the Firebase console’s Indexes tab before hitting the protected routes.

For local dry-runs you can spin up the Firestore emulator:

```
npx firebase emulators:exec --project demo-bidagri "echo rules-ok"
```

> The emulator requires Java (`java -version`); install a JDK if the command fails.

### Security rules

`firestore.rules` now limits sensitive collections to authenticated users:

- `users/{uid}` & `watchlists/{uid}`: only that signed-in user can read/write.
- `buyerDashboards/{uid}` & `farmerDashboards/{uid}`: owners can read; writes are restricted to admins (farmer dashboards) or owners/admins (buyer dashboards).
- `farmerSubmissions`, `buyerRegistrations`, `contactMessages`, and `products` writes are admin-only.
- `deliveries/{id}`: readable by the buyer, farmer, or admins; writes remain admin-only (server-side).
- `notificationTokens/{token}`: users can create/delete their own tokens; admins can view every token for observability.
- `mailQueue` / `pushQueue`: admin-only (these collections are append-only logs for failed notification attempts).

Deploy them together with the indexes:

```bash
npx firebase use <project-id>
npx firebase deploy --only firestore:indexes,firestore:rules
```

> Admin detection defaults to any account whose custom claim `role` is set to `admin` or whose email ends with `@bidagri.com`. Adjust the regex in `firestore.rules` if your ops emails differ.

Additional operational runbooks live in [`docs/operations.md`](docs/operations.md).

## Product Search & Filters

This project includes an advanced client-side product search with typeahead, faceted filters, sorting, and URL-backed state.

- Typeahead search in `src/components/SearchBar.jsx` with keyboard navigation and debounced input.
- Filters sidebar/drawer in `src/components/FiltersSidebar.jsx` and `src/components/FiltersDrawer.jsx`.
- Price range slider in `src/components/PriceRangeSlider.jsx` (accessible inputs + dual range handles).
- Status chips in `src/components/StatusChips.jsx`.
- URL query state management in `src/hooks/useQueryFilters.js`.
- Integration with product list in `src/components/ProductCatalog.jsx`.

### Manual Test Checklist

Run `npm run dev` and open `/products`.

- Typeahead suggests product titles as you type; Enter selects and applies; Up/Down navigates.
- Search is debounced; fast typing doesn’t flicker results.
- Change sort to Newest / Price Low→High / Price High→Low.
- Open "More filters" on mobile to reveal drawer; close via ✕ or backdrop.
- Set Category, Availability, and Price range; click Apply to update results and URL.
- Combine facets; results reflect all filters together.
- Clear all resets filters and removes query params.
- URL shares the current state; refresh keeps filters applied.
- Counts appear next to status and categories where available.

### Notes

- Filtering is client-side against `src/data/products.js`. Hooks are modular for future API integration.
- Query params used: `q`, `category`, `subcategory`, `status`, `minPrice`, `maxPrice`, `sort`.

## End-to-end QA

Playwright-driven regression covers the critical marketplace pipeline:

1. Admin publishes a farmer submission via `/api/admin/farmers/publish`.
2. Buyer places a bid which spawns a delivery record.
3. Delivery timeline update is applied and validated through `/api/deliveries/:id`.

Setup:

```
# Install Playwright browsers (first run only)
npx playwright install --with-deps

# Run the suite (skips launching the Next.js dev server)
PLAYWRIGHT_SKIP_SERVER=1 npm run test:e2e
```

The test uses Firebase Admin APIs. To execute against a sandbox Firestore project provide a service account (`firebaseServiceAccount.json`) and opt-in explicitly:

```
E2E_FIREBASE=true PLAYWRIGHT_SKIP_SERVER=1 PLAYWRIGHT_BASE_URL=https://your-env npm run test:e2e
```

The runner seeds temporary submissions/products/deliveries and removes them afterwards, but always target a staging project (or emulator) to avoid touching production data.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
