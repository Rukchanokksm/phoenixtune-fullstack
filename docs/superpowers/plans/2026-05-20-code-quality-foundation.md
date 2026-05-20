# Code Quality Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the project from "TypeScript strict only, no linter, no formatter, no tests" to a baseline where `npm run check` catches lint errors, type errors, formatting drift, and broken pure-function logic.

**Architecture:** Six commits in strict order — cleanup, ESLint, Prettier config (no apply), Prettier format-all, Vitest+calculator tests+ignore-revs, timeAgo tests+check script+CLAUDE.md. The format-all commit is isolated so `git blame` can skip it via `.git-blame-ignore-revs`.

**Tech Stack:** ESLint flat config (`eslint-config-next`), Prettier 3 (defaults), Vitest (node env, no jsdom). Existing: Next.js 16.2.4, React 19.2.4, TypeScript 5 strict.

**Spec:** `docs/superpowers/specs/2026-05-20-code-quality-foundation-design.md`

---

## File Structure

**Create:**
- `eslint.config.mjs` — flat config, Next preset + Prettier compat
- `.prettierrc.json` — Prettier defaults made explicit
- `.prettierignore` — skip `node_modules`, `.next`, build artifacts, SQL migrations
- `.git-blame-ignore-revs` — references the format-all commit SHA
- `vitest.config.ts` — node env, `src/**/*.test.ts` glob
- `src/lib/calculator.test.ts` — characterization tests for `calculateFH6Tune`
- `src/lib/i18n/timeAgo.test.ts` — characterization tests for `timeAgo`

**Modify:**
- `package.json` — scripts + deps (one diff at the end of each tooling task)
- `CLAUDE.md` — update Commands section, remove "No test runner or linter" line (Task 6)
- All `*.ts` / `*.tsx` files (Task 4 — Prettier formatting only)

**Delete:**
- `src/app/page.tsx.bak`
- `src/app/(main)/_page.tsx.bak`
- `src/middleware.ts.bak`

---

## Task 1: Remove `.bak` files

Trivial cleanup, but isolated so it can be reverted if any `.bak` was secretly load-bearing.

**Files:**
- Delete: `src/app/page.tsx.bak`
- Delete: `src/app/(main)/_page.tsx.bak`
- Delete: `src/middleware.ts.bak`

- [ ] **Step 1: Confirm baseline `npm run build` passes**

Run: `npm run build`
Expected: build succeeds. (If it fails, fix the underlying issue before continuing — none of these tasks should mask a pre-existing breakage.)

- [ ] **Step 2: Confirm no source file imports any `.bak` file**

Run (PowerShell): `Select-String -Path src\**\*.ts,src\**\*.tsx -Pattern '\.bak' -SimpleMatch`
Expected: no matches.

- [ ] **Step 3: Delete the three files**

```bash
rm src/app/page.tsx.bak
rm "src/app/(main)/_page.tsx.bak"
rm src/middleware.ts.bak
```

- [ ] **Step 4: Verify build still passes**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove .bak files

Leftover from earlier migrations; no source imports them."
```

---

## Task 2: ESLint setup

Adds ESLint with the Next.js 16 flat-config preset and the `lint` / `lint:fix` scripts. Does NOT add Prettier yet (Task 3).

**Files:**
- Create: `eslint.config.mjs`
- Modify: `package.json` (add devDeps + scripts)

- [ ] **Step 1: Install ESLint packages**

```bash
npm install --save-dev eslint eslint-config-next @eslint/eslintrc
```

Expected: packages added to `devDependencies`. No errors. `package-lock.json` updated.

- [ ] **Step 2: Create `eslint.config.mjs`**

```js
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "next-env.d.ts",
      "tsconfig.tsbuildinfo",
      "public/**",
    ],
  },
];

export default eslintConfig;
```

- [ ] **Step 3: Add `lint` + `lint:fix` scripts**

Open `package.json`. In the `scripts` object, after `"start": "next start",`, add:

```json
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
```

- [ ] **Step 4: Run lint to see current violations**

Run: `npm run lint`
Expected: either passes clean (✅ proceed to Step 6), or surfaces violations (proceed to Step 5).

- [ ] **Step 5: Auto-fix what's auto-fixable**

Run: `npm run lint:fix`
Then run: `npm run lint` again.

- If now clean → proceed to Step 6.
- If errors remain → **STOP and report**. Do NOT mass-disable rules. Triage each remaining error: is it a real bug (fix it), a false positive (add a targeted `// eslint-disable-next-line <rule>` comment with a brief justification), or an over-strict rule for this codebase (downgrade that specific rule to `"warn"` in `eslint.config.mjs` — never disable wholesale)?

- [ ] **Step 6: Verify build still passes**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 7: Commit**

```bash
git add eslint.config.mjs package.json package-lock.json
# plus any source files touched by lint:fix
git add -A
git commit -m "chore: add ESLint with next preset

Flat config. Includes next/core-web-vitals and next/typescript rules.
lint:fix applied where auto-fixable."
```

---

## Task 3: Prettier config (no format-all yet)

Adds Prettier deps, config files, and scripts — but does NOT run `prettier --write` on the codebase. That happens in Task 4 so the format-all diff is its own commit.

**Files:**
- Create: `.prettierrc.json`
- Create: `.prettierignore`
- Modify: `eslint.config.mjs` (extend `eslint-config-prettier`)
- Modify: `package.json` (deps + scripts)

- [ ] **Step 1: Install Prettier packages**

```bash
npm install --save-dev prettier eslint-config-prettier
```

- [ ] **Step 2: Create `.prettierrc.json`**

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

- [ ] **Step 3: Create `.prettierignore`**

```
node_modules
.next
next-env.d.ts
tsconfig.tsbuildinfo
public
package-lock.json
supabase/migrations
```

- [ ] **Step 4: Extend `eslint-config-prettier` in `eslint.config.mjs`**

Open `eslint.config.mjs`. In the `compat.extends(...)` call, append `"prettier"` (it must be the LAST extends entry so it can override conflicting style rules). Change:

```js
  ...compat.extends("next/core-web-vitals", "next/typescript"),
```

to:

```js
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
```

- [ ] **Step 5: Add `format` + `format:check` scripts**

Open `package.json`. After the `lint:fix` line in `scripts`, add:

```json
    "format": "prettier --write .",
    "format:check": "prettier --check .",
```

- [ ] **Step 6: Verify Prettier sees the codebase as unformatted (sanity check)**

Run: `npm run format:check`
Expected: FAIL with a list of files that need formatting. (Almost every source file should be listed — the codebase is currently inconsistent. If it unexpectedly passes, something is misconfigured.)

- [ ] **Step 7: Verify lint still passes**

Run: `npm run lint`
Expected: passes (adding `eslint-config-prettier` only removes rules, never adds them).

- [ ] **Step 8: Verify build still passes**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 9: Commit**

```bash
git add .prettierrc.json .prettierignore eslint.config.mjs package.json package-lock.json
git commit -m "chore: add Prettier config

Prettier defaults (2-space, double quotes, semi, 80-width, trailing
commas). format-all comes in the next commit so the diff is isolated."
```

---

## Task 4: Format the codebase

Single huge commit. Pure formatting — no logic changes. The resulting SHA gets captured for `.git-blame-ignore-revs` in Task 5.

**Files:**
- Modify: every TS/TSX file Prettier touches

- [ ] **Step 1: Run Prettier across the codebase**

Run: `npm run format`
Expected: many files reformatted. No errors.

- [ ] **Step 2: Verify the codebase is now consistently formatted**

Run: `npm run format:check`
Expected: PASS (all files match).

- [ ] **Step 3: Verify lint still passes**

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 4: Verify type check / build still passes**

Run: `npm run build`
Expected: succeeds. (Prettier should not introduce type errors. If it does — extremely unlikely — investigate before committing.)

- [ ] **Step 5: Spot-check the diff**

Run: `git diff --stat | head -20`
Expected: many files changed, but only with formatting deltas (indentation, quotes, semicolons, line wrapping). Open one file with `git diff src/lib/calculator.ts` to confirm — no token additions or removals beyond formatting punctuation.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "style: format codebase with Prettier

Pure formatting change — no logic modified. Added to
.git-blame-ignore-revs in the next commit."
```

- [ ] **Step 7: Capture the SHA for the next task**

Run: `git rev-parse HEAD`
Expected: prints the SHA of the format-all commit. **Write it down** — Task 5 references it.

---

## Task 5: Vitest + calculator tests + `.git-blame-ignore-revs`

Adds the test runner, the first real test suite (the highest-value pure functions in the codebase), and the blame-ignore file referencing the Task 4 SHA.

**Files:**
- Create: `.git-blame-ignore-revs`
- Create: `vitest.config.ts`
- Create: `src/lib/calculator.test.ts`
- Modify: `package.json` (deps + scripts)

- [ ] **Step 1: Install Vitest**

```bash
npm install --save-dev vitest
```

- [ ] **Step 2: Create `.git-blame-ignore-revs`**

Use the SHA captured at end of Task 4. Replace `<FORMAT_ALL_SHA>` below:

```
# Mass-format with Prettier (no logic changes)
<FORMAT_ALL_SHA>
```

(If you skipped the SHA capture, recover it with `git log --oneline | grep "format codebase with Prettier"`.)

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 4: Add `test`, `test:watch`, and `typecheck` scripts**

Open `package.json`. In `scripts`, after `format:check`, add:

```json
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
```

- [ ] **Step 5: Verify `typecheck` and empty test run both pass**

Run: `npm run typecheck`
Expected: passes (existing build already proves this, but the standalone script needs to work).

Run: `npm run test`
Expected: passes with "no tests found" warning (we haven't added a test file yet). If it errors instead of warning, fix the config.

- [ ] **Step 6: Create `src/lib/calculator.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import {
  calculateFH6Tune,
  type CalcInput,
  type Discipline,
  type Drivetrain,
} from "./calculator";

const DRIVETRAINS: Drivetrain[] = ["AWD", "FWD", "RWD"];
const DISCIPLINES: Discipline[] = [
  "street",
  "track",
  "offroad",
  "rally",
  "drift",
  "drag",
];

const baseInput = (overrides: Partial<CalcInput> = {}): CalcInput => ({
  balanceFront: 50,
  drivetrain: "RWD",
  discipline: "track",
  weightKg: 1400,
  powerKw: 300,
  ...overrides,
});

describe("calculateFH6Tune", () => {
  describe("smoke — every discipline × drivetrain combination", () => {
    for (const discipline of DISCIPLINES) {
      for (const drivetrain of DRIVETRAINS) {
        it(`${discipline} / ${drivetrain} returns a valid TuneResult`, () => {
          const result = calculateFH6Tune(
            baseInput({ discipline, drivetrain }),
          );
          expect(result.version).toBe("2.0");
          expect(result.tires.pressureF).toBeGreaterThan(0);
          expect(result.gear.finalDrive).toBeGreaterThan(0);
          expect(result.springs.rateF).toBeGreaterThan(0);
          expect(result.springs.rateR).toBeGreaterThan(0);
        });
      }
    }
  });

  describe("gear — finalDrive matches FH6 guide values", () => {
    it("powerKw=300 → finalDrive ≈ 4.25", () => {
      const result = calculateFH6Tune(baseInput({ powerKw: 300 }));
      expect(result.gear.finalDrive).toBeCloseTo(4.25, 1);
    });

    it("powerKw=447 → finalDrive ≈ 3.92", () => {
      const result = calculateFH6Tune(baseInput({ powerKw: 447 }));
      expect(result.gear.finalDrive).toBeCloseTo(3.92, 1);
    });
  });

  describe("invariants", () => {
    for (const discipline of DISCIPLINES) {
      for (const drivetrain of DRIVETRAINS) {
        it(`${discipline} / ${drivetrain}: toe is always 0`, () => {
          const result = calculateFH6Tune(
            baseInput({ discipline, drivetrain }),
          );
          expect(result.alignment.toeF).toBe(0);
          expect(result.alignment.toeR).toBe(0);
        });

        it(`${discipline} / ${drivetrain}: tire pressures stay in [1.0, 3.8] bar`, () => {
          const result = calculateFH6Tune(
            baseInput({ discipline, drivetrain }),
          );
          expect(result.tires.pressureF).toBeGreaterThanOrEqual(1.0);
          expect(result.tires.pressureF).toBeLessThanOrEqual(3.8);
          expect(result.tires.pressureR).toBeGreaterThanOrEqual(1.0);
          expect(result.tires.pressureR).toBeLessThanOrEqual(3.8);
        });
      }
    }

    it("aero.balance is 0 for drag (both downforce sliders are 0)", () => {
      const result = calculateFH6Tune(baseInput({ discipline: "drag" }));
      expect(result.aero.front).toBe(0);
      expect(result.aero.rear).toBe(0);
      expect(result.aero.balance).toBe(0);
    });
  });

  describe("drag — RWD/AWD use lower rear pressure for squat", () => {
    it("RWD drag: pressureR < pressureF", () => {
      const result = calculateFH6Tune(
        baseInput({ discipline: "drag", drivetrain: "RWD" }),
      );
      expect(result.tires.pressureR).toBeLessThan(result.tires.pressureF);
    });

    it("AWD drag: pressureR < pressureF", () => {
      const result = calculateFH6Tune(
        baseInput({ discipline: "drag", drivetrain: "AWD" }),
      );
      expect(result.tires.pressureR).toBeLessThan(result.tires.pressureF);
    });

    it("FWD drag: pressureR === pressureF (no squat tuning)", () => {
      const result = calculateFH6Tune(
        baseInput({ discipline: "drag", drivetrain: "FWD" }),
      );
      expect(result.tires.pressureR).toBe(result.tires.pressureF);
    });
  });

  describe("aero balance — track is in [0.40, 0.50]", () => {
    for (const drivetrain of DRIVETRAINS) {
      it(`${drivetrain} track`, () => {
        const result = calculateFH6Tune(
          baseInput({ discipline: "track", drivetrain }),
        );
        expect(result.aero.balance).toBeGreaterThanOrEqual(0.4);
        expect(result.aero.balance).toBeLessThanOrEqual(0.5);
      });
    }
  });
});
```

- [ ] **Step 7: Run tests and verify all pass**

Run: `npm run test`
Expected: all tests PASS. Test count should be in the 40-50 range (smoke + invariants × 18 combos, plus the named-value and drag and aero tests).

If any test fails: the test is pinning current behavior, so a failure means either (a) the test expectation is wrong and the code is right — fix the test; or (b) the code has a real bug — pause, raise it, decide whether to fix in this task or follow-up.

- [ ] **Step 8: Verify lint, typecheck, build all still pass**

Run: `npm run lint && npm run typecheck && npm run build`
Expected: all succeed.

- [ ] **Step 9: Commit**

```bash
git add .git-blame-ignore-revs vitest.config.ts src/lib/calculator.test.ts package.json package-lock.json
git commit -m "test: add Vitest + calculator.ts tests, register format-all in blame-ignore

Characterization tests for calculateFH6Tune — smoke across all 18
discipline × drivetrain combos, named values from the FH6 guide,
invariants (toe=0, tire pressure clamps, drag aero), and track aero
balance window.

.git-blame-ignore-revs references the Prettier format-all commit so
git blame skips it."
```

---

## Task 6: timeAgo tests + `check` script + CLAUDE.md

Final task. Adds the second test suite, consolidates everything into `npm run check`, and updates CLAUDE.md to reflect the new tooling.

**Files:**
- Create: `src/lib/i18n/timeAgo.test.ts`
- Modify: `package.json` (add `check` script)
- Modify: `CLAUDE.md`

- [ ] **Step 1: Create `src/lib/i18n/timeAgo.test.ts`**

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { timeAgo } from "./timeAgo";

const NOW = new Date("2026-05-20T12:00:00Z");

const minutesAgo = (n: number) =>
  new Date(NOW.getTime() - n * 60_000).toISOString();
const hoursAgo = (n: number) =>
  new Date(NOW.getTime() - n * 3_600_000).toISOString();
const daysAgo = (n: number) =>
  new Date(NOW.getTime() - n * 86_400_000).toISOString();

describe("timeAgo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("EN locale", () => {
    it("returns 'just now' for < 2 minutes ago", () => {
      expect(timeAgo(minutesAgo(0), "en")).toBe("just now");
      expect(timeAgo(minutesAgo(1), "en")).toBe("just now");
    });

    it("returns 'Xm ago' for 2..59 minutes", () => {
      expect(timeAgo(minutesAgo(2), "en")).toBe("2m ago");
      expect(timeAgo(minutesAgo(59), "en")).toBe("59m ago");
    });

    it("returns 'Xh ago' for 1..23 hours", () => {
      expect(timeAgo(hoursAgo(1), "en")).toBe("1h ago");
      expect(timeAgo(hoursAgo(23), "en")).toBe("23h ago");
    });

    it("returns 'Xd ago' for 1..29 days", () => {
      expect(timeAgo(daysAgo(1), "en")).toBe("1d ago");
      expect(timeAgo(daysAgo(29), "en")).toBe("29d ago");
    });

    it("returns absolute date (no 'ago') for >= 30 days", () => {
      const result = timeAgo(daysAgo(30), "en");
      expect(result).not.toMatch(/ago/);
      expect(result).toMatch(/\d{4}/);
    });

    it("defaults to EN locale when no locale arg passed", () => {
      expect(timeAgo(minutesAgo(5))).toBe("5m ago");
    });
  });

  describe("TH locale", () => {
    it("returns 'เมื่อกี้' for < 1 minute ago", () => {
      expect(timeAgo(minutesAgo(0), "th")).toBe("เมื่อกี้");
    });

    it("returns 'X นาทีที่แล้ว' for 1..59 minutes", () => {
      expect(timeAgo(minutesAgo(1), "th")).toBe("1 นาทีที่แล้ว");
      expect(timeAgo(minutesAgo(59), "th")).toBe("59 นาทีที่แล้ว");
    });

    it("returns 'X ชั่วโมงที่แล้ว' for 1..23 hours", () => {
      expect(timeAgo(hoursAgo(1), "th")).toBe("1 ชั่วโมงที่แล้ว");
      expect(timeAgo(hoursAgo(23), "th")).toBe("23 ชั่วโมงที่แล้ว");
    });

    it("returns 'X วันที่แล้ว' for 1..29 days", () => {
      expect(timeAgo(daysAgo(1), "th")).toBe("1 วันที่แล้ว");
      expect(timeAgo(daysAgo(29), "th")).toBe("29 วันที่แล้ว");
    });

    it("returns absolute date with no English month names for >= 30 days", () => {
      const result = timeAgo(daysAgo(30), "th");
      expect(result).not.toMatch(
        /Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/,
      );
      expect(result).not.toMatch(/ago/);
    });
  });
});
```

- [ ] **Step 2: Run the new test suite**

Run: `npm run test`
Expected: all tests pass — both `calculator` and `timeAgo` suites. Total test count should now be around 50-60.

If any TH test fails because of ICU/locale data issues (e.g., `toLocaleDateString("th-TH", ...)` returning an unexpected format on this Node version), check the Node version (`node --version` — must be ≥18 for full ICU). Do not edit the test to match a broken locale output — fix the runtime first.

- [ ] **Step 3: Add the `check` script**

Open `package.json`. After `"test:watch": "vitest",`, add:

```json
    "check": "npm run lint && npm run typecheck && npm run format:check && npm run test"
```

- [ ] **Step 4: Run `npm run check` end-to-end**

Run: `npm run check`
Expected: all four stages pass. This is the single command that should be green before any future commit.

- [ ] **Step 5: Update `CLAUDE.md`**

Open `CLAUDE.md`. Find the Commands section, currently:

```markdown
## Commands

\`\`\`bash
npm run dev    # http://localhost:3000
npm run build  # production build + type check
\`\`\`

No test runner or linter configured.
```

Replace with:

```markdown
## Commands

\`\`\`bash
npm run dev        # http://localhost:3000
npm run build      # production build + type check
npm run check      # lint + typecheck + format:check + tests (run before commits)
npm run test       # vitest run (one-shot)
npm run test:watch # vitest in watch mode
npm run format     # prettier --write .
\`\`\`

Tests live next to the source file (`*.test.ts`). Vitest, node env,
no DOM — currently covers pure functions in `src/lib/`.
```

- [ ] **Step 6: Final verification**

Run: `npm run check && npm run build`
Expected: both succeed. This is the green-state for the feature.

- [ ] **Step 7: Commit**

```bash
git add src/lib/i18n/timeAgo.test.ts package.json CLAUDE.md
git commit -m "test: add timeAgo tests, npm run check, update CLAUDE.md

timeAgo characterization tests cover both EN and TH locales across
every relative-time bucket. \`npm run check\` is the single pre-commit
gate (lint + typecheck + format:check + tests). CLAUDE.md updated to
reflect the new commands."
```

---

## Self-Review

**Spec coverage:**

| Spec section | Implementing task(s) |
| --- | --- |
| Tooling Stack (ESLint flat config, Prettier 3, Vitest, tsc) | T2 (ESLint), T3 (Prettier), T5 (Vitest), T5 (typecheck script) |
| Code Style (Prettier defaults) | T3 step 2 (`.prettierrc.json`) |
| Test Scope: calculator.ts (smoke, named values, invariants, drag, aero balance) | T5 step 6 |
| Test Scope: timeAgo.ts (buckets, EN/TH, default locale) | T6 step 1 |
| Scripts (lint, lint:fix, format, format:check, typecheck, test, test:watch, check) | T2 (lint/lint:fix), T3 (format/format:check), T5 (typecheck/test/test:watch), T6 (check) |
| Rollout Order (6 commits) | T1–T6 (one commit each) |
| ESLint Rule Strictness (Next preset + ts-eslint recommended, not strict) | T2 step 2 — Next preset includes `next/typescript` which uses recommended-typed, not strict |
| Risk: format-all SHA in `.git-blame-ignore-revs` | T4 step 7 (capture SHA), T5 step 2 (record it) |
| Risk: ESLint surfaces violations | T2 step 5 (triage instructions, no mass-disable) |
| Verification checklist (clean install, build, log shape, blame-ignore, CLAUDE.md) | T6 step 6 + the existing commit history after T6 |

All spec sections mapped.

**Placeholder scan:** None of "TBD", "TODO", "implement later", "appropriate", "handle edge cases", "similar to Task N" appear in the plan. Step 5 of Task 2 has a contingency branch but it's concrete (specific responses to specific outcomes), not a placeholder.

**Type consistency:**
- `CalcInput`, `Discipline`, `Drivetrain` — imported from `./calculator` in T5 step 6, names match `calculator.ts` exports.
- `timeAgo(dateStr, locale)` — signature matches `src/lib/i18n/timeAgo.ts` (confirmed by Read during plan-writing).
- `Locale` type — not imported in the test; the test passes string literals `"en"`/`"th"` which TypeScript will narrow against the `Locale` parameter type without needing the import.

Plan is consistent and complete.
