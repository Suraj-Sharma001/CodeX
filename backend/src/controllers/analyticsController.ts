import { Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { analyticsService } from "../services/analyticsService.js";
import { logger } from "../utils/logger.js";

export class AnalyticsController {
  async getDashboardStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return;
      }

      const stats = await analyticsService.getDashboardStats(req.user.userId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to get dashboard stats";
      logger.error(`Dashboard stats error: ${message}`);
      res.status(400).json({ success: false, message });
    }
  }

  async getTopicWiseStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return;
      }

      const stats = await analyticsService.getTopicWiseStats(req.user.userId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to get topic-wise stats";
      logger.error(`Topic stats error: ${message}`);
      res.status(400).json({ success: false, message });
    }
  }

  async getDailyActivity(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return;
      }

      const days = parseInt(req.query.days as string) || 30;
      const activity = await analyticsService.getDailyActivity(
        req.user.userId,
        days
      );

      res.status(200).json({
        success: true,
        data: activity,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to get daily activity";
      logger.error(`Daily activity error: ${message}`);
      res.status(400).json({ success: false, message });
    }
  }
}

export const analyticsController = new AnalyticsController();
