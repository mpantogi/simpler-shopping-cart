"use client";

import { useCart } from "@/context/CartContext";
import { postOrder } from "@/services/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartId, cartItems, discountCode, getTotalPrice, getSubtotal } =
    useCart();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cartItems.length > 0 || localStorage.getItem("cartItems")) {
      setLoading(false);
    }
  }, [cartItems]);

  const isCartEmpty = !cartId || cartItems.length === 0;
  const subtotalValue = getSubtotal().toFixed(2);
  const discountedValue = getTotalPrice().toFixed(2);
  const hasDiscount = discountCode && subtotalValue !== discountedValue;

  async function handlePlaceOrder() {
    if (isCartEmpty) {
      setError("Cart is empty or missing ID.");
      return;
    }

    setError("");
    try {
      const orderId = await postOrder({ cartId, discountCode });
      router.push(`/cart/checkout/success?orderId=${orderId}`);
    } catch (err) {
      console.error(err);
      setError(err.message || "Order failed.");
    }
  }

  if (loading) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <p>Loading your cart...</p>
      </main>
    );
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

      {discountCode && (
        <p className="text-green-600 mb-2">
          Coupon Applied: <strong>{discountCode}</strong>
        </p>
      )}

      {hasDiscount ? (
        <p>
          Subtotal: <s>${subtotalValue}</s>{" "}
          <span className="text-green-600 font-semibold">
            ${discountedValue}
          </span>
        </p>
      ) : (
        <p className="text-xl">Total: ${discountedValue}</p>
      )}

      {error && <p className="text-red-600 mt-2">{error}</p>}

      <button
        onClick={handlePlaceOrder}
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
      >
        Place Order
      </button>
    </main>
  );
}
