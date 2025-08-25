import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "Missing fields" });
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: "Email already in use" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });
    return res.status(201).json({ id: user._id });
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign(
      { sub: user._id, role: "user", email: user.email },
      process.env.JWT_SECRET || "devsecret",
      { expiresIn: "7d" }
    );
    return res.json({ token });
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
}

export async function me(req, res) {
  try {
    const userId = req.user?.sub;
    const user = await User.findById(userId).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "Not found" });
    return res.json(user);
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
}

export async function updateProfile(req, res) {
  try {
    const userId = req.user?.sub;
    let { name, place, bio, experiences } = req.body;
    const patch = {};
    if (typeof name === "string") patch.name = name;
    if (typeof place === "string") patch.place = place;
    if (typeof bio === "string") patch.bio = bio;
    if (typeof experiences === "string") {
      try {
        experiences = JSON.parse(experiences);
      } catch {}
    }
    if (Array.isArray(experiences)) patch.experiences = experiences;
    if (req.file) {
      patch.avatarUrl = `/uploads/${req.file.filename}`;
    }
    const user = await User.findByIdAndUpdate(userId, patch, {
      new: true,
    }).select("-passwordHash");
    return res.json(user);
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
}
