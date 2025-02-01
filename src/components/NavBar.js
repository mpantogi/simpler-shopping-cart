"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";

/**
 * A top navigation bar that shows:
 * - A link to "Home" (product listing)
 * - A cart widget with total # of items and total price
 */
export default function NavBar() {
  const { cartItems, getTotalPrice } = useCart();

  // Compute number of items in cart
  const totalItems = cartItems.reduce((acc, ci) => acc + ci.quantity, 0);

  // Compute total cost
  const totalCost = getTotalPrice().toFixed(2);

  return (
    <header className="bg-gray-100 p-4 flex justify-between items-center">
      <Link href="/">
        <h1 className="text-xl font-bold text-black">Simpler Shopping Cart</h1>
      </Link>

      <Link href="/cart">
        <div className="cursor-pointer flex items-center gap-2 text-black">
          <span className="font-semibold">Cart</span>
          <span>({totalItems} items)</span>
          <span>- ${totalCost}</span>
        </div>
      </Link>
    </header>
  );
}
