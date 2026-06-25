export async function createCheckoutSession(email: string): Promise<string> {
  const apiKey = process.env.PADDLE_API_KEY;
  const priceId = process.env.PADDLE_PRO_PRICE_ID;

  if (!apiKey) throw new Error("Paddle is not configured (PADDLE_API_KEY missing).");
  if (!priceId) throw new Error("Paddle is not configured (PADDLE_PRO_PRICE_ID missing).");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://readmeforge.veridux.ai";

  const res = await fetch("https://api.paddle.com/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      items: [{ price_id: priceId, quantity: 1 }],
      customer: { email },
      checkout: { url: appUrl + "/dashboard" },
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
