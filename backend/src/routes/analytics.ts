import { Router } from "express";
import { analyticsController } from "../controllers/analyticsController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

router.get("/dashboard", (req, res) =>
  analyticsController.getDashboardStats(req, res)
);
router.get("/topic-wise", (req, res) =>
  analyticsController.getTopicWiseStats(req, res)
);
router.get("/daily-activity", (req, res) =>
  analyticsController.getDailyActivity(req, res)
);

export default router;
