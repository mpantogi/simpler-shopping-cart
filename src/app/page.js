"use client";

import ProductList from "@/components/ProductList";
import { useCart } from "@/context/CartContext";
import { getDiscounts, getProducts } from "@/services/api";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const { addItem, setDiscounts } = useCart();

  useEffect(() => {
    // Fetch products
    getProducts()
      .then((data) => setProducts(data))
      .catch(console.error);

    // Fetch discounts
    getDiscounts()
      .then((disc) => setDiscounts(disc))
      .catch(console.error);
  }, [setDiscounts]);

  return (
    <main className="p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">Product Listing</h1>
      <ProductList products={products} onAddToCart={addItem} />
    </main>
  );
}
