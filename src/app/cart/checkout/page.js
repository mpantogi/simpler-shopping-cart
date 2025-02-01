"use client";

import { useCart } from "@/context/CartContext";
import { postOrder } from "@/services/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartId, cartItems, discountCode, getTotalPrice } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = getTotalPrice().toFixed(2);
  const isCartEmpty = !cartId || cartItems.length === 0;

  async function handlePlaceOrder() {
    if (isCartEmpty) {
      setError("Cart is empty or missing ID.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const orderId = await postOrder({ cartId, discountCode });
      // We can redirect to a success page with that ID
      router.push(`/cart/checkout/success?orderId=${orderId}`);
    } catch (err) {
      console.error(err);
      setError(err.message || "Order failed.");
    } finally {
      setLoading(false);
    }
  }

  if (isCartEmpty) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <p>
          Your cart is empty. <Link href="/">Go Shop</Link>
        </p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Review &amp; Place Order</h1>
      {cartItems.map(({ product_id, productData, quantity }) => (
        <div key={product_id} className="mb-4 border-b pb-2">
          <h2>{productData?.name ?? "Unknown"}</h2>
          <p>Qty: {quantity}</p>
          <p>Subtotal: ${(productData?.price ?? 0 * quantity).toFixed(2)}</p>
        </div>
      ))}

      <h2 className="text-xl">Total: ${total}</h2>
      {error && <p className="text-red-600 mt-2">{error}</p>}

      <button
        disabled={loading}
        onClick={handlePlaceOrder}
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
      >
        {loading ? "Placing Order..." : "Place Order"}
      </button>
    </main>
  );
}
