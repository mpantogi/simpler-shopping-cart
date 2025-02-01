"use client";

import { useCart } from "@/context/CartContext";
import { postOrder } from "@/services/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, discountCode, getTotalPrice } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePlaceOrder() {
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
        // redirect to success
        router.push(`/cart/checkout/success?orderId=${res.orderId}`);
      } else {
        setError("Something went wrong placing your order.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Order failed");
    } finally {
      setLoading(false);
    }
  }

  const total = getTotalPrice().toFixed(2);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Review &amp; Place Order</h1>
      {cartItems.map((item) => {
        const subtotal = (item.product.price * item.quantity).toFixed(2);
        return (
          <div key={item.product.id} className="mb-4">
            <h2>{item.product.name}</h2>
            <p>Qty: {item.quantity}</p>
            <p>Subtotal: ${subtotal}</p>
          </div>
        );
      })}
      <h2 className="text-xl">Total: ${total}</h2>
      {error && <p className="text-red-600 mt-2">{error}</p>}
      <button
        onClick={handlePlaceOrder}
        disabled={loading}
        className="mt-4 bg-green-700 text-white px-4 py-2 rounded"
      >
        {loading ? "Placing Order..." : "Place Order"}
      </button>
    </main>
  );
}
