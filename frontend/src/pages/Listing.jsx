import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function Listing() {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    fetchItems();
  }, [category, maxPrice]);

  async function fetchItems() {
    setLoading(true);
    try {
      let url = new URL(`${API_BASE}/api/items`);
      if (category) url.searchParams.append("category", category);
      if (maxPrice) url.searchParams.append("maxPrice", maxPrice);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch items");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Fetch items error:", err);
      alert("Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  async function addToCart(itemId) {
    const token = localStorage.getItem("token");
    if (!token) return nav("/login");

    try {
      const res = await fetch(`${API_BASE}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ itemId, quantity: 1 }),
      });

      if (!res.ok) throw new Error("Failed to add item to cart");
      alert("Added to cart!");
    } catch (err) {
      console.error("Add to cart error:", err);
      alert("Failed to add item to cart");
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Products</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select
          className="border p-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Clothing">Clothing</option>
          <option value="Footwear">Footwear</option>
          <option value="Electronics">Electronics</option>
        </select>

        <input
          type="number"
          placeholder="Max Price"
          className="border p-2"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />

        <button
          onClick={() => nav("/cart")}
          className="ml-auto bg-green-600 text-white px-4 py-2 rounded"
        >
          View Cart
        </button>
      </div>

      {/* Item list */}
      {loading ? (
        <p>Loading products...</p>
      ) : items.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="border p-4 rounded shadow">
              <h2 className="font-bold">{item.title}</h2>
              <p>₹{item.price}</p>
              <p className="text-sm text-gray-500">{item.category}</p>
              <button
                onClick={() => addToCart(item.id)}
                className="mt-2 bg-indigo-600 text-white px-3 py-1 rounded"
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
