"use client";
import {
  createCartOnServer,
  getServerCart,
  updateServerCart,
} from "@/services/api";
import { bankersRound } from "@/utils/rounding";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartId, setCartId] = useState(null);
  /**
   * We'll store each item as:
   *   { product_id, quantity, productData?: {id, name, price, stock} }
   */
  const [cartItems, setCartItems] = useState([]);
  const [discountCode, setDiscountCode] = useState(null);
  const [discounts, setDiscounts] = useState([]);

  /** Re-fetch the cart from the server (GET /carts/{id}) */
  async function fetchAndSetCart(id) {
    try {
      const cart = await getServerCart(id);
      // cart => { id: "xyz", items: [ { product_id, quantity }, ... ] }
      // Merge each server item with local productData if we have it
      setCartItems((prev) => {
        return cart.items.map((si) => {
          const existing = prev.find((ci) => ci.product_id === si.product_id);
          return {
            product_id: si.product_id,
            quantity: si.quantity,
            productData: existing?.productData || {
              id: si.product_id,
              name: "Unknown",
              price: 0,
              stock: 99,
            },
          };
        });
      });
    } catch (err) {
      console.error("Failed to fetch server cart:", err);
    }
  }

  /** Ensure we have a cart ID by calling POST /carts if needed */
  async function ensureServerCart() {
    if (cartId) return cartId;
    try {
      const cart = await createCartOnServer(); // => { id, items: [...] }
      if (cart?.id) {
        setCartId(cart.id);
        // store items from server
        setCartItems(
          cart.items.map((si) => ({
            product_id: si.product_id,
            quantity: si.quantity,
            productData: {
              id: si.product_id,
              name: "Unknown",
              price: 0,
              stock: 99,
            },
          }))
        );
        return cart.id;
      }
    } catch (err) {
      console.error("Failed to create cart on server:", err);
    }
    return null;
  }

  /**
   * Every time our local cart changes, do:
   * PUT /carts/{id} with an array of items => [ { product_id, quantity }, ... ]
   * Then store the returned cart's items in local state, so we stay in sync
   */
  async function syncCartToServer(items) {
    if (!cartId) return;
    try {
      const arrayOfItems = items.map((ci) => ({
        product_id: ci.product_id,
        quantity: ci.quantity,
      }));
      const updatedCart = await updateServerCart(cartId, arrayOfItems);
      // updatedCart => { id, items: [ { product_id, quantity }, ... ] }

      // Compare with current local items
      setCartItems((prev) => {
        // Build array for the server's result
        const newItems = updatedCart.items.map((si) => {
          const ex = prev.find((p) => p.product_id === si.product_id);
          return {
            product_id: si.product_id,
            quantity: si.quantity,
            productData: ex?.productData || {
              id: si.product_id,
              name: "Unknown",
              price: 0,
              stock: 99,
            },
          };
        });

        // If newItems is effectively the same as prev, skip updating to avoid re-render loops
        if (areArraysEqual(prev, newItems)) {
          return prev; // no change, no re-render
        }
        return newItems;
      });
    } catch (err) {
      console.error("Failed to update server cart:", err);
    }
  }

  // Add an item to local cart
  async function addItem(product) {
    // ensure we have a cart
    const id = await ensureServerCart();
    if (!id) return;

    setCartItems((prev) => {
      const existing = prev.find((ci) => ci.product_id === product.id);
      if (existing) {
        if (existing.quantity < product.stock) {
          return prev.map((ci) =>
            ci.product_id === product.id
              ? {
                  ...ci,
                  quantity: ci.quantity + 1,
                  productData: product,
                }
              : ci
          );
        } else {
          console.warn("Reached stock limit for", product.name);
          return prev;
        }
      }
      return [
        ...prev,
        {
          product_id: product.id,
          quantity: 1,
          productData: product,
        },
      ];
    });
  }

  // Remove an item
  function removeItem(productId) {
    setCartItems((prev) => prev.filter((ci) => ci.product_id !== productId));
  }

  // Update quantity
  function updateQuantity(productId, newQty) {
    setCartItems((prev) =>
      prev.map((ci) =>
        ci.product_id === productId ? { ...ci, quantity: newQty } : ci
      )
    );
  }

  function applyDiscountCode(code) {
    setDiscountCode(code || null);
  }

  // On each local cart update, sync to server
  useEffect(() => {
    if (cartId) {
      syncCartToServer(cartItems);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems]);

  /** Compute local total using productData.price, discount logic, etc. */
  const getTotalPrice = useMemo(() => {
    return () => {
      let subtotal = 0;
      cartItems.forEach((ci) => {
        const price = ci.productData?.price ?? 0;
        subtotal += price * ci.quantity;
      });
      if (discountCode) {
        const disc = discounts.find((d) => d.code === discountCode);
        if (disc) {
          if (disc.type === "FLAT") {
            let newTotal = subtotal - disc.amount;
            if (newTotal < 0) newTotal = 0;
            subtotal = newTotal;
          } else if (disc.type === "PERCENTAGE") {
            subtotal = subtotal * (1 - disc.amount / 100);
          } else if (disc.type === "BOGO") {
            let discountAmount = 0;
            cartItems.forEach(({ quantity, productData }) => {
              const freeUnits = Math.floor(quantity / 2);
              discountAmount += (productData?.price ?? 0) * freeUnits;
            });
            subtotal -= discountAmount;
          }
        }
      }
      return bankersRound(subtotal, 2);
    };
  }, [cartItems, discountCode, discounts]);

  /** Simple deep compare of cart item arrays, checking product_id & quantity. 
    You could do fancier logic or a JSON.stringify compare. */
  function areArraysEqual(oldItems, newItems) {
    if (oldItems.length !== newItems.length) return false;
    for (let i = 0; i < oldItems.length; i++) {
      if (
        oldItems[i].product_id !== newItems[i].product_id ||
        oldItems[i].quantity !== newItems[i].quantity
      ) {
        return false;
      }
    }
    return true;
  }

  return (
    <CartContext.Provider
      value={{
        cartId,
        cartItems,
        discountCode,
        discounts,
        setDiscounts,
        addItem,
        removeItem,
        updateQuantity,
        applyDiscountCode,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
