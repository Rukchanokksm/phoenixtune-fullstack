# new-component

Create a new React component following project patterns.

## Arguments
`$ARGUMENTS` — e.g. "TuneFilterBar — filter bar for the tunes list page, goes in src/components/tune/"

## Server vs Client

**Server (no directive):** fetches from Supabase server client, no interactivity, no hooks, no state.  
**Client (`"use client"`):** uses Zustand stores, DOM event handlers, `useState`/`useEffect`, browser Supabase client.

## File Locations

| Folder | Purpose |
|---|---|
| `src/components/tune/` | tune-related |
| `src/components/game/` | game/car browsing |
| `src/components/layout/` | Navbar, Footer |
| `src/components/profile/` | user profile |
| `src/components/providers/` | context/initializer wrappers |
| `src/components/ads/` | ad slots |

## Key Conventions

- **Named exports only** — no default exports.
- **Class merging** — always `cn()` from `@/lib/utils`.
- **i18n** — use `const { t } = useLanguage()` for all user-visible text. Add keys to both `en` and `th` in `src/lib/i18n/messages.ts` and update the `Schema` type.
- **Types** — import from `src/types/index.ts`; do not redeclare.
- **Premium gate** — `const isPremium = useUserStore(s => s.isPremium())`. Flag-only: `import { PREMIUM_ENABLED } from "@/lib/premium"`.
- Nav entries gated by flag: `...(PREMIUM_ENABLED ? [{ label, href }] : [])`.

## After Writing

`npm run build` — verify no TypeScript errors.
