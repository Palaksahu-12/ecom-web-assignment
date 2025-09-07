import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    const res = await fetch("http://localhost:4000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      nav("/listing");
    } else {
      alert(data.error || "Signup failed");
    }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={submit} className="bg-white p-6 rounded shadow w-80">
        <h2 className="text-xl font-bold mb-4">Sign Up</h2>
        <input
          className="border p-2 w-full mb-2"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="border p-2 w-full mb-2"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          className="border p-2 w-full mb-2"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="bg-indigo-600 text-white w-full py-2 rounded">
          Sign Up
        </button>
        <p
          className="text-sm mt-2 text-blue-600 cursor-pointer"
          onClick={() => nav("/login")}
        >
          Already have an account? Login
        </p>
      </form>
    </div>
  );
}
