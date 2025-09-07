import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  async function fetchCart() {
    const token = localStorage.getItem("token");
    if (!token) return nav("/login");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/cart`, {
        headers: { Authorization: "Bearer " + token },
      });
      if (!res.ok) throw new Error("Failed to fetch cart");
      const data = await res.json();
      setCart(data);
    } catch (err) {
      console.error("Cart fetch error:", err);
      alert("Failed to load cart");
    } finally {
      setLoading(false);
    }
  }

  async function removeItem(itemId) {
    const token = localStorage.getItem("token");
    if (!token) return nav("/login");

    try {
      const res = await fetch(`${API_BASE}/cart/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ itemId }),
      });

      if (!res.ok) throw new Error("Failed to remove item");
      fetchCart();
    } catch (err) {
      console.error("Remove item error:", err);
      alert("Failed to remove item from cart");
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

      {loading ? (
        <p>Loading...</p>
      ) : cart.length === 0 ? (
        <p>No items in cart</p>
      ) : (
        <div className="grid gap-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="border p-4 rounded shadow flex justify-between"
            >
              <div>
                <h2 className="font-bold">{item.title}</h2>
                <p>₹{item.price}</p>
                <p>Qty: {item.quantity}</p>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => nav("/listing")}
        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded"
      >
        Back to Products
      </button>
    </div>
  );
}
