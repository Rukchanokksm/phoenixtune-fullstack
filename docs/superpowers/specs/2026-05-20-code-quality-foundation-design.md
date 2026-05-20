# Code Quality Foundation — Design Spec

**Date:** 2026-05-20
**Scope:** Standard (แนว B) — ESLint + Prettier + Vitest for pure functions, `npm run check` gate, `.bak` cleanup.

## Goal

Bring the project from "TypeScript strict only, no linter, no formatter, no tests" to a baseline where:

1. A single `npm run check` command catches lint errors, type errors, formatting drift, and broken pure-function logic.
2. Code style is consistent across the codebase (currently `tuneStore.ts` uses 2-space/single-quote while `calculator.ts` uses 4-space/double-quote).
3. The tuning math in `lib/calculator.ts` cannot silently regress — it's the one piece of logic where a wrong number is worse than a crash.

Out of scope: CI workflow, pre-commit hooks, component/API integration tests (those are แนว C territory; revisit when there is a contributor or real user volume).

## Tooling Stack

| Concern | Package(s) | Notes |
| --- | --- | --- |
| Linter | `eslint`, `eslint-config-next`, `eslint-config-prettier`, `@typescript-eslint/eslint-plugin` (via Next preset) | Flat config (`eslint.config.mjs`). Next 16 deprecates `next lint` — run ESLint directly. |
| Formatter | `prettier` | Defaults: 2-space indent, double quotes, semicolons, 80-char width, trailing commas (all). |
| Test runner | `vitest` | No jsdom/happy-dom — pure-function tests only. |
| Type check | `tsc --noEmit` | Already implicit in `next build`; the script just exposes it standalone. |

**Config files added:**

- `eslint.config.mjs` — flat config; extends `eslint-config-next` + `eslint-config-prettier`; rule strictness = Next defaults + `@typescript-eslint/recommended` (NOT strict).
- `.prettierrc.json` — explicit Prettier defaults so the choice is documented.
- `.prettierignore` — `node_modules`, `.next`, `next-env.d.ts`, `tsconfig.tsbuildinfo`, `public/**`, `supabase/migrations/**` (SQL not Prettier's job).
- `vitest.config.ts` — minimal; `test.environment = "node"`, `test.include = ["src/**/*.test.ts"]`.
- `.git-blame-ignore-revs` — list the format-all commit SHA so blame skips it.

## Code Style (Prettier)

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "all",
  "printWidth": 80,
  "arrowParens": "always"
}
```

Rationale: Prettier defaults. Lowest cognitive load for new contributors, matches the broader TS/React ecosystem, and avoids the no-semi debate.

## Test Scope

### `src/lib/calculator.ts`

The single highest-value test target — pure functions, well-defined inputs, and the wrong numbers ship silently.

| Test group | What it asserts |
| --- | --- |
| Smoke (18 cases) | `calculateFH6Tune` returns a valid `TuneResult` for every (6 disciplines × 3 drivetrains) combo without throwing. |
| Named values | `powerKw=300 → gear.finalDrive ≈ 4.25`; `powerKw=447 → gear.finalDrive ≈ 3.92` (from the FH6 guide). |
| Invariants | `alignment.toeF === 0 && alignment.toeR === 0` everywhere; `aero.balance === 0` when discipline is `drag`; `tires.pressureF/R ∈ [1.0, 3.8]` always. |
| Drag-specific | RWD/AWD in drag → `tires.pressureR < tires.pressureF` (squat-friendly). |
| Aero balance | `track` discipline → `aero.balance` in `[0.40, 0.50]`. |
| Version | `version === "2.0"`. |

### `src/lib/i18n/timeAgo.ts`

Locale-aware relative time. The risk is silent regression of Thai phrasing.

| Test group | What it asserts |
| --- | --- |
| Buckets | Outputs differ correctly across seconds / minutes / hours / days / weeks / months / years. |
| EN locale | Returns English strings; pluralization (`1 minute` vs `5 minutes`) correct. |
| TH locale | Returns Thai strings; no English fallback for any bucket. |

### Out of scope

- Component tests (would need RTL + happy-dom).
- API route tests (would need a Supabase test instance or extensive mocking).
- Snapshot tests of `TuneResult` (named-value tests already pin the math).

## Scripts (`package.json`)

```json
{
  "scripts": {
    "dev":          "next dev --webpack",
    "build":        "next build",
    "start":        "next start",
    "lint":         "eslint .",
    "lint:fix":     "eslint . --fix",
    "format":       "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck":    "tsc --noEmit",
    "test":         "vitest run",
    "test:watch":   "vitest",
    "check":        "npm run lint && npm run typecheck && npm run format:check && npm run test"
  }
}
```

`npm run check` is the single gate before commit/PR. Fast enough to run locally; no watch mode needed.

## Rollout Order

Each step is one commit. The format-all commit (#4) is intentionally isolated so it can be skipped in `git blame` via `.git-blame-ignore-revs`.

| # | Commit message | What changes | Why isolated |
| --- | --- | --- | --- |
| 1 | `chore: remove .bak files` | Delete `src/app/page.tsx.bak`, `src/app/(main)/_page.tsx.bak`, `src/middleware.ts.bak`. | Trivial, but easier to revert if any was secretly load-bearing. |
| 2 | `chore: add ESLint with next + typescript-eslint recommended` | Add ESLint deps, `eslint.config.mjs`, `lint` + `lint:fix` scripts. Run `lint:fix` and fold any auto-fixed changes into this commit. | If ESLint surfaces real issues that need manual fixes, fix them in a follow-up commit so the tooling-add commit stays clean. |
| 3 | `chore: add Prettier config` | Add `prettier` + `eslint-config-prettier`, `.prettierrc.json`, `.prettierignore`, `format` + `format:check` scripts. Do NOT run `format` yet. | Verify the config in isolation; the format-all diff is the next commit. |
| 4 | `style: format codebase with Prettier` | Run `prettier --write .` and commit the result. Capture the resulting SHA — it gets referenced in commit #5. | Massive diff but pure formatting — reviewers can trust it's a no-op. |
| 5 | `chore: add .git-blame-ignore-revs and Vitest with calculator.ts tests` | Add `.git-blame-ignore-revs` containing the SHA from commit #4, then add `vitest`, `vitest.config.ts`, `src/lib/calculator.test.ts`, and `test` + `test:watch` + `typecheck` scripts. | The ignore-revs file can only be added AFTER commit #4 exists (SHA must be known). Combined with Vitest so we don't add a single-line-file commit. |
| 6 | `test: add timeAgo tests + check script + CLAUDE.md update` | Add `src/lib/i18n/timeAgo.test.ts`, the `check` script, and update CLAUDE.md (remove the "No test runner or linter configured" line; add a short Commands section entry for `check`). | CLAUDE.md update belongs with the last step so it reflects the final state. |

## ESLint Rule Strictness

Use Next's recommended preset + `@typescript-eslint/recommended` (not `recommended-strict`). Rationale:

- Strict adds rules like `no-explicit-any` as `error` which would block the build until every `any` is removed — out of scope for this round.
- Next's preset already covers the most useful runtime/correctness rules (`react-hooks/exhaustive-deps`, `react/jsx-key`, etc.).
- If real issues surface during commit #2, escalate specific rules rather than the whole preset.

## Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| ESLint finds many violations and commit #2 balloons. | If `lint:fix` doesn't clear them, switch the offending rule to `warn`, file a follow-up, and proceed. |
| Prettier disagrees with intentional formatting (e.g., aligned table comments in `calculator.ts`). | Accept the reformatting — consistency > aesthetics. Use `// prettier-ignore` only where alignment is semantically important (none identified yet). |
| `vitest` discovers a real bug in `calculator.ts`. | Good — fix it in a follow-up commit before merging. The whole point of step 5 is to catch this. |
| `npm run check` becomes slow as the test suite grows. | Not a concern at this scope; revisit if total runtime exceeds ~10s. |

## Verification

After all 6 commits:

1. `npm run check` passes from a clean clone (`rm -rf node_modules && npm install`).
2. `npm run build` still passes (sanity — Prettier shouldn't have broken anything).
3. `git log --oneline` shows the 6 commits in order with sensible messages.
4. `.git-blame-ignore-revs` contains the format-all SHA.
5. CLAUDE.md no longer claims "No test runner or linter configured".
