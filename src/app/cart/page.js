"use client";

import { useCart } from "@/context/CartContext";
import { useState } from "react";

export default function CartPage() {
  const {
    cartItems,
    removeItem,
    updateQuantity,
    discountCode,
    applyDiscountCode,
    getTotalPrice,
    discounts,
  } = useCart();

  const [couponInput, setCouponInput] = useState(discountCode || "");

  function handleApplyCoupon() {
    const valid = discounts.find((d) => d.code === couponInput);
    if (valid) {
      applyDiscountCode(couponInput);
      alert(`Coupon ${couponInput} applied!`);
    } else {
      alert("Invalid coupon code.");
    }
  }

  const total = getTotalPrice().toFixed(2);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      {cartItems.length === 0 && <p>Your cart is empty.</p>}

      {cartItems.map((item) => (
        <div key={item.product.id} className="border-b mb-4 pb-4">
          <h2 className="font-semibold">{item.product.name}</h2>
          <p>Price: ${item.product.price.toFixed(2)}</p>
          <label className="block my-1">
            Quantity:
            <input
              className="ml-2 border p-1 w-16"
              type="number"
              min="1"
              max={item.product.stock}
              value={item.quantity}
              onChange={(e) =>
                updateQuantity(item.product.id, Number(e.target.value))
              }
            />
          </label>
          <button
            onClick={() => removeItem(item.product.id)}
            className="bg-red-500 text-white px-2 py-1 rounded"
          >
            Remove
          </button>
        </div>
      ))}

      {cartItems.length > 0 && (
        <>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Enter coupon code"
              className="border p-1 mr-2"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
            />
            <button
              onClick={handleApplyCoupon}
              className="bg-blue-600 text-white px-2 py-1 rounded"
            >
              Apply
            </button>
          </div>
          <h2 className="mt-4 text-xl">
            Total: <span className="font-bold">${total}</span>
          </h2>
          <a href="/cart/checkout">
            <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded">
              Proceed to Checkout
            </button>
          </a>
        </>
      )}
    </main>
  );
}
