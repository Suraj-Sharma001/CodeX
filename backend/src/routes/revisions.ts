import { Router } from "express";
import { revisionsController } from "../controllers/revisionsController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.use(authMiddleware);

router.get("/pending", (req, res) => revisionsController.getPending(req, res));
router.get("/stats", (req, res) => revisionsController.getStats(req, res));
router.post("/:problemId/complete", (req, res) =>
  revisionsController.complete(req, res)
);

export default router;
