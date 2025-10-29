# Operations & Migration Helpers

## Firestore configuration

```
# Select project
npx firebase use <project-id>

# Deploy rules and indexes together
npx firebase deploy --only firestore:rules,firestore:indexes
```

To sanity-check rule compilation without touching production, run the emulator suite (requires Java):

```
npx firebase emulators:exec --project demo-bidagri "echo rules-ok"
```

## Notification queue monitor

The Firestore collections `mailQueue` and `pushQueue` capture failed email/push sends. Attach a scheduled Cloud Function or cron worker that:

1. Reads `status === "pending"` documents.
2. Retries delivery via SMTP/FCM.
3. Marks each document with `status: "sent"` or an `error` payload.

Until the worker exists, check those collections after deployments so issues do not go unnoticed.

## Backups

- Enable automated Firestore backups or export snapshots as part of your deployment pipeline.
- Keep a secure copy of `.env.local` (SMTP + FCM config) in your secret manager.

## Regression testing

```
npx playwright install --with-deps
PLAYWRIGHT_SKIP_SERVER=1 npm run test:e2e
```

For full integration against a staging project:

```
E2E_FIREBASE=true PLAYWRIGHT_SKIP_SERVER=1 PLAYWRIGHT_BASE_URL=https://staging.example.com npm run test:e2e
```

The test seeds temporary submissions/products/deliveries and cleans them up automatically.
