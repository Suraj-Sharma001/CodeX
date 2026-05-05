import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { revisionsService } from "../services/revisionsService.js";
import { logger } from "../utils/logger.js";

export class RevisionsController {
  async getPending(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return;
      }

      const limit = Math.min(
        parseInt(req.query.limit as string, 10) || 50,
        100
      );
      const problems = await revisionsService.getPendingRevisions(
        req.user.userId,
        limit
      );

      res.status(200).json({
        success: true,
        data: problems,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load revisions";
      logger.error(`getPending revisions: ${message}`);
      res.status(400).json({ success: false, message });
    }
  }

  async complete(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return;
      }

      const { problemId } = req.params;
      const { performanceRating, canSolveAgain } = req.body;

      const problem = await revisionsService.completeRevision(
        req.user.userId,
        problemId,
        {
          performanceRating: Number(performanceRating),
          canSolveAgain: Boolean(canSolveAgain),
        }
      );

      res.status(200).json({
        success: true,
        data: problem,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to complete revision";
      logger.error(`complete revision: ${message}`);
      res.status(400).json({ success: false, message });
    }
  }

  async getStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return;
      }

      const stats = await revisionsService.getRevisionStats(req.user.userId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load stats";
      logger.error(`revision stats: ${message}`);
      res.status(400).json({ success: false, message });
    }
  }
}

export const revisionsController = new RevisionsController();
