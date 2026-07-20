import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/paddle";
import { CHECKOUT_HOURLY_LIMIT, checkCheckoutRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  if (!checkCheckoutRateLimit(ip)) {
    return NextResponse.json(
      { error: `Rate limit reached (${CHECKOUT_HOURLY_LIMIT} checkout attempts per hour). Please try again later.` },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { email } = body as { email?: unknown };
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
  }

  try {
    const checkoutUrl = await createCheckoutSession(email);
    return NextResponse.json({ url: checkoutUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Checkout creation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
