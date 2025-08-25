import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import http from "http";

import leaderboardRoutes from "./src/routes/leaderboard.js";
import contestantRoutes from "./src/routes/contestants.js";
import authRoutes from "./src/routes/auth.js";
import contentRoutes from "./src/routes/content.js";
import userRoutes from "./src/routes/users.js";
import Contestant from "./src/models/Contestant.js";

dotenv.config();

const app = express();
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
// Ensure uploads directory exists and is served from an absolute path
fs.mkdirSync(path.resolve(process.cwd(), "uploads"), { recursive: true });
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/contestdb";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Mongo connected"))
  .catch((err) => console.error("Mongo error", err));

app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/contestants", contestantRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/users", userRoutes);

app.get("/api/health", (_, res) => res.json({ ok: true }));

// Optional: Ensure email unique index with case-insensitive collation exists
// This is idempotent and safe to run at startup
(async () => {
  try {
    await Contestant.init();
    const indexes = await Contestant.collection.indexes();
    const emailIdx = indexes.find((i) => i.name === "email_1");
    const needsCollation =
      !emailIdx?.collation || emailIdx.collation?.strength !== 2;
    if (!emailIdx || needsCollation) {
      if (emailIdx) {
        await Contestant.collection.dropIndex("email_1");
        console.log(
          "Dropped existing email_1 index to recreate with collation"
        );
      }
      await Contestant.collection.createIndex(
        { email: 1 },
        {
          name: "email_1",
          unique: true,
          collation: { locale: "en", strength: 2 },
        }
      );
      console.log(
        "Ensured unique email_1 index with case-insensitive collation"
      );
    }

    // Remove unintended unique index on `id` if it exists (breaks inserts when field is missing)
    const strayIdIdx = indexes.find((i) => i.name === "id_1" && i.unique);
    if (strayIdIdx) {
      try {
        await Contestant.collection.dropIndex("id_1");
        console.log("Dropped stray unique index id_1 on Contestant");
      } catch (e) {
        console.warn("Could not drop id_1 index:", e?.message || e);
      }
    }
  } catch (e) {
    console.warn("Index ensure warning:", e?.message || e);
  }
})();

const PORT = Number(process.env.PORT) || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    // Check if another healthy instance is already running on this port
    http
      .get(`http://localhost:${PORT}/api/health`, (res) => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          console.log(
            `Another instance is already running on port ${PORT}. Skipping duplicate start.`
          );
          // Exit quietly to avoid restart loops when using --watch
          process.exit(0);
        } else {
          console.error(
            `Port ${PORT} is in use but health check failed (status ${res.statusCode}). Please free the port or change PORT in .env.`
          );
          process.exit(1);
        }
      })
      .on("error", () => {
        console.error(
          `Port ${PORT} is in use by another process. Free the port or change PORT in .env.`
        );
        process.exit(1);
      });
  } else {
    console.error("Server error:", err);
    process.exit(1);
  }
});
