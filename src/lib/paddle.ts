export const PADDLE_VENDOR_ID = process.env.PADDLE_VENDOR_ID!;
export const PADDLE_API_KEY = process.env.PADDLE_API_KEY!;
export const PADDLE_PRO_PRICE_ID = process.env.PADDLE_PRO_PRICE_ID!;
export const PADDLE_WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET!;

export async function createCheckoutSession(email: string): Promise<string> {
  const res = await fetch("https://api.paddle.com/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PADDLE_API_KEY}`,
    },
    body: JSON.stringify({
      items: [{ price_id: PADDLE_PRO_PRICE_ID, quantity: 1 }],
      customer: { email },
      checkout: { url: process.env.NEXT_PUBLIC_APP_URL + "/dashboard" },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Paddle checkout failed: ${err}`);
  }

  const data = await res.json();
  const checkoutUrl = data.data?.checkout?.url as string | undefined;
  if (!checkoutUrl) {
    throw new Error("Paddle did not return a checkout URL.");
  }
  return checkoutUrl;
}
