import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { problemsService } from "../services/problemsService.js";
import { logger } from "../utils/logger.js";
import { ProblemRequest, ProblemsQuery } from "../types/index.js";

export class ProblemsController {
  async createProblem(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return;
      }

      const data: ProblemRequest = req.body;

      if (!data.title || !data.difficulty || !data.topics) {
        res.status(400).json({
          success: false,
          message: "Missing required fields: title, difficulty, topics",
        });
        return;
      }

      const problem = await problemsService.createProblem(req.user.userId, data);

      res.status(201).json({
        success: true,
        data: problem,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create problem";
      logger.error(`Create problem error: ${message}`);
      res.status(400).json({ success: false, message });
    }
  }

  async getProblems(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return;
      }

      const query: ProblemsQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        difficulty: req.query.difficulty as string,
        platform: req.query.platform as string,
        topic: req.query.topic as string,
        status: req.query.status as string,
        isFavorited: req.query.isFavorited === "true",
        markedForRevision: req.query.markedForRevision === "true",
        search: req.query.search as string,
        sortBy: (req.query.sortBy as "createdAt" | "dateSolved" | "revisionCount") || "createdAt",
        order: (req.query.order as "asc" | "desc") || "desc",
      };

      const result = await problemsService.getProblems(req.user.userId, query);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch problems";
      logger.error(`Get problems error: ${message}`);
      res.status(400).json({ success: false, message });
    }
  }

  async getProblemById(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return;
      }

      const { id } = req.params;
      const problem = await problemsService.getProblemById(req.user.userId, id);

      res.status(200).json({
        success: true,
        data: problem,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Problem not found";
      logger.error(`Get problem error: ${message}`);
      res.status(404).json({ success: false, message });
    }
  }

  async updateProblem(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return;
      }

      const { id } = req.params;
      const data: Partial<ProblemRequest> = req.body;

      const problem = await problemsService.updateProblem(
        req.user.userId,
        id,
        data
      );

      res.status(200).json({
        success: true,
        data: problem,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update problem";
      logger.error(`Update problem error: ${message}`);
      res.status(400).json({ success: false, message });
    }
  }

  async deleteProblem(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return;
      }

      const { id } = req.params;
      await problemsService.deleteProblem(req.user.userId, id);

      res.status(200).json({
        success: true,
        message: "Problem deleted successfully",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete problem";
      logger.error(`Delete problem error: ${message}`);
      res.status(400).json({ success: false, message });
    }
  }

  async toggleFavorite(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return;
      }

      const { id } = req.params;
      const problem = await problemsService.toggleFavorite(req.user.userId, id);

      res.status(200).json({
        success: true,
        data: problem,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to toggle favorite";
      logger.error(`Toggle favorite error: ${message}`);
      res.status(400).json({ success: false, message });
    }
  }

  async markForRevision(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return;
      }

      const { id } = req.params;
      const { confidenceLevel } = req.body;

      if (!confidenceLevel || confidenceLevel < 1 || confidenceLevel > 5) {
        res.status(400).json({
          success: false,
          message: "Confidence level must be between 1 and 5",
        });
        return;
      }

      const problem = await problemsService.markForRevision(
        req.user.userId,
        id,
        confidenceLevel
      );

      const daysUntilNext = (problem as any).revision?.nextRevisionDate
        ? Math.ceil(
            (new Date((problem as any).revision.nextRevisionDate).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 0;

      res.status(200).json({
        success: true,
        data: problem,
        message: `Problem marked for revision. Next date: ${daysUntilNext} days`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to mark for revision";
      logger.error(`Mark for revision error: ${message}`);
      res.status(400).json({ success: false, message });
    }
  }
}

export const problemsController = new ProblemsController();
