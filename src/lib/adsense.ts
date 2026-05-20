// ─── Google AdSense slot map ─────────────────────────────────────────────────
//
// After your site is approved by AdSense, create one Ad Unit per slot below
// in the AdSense dashboard and paste the numeric slot ID (e.g. "1234567890").
//
// Keys here MUST match the `slot` prop passed to <AdUnit slot="..."/>.
// Leave a value empty ("") to disable that slot — it will render the
// dev placeholder instead of a real ad.

export const AD_SLOTS: Record<string, string> = {
  // Homepage
  "homepage-hero-banner": "",

  // Tunes list / detail
  "tune-list-infeed": "",
  "tune-detail-banner": "",
  "tune-detail-sidebar": "",
  "tunes-new-top": "",
  "tunes-new-bottom": "",

  // Per-game pages (dynamic slug fills in)
  "game-forza-horizon-5-mid": "",
  "game-forza-horizon-5-bottom": "",
  "game-the-crew-motorfest-mid": "",
  "game-the-crew-motorfest-bottom": "",
  "game-nfs-unbound-mid": "",
  "game-nfs-unbound-bottom": "",

  // Car detail
  "car-detail-infeed": "",

  // Forums
  "forums-hub-banner": "",
  "forum-post-banner": "",

  // Calculator
  "calculator-form-bottom": "",
  "calculator-result-bottom": "",
};

/** Look up the real numeric slot ID for a given slot key. */
export function resolveSlotId(key: string): string {
  return AD_SLOTS[key] ?? "";
}
