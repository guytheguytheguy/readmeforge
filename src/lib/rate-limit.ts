// ---------------------------------------------------------------------------
// Lightweight in-process rate limiter for anonymous (unauthenticated) requests
// to /api/generate. Limit: 3 requests per IP per hour. This is a best-effort
// guard — it won't survive server restarts or multi-instance deploys, but it
// stops casual abuse on Vercel's single-region serverless.
//
// Entries are lazily swept every RATE_MAP_SWEEP_INTERVAL checks. Previously
// the map had no eviction at all — an expired entry only got overwritten if
// the *same* IP checked in again, so one-off visitors' entries sat in the map
// forever. On a long-lived warm serverless container (or `next dev`), that's
// unbounded growth. A periodic sweep bounds memory without adding per-request
// overhead on the common path.
// ---------------------------------------------------------------------------

export const ANON_HOURLY_LIMIT = 3;
export const ANON_WINDOW_MS = 60 * 60 * 1_000; // 1 hour
const RATE_MAP_SWEEP_INTERVAL = 500; // sweep expired entries every N checks

const anonRateMap = new Map<string, { count: number; resetAt: number }>();
let rateLimitCheckCount = 0;

export function sweepExpiredRateLimitEntries(now: number): void {
  for (const [ip, entry] of anonRateMap) {
    if (now >= entry.resetAt) anonRateMap.delete(ip);
  }
}

export function checkAnonRateLimit(ip: string, now: number = Date.now()): boolean {
  rateLimitCheckCount += 1;
  if (rateLimitCheckCount % RATE_MAP_SWEEP_INTERVAL === 0) {
    sweepExpiredRateLimitEntries(now);
  }

  const entry = anonRateMap.get(ip);
  if (!entry || now >= entry.resetAt) {
    anonRateMap.set(ip, { count: 1, resetAt: now + ANON_WINDOW_MS });
    return true; // allowed
  }
  if (entry.count >= ANON_HOURLY_LIMIT) return false; // blocked
  entry.count += 1;
  return true; // allowed
}

// Test-only helpers to reset shared module state between test cases.
export function __resetRateLimitStateForTests(): void {
  anonRateMap.clear();
  rateLimitCheckCount = 0;
}

export function __getRateLimitMapSizeForTests(): number {
  return anonRateMap.size;
}
