# ReadMeForge — Changelog

All notable changes to ReadMeForge are recorded here in reverse-chronological order.
Dates use YYYY-MM-DD. SHA references are from the monorepo (`apps/microsaas/readmeforge/dev`).

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
