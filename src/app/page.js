"use client";

import ProductList from "@/components/ProductList";
import { useCart } from "@/context/CartContext";
import { getProducts } from "@/services/api";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const { addItem } = useCart();

  useEffect(() => {
    getProducts()
      .then((data) => setProducts(data))
      .catch(console.error);
  }, []);

  return (
    <main className="p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">Product Listing</h1>
      <ProductList products={products} onAddToCart={addItem} />
    </main>
  );
}
