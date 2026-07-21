# ReadMeForge — Changelog

All notable changes to ReadMeForge are recorded here in reverse-chronological order.
Dates use YYYY-MM-DD. SHA references are from the monorepo (`apps/microsaas/readmeforge/dev`).

---

## 2026-07-21

### Verified (no code changes)
- Re-ran `npm install && npm run build` (clean, 12 routes, 0 TS errors) and `npm test` (69/69 pass, unchanged)
- Working tree clean, HEAD matches `origin/main` at `3594a3a` — no drift since 07-20
- Confirmed via Vercel MCP: latest production deployment `dpl_7q91c36k6XjYV1RNTFh1JqSrGC8g` is READY and matches HEAD — auto-deploy continues to work for this project
- `dashboard/projects.json` notes/`lastAudit` were stale (still dated 07-18 despite a 07-20 fix having landed); synced to reflect current state

### Still Blocked (manual action required)
- `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`, `PADDLE_PRO_PRICE_ID` not set in Vercel — now 8+ days outstanding, human-only
- Paddle checkout not E2E validated end-to-end
- This is the 3rd consecutive re-verification pass with zero new findings (07-18, 07-20, 07-21) — recommend weekly rather than daily audit cadence until the Paddle blocker is cleared

---

## 2026-07-20

### Fixed
- `src/app/api/checkout/route.ts`: the Paddle checkout-session endpoint had **no rate limiting at all**, unlike `/api/generate` (3/IP/hour). It's reachable without authentication and, once `PADDLE_API_KEY` is configured, triggers a live call to Paddle's `/transactions` API for an arbitrary attacker-supplied email — an unlimited caller could script a flood of checkout-session-creation requests against Paddle at no cost to themselves. Generalized `src/lib/rate-limit.ts` into a reusable `createRateLimiter()` factory (same sweep-based eviction strategy as the 07-17 generate-limiter fix) and added a second, independent limiter: 5 checkout attempts/IP/hour. 6 new tests (63→69 total).

### Verified
- Tests: 69 vitest unit tests passing (up from 63)
- Build PASS: typecheck + `next build` clean, 0 errors
- Re-confirmed live: `/api/checkout` still returns `{"error":"Paddle is not configured (PADDLE_API_KEY missing)."}` (500) with a valid email — Paddle env vars still unset in Vercel, unchanged
- Live: `/`, `/pricing` both 200

### Still Blocked (manual action required)
- `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`, `PADDLE_PRO_PRICE_ID` not set in Vercel (values must come from the Paddle dashboard — no Paddle MCP/dashboard access available this session)
- Paddle checkout not E2E validated end-to-end
- GitHub → Vercel auto-deploy integration for this project should be reconnected in Vercel project settings (human action) — recurring finding, several weeks running

---

## 2026-07-17

### Fixed
- `src/app/api/generate/route.ts` (f4f0b54): the in-process anonymous-IP rate limiter's backing `Map` had no eviction path at all. A comment claimed entries "reset automatically via TTL eviction," but the only thing that happened was an entry getting overwritten if the *same* IP checked in again after its window expired — a one-off visitor's entry sat in the map forever. On a warm, long-lived serverless container (or a long `next dev` session) this is unbounded memory growth. Extracted the limiter into `src/lib/rate-limit.ts` and added a periodic sweep (every 500 checks) that evicts expired entries. Added `src/lib/rate-limit.test.ts` (5 new tests).

### Verified
- Tests: 63 vitest unit tests passing (up from 58, +5 for the rate-limiter sweep/isolation/reset coverage)
- Build PASS: 12 routes, 0 TypeScript errors, exit 0 (run twice)
- GitHub auto-deploy integration is still disconnected for this project (unchanged since 07-13/07-14) — the push to `origin/main` did not trigger a new Vercel deployment. Manually redeployed via `vercel --prod --yes` (`dpl_69F83qKhi7k5e4brzqaR4WAHVDfN`, READY, aliased to readmeforge.veridux.ai)
- Live: `/`, `/pricing`, `/docs`, `/auth`, `/dashboard` all 200
- `SUPABASE_SERVICE_ROLE_KEY` fix (07-13) reconfirmed holding

### Still Blocked (manual action required)
- `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`, `PADDLE_PRO_PRICE_ID` not set in Vercel (values must come from the Paddle dashboard — no Paddle MCP/dashboard access available this session)
- Paddle checkout not E2E validated end-to-end
- GitHub → Vercel auto-deploy integration for this project should be reconnected in Vercel project settings (human action) — now a multi-week recurring finding

---

## 2026-07-14

### Fixed
- `src/lib/github.ts` (ca22c5d): `fetchRepoInfo` now retries once without the `Authorization` header when the initial GitHub API request returns 401, instead of hard-failing every `/api/generate` call. GitHub allows unauthenticated reads of public repos (at a lower rate limit), so a misconfigured/expired `GITHUB_TOKEN` no longer breaks the core flow. Fix was already sitting uncommitted in the working tree at session start; committed with regression test coverage (`src/lib/github.test.ts`).

### Verified
- Build PASS: 12 routes, 0 TypeScript errors, exit 0
- Tests: 58 vitest unit tests passing (up from 55, +3 for the GitHub fallback)
- GitHub auto-deploy integration is still disconnected for this project (same class of issue as [[project_dashboard_vercel_autodeploy]]) — the push to `origin/main` did not trigger a new Vercel deployment. Manually redeployed via `vercel --prod --yes` (`dpl_6z8QL1AVDcewXU5mTbi6pTV2Txpq`, READY, aliased to readmeforge.veridux.ai)
- Live: `/`, `/pricing`, `/docs`, `/auth`, `/dashboard` all 200

### Still Blocked (manual action required)
- `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`, `PADDLE_PRO_PRICE_ID` not set in Vercel (values must come from the Paddle dashboard — no Paddle MCP/dashboard access available this session)
- Paddle checkout not E2E validated end-to-end
- GitHub → Vercel auto-deploy integration for this project should be reconnected in Vercel project settings (human action) to stop requiring manual `vercel --prod` after every push

---

## 2026-07-13

### Fixed
- `next.config.ts` (606364d): removed broken `outputFileTracingRoot` pointing 3 directories up at the monorepo root — same bug class already confirmed to cause silent prod build failures in envshield (path traversal breaks when `vercel --prod` deploys only the `dev/` subdirectory). Fix was already sitting uncommitted in the working tree; committed, pushed, and deployed.
- **Critical**: `SUPABASE_SERVICE_ROLE_KEY` in Vercel (all environments) was set to the service_role key for a *different* Supabase project (headerguard, `kyscibpwchcvsvkgkfea`) instead of readmeforge's dedicated project (`gkkwgypqnvlytpxehojx`) — `NEXT_PUBLIC_SUPABASE_URL`/anon key were already correct, so this was a silent cross-project credential mismatch on all server-side Supabase calls. Corrected across Development, Preview, and Production.

### Verified
- Build PASS: 12 routes, 0 TypeScript errors, exit 0
- Tests: 55 vitest unit tests passing
- Deployed via `vercel --prod`: dpl_2hvAMEuRjobsmh35YRxrjZPi1QBX READY, aliased to readmeforge.veridux.ai
- Live: `/` 200, `/pricing` 200, `/docs` 200
- projects.json synced: score 80→88

### Still Blocked (manual action required)
- `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`, `PADDLE_PRO_PRICE_ID` not set in Vercel (values must come from the Paddle dashboard — no Paddle MCP/dashboard access available this session)
- Paddle checkout not E2E validated end-to-end

---

## 2026-07-08

### Verified (daily audit)
- Build PASS: 12 routes, 0 TypeScript errors, exit 0
- Tests: 55 vitest unit tests passing
- Vercel: READY (dpl_7KVyDNC9qs72xmmhcQuJeNp6oLgM, `feat(analytics): add StatCounter tracking`)
- projects.json synced: score 55→80, lastAudit 2026-03-29→2026-07-08, vercelProjectId/githubRepo populated

### Still Blocked (manual action required)
- `SUPABASE_SERVICE_ROLE_KEY` in Vercel must point to gkkwgypqnvlytpxehojx
- `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`, `PADDLE_PRO_PRICE_ID` not set in Vercel
- Paddle checkout not E2E validated end-to-end

---

## 2026-06-25

### Fixed
- `github.ts`: Switched to recursive GitHub tree fetch (`?recursive=1`) so CI/CD files in `.github/workflows/` are detected correctly (non-recursive fetch only returned the root entry `.github`, not the workflow files)
- `github.ts`: Fixed `.circleci` CI detection — was checking `f === ".circleci"` (never matches since it's a directory), now uses `f.startsWith(".circleci/")`. Added `Jenkinsfile` and `.gitlab-ci` patterns.
- `github.ts`: Added `docker-compose.yaml` detection alongside `docker-compose.yml` (both variants accepted)
- `github.ts`: Improved test detection — replaced broad `f.includes("test")` with precise patterns (`.test.`, `.spec.`, `__tests__`, config files, `playwright.config.*`) to avoid false positives from filenames like `testimonials.md`
- `readme-generator.ts`: Fixed `.env.local.example` copy command — was hardcoded to `cp .env.example .env.local`; now uses the actual filename found
- `readme-generator.ts`: Improved `buildProjectStructure` — now deduplicates by root directory (shows `src/` once instead of each file), marks directories with trailing `/`, uses proper `├──`/`└──` connectors
- `paddle.ts`: Removed module-level non-null assertions on env vars (caused confusing build-time crashes when Paddle not configured); env vars now validated lazily at call time with descriptive error messages

### Added
- `api/generate/route.ts`: In-process IP-based rate limiter for anonymous (unauthenticated) requests — 3 READMEs/hour per IP. Closes the known gap where anonymous users bypassed all rate limiting.
- Navigation: Added "Docs" link to homepage and pricing page headers; added Pricing/Sign In to docs page header (all pages now have consistent nav)
- `sitemap.ts`: Added `/docs` route (was missing, despite the page existing)

### Verified
- TypeScript: 0 errors (`npx tsc --noEmit`)
- Tests: 55 vitest unit tests passing (1 test updated for corrected `.env.local.example` copy command)

---

## 2026-06-21

### Fixed
- Supabase RLS `auth_rls_initplan` performance warnings on `generations` and `subscriptions` tables — wrapped `auth.uid()` and `auth.role()` in `(SELECT ...)` so Postgres evaluates them once per query, not once per row (migration `fix_rls_initplan_performance`)

### Verified
- Build PASS: 11 routes, 0 TypeScript errors, exit 0
- 55 vitest unit tests passing
- Vercel latest deployment READY (dpl_AuV7HuR1YZjU65ZuS8svEqFSRfsW)
- Supabase project ACTIVE_HEALTHY (gkkwgypqnvlytpxehojx, us-east-1, Postgres 17)
- Readiness: 80/G2 (up from 79) — blockers remain manual (SUPABASE_SERVICE_ROLE_KEY + Paddle env vars in Vercel)

---

## 2026-06-01

### Verified
- Build confirmed clean: 12 routes, 0 TypeScript errors, exit 0
- 55 vitest unit tests passing
- Vercel deployment READY (dpl_AuV7HuR1YZjU65ZuS8svEqFSRfsW, readmeforge.veridux.ai)
- Readiness: 79/G2 — blockers remain manual (SUPABASE_SERVICE_ROLE_KEY + Paddle env vars in Vercel)
- No code changes; audit only

---

## 2026-05-31

### Verified
- Build confirmed clean: `npm run build` exits 0, 12 routes, no TypeScript errors (P0 resolved)
- 55 vitest unit tests passing
- Readiness: 79/G2 — remaining blockers are manual Vercel env var updates (SUPABASE_SERVICE_ROLE_KEY, Paddle keys)

---

## 2026-05-24

### Added
- `product-and-marketing/competitive-analysis.md` — full competitor profile vs. readme.so, ReadmeAI, GitDocs, AutoReadme, and WriteReadme (f6780fa)
- `product-and-marketing/positioning.md`, `target-audience.md`, `value-proposition.md` — complete GTM foundation (5cf3218)

---

## 2026-05-21

### Changed
- Daily sync and git hygiene pass; no functional changes (e19ecf1)

---

## 2026-05-20

### Added
- OG / Twitter card metadata on all pages (`<og:image>`, `twitter:card`) (48e387b)
- Canonical URL tags on homepage, pricing, dashboard, auth pages

### Fixed
- Webpack cache atomic-rename failure on Windows (`outputFileTracingRoot` + `cacheHandler` config) (c8b777c)
- Paddle checkout throws on missing URL instead of returning `undefined` — prevents silent 500s (58fa8a3)

---

## 2026-05-18

### Added
- Vitest unit-test suite — 55 tests covering `github.ts` fetcher and `readme-generator.ts` (e5fd0db)
- Test coverage script (`npm run coverage`) — readiness score bump 62→67

---

## 2026-05-17

### Added
- `robots.ts` and `sitemap.ts` — SEO foundation for all routes (2e2fe53)
- `marketing/` directory with brand assets and strategy docs
- `.gitignore` fixes for Windows build artifacts

---

## 2026-05-16

### Fixed
- Paddle webhook signature validation corrected — HMAC comparison was using wrong encoding (e31a994)
- Generation tracking row inserted correctly after successful README output

---

## 2026-05-15

### Fixed
- `outputFileTracingRoot` warning resolved for monorepo build (1209560)

---

## Initial Build (prior to 2026-05-15)

- Next.js 15 App Router scaffold with TypeScript strict mode
- `/api/generate` — GitHub repo analysis + template-driven README generation
- `/api/checkout` — Paddle checkout session creation
- `/api/webhook` — Paddle webhook handler with signature validation
- Supabase auth integration (`/auth`, `/dashboard`)
- Free-tier monthly limit enforcement (5 READMEs/month)
- Pricing page with Paddle upgrade flow
- `/docs` page with usage guide
