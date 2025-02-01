"use client";
import { useCart } from "@/context/CartContext";
import { useEffect } from "react";
import ProductCard from "./ProductCard";

export default function ProductList({ products, discounts }) {
  const { addItem, setDiscounts } = useCart();

  useEffect(() => {
    if (discounts?.length) {
      setDiscounts(discounts);
    }
  }, [discounts, setDiscounts]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={() => addItem(product)}
        />
      ))}
    </div>
  );
}
