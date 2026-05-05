import { Router } from "express";
import { problemsController } from "../controllers/problemsController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// CRUD operations
router.post("/", (req, res) => problemsController.createProblem(req, res));
router.get("/", (req, res) => problemsController.getProblems(req, res));
router.get("/:id", (req, res) => problemsController.getProblemById(req, res));
router.put("/:id", (req, res) => problemsController.updateProblem(req, res));
router.delete("/:id", (req, res) => problemsController.deleteProblem(req, res));

// Special operations
router.post("/:id/toggle-favorite", (req, res) =>
  problemsController.toggleFavorite(req, res)
);
router.post("/:id/mark-for-revision", (req, res) =>
  problemsController.markForRevision(req, res)
);

export default router;
