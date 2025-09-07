const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = "secret123";

// Temporary "databases"
let users = [];   // {id, name, email, passwordHash}
let items = [
  { id: 1, title: "T-shirt", price: 500, category: "Clothing" },
  { id: 2, title: "Shoes", price: 1500, category: "Footwear" },
  { id: 3, title: "Headphones", price: 2000, category: "Electronics" }
];
let carts = {};   // userId -> [ { itemId, quantity } ]

// Middleware
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { userId }
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// Signup
app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: "Email already exists" });
  }
  const hashed = await bcrypt.hash(password, 10);
  const newUser = { id: users.length + 1, name, email, passwordHash: hashed };
  users.push(newUser);
  const token = jwt.sign({ userId: newUser.id }, JWT_SECRET);
  res.json({ token, user: { id: newUser.id, name, email } });
});

// Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ error: "Invalid credentials" });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(400).json({ error: "Invalid credentials" });
  const token = jwt.sign({ userId: user.id }, JWT_SECRET);
  res.json({ token, user: { id: user.id, name: user.name, email } });
});

// CRUD for items (basic, no DB)
app.get("/api/items", (req, res) => {
  const { category, minPrice, maxPrice } = req.query;
  let filtered = items;
  if (category) filtered = filtered.filter(i => i.category === category);
  if (minPrice) filtered = filtered.filter(i => i.price >= Number(minPrice));
  if (maxPrice) filtered = filtered.filter(i => i.price <= Number(maxPrice));
  res.json(filtered);
});

// Cart APIs
app.get("/api/cart", auth, (req, res) => {
  const userCart = carts[req.user.userId] || [];
  const cartItems = userCart.map(ci => {
    const item = items.find(i => i.id === ci.itemId);
    return { ...item, quantity: ci.quantity };
  });
  res.json(cartItems);
});

app.post("/api/cart/add", auth, (req, res) => {
  const { itemId, quantity } = req.body;
  if (!carts[req.user.userId]) carts[req.user.userId] = [];
  const existing = carts[req.user.userId].find(ci => ci.itemId === itemId);
  if (existing) existing.quantity += quantity;
  else carts[req.user.userId].push({ itemId, quantity });
  res.json({ success: true });
});

app.post("/api/cart/remove", auth, (req, res) => {
  const { itemId } = req.body;
  carts[req.user.userId] = (carts[req.user.userId] || []).filter(ci => ci.itemId !== itemId);
  res.json({ success: true });
});

app.listen(4000, () => console.log("Backend running on http://localhost:4000"));

app.use(express.static("../frontend/dist"));
app.get("*", (req, res) => {
  res.sendFile(__dirname + "/../frontend/dist/index.html");
});
