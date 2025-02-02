"use client";

import { useCart } from "@/context/CartContext";
import { getDiscounts } from "@/services/api";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartPage() {
  const {
    cartItems,
    removeItem,
    updateQuantity,
    discountCode,
    applyDiscountCode,
    getTotalPrice,
    discounts,
    getSubtotal,
    setDiscounts,
  } = useCart();

  const [coupon, setCoupon] = useState(discountCode || "");
  const [couponError, setCouponError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cartItems.length > 0 || localStorage.getItem("cartItems")) {
      setLoading(false);
    }
  }, [cartItems]);

  useEffect(() => {
    getDiscounts()
      .then((disc) => setDiscounts(disc))
      .catch(console.error);
  }, [setDiscounts]);

  function handleApplyCoupon() {
    if (!coupon) {
      applyDiscountCode(null);
      setCouponError("");
      return;
    }
    const found = discounts.find((d) => d.code === coupon);
    if (found) {
      applyDiscountCode(coupon);
      setCouponError("");
    } else {
      setCouponError("Invalid coupon code!");
    }
  }

  const subtotalValue = getSubtotal().toFixed(2);
  const discountedValue = getTotalPrice().toFixed(2);
  const hasDiscount = discountCode && subtotalValue !== discountedValue;

  return (
    <main className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

      {loading ? (
        <p>Loading your cart...</p>
      ) : cartItems.length === 0 ? (
        <p>
          Your cart is empty. <Link href="/">Go Shop</Link>
        </p>
      ) : (
        <>
          {cartItems.map(({ product_id, productData, quantity }) => (
            <div key={product_id} className="border-b mb-4 pb-4">
              <h2 className="font-semibold">{productData?.name}</h2>
              <p>Price: ${productData?.price?.toFixed(2)}</p>
              <label className="block my-2">
                Quantity:
                <input
                  type="number"
                  className="ml-2 border p-1 w-16 appearance-textfield text-black"
                  value={quantity}
                  min={1}
                  max={productData?.stock ?? 99}
                  onChange={(e) => {
                    let val = parseInt(e.target.value, 10);
                    if (isNaN(val) || val <= 0) val = 1;
                    updateQuantity(product_id, val);
                  }}
                />
              </label>
              <button
                onClick={() => removeItem(product_id)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Remove
              </button>
            </div>
          ))}

          <div className="mt-4 flex flex-wrap gap-2">
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
            {couponError && <p className="text-red-500 mt-1">{couponError}</p>}
          </div>

          {discountCode && !couponError && (
            <p className="mt-2 text-green-600">
              Coupon Applied: <strong>{discountCode}</strong>
            </p>
          )}

          <div className="mt-4">
            {hasDiscount ? (
              <p>
                Subtotal: <s>${subtotalValue}</s>
                <span className="text-green-600 font-semibold ml-1">
                  ${discountedValue}
                </span>
              </p>
            ) : (
              <p className="text-xl font-semibold">Total: ${discountedValue}</p>
            )}
          </div>

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
