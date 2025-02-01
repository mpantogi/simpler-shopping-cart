"use client";

import { useCart } from "@/context/CartContext";
import { postOrder } from "@/services/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, discountCode, getTotalPrice } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = getTotalPrice().toFixed(2);
  const isCartEmpty = cartItems.length === 0;

  async function handlePlaceOrder() {
    if (isCartEmpty) return;

    setLoading(true);
    setError("");

    try {
      const orderData = {
        items: cartItems.map((ci) => ({
          productId: ci.product.id,
          quantity: ci.quantity,
        })),
        discountCode: discountCode || undefined,
      };

      const res = await postOrder(orderData);
      if (res.success) {
        router.push(`/cart/checkout/success?orderId=${res.orderId}`);
      } else {
        setError("Failed to place order. No success from API.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Order failed");
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

      {cartItems.map(({ product, quantity }) => (
        <div key={product.id} className="mb-4 border-b pb-2">
          <h2>{product.name}</h2>
          <p>Qty: {quantity}</p>
          <p>Subtotal: ${(product.price * quantity).toFixed(2)}</p>
        </div>
      ))}

      <h2 className="text-xl">Total: ${total}</h2>
      {error && <p className="text-red-600 mt-2">{error}</p>}

      <button
        onClick={handlePlaceOrder}
        disabled={loading || isCartEmpty}
        className={`mt-4 px-4 py-2 rounded text-white ${
          loading || isCartEmpty
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-700"
        }`}
      >
        {loading ? "Placing Order..." : "Place Order"}
      </button>
    </main>
  );
}
