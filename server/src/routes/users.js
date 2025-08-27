import { Router } from "express";
import multer from "multer";
import path from "path";
import {
  register,
  login,
  me,
  updateProfile,
  googleSignIn,
} from "../controllers/userController.js";
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

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleSignIn);
router.get("/me", requireAuth, me);
router.put("/me", requireAuth, upload.single("avatar"), updateProfile);

export default router;
