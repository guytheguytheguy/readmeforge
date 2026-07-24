import { describe, it, expect } from "vitest";
import { isValidEmail, normalizeEmail } from "./email";

describe("isValidEmail", () => {
  it("accepts well-formed addresses", () => {
    expect(isValidEmail("a@b.com")).toBe(true);
    expect(isValidEmail("first.last+tag@sub.example.co")).toBe(true);
  });

  it("rejects malformed addresses", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("missing@tld")).toBe(false);
    expect(isValidEmail("@example.com")).toBe(false);
    expect(isValidEmail("has spaces@example.com")).toBe(false);
  });

  it("rejects non-string and empty input", () => {
    expect(isValidEmail(undefined)).toBe(false);
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(42)).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });

  it("rejects overly long input", () => {
    const long = `${"a".repeat(250)}@b.com`;
    expect(isValidEmail(long)).toBe(false);
  });
});

describe("normalizeEmail", () => {
  it("trims whitespace and lowercases", () => {
    expect(normalizeEmail("  Foo@Example.COM  ")).toBe("foo@example.com");
  });
});
