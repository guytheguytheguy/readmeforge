import { describe, it, expect, beforeEach } from "vitest";
import {
  ANON_HOURLY_LIMIT,
  ANON_WINDOW_MS,
  checkAnonRateLimit,
  sweepExpiredRateLimitEntries,
  __resetRateLimitStateForTests,
  __getRateLimitMapSizeForTests,
} from "./rate-limit";

// ---------------------------------------------------------------------------
// checkAnonRateLimit — in-process anonymous rate limiter for /api/generate
// ---------------------------------------------------------------------------
// Covers a real bug found during the 2026-07-17 daily maintenance pass: the
// map backing this limiter had no eviction path at all. A stale comment
// claimed entries "reset automatically via TTL eviction," but an expired
// entry only got overwritten when the *same* IP checked in again — one-off
// visitors' entries sat in the map forever, growing unbounded on any
// long-lived warm serverless container or local `next dev` session.

describe("checkAnonRateLimit", () => {
  beforeEach(() => {
    __resetRateLimitStateForTests();
  });

  it("allows requests up to the hourly limit", () => {
    const now = Date.now();
    for (let i = 0; i < ANON_HOURLY_LIMIT; i++) {
      expect(checkAnonRateLimit("1.2.3.4", now)).toBe(true);
    }
  });

  it("blocks requests once the hourly limit is exceeded", () => {
    const now = Date.now();
    for (let i = 0; i < ANON_HOURLY_LIMIT; i++) {
      checkAnonRateLimit("1.2.3.4", now);
    }
    expect(checkAnonRateLimit("1.2.3.4", now)).toBe(false);
  });

  it("tracks each IP independently", () => {
    const now = Date.now();
    for (let i = 0; i < ANON_HOURLY_LIMIT; i++) {
      checkAnonRateLimit("1.2.3.4", now);
    }
    expect(checkAnonRateLimit("1.2.3.4", now)).toBe(false);
    expect(checkAnonRateLimit("5.6.7.8", now)).toBe(true);
  });

  it("resets the count after the window elapses", () => {
    const now = Date.now();
    for (let i = 0; i < ANON_HOURLY_LIMIT; i++) {
      checkAnonRateLimit("1.2.3.4", now);
    }
    expect(checkAnonRateLimit("1.2.3.4", now)).toBe(false);
    expect(checkAnonRateLimit("1.2.3.4", now + ANON_WINDOW_MS + 1)).toBe(true);
  });

  it("sweepExpiredRateLimitEntries removes only expired entries from the map", () => {
    const now = Date.now();
    checkAnonRateLimit("1.1.1.1", now); // expires at now + window
    checkAnonRateLimit("2.2.2.2", now); // expires at now + window

    expect(__getRateLimitMapSizeForTests()).toBe(2);

    // Not expired yet — sweep should be a no-op.
    sweepExpiredRateLimitEntries(now + 1);
    expect(__getRateLimitMapSizeForTests()).toBe(2);

    // Past the window — both entries should be evicted.
    sweepExpiredRateLimitEntries(now + ANON_WINDOW_MS + 1);
    expect(__getRateLimitMapSizeForTests()).toBe(0);
  });
});
