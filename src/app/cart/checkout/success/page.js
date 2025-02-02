"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Order Placed Successfully!</h1>
      {orderId && <p>Your order ID is: {orderId}</p>}
      <p>Thank you for your purchase!</p>

      <Link href="/">
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
          Go Home
        </button>
      </Link>
    </main>
  );
}
