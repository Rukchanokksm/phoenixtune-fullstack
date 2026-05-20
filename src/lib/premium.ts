// ─── Premium feature flag ────────────────────────────────────────────────────
//
// Premium features are currently HELD — we'll enable them once user base is
// large enough to justify the billing/support overhead.
//
// To enable premium features site-wide:
//   1. Set env var: NEXT_PUBLIC_PREMIUM_ENABLED=true
//   2. Redeploy
//
// While disabled:
//   - useUserStore.isPremium() always returns false (no PRO badge)
//   - "Saved Tunes" link is hidden from the user menu
//   - /saved page shows a "Coming Soon" placeholder
//   - Backend (Stripe webhook, DB) is left untouched — re-enabling is one
//     env var change with zero data migration.

export const PREMIUM_ENABLED =
  process.env.NEXT_PUBLIC_PREMIUM_ENABLED === "true";
