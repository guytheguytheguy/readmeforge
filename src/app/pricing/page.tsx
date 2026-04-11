"use client";

import { useState } from "react";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "5 READMEs per month",
      "All detection features",
      "Copy & download",
      "Public repos only",
    ],
    cta: "Get Started Free",
    href: "/",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    features: [
      "Unlimited READMEs",
      "Private repo support",
      "README history & dashboard",
      "Custom sections",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    href: null, // handled by checkout
    highlight: true,
  },
];

export default function PricingPage() {
  const [email, setEmail] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  async function handleProCheckout() {
    if (!email.trim() || !email.includes("@")) {
      setCheckoutError("Enter your email to continue.");
      return;
    }
    setCheckoutLoading(true);
    setCheckoutError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCheckoutError(data.error || "Checkout failed.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setCheckoutError("Network error. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-6 py-4">
        <a href="/" className="font-bold text-xl flex items-center gap-2 w-fit">
          <span>📄</span> ReadMeForge
        </a>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-gray-400 mb-12">Start free. Upgrade when you need more.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`border rounded-2xl p-8 text-left flex flex-col ${
                plan.highlight
                  ? "border-indigo-500 bg-indigo-950/30"
                  : "border-gray-800 bg-gray-900"
              }`}
            >
              {plan.highlight && (
                <span className="text-indigo-400 text-xs font-semibold uppercase tracking-wide mb-2">
                  Most Popular
                </span>
              )}
              <h2 className="text-2xl font-bold mb-1">{plan.name}</h2>
              <p className="text-4xl font-bold mb-1">
                {plan.price}
                <span className="text-lg font-normal text-gray-400">{plan.period}</span>
              </p>

              <ul className="mt-6 space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="text-green-400">✓</span> {f}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {plan.highlight ? (
                  <>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 mb-3 focus:outline-none focus:border-indigo-500"
                    />
                    {checkoutError && (
                      <p className="text-red-400 text-xs mb-2">{checkoutError}</p>
                    )}
                    <button
                      onClick={handleProCheckout}
                      disabled={checkoutLoading}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white py-3 rounded-xl font-semibold transition-colors"
                    >
                      {checkoutLoading ? "Redirecting…" : plan.cta}
                    </button>
                  </>
                ) : (
                  <a
                    href={plan.href!}
                    className="block w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-semibold text-center transition-colors"
                  >
                    {plan.cta}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="text-gray-500 text-sm mt-10">
          Cancel anytime. No hidden fees. Powered by Paddle.
        </p>
      </main>
    </div>
  );
}
