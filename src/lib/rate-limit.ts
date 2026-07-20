// ---------------------------------------------------------------------------
// Lightweight in-process rate limiters for unauthenticated API routes.
// Best-effort guards — they won't survive server restarts or multi-instance
// deploys, but they stop casual abuse on Vercel's single-region serverless.
//
// Each limiter's backing Map is lazily swept every `sweepInterval` checks so
// one-off callers' entries don't sit in memory forever on a long-lived warm
// serverless container (or a long `next dev` session).
// ---------------------------------------------------------------------------

interface RateLimiterOptions {
  limit: number;
  windowMs: number;
  sweepInterval?: number;
}

interface RateLimiterEntry {
  count: number;
  resetAt: number;
}

function createRateLimiter(options: RateLimiterOptions) {
  const { limit, windowMs, sweepInterval = 500 } = options;
  const map = new Map<string, RateLimiterEntry>();
  let checkCount = 0;

  function sweepExpired(now: number): void {
    for (const [key, entry] of map) {
      if (now >= entry.resetAt) map.delete(key);
    }
  }

  function check(key: string, now: number = Date.now()): boolean {
    checkCount += 1;
    if (checkCount % sweepInterval === 0) sweepExpired(now);

    const entry = map.get(key);
    if (!entry || now >= entry.resetAt) {
      map.set(key, { count: 1, resetAt: now + windowMs });
      return true; // allowed
    }
    if (entry.count >= limit) return false; // blocked
    entry.count += 1;
    return true; // allowed
  }

  function resetForTests(): void {
    map.clear();
    checkCount = 0;
  }

  function sizeForTests(): number {
    return map.size;
  }

  return { check, sweepExpired, resetForTests, sizeForTests };
}

// ---------------------------------------------------------------------------
// /api/generate — anonymous (unauthenticated) callers: 3 requests/IP/hour.
// ---------------------------------------------------------------------------

export const ANON_HOURLY_LIMIT = 3;
export const ANON_WINDOW_MS = 60 * 60 * 1_000; // 1 hour

const anonGenerateLimiter = createRateLimiter({
  limit: ANON_HOURLY_LIMIT,
  windowMs: ANON_WINDOW_MS,
});

export function checkAnonRateLimit(ip: string, now: number = Date.now()): boolean {
  return anonGenerateLimiter.check(ip, now);
}

export function sweepExpiredRateLimitEntries(now: number): void {
  anonGenerateLimiter.sweepExpired(now);
}

// Test-only helpers to reset shared module state between test cases.
export function __resetRateLimitStateForTests(): void {
  anonGenerateLimiter.resetForTests();
}

export function __getRateLimitMapSizeForTests(): number {
  return anonGenerateLimiter.sizeForTests();
}

// ---------------------------------------------------------------------------
// /api/checkout — unauthenticated Paddle checkout-session creation: previously
// had zero rate limiting at all, unlike /api/generate. Since it's reachable
// without auth and (once PADDLE_API_KEY is configured) triggers a live call
// to Paddle's API for an arbitrary attacker-supplied email, an unlimited
// caller could flood Paddle with checkout-session requests. Limit: 5
// requests/IP/hour — generous for a real customer trying the upgrade flow
// a few times, tight enough to stop scripted abuse.
// ---------------------------------------------------------------------------

export const CHECKOUT_HOURLY_LIMIT = 5;
export const CHECKOUT_WINDOW_MS = 60 * 60 * 1_000; // 1 hour

const checkoutLimiter = createRateLimiter({
  limit: CHECKOUT_HOURLY_LIMIT,
  windowMs: CHECKOUT_WINDOW_MS,
});

export function checkCheckoutRateLimit(ip: string, now: number = Date.now()): boolean {
  return checkoutLimiter.check(ip, now);
}

export function sweepExpiredCheckoutRateLimitEntries(now: number): void {
  checkoutLimiter.sweepExpired(now);
}

// Test-only helpers to reset shared module state between test cases.
export function __resetCheckoutRateLimitStateForTests(): void {
  checkoutLimiter.resetForTests();
}

export function __getCheckoutRateLimitMapSizeForTests(): number {
  return checkoutLimiter.sizeForTests();
}
