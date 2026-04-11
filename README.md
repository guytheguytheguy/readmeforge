# ReadMeForge

![Framework](https://img.shields.io/badge/framework-Next.js%2015-informational.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Tests](https://img.shields.io/badge/tests-E2E%20Playwright-brightgreen.svg)

AI-powered README generator for GitHub repositories. Paste any public GitHub URL — ReadMeForge analyzes the codebase structure, detects frameworks, package managers, tooling, and generates a professional, structured README in seconds.

## Features

- **Template-driven generation** — zero API costs, instant results, no rate limits
- **Codebase analysis** — detects framework, language, tests, Docker, CI/CD, package manager
- **Badges auto-included** — license, framework, test status, Docker badges
- **Copy & download** — one-click copy to clipboard or download as `README.md`
- **Auth with Supabase** — magic link sign-in, README history in dashboard
- **Payments via Paddle** — Free tier (5/month) + Pro plan ($9/month, unlimited)

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript 5, Tailwind CSS 4
- **Auth & DB**: Supabase (magic link auth, `generations` + `subscriptions` tables)
- **Payments**: Paddle (webhook-verified subscription management)
- **Testing**: Playwright E2E (15 tests covering core flows + API endpoints)
- **Deploy**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/<owner>/readmeforge.git
cd readmeforge/dev

# Copy env file and fill in values
cp .env.example .env.local

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm run start
```

### Environment Variables

See [`.env.example`](.env.example) for all required variables.

## Project Structure

```
dev/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing + generator form
│   │   ├── auth/page.tsx         # Magic link sign-in
│   │   ├── dashboard/page.tsx    # User README history
│   │   ├── pricing/page.tsx      # Free / Pro plans
│   │   └── api/
│   │       ├── generate/route.ts # Core: fetches repo + generates README
│   │       ├── checkout/route.ts # Paddle checkout session
│   │       └── webhook/route.ts  # Paddle subscription webhooks
│   └── lib/
│       ├── github.ts             # GitHub API: repo metadata + file tree
│       ├── readme-generator.ts   # Template engine: badges, install, structure
│       ├── supabase.ts           # Supabase client singleton
│       └── paddle.ts             # Paddle API helpers
├── tests/
│   └── e2e/
│       └── readme-flow.spec.ts   # Playwright E2E tests (15 tests)
├── vercel.json
└── playwright.config.ts
```

## Database Schema (Supabase)

```sql
-- Track generated READMEs per user
create table generations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  repo_url    text not null,
  repo_name   text,
  created_at  timestamptz default now()
);

-- Track Paddle subscriptions
create table subscriptions (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  customer_id text not null unique,
  status      text not null,  -- 'active' | 'canceled'
  plan        text not null,  -- 'pro'
  updated_at  timestamptz default now()
);

-- RLS: users can only see their own generations
alter table generations enable row level security;
create policy "own generations" on generations
  for all using (auth.uid() = user_id);
```

## E2E Tests

```bash
# Run all E2E tests (starts dev server automatically)
npm run test:e2e

# Run with UI
npx playwright test --ui
```

Tests cover: homepage rendering, validation errors, sample repo buttons, pricing page, auth page, API endpoint validation (400/422/500 responses).

## Deployment

1. **Vercel**: Connect repo → set env vars → deploy
2. **DNS**: Add CNAME `readmeforge.veridux.ai` → `cname.vercel-dns.com`
3. **Supabase**: Create project, run schema SQL above, copy keys
4. **Paddle**: Create product ($9/mo), copy vendor ID + price ID + webhook secret

## API

### `POST /api/generate`

Generate a README for a GitHub repository.

```json
// Request
{ "repoUrl": "https://github.com/owner/repo" }

// Response 200
{ "readme": "# repo\n...", "repo": { "owner": "owner", "name": "repo" } }

// Response 400 — missing repoUrl
{ "error": "repoUrl is required." }

// Response 422 — invalid GitHub URL
{ "error": "Invalid GitHub URL. Expected format: https://github.com/owner/repo" }

// Response 404 — repo not found
{ "error": "Repository not found. Make sure it's public." }
```

### `POST /api/checkout`

Create a Paddle checkout session.

```json
// Request
{ "email": "user@example.com" }

// Response 200
{ "url": "https://checkout.paddle.com/..." }
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a pull request

## License

MIT

---

> Built with Next.js 15 + Supabase + Paddle. Deployed on Vercel.
