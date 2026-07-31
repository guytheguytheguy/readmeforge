import { NextRequest, NextResponse } from "next/server";
import { verifyPaddleWebhookSignature } from "@/lib/paddle-webhook";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("paddle-signature") ?? req.headers.get("Paddle-Signature") ?? "";

  const isValid = verifyPaddleWebhookSignature(rawBody, signature, process.env.PADDLE_WEBHOOK_SECRET);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event: { event_type: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  // Lazy-init supabase only at request time to avoid build-time env errors
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { event_type, data } = event;

  if (event_type === "subscription.created" || event_type === "subscription.activated") {
    const customerId = data.customer_id as string;
    const email = (data.customer as { email?: string })?.email;
    if (email) {
      await supabase
        .from("subscriptions")
        .upsert({ email, customer_id: customerId, status: "active", plan: "pro" });
    }
  }

  if (event_type === "subscription.canceled") {
    const customerId = data.customer_id as string;
    await supabase
      .from("subscriptions")
      .update({ status: "canceled" })
      .eq("customer_id", customerId);
  }

  return NextResponse.json({ received: true });
}
