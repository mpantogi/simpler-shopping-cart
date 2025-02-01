"use client";

import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Order Placed Successfully!</h1>
      {orderId && <p className="mb-2">Your order ID is: {orderId}</p>}
      <p>Thank you for your purchase!</p>
    </main>
  );
}
