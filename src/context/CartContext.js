"use client";

import { bankersRound } from "@/utils/rounding";
import { createContext, useContext, useMemo, useState } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [discountCode, setDiscountCode] = useState(null);
  const [discounts, setDiscounts] = useState([]);

  // Add item
  function addItem(product) {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) => {
          if (item.product.id === product.id) {
            // increment up to product stock
            const newQty = Math.min(item.quantity + 1, product.stock);
            return { ...item, quantity: newQty };
          }
          return item;
        });
      }
      return [...prev, { product, quantity: 1 }];
    });
  }

  // Remove item
  function removeItem(productId) {
    setCartItems((prev) =>
      prev.filter((item) => item.product.id !== productId)
    );
  }

  // Update item quantity
  function updateQuantity(productId, quantity) {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const newQty = Math.min(quantity, item.product.stock);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  }

  // Apply discount code
  function applyDiscountCode(code) {
    setDiscountCode(code);
  }

  // Calculate total with discount
  const getTotalPrice = useMemo(() => {
    return () => {
      let subtotal = cartItems.reduce((acc, curr) => {
        return acc + curr.product.price * curr.quantity;
      }, 0);

      if (discountCode) {
        const foundDiscount = discounts.find((d) => d.code === discountCode);
        if (foundDiscount) {
          subtotal -= (subtotal * foundDiscount.percentage) / 100;
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
