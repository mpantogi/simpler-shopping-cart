export default function ProductCard({ product, onAddToCart }) {
  return (
    <div className="border p-4 rounded shadow-sm">
      <h2 className="font-semibold mb-2">{product.name}</h2>
      <p className="mb-1">Price: ${product.price.toFixed(2)}</p>
      <p className="mb-2">Stock: {product.stock}</p>
      <button
        onClick={() => onAddToCart(product)}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Add to Cart
      </button>
    </div>
  );
}
