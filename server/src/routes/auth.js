import { Router } from "express";
import { login, seedAdmin, hasAdmin } from "../controllers/authController.js";

const router = Router();
router.post("/login", login);
// Optional seeding endpoint; enable only if ALLOW_SEED=1
router.post("/seed", (req, res, next) => {
  if (process.env.ALLOW_SEED === "1") return seedAdmin(req, res);
  return res.status(403).json({ error: "Disabled" });
});
router.get("/status", hasAdmin);

export default router;
