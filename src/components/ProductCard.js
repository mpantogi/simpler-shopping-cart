"use client";

import { useCart } from "@/context/CartContext";

export default function ProductCard({ product, onAddToCart }) {
  const { cartItems } = useCart();

  // Because cart items store { product_id, quantity, productData },
  // we find the item by matching product_id to product.id
  const cartItem = cartItems.find((ci) => ci.product_id === product.id);
  const alreadyInCart = cartItem ? cartItem.quantity : 0;

  // If the user already has quantity >= product.stock, disable adding
  const isAtStockLimit = alreadyInCart >= product.stock;
  const buttonText = isAtStockLimit ? "Out of Stock" : "Add to Cart";

  return (
    <div className="border p-4 rounded shadow-sm flex flex-col gap-2">
      <h2 className="font-semibold">{product.name}</h2>
      <p>Price: ${product.price.toFixed(2)}</p>
      <p>Stock: {product.stock}</p>
      <button
        onClick={() => {
          if (!isAtStockLimit) {
            onAddToCart(product);
          }
        }}
        disabled={isAtStockLimit}
        className={`px-4 py-2 rounded ${
          isAtStockLimit
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 text-white"
        }`}
      >
        {buttonText}
      </button>
    </div>
  );
}
