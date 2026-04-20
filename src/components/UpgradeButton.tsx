"use client";

import { loadStripe } from "@stripe/stripe-js";

export default function UpgradeButton() {
  const handleUpgrade = async () => {
    // 1. Stripeの公開鍵を読み込む（後で .env に追加するよ！）
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

    if (!stripe) return;

    // 2. Stripe Checkoutを起動する
    const { error } = await stripe.redirectToCheckout({
      lineItems: [
        {
          price: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO, // さっき貼ったID！
          quantity: 1,
        },
      ],
      mode: "subscription",
      successUrl: `${window.location.origin}/success`, // 成功時の戻り先
      cancelUrl: `${window.location.origin}/`,        // キャンセル時の戻り先
    });

    if (error) {
      console.error("Stripe Error:", error);
    }
  };

  return (
    <button
      onClick={handleUpgrade}
      className="px-6 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg"
    >
      Thinker Proにアップグレード
    </button>
  );
}