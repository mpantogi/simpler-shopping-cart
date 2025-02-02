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
  const [cartItems, setCartItems] = useState([]);
  const [discountCode, setDiscountCode] = useState(null);
  const [discounts, setDiscounts] = useState([]);
  const [cartLoaded, setCartLoaded] = useState(false);

  /** Load cartId & cartItems from localStorage on first render */
  useEffect(() => {
    const savedId = localStorage.getItem("cartId");
    const savedCart = localStorage.getItem("cartItems");
    const savedDiscount = localStorage.getItem("discountCode");

    if (savedId) setCartId(savedId);
    if (savedCart) setCartItems(JSON.parse(savedCart));
    if (savedDiscount) setDiscountCode(savedDiscount);
    setCartLoaded(true);
  }, []);

  useEffect(() => {
    if (cartLoaded && cartItems.length === 0) {
      setDiscountCode(null);
      localStorage.removeItem("discountCode");
    }
  }, [cartLoaded, cartItems]);

  useEffect(() => {
    if (cartId) {
      localStorage.setItem("cartId", cartId);
      fetchAndSetCart(cartId);
    }
  }, [cartId]);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (discountCode) {
      localStorage.setItem("discountCode", discountCode);
    } else {
      localStorage.removeItem("discountCode");
    }
  }, [discountCode]);

  useEffect(() => {
    if (cartId) {
      syncCartToServer(cartItems);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems]);

  const getSubtotal = useMemo(() => {
    return () => {
      return cartItems.reduce((acc, ci) => {
        const price = ci.productData?.price ?? 0;
        return acc + price * ci.quantity;
      }, 0);
    };
  }, [cartItems]);

  const getTotalPrice = useMemo(() => {
    return () => {
      let subtotal = getSubtotal();
      if (discountCode) {
        const disc = discounts.find((d) => d.code === discountCode);
        if (disc) {
          if (disc.type === "FLAT") {
            subtotal = Math.max(0, subtotal - disc.amount);
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
  }, [cartItems, discountCode, discounts, getSubtotal]);

  /** Fetch the cart from the server and merge with local data */
  async function fetchAndSetCart(id) {
    try {
      const cart = await getServerCart(id);
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
      const cart = await createCartOnServer();
      if (cart?.id) {
        setCartId(cart.id);
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
      setCartItems((prev) => {
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

        if (areArraysEqual(prev, newItems)) {
          return prev;
        }
        return newItems;
      });
    } catch (err) {
      console.error("Failed to update server cart:", err);
    }
  }

  async function addItem(product) {
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

  function removeItem(productId) {
    setCartItems((prev) => prev.filter((ci) => ci.product_id !== productId));
  }

  function updateQuantity(productId, newQty) {
    setCartItems((prev) =>
      prev.map((ci) =>
        ci.product_id === productId ? { ...ci, quantity: newQty } : ci
      )
    );
  }

  function applyDiscountCode(code) {
    setDiscountCode(code || null);
    if (code) {
      localStorage.setItem("discountCode", code);
    } else {
      localStorage.removeItem("discountCode");
    }
  }

  // Simple deep compare of cart item arrays, checking product_id & quantity.
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
        getSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
