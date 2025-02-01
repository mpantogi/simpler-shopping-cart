"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useState } from "react";

export default function CartPage() {
  const {
    cartItems,
    removeItem,
    updateQuantity,
    discountCode,
    applyDiscountCode,
    getTotalPrice,
  } = useCart();

  const [coupon, setCoupon] = useState(discountCode || "");

  function handleApplyCoupon() {
    // This doesn't do immediate validation, but the final total checks if code is valid from discounts array
    applyDiscountCode(coupon);
  }

  const total = getTotalPrice().toFixed(2);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      {cartItems.length === 0 && (
        <p>
          Your cart is empty. <Link href="/">Go Shop</Link>
        </p>
      )}

      {cartItems.map(({ product, quantity }) => (
        <div key={product.id} className="border-b mb-4 pb-4">
          <h2 className="font-semibold">{product.name}</h2>
          <p>Price: ${product.price.toFixed(2)}</p>
          <label className="block my-1">
            Quantity:
            <input
              type="number"
              className="ml-2 border p-1 w-16 text-black"
              value={quantity}
              min={1}
              max={product.stock}
              onChange={(e) =>
                updateQuantity(product.id, Number(e.target.value))
              }
            />
          </label>
          <button
            onClick={() => removeItem(product.id)}
            className="mt-1 bg-red-500 text-white px-2 py-1 rounded"
          >
            Remove
          </button>
        </div>
      ))}

      {cartItems.length > 0 && (
        <>
          <div className="mt-4 flex gap-1 flex-wrap">
            <input
              type="text"
              placeholder="Enter coupon code"
              className="border p-1 text-black"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
            />
            <button
              onClick={handleApplyCoupon}
              className="bg-blue-600 text-white px-2 py-1 rounded"
            >
              Apply Coupon
            </button>
          </div>
          <h2 className="mt-4 text-xl font-semibold">Total: ${total}</h2>

          <Link href="/cart/checkout">
            <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded">
              Proceed to Checkout
            </button>
          </Link>
        </>
      )}
    </main>
  );
}
