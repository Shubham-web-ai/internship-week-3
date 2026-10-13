import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

function makeToken(user) {
  return jwt.sign(
    { userId: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" || !name.trim() ||
      typeof email !== "string" || !email.trim() ||
      typeof password !== "string" || password.length < 8
    ) {
      return res.status(400).json({
        message: "Name and email are required; password must be at least 8 characters"
      });
    }

    const existing = await User.findOne({ email: email.trim().toLowerCase() });

    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: await bcrypt.hash(password, 10)
    });

    res.status(201).json({
      token: makeToken(user),
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }
    console.error(error);
    res.status(500).json({ message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      token: makeToken(user),
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
});

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.userId).select("-password");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
});

export default router;