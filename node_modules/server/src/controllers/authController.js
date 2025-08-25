import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function login(req, res) {
  const { email, password } = req.body;
  const inputEmail = (email || "").trim();
  // Case-insensitive lookup to avoid login failures due to email casing
  const admin = await Admin.findOne({ email: inputEmail }).collation({
    locale: "en",
    strength: 2,
  });
  if (!admin) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign(
    { sub: admin._id, role: admin.role, email: admin.email },
    process.env.JWT_SECRET || "devsecret",
    { expiresIn: "7d" }
  );
  res.json({ token });
}

export async function seedAdmin(req, res) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Missing email/password" });
  const inputEmail = (email || "").trim();
  const exists = await Admin.findOne({ email: inputEmail }).collation({
    locale: "en",
    strength: 2,
  });
  const passwordHash = await bcrypt.hash(password, 10);
  if (exists) {
    // Idempotent: update password when seeding is enabled
    exists.passwordHash = passwordHash;
    await exists.save();
    return res.status(200).json({ id: exists._id, updated: true });
  }
  const a = await Admin.create({ email: inputEmail, passwordHash });
  res.status(201).json({ id: a._id, created: true });
}

export async function hasAdmin(_req, res) {
  const count = await Admin.countDocuments();
  res.json({ exists: count > 0, allowSeed: process.env.ALLOW_SEED === "1" });
}
