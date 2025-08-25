import { Router } from "express";
import { getContent, updateContent } from "../controllers/contentController.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();
router.get("/", getContent);
router.put("/", requireAdmin, updateContent);
export default router;
