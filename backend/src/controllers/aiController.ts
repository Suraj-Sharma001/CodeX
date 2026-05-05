import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { aiService } from "../services/aiService.js";
import { logger } from "../utils/logger.js";

export class AiController {
  async summarize(req: AuthRequest, res: Response): Promise<void> {
    await this.run(req, res, (uid, pid) => aiService.summarizeApproach(uid, pid));
  }

  async approachToCode(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return;
      }
      const { problemId } = req.body;
      const language =
        (req.body.language as string) ||
        (req.query.language as string) ||
        "typescript";
      if (!problemId) {
        res.status(400).json({ success: false, message: "problemId required" });
        return;
      }
      const text = await aiService.approachToCode(
        req.user.userId,
        problemId,
        language
      );
      res.status(200).json({ success: true, data: { text } });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "AI request failed";
      logger.error(`AI approachToCode: ${message}`);
      res.status(503).json({ success: false, message });
    }
  }

  async improvements(req: AuthRequest, res: Response): Promise<void> {
    await this.run(req, res, (uid, pid) =>
      aiService.suggestImprovements(uid, pid)
    );
  }

  async interviewExplain(req: AuthRequest, res: Response): Promise<void> {
    await this.run(req, res, (uid, pid) =>
      aiService.interviewExplain(uid, pid)
    );
  }

  async missingEdges(req: AuthRequest, res: Response): Promise<void> {
    await this.run(req, res, (uid, pid) =>
      aiService.missingEdgeCases(uid, pid)
    );
  }

  private async run(
    req: AuthRequest,
    res: Response,
    fn: (userId: string, problemId: string) => Promise<string>
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return;
      }
      const problemId = req.body?.problemId as string;
      if (!problemId) {
        res.status(400).json({ success: false, message: "problemId required" });
        return;
      }
      const text = await fn(req.user.userId, problemId);
      res.status(200).json({ success: true, data: { text } });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "AI request failed";
      logger.error(`AI run: ${message}`);
      res.status(503).json({ success: false, message });
    }
  }
}

export const aiController = new AiController();
