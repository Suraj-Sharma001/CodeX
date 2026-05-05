import { Problem } from "../models/Problem.js";
import { User } from "../models/User.js";
import { logger } from "../utils/logger.js";
import { DashboardStats } from "../types/index.js";
import mongoose from "mongoose";

class AnalyticsService {
  async getDashboardStats(userId: string): Promise<DashboardStats> {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error("User not found");
      }

      const objectId = new mongoose.Types.ObjectId(userId);

      // Get difficulty breakdown
      const difficultyResult = await Problem.aggregate([
        { $match: { userId: objectId } },
        {
          $group: {
            _id: "$difficulty",
            count: { $sum: 1 },
          },
        },
      ]);

      const difficultyBreakdown = {
        Easy: 0,
        Medium: 0,
        Hard: 0,
      };

      difficultyResult.forEach((item) => {
        difficultyBreakdown[item._id as keyof typeof difficultyBreakdown] = item.count;
      });

      // Get topic distribution
      const topicResult = await Problem.aggregate([
        { $match: { userId: objectId } },
        { $unwind: "$topics" },
        {
          $group: {
            _id: "$topics",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]);

      const topicDistribution: Record<string, number> = {};
      topicResult.forEach((item) => {
        topicDistribution[item._id] = item.count;
      });

      // Get weak areas (problems marked for revision)
      const weakAreasResult = await Problem.aggregate([
        {
          $match: {
            userId: objectId,
            "revision.markedForRevision": true,
          },
        },
        { $unwind: "$topics" },
        {
          $group: {
            _id: "$topics",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]);

      const weakAreas = weakAreasResult.map((item) => item._id);

      // Get pending revisions count
      const revisionsPending = await Problem.countDocuments({
        userId: objectId,
        "revision.markedForRevision": true,
        "revision.nextRevisionDate": { $lte: new Date() },
      });

      return {
        totalProblems: user.stats.totalProblems,
        totalRevisions: user.stats.totalRevisions,
        currentStreak: user.stats.currentStreak,
        longestStreak: user.stats.longestStreak,
        weakAreas,
        revisionsPending,
        difficultyBreakdown,
        topicDistribution,
      };
    } catch (error) {
      logger.error(`Failed to get dashboard stats: ${error}`);
      throw error;
    }
  }

  async getTopicWiseStats(userId: string) {
    try {
      const objectId = new mongoose.Types.ObjectId(userId);

      const result = await Problem.aggregate([
        { $match: { userId: objectId } },
        { $unwind: "$topics" },
        {
          $group: {
            _id: "$topics",
            totalProblems: { $sum: 1 },
            solvedCount: {
              $sum: { $cond: [{ $eq: ["$status", "Solved"] }, 1, 0] },
            },
            avgTimeSpent: { $avg: "$timeTaken" },
            avgConfidence: { $avg: "$revision.confidenceLevel" },
          },
        },
        { $sort: { totalProblems: -1 } },
      ]);

      return result.map((topic) => ({
        ...topic,
        accuracy: ((topic.solvedCount / topic.totalProblems) * 100).toFixed(2),
        weakArea: topic.avgConfidence < 3,
      }));
    } catch (error) {
      logger.error(`Failed to get topic-wise stats: ${error}`);
      throw error;
    }
  }

  async getDailyActivity(userId: string, days: number = 30) {
    try {
      const objectId = new mongoose.Types.ObjectId(userId);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const result = await Problem.aggregate([
        {
          $match: {
            userId: objectId,
            dateSolved: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$dateSolved" },
            },
            problemsSolved: { $sum: 1 },
            timeSpent: { $sum: "$timeTaken" },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Fill in missing dates with 0 activity
      const activityMap: Record<string, any> = {};
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        activityMap[dateStr] = {
          date: dateStr,
          problemsSolved: 0,
          timeSpent: 0,
        };
      }

      result.forEach((item) => {
        activityMap[item._id] = {
          date: item._id,
          problemsSolved: item.problemsSolved,
          timeSpent: item.timeSpent,
        };
      });

      return Object.values(activityMap).reverse();
    } catch (error) {
      logger.error(`Failed to get daily activity: ${error}`);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
