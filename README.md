This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
