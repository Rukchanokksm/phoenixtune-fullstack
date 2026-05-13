# Tunix — Racing Tune Hub

Community platform where racing game players share car tuning configurations.
Built with Next.js 16 (App Router) + Supabase + Stripe + Zustand.

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Database & Auth:** Supabase (PostgreSQL + RLS)
- **Payments:** Stripe (premium subscriptions)
- **State:** Zustand
- **Styling:** Tailwind CSS v4 + inline styles
- **i18n:** Custom lightweight (English default, Thai secondary)

## Local development

```bash
cp .env.example .env.local   # then fill in real values
npm install
npm run dev                  # http://localhost:3000
```

## Build

```bash
npm run build
npm run start
```

## Deploy to Vercel

1. Push the repo to GitHub.
2. Import the project on [vercel.com/new](https://vercel.com/new).
3. Set all environment variables from `.env.example` in the Vercel project settings.
4. Add your production domain in Supabase → **Auth** → **URL Configuration** → Site URL + Redirect URLs.
5. Configure the Stripe webhook endpoint to point to `https://your-domain/api/webhooks/stripe`
   and update `STRIPE_WEBHOOK_SECRET` with the new signing secret.
6. Deploy.

The `vercel.json` already wires a daily cron job for temp-image cleanup.

## Required environment variables

See `.env.example` for the full list. Critical ones:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (RLS-respecting) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-only** key, bypasses RLS — never expose |
| `STRIPE_SECRET_KEY` | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for `/api/webhooks/stripe` |
| `STRIPE_PREMIUM_PRICE_ID` | Stripe price ID for the premium plan |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public Stripe key (browser-safe) |

## Project layout

```
src/
├── app/
│   ├── (auth)/         login + register pages (no shared layout)
│   ├── (main)/         all primary pages (Navbar + Footer)
│   ├── api/            REST routes (Supabase-backed)
│   └── layout.tsx      root layout — initializes user + LanguageProvider
├── components/
│   ├── layout/         Navbar, Footer, LanguageSwitcher
│   ├── tune/           tune cards, forms, parameter display
│   ├── game/           game/car browsing
│   └── providers/      UserInitializer
├── lib/
│   ├── supabase/       browser + server Supabase clients
│   ├── i18n/           LanguageProvider + message dictionaries
│   ├── calculator.ts   FH5 auto-tune engine
│   └── stripe.ts       Stripe SDK init
├── stores/             Zustand stores (tune, user)
├── types/              shared TypeScript types
└── proxy.ts            session refresh + protected-route guard (Next.js 16)
```

## Protected routes

Enforced in `src/proxy.ts`:
- `/tunes/new` — create a tune
- `/profile/*` — user profile pages
- `/saved` — bookmarked tunes
- `/settings` — user settings

## Database migrations

Migration files live in `supabase/migrations/` and are applied via the Supabase
dashboard or the local `scripts/migrate.js` helper.

## Internationalization

The language switcher in the Navbar toggles between English (default) and Thai.
Translations are stored in `src/lib/i18n/messages.ts`. The selected locale is
persisted in `localStorage`. To extend coverage, add keys to the `Schema` type
and translations to both `en` and `th` blocks.
