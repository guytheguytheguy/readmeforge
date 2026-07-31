import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { verifyPaddleWebhookSignature, MAX_WEBHOOK_AGE_MS } from "./paddle-webhook";

const SECRET = "test-webhook-secret";

function sign(body: string, tsSeconds: number, secret: string = SECRET): string {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(`${tsSeconds}:${body}`);
  return `ts=${tsSeconds};h1=${hmac.digest("hex")}`;
}

describe("verifyPaddleWebhookSignature", () => {
  it("accepts a correctly signed, fresh payload", () => {
    const now = Date.now();
    const body = JSON.stringify({ event_type: "subscription.created" });
    const header = sign(body, Math.floor(now / 1000), SECRET);
    expect(verifyPaddleWebhookSignature(body, header, SECRET, now)).toBe(true);
  });

  it("rejects when PADDLE_WEBHOOK_SECRET is not configured", () => {
    const now = Date.now();
    const body = "{}";
    const header = sign(body, Math.floor(now / 1000), SECRET);
    expect(verifyPaddleWebhookSignature(body, header, undefined, now)).toBe(false);
  });

  it("rejects a missing signature header", () => {
    expect(verifyPaddleWebhookSignature("{}", "", SECRET)).toBe(false);
  });

  it("rejects a header missing ts or h1", () => {
    const now = Date.now();
    expect(verifyPaddleWebhookSignature("{}", `ts=${Math.floor(now / 1000)}`, SECRET, now)).toBe(false);
    expect(verifyPaddleWebhookSignature("{}", "h1=deadbeef", SECRET, now)).toBe(false);
  });

  it("rejects a tampered body (hmac mismatch)", () => {
    const now = Date.now();
    const header = sign("original body", Math.floor(now / 1000), SECRET);
    expect(verifyPaddleWebhookSignature("tampered body", header, SECRET, now)).toBe(false);
  });

  it("rejects a signature produced with the wrong secret", () => {
    const now = Date.now();
    const body = "{}";
    const header = sign(body, Math.floor(now / 1000), "wrong-secret");
    expect(verifyPaddleWebhookSignature(body, header, SECRET, now)).toBe(false);
  });

  it("rejects a stale (replayed) webhook older than MAX_WEBHOOK_AGE_MS", () => {
    const now = Date.now();
    const staleTsSeconds = Math.floor((now - MAX_WEBHOOK_AGE_MS - 60_000) / 1000);
    const body = "{}";
    const header = sign(body, staleTsSeconds, SECRET);
    expect(verifyPaddleWebhookSignature(body, header, SECRET, now)).toBe(false);
  });

  it("rejects a timestamp implausibly far in the future", () => {
    const now = Date.now();
    const futureTsSeconds = Math.floor((now + MAX_WEBHOOK_AGE_MS + 60_000) / 1000);
    const body = "{}";
    const header = sign(body, futureTsSeconds, SECRET);
    expect(verifyPaddleWebhookSignature(body, header, SECRET, now)).toBe(false);
  });

  it("accepts a timestamp within the allowed clock-skew window", () => {
    const now = Date.now();
    const slightlyOldTsSeconds = Math.floor((now - MAX_WEBHOOK_AGE_MS + 30_000) / 1000);
    const body = "{}";
    const header = sign(body, slightlyOldTsSeconds, SECRET);
    expect(verifyPaddleWebhookSignature(body, header, SECRET, now)).toBe(true);
  });

  it("rejects a non-numeric ts", () => {
    const now = Date.now();
    const body = "{}";
    const hmac = crypto.createHmac("sha256", SECRET);
    hmac.update(`not-a-number:${body}`);
    const header = `ts=not-a-number;h1=${hmac.digest("hex")}`;
    expect(verifyPaddleWebhookSignature(body, header, SECRET, now)).toBe(false);
  });
});
