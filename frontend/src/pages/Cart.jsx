import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  async function fetchCart() {
    const token = localStorage.getItem("token");
    if (!token) return nav("/login");

    const res = await fetch("http://localhost:4000/api/cart", {
      headers: { Authorization: "Bearer " + token },
    });
    const data = await res.json();
    setCart(data);
  }

  async function removeItem(itemId) {
    const token = localStorage.getItem("token");
    await fetch("http://localhost:4000/api/cart/remove", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ itemId }),
    });
    fetchCart();
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

      {cart.length === 0 ? (
        <p>No items in cart</p>
      ) : (
        <div className="grid gap-4">
          {cart.map((item, idx) => (
            <div key={idx} className="border p-4 rounded shadow flex justify-between">
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
