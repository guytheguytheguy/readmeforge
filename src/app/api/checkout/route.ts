import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/paddle";

export async function POST(req: NextRequest) {
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
