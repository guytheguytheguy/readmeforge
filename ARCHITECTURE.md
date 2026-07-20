# ReadMeForge — Architecture

> AI-powered README generator. Paste a GitHub repo URL → get a professional README in seconds.
> Stack: Next.js 15 App Router, TypeScript strict, Tailwind CSS, Supabase, Paddle.

---

## High-Level Flow

```
User (browser)
  │
  ├─ GET /          →  Homepage (form + feature grid)
  ├─ GET /pricing   →  Pricing page with Paddle upgrade CTA
  ├─ GET /auth      →  Supabase email-link auth
  ├─ GET /dashboard →  User generations history (auth-gated)
  └─ GET /docs      →  Usage documentation
        │
  POST /api/generate
        │
        ├─ Validate GitHub URL (regex)
        ├─ Resolve auth token (optional Bearer header → Supabase getUser)
        ├─ Enforce free-tier limit (5 READMEs/month per user_id)
        ├─ fetchRepoInfo()  →  GitHub REST API (no auth required for public repos)
        ├─ generateReadme() →  Template engine (deterministic, zero LLM cost)
        ├─ Insert generation row (authenticated users only)
        └─ Return { readme, repo }

  POST /api/checkout
        └─ Create Paddle checkout session → return { url }

  POST /api/webhook
        └─ Validate Paddle HMAC signature → upsert subscriptions row
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Homepage — repo URL form, output display, copy/download |
| `src/app/pricing/page.tsx` | Pricing — free vs. pro comparison, Paddle CTA |
| `src/app/auth/page.tsx` | Supabase magic-link auth |
| `src/app/dashboard/page.tsx` | User generation history (auth-gated) |
| `src/app/api/generate/route.ts` | Core generation endpoint |
| `src/app/api/checkout/route.ts` | Paddle checkout session creation |
| `src/app/api/webhook/route.ts` | Paddle webhook → subscription sync |
| `src/lib/github.ts` | `fetchRepoInfo()` — GitHub REST API calls |
| `src/lib/readme-generator.ts` | `generateReadme()` — template-driven README builder |
| `src/lib/supabase.ts` | Supabase client factory (browser + admin) |
| `src/app/robots.ts` | SEO robots.txt |
| `src/app/sitemap.ts` | SEO sitemap.xml |
| `tests/` | Vitest unit tests (55 tests, 100% passing) |

---

## Data Model (Supabase project: `gkkwgypqnvlytpxehojx`)

### `subscriptions`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `email` | text | User email |
| `status` | text | `active` / `canceled` / `past_due` |
| `plan` | text | `free` / `pro` |
| `paddle_subscription_id` | text | Paddle subscription reference |
| `updated_at` | timestamptz | Last sync from webhook |

### `generations`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `user_id` | uuid | FK → auth.users |
| `repo_url` | text | Full GitHub URL |
| `repo_name` | text | `owner/repo` shorthand |
| `created_at` | timestamptz | Auto-set |

---

## Monetization

- **Payment processor**: Paddle (sandbox validated; production env vars required in Vercel)
- **Free tier**: 5 READMEs/month (anonymous users: no limit enforcement — unauthenticated)
- **Pro tier**: $9/month, unlimited generations
- **Required Vercel env vars**: `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`, `PADDLE_PRO_PRICE_ID`

---

## Deployment

- **Platform**: Vercel (project `prj_mNHM55aH8o9m1QgZP3WJKtB5uAo1`)
- **Domain**: `readmeforge.veridux.ai` (wildcard SSL via `*.veridux.ai`)
- **Monorepo root**: `microsaas/readmeforge/dev/` (Next.js `outputFileTracingRoot` set to repo root)
- **Auto-deploy**: Triggered on push to `main` in `apps` monorepo

---

## Generation Engine

`generateReadme()` is **template-driven** — no LLM calls, no API costs:
1. Detect language, framework, package manager from repo file tree
2. Detect CI/CD (`.github/workflows/`, `.travis.yml`, etc.)
3. Detect Docker, license, test runner
4. Fill template with detected values + repo metadata (description, stars, language)
5. Auto-generate badges (language, framework, license, CI status)

This gives instant results with zero hallucination risk.

---

## Rate Limiting

- **Authenticated users**: 5 READMEs/month (enforced via Supabase `generations` count)
- **Anonymous users (`/api/generate`)**: 3 READMEs/hour per IP (in-process `Map` with periodic sweep eviction, implemented 2026-06-25; eviction bug fixed 2026-07-17)
- **Checkout (`/api/checkout`)**: 5 attempts/hour per IP (added 2026-07-20 — previously unlimited despite being unauthenticated and calling out to Paddle's live API)
  - Both limiters share a common factory in `src/lib/rate-limit.ts` with independent buckets per route.
  - Note: best-effort only — won't persist across serverless cold starts or multiple instances

## Outstanding Gaps

| Priority | Gap | Action |
|----------|-----|--------|
| P0 | Paddle env vars not set in Vercel | MANUAL: Set `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`, `PADDLE_PRO_PRICE_ID` in Vercel dashboard |
| P1 | Supabase `SUPABASE_SERVICE_ROLE_KEY` — verify correct project | MANUAL: Verify Vercel env var points to `gkkwgypqnvlytpxehojx` |
