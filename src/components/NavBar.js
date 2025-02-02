"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useState } from "react";

export default function NavBar() {
  const { cartItems, getTotalPrice } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const totalItems = cartItems.reduce((acc, ci) => acc + ci.quantity, 0);
  const totalCost = getTotalPrice().toFixed(2);

  const itemCountBadge = totalItems > 0 && (
    <span className="bg-red-600 text-white px-2 rounded-full text-sm">
      {totalItems}
    </span>
  );

  return (
    <header className="bg-gray-100 p-4">
      <div className="flex items-center justify-between">
        <button
          className="text-xl font-bold text-black"
          onClick={() =>
            typeof window !== "undefined" && window.location.assign("/")
          }
        >
          Simpler Shopping Cart
        </button>

        <div className="md:hidden relative">
          <button
            className="px-2 py-1 border rounded text-black"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            ☰
          </button>

          {!menuOpen && totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
              {totalItems}
            </span>
          )}
        </div>

        <div className="hidden md:flex items-center gap-4 text-black">
          <Link href="/cart" className="flex items-center gap-2">
            <span className="font-semibold">Cart</span>
            {itemCountBadge}
            <span>- ${totalCost}</span>
          </Link>
        </div>
      </div>

      {menuOpen && (
        <nav className="mt-2 md:hidden flex flex-col gap-2 text-black">
          <Link href="/cart" onClick={() => setMenuOpen(false)}>
            Cart {itemCountBadge} - ${totalCost}
          </Link>
        </nav>
      )}
    </header>
  );
}
