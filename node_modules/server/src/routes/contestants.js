import { Router } from "express";
import multer from "multer";
import path from "path";
import {
  register,
  list,
  stats,
  updateScore,
  remove,
  exportCSV,
} from "../controllers/contestantController.js";
import { requireAdmin } from "../middleware/authMiddleware.js";
import { requireAuth } from "../middleware/authUser.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const base = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, base + ext);
  },
});
const upload = multer({ storage });
const router = Router();

// Require a logged-in user to register for the event
router.post("/register", requireAuth, upload.single("file"), register);
router.get("/", requireAdmin, list);
router.get("/stats", requireAdmin, stats);
router.patch("/:id/score", requireAdmin, updateScore);
router.delete("/:id", requireAdmin, remove);
router.get("/export/csv", requireAdmin, exportCSV);

export default router;
