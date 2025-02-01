"use client";

import { bankersRound } from "@/utils/rounding";
import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [discountCode, setDiscountCode] = useState(null);
  const [discounts, setDiscounts] = useState([]);

  // Add item to cart (only if not exceeding stock)
  function addItem(product) {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        // increment quantity up to stock
        if (existing.quantity < product.stock) {
          return prev.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          // Optional: you can show an alert or message if stock is exceeded
          console.warn("Cannot add more; stock limit reached");
          return prev;
        }
      }
      // If not in cart yet, add new item with quantity=1
      return [...prev, { product, quantity: 1 }];
    });
  }

  // Remove item from cart
  function removeItem(productId) {
    setCartItems((prev) => prev.filter((ci) => ci.product.id !== productId));
  }

  // Update item quantity (not exceeding stock)
  function updateQuantity(productId, newQty) {
    setCartItems((prev) =>
      prev.map((ci) => {
        if (ci.product.id === productId) {
          const safeQty = Math.min(newQty, ci.product.stock);
          return { ...ci, quantity: safeQty };
        }
        return ci;
      })
    );
  }

  // Apply discount code (we’ll validate later in getTotalPrice)
  function applyDiscountCode(code) {
    setDiscountCode(code);
  }

  // Calculated total
  const getTotalPrice = useMemo(() => {
    return () => {
      let subtotal = cartItems.reduce(
        (acc, ci) => acc + ci.product.price * ci.quantity,
        0
      );
      if (discountCode) {
        const found = discounts.find((d) => d.code === discountCode);
        if (found) {
          subtotal -= (found.percentage / 100) * subtotal;
        }
      }
      return bankersRound(subtotal, 2);
    };
  }, [cartItems, discountCode, discounts]);

  const value = {
    cartItems,
    discountCode,
    discounts,
    setDiscounts,
    addItem,
    removeItem,
    updateQuantity,
    applyDiscountCode,
    getTotalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
