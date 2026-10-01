import crypto from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const port = process.env.PORT || 3001;
const jwtSecret = process.env.JWT_SECRET || "api-tester-local-development-secret";
const usersFile = path.join(path.dirname(fileURLToPath(import.meta.url)), "users.json");

async function readUsers() {
  try {
    return JSON.parse(await readFile(usersFile, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function saveUsers(users) {
  await writeFile(usersFile, `${JSON.stringify(users, null, 2)}\n`, "utf8");
}

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ message: "Auth API is running." });
});

app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const users = await readUsers();
  const existingUser = users.find((user) => user.email === normalizedEmail);
  if (existingUser) {
    return res.status(409).json({ message: "This email is already registered." });
  }

  const user = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(password, 10),
  };
  users.push(user);
  await saveUsers(users);

  return res.status(201).json({
    message: "Account created. You can now log in.",
    user: { id: user.id, name: user.name, email: user.email },
  });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const users = await readUsers();
  const user = users.find((item) => item.email === normalizedEmail);

  if (!user || typeof password !== "string" || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: "Email or password is incorrect." });
  }

  const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: "1h" });
  return res.json({
    message: "Login successful.",
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
});

app.get("/api/auth/me", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Login token is required." });

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const users = await readUsers();
    const user = users.find((item) => item.id === decoded.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    return res.json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch {
    return res.status(401).json({ message: "Login token is invalid or expired." });
  }
});

app.listen(port, () => {
  console.log(`Auth API is running at http://localhost:${port}`);
});