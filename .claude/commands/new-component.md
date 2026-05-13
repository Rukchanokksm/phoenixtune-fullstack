# new-component

Create a new React component for this project following the established patterns.

## Arguments

`$ARGUMENTS` — describe what the component does and where it lives, e.g. "TuneFilterBar — filter bar for the tunes list page, goes in src/components/tune/"

## Decision: Server vs Client Component

**Use a Server Component (default, no directive)** when:
- Fetching data directly from Supabase server client
- No interactivity, event handlers, or browser APIs
- No React state or effects

**Add `"use client"` at the top** when:
- Component reads from Zustand stores (`useTuneStore`, `useUserStore`)
- Has `onClick`, `onChange`, `onSubmit` or any DOM event handler
- Uses `useState`, `useEffect`, `useRef`, or other React hooks
- Uses the browser Supabase client (`@/lib/supabase/client.ts`)

## Component Structure

```tsx
// Server component — no directive needed
import type { Tune } from "@/types"
import { cn } from "@/lib/utils"

interface Props {
  // define props here
}

export function ComponentName({ }: Props) {
  return (
    <div className={cn("...")}>
      {/* content */}
    </div>
  )
}
```

```tsx
"use client"
// Client component
import { useTuneStore, selectFilters } from "@/stores/tuneStore"
import { useUserStore, selectUser } from "@/stores/userStore"

export function ComponentName() {
  const filters = useTuneStore(selectFilters)
  const user = useUserStore(selectUser)
  // ...
}
```

## Key Conventions

- **Named exports only** — no default exports for components.
- **Path alias** — use `@/` for all imports from `src/` (e.g. `@/types`, `@/lib/utils`, `@/stores/tuneStore`).
- **Class merging** — always use `cn()` from `@/lib/utils` when combining conditional classes.
- **Supabase in client components** — use `createClient()` from `@/lib/supabase/client.ts` (browser-safe). Never import the server client in a `"use client"` file.
- **File location**:
  - `src/components/tune/` — tune-related components
  - `src/components/game/` — game/car browsing components
  - `src/components/layout/` — Navbar, Footer, wrappers
  - `src/components/profile/` — user profile components
  - `src/components/providers/` — context/initializer wrappers
  - `src/components/ads/` — ad slots
- **Domain types** live in `src/types/index.ts`. Import from there; do not redeclare.

## Premium Gate Pattern

When a feature requires premium:
```tsx
const isPremium = useUserStore((s) => s.isPremium())
if (!isPremium) return <PremiumUpsell />
```

## After Writing

Run `npm run build` to verify the component has no TypeScript errors before reporting done.
