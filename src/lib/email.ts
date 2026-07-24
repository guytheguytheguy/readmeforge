// Minimal RFC-5322-ish email validation — good enough to reject junk input
// before it hits the database without pulling in a dependency.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 254 && EMAIL_RE.test(value.trim());
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
