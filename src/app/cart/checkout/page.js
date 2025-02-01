"use client";

import { useCart } from "@/context/CartContext";
import { postOrder } from "@/services/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, discountCode, getTotalPrice } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // If cart is empty, redirect to /cart
  useEffect(() => {
    if (cartItems.length === 0) {
      router.push("/cart");
    }
  }, [cartItems, router]);

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

  const total = getTotalPrice().toFixed(2);

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
        disabled={loading}
        className="mt-4 bg-green-700 text-white px-4 py-2 rounded"
      >
        {loading ? "Placing Order..." : "Place Order"}
      </button>
    </main>
  );
}
