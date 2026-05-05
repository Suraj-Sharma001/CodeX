import { Router } from "express";
import { aiController } from "../controllers/aiController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.use(authMiddleware);

router.post("/summarize", (req, res) => aiController.summarize(req, res));
router.post("/approach-to-code", (req, res) =>
  aiController.approachToCode(req, res)
);
router.post("/improvements", (req, res) =>
  aiController.improvements(req, res)
);
router.post("/interview-explain", (req, res) =>
  aiController.interviewExplain(req, res)
);
router.post("/missing-edges", (req, res) =>
  aiController.missingEdges(req, res)
);

export default router;
