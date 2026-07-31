import crypto from "crypto";

// ---------------------------------------------------------------------------
// Paddle Billing v2 webhook signature verification.
//
// Signature header format: "ts=<unix_seconds>;h1=<hmac_hex>"
// HMAC is computed over "ts:rawBody" using PADDLE_WEBHOOK_SECRET (SHA-256).
//
// Extracted out of the route handler (2026-07-31) so it can be unit-tested
// without constructing a NextRequest, and to fix a real gap found during
// re-verification: the original implementation checked the HMAC but never
// checked the `ts` value's freshness, so a captured-but-valid webhook body
// (e.g. leaked via logs, a proxy, or a compromised endpoint) could be
// replayed indefinitely and would still pass signature verification.
// ---------------------------------------------------------------------------

// Paddle recommends rejecting webhooks whose timestamp is too far from "now"
// to bound the replay window. 5 minutes covers normal delivery/retry jitter
// without leaving a practically-unlimited replay window open.
export const MAX_WEBHOOK_AGE_MS = 5 * 60 * 1_000;

export function verifyPaddleWebhookSignature(
  body: string,
  signatureHeader: string,
  secret: string | undefined,
  now: number = Date.now()
): boolean {
  if (!secret || !signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(";").map((part) => part.split("=") as [string, string])
  );
  const ts = parts["ts"];
  const h1 = parts["h1"];
  if (!ts || !h1) return false;

  // Reject stale or implausibly-future timestamps before doing any HMAC work
  // (also guards against a non-numeric `ts` sailing through as NaN).
  const tsMs = Number(ts) * 1000;
  if (!Number.isFinite(tsMs) || Math.abs(now - tsMs) > MAX_WEBHOOK_AGE_MS) {
    return false;
  }

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(`${ts}:${body}`);
  const expected = hmac.digest("hex");

  // expected is always 64 hex chars (SHA-256); guard length before
  // timingSafeEqual, which throws on mismatched buffer lengths.
  if (h1.length !== expected.length) return false;

  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(h1, "hex"));
  } catch {
    return false;
  }
}
