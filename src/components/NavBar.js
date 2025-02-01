"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useState } from "react";

/**
 * A top navigation bar that shows:
 * - Brand / home link
 * - Cart summary (# items, total $)
 * Mobile-friendly: stacks on small screens, horizontal on medium+.
 */
export default function NavBar() {
  const { cartItems, getTotalPrice } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  // Compute number of items in cart
  const totalItems = cartItems.reduce((acc, ci) => acc + ci.quantity, 0);
  const totalCost = getTotalPrice().toFixed(2);

  return (
    <header className="bg-gray-100 p-4">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-black">
          Simpler Shopping Cart
        </Link>

        {/* Hamburger button on small screens */}
        <button
          className="md:hidden px-2 py-1 border rounded text-black"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          ☰
        </button>

        {/* Right side (Cart) visible on medium+ */}
        <div className="hidden md:flex items-center gap-4 text-black">
          <Link href="/cart" className="flex items-center gap-1">
            <span className="font-semibold">Cart:</span>
            <span>{totalItems} items</span>
            <span>- ${totalCost}</span>
          </Link>
        </div>
      </div>

      {/* Mobile Menu when menuOpen = true */}
      {menuOpen && (
        <nav className="mt-2 md:hidden flex flex-col gap-2 text-black">
          <Link href="/cart" onClick={() => setMenuOpen(false)}>
            Cart ({totalItems}) - ${totalCost}
          </Link>
        </nav>
      )}
    </header>
  );
}
