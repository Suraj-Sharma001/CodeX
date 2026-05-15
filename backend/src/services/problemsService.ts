import mongoose from "mongoose";
import { Problem, IProblem } from "../models/Problem.js";
import { User } from "../models/User.js";
import { logger } from "../utils/logger.js";
import { ProblemRequest, ProblemsQuery, PaginatedResponse } from "../types/index.js";

class ProblemsService {
  async createProblem(
    userId: string,
    data: ProblemRequest
  ): Promise<IProblem> {
    try {
      const problem = new Problem({
        userId,
        ...data,
        status: "Solved",
        revisionCount: 0,
      });

      await problem.save();

      // Update user stats
      await User.findByIdAndUpdate(userId, {
        $inc: { "stats.totalProblems": 1 },
      });

      logger.info(`Problem created: ${problem.title} by user ${userId}`);
      return problem;
    } catch (error) {
      logger.error(`Failed to create problem: ${error}`);
      throw error;
    }
  }

  async getProblems(
    userId: string,
    query: ProblemsQuery
  ): Promise<PaginatedResponse<IProblem>> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 20;
      const skip = (page - 1) * limit;

      // Convert userId to ObjectId for proper MongoDB queries
      const userObjectId = new mongoose.Types.ObjectId(userId);

      // DEBUG: Log the userId and filter
      logger.info(`DEBUG getProblems - userId: ${userId}, userObjectId: ${userObjectId.toString()}`);

      // Build filter
      let filter: any = { userId: userObjectId };
      
      logger.info(`DEBUG Filter before applied: ${JSON.stringify(filter)}`);

      if (query.difficulty) {
        filter.difficulty = query.difficulty;
      }

      if (query.platform) {
        filter.platform = query.platform;
      }

      if (query.topic) {
        filter.topics = { $in: [query.topic] };
      }

      if (query.status) {
        filter.status = query.status;
      }

      if (query.isFavorited !== undefined) {
        filter.isFavorited = query.isFavorited;
      }

      if (query.markedForRevision !== undefined) {
        filter["revision.markedForRevision"] = query.markedForRevision;
      }

      if (query.search) {
        filter.$text = { $search: query.search };
      }

      // Sort
      const sortField = query.sortBy || "createdAt";
      const sortOrder = query.order === "asc" ? 1 : -1;
      const sort: any = { [sortField]: sortOrder };

      // Fetch problems
      const problems = await Problem.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      // Get total count
      const total = await Problem.countDocuments(filter);
      
      // DEBUG: Log results
      logger.info(`DEBUG getProblems - Found ${problems.length} problems, Total: ${total}`);
      if (problems.length === 0 && total > 0) {
        logger.warn(`ISSUE DETECTED: Count shows ${total} problems but find() returned 0. Filter: ${JSON.stringify(filter)}`);
        // Let's check all problems for this user with different query approach
        const allProblemsForUser = await Problem.find({ userId: userObjectId }).lean();
        logger.warn(`Alternative query returned ${allProblemsForUser.length} problems`);
        if (allProblemsForUser.length > 0) {
          logger.warn(`First problem userId type: ${typeof allProblemsForUser[0].userId}, value: ${allProblemsForUser[0].userId}`);
        }
      }

      return {
        data: problems as any,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error(`Failed to get problems: ${error}`);
      throw error;
    }
  }

  async getProblemById(userId: string, problemId: string): Promise<IProblem> {
    try {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      const problem = await Problem.findOne({
        _id: problemId,
        userId: userObjectId,
      });

      if (!problem) {
        throw new Error("Problem not found");
      }

      return problem;
    } catch (error) {
      logger.error(`Failed to get problem: ${error}`);
      throw error;
    }
  }

  async updateProblem(
    userId: string,
    problemId: string,
    data: Partial<ProblemRequest>
  ): Promise<IProblem> {
    try {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      const problem = await Problem.findOneAndUpdate(
        { _id: problemId, userId: userObjectId },
        { $set: data },
        { new: true, runValidators: true }
      );

      if (!problem) {
        throw new Error("Problem not found");
      }

      logger.info(`Problem updated: ${problemId}`);
      return problem;
    } catch (error) {
      logger.error(`Failed to update problem: ${error}`);
      throw error;
    }
  }

  async deleteProblem(userId: string, problemId: string): Promise<void> {
    try {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      const problem = await Problem.findOneAndDelete({
        _id: problemId,
        userId: userObjectId,
      });

      if (!problem) {
        throw new Error("Problem not found");
      }

      // Update user stats
      const totalProblems = await Problem.countDocuments({ userId: userObjectId });

      await User.findByIdAndUpdate(userId, {
        $set: { "stats.totalProblems": totalProblems },
      });

      logger.info(`Problem deleted: ${problemId}`);
    } catch (error) {
      logger.error(`Failed to delete problem: ${error}`);
      throw error;
    }
  }

  async toggleFavorite(userId: string, problemId: string): Promise<IProblem> {
    try {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      const problem = await Problem.findOne({
        _id: problemId,
        userId: userObjectId,
      });

      if (!problem) {
        throw new Error("Problem not found");
      }

      const updated = await Problem.findByIdAndUpdate(
        problemId,
        { $set: { isFavorited: !problem.isFavorited } },
        { new: true }
      );

      if (!updated) {
        throw new Error("Failed to update problem");
      }

      return updated;
    } catch (error) {
      logger.error(`Failed to toggle favorite: ${error}`);
      throw error;
    }
  }

  async markForRevision(
    userId: string,
    problemId: string,
    confidenceLevel: number
  ): Promise<IProblem> {
    try {
      // Validate confidence level early
      if (confidenceLevel < 1 || confidenceLevel > 5) {
        throw new Error("Confidence level must be between 1 and 5");
      }

      const userObjectId = new mongoose.Types.ObjectId(userId);
      const problem = await Problem.findOne({
        _id: problemId,
        userId: userObjectId,
      });

      if (!problem) {
        throw new Error("Problem not found");
      }

      // Calculate next revision date based on confidence
      const intervals: Record<number, number> = {
        1: 1,
        2: 3,
        3: 7,
        4: 14,
        5: 30,
      };

      const daysUntilNextRevision = intervals[confidenceLevel] || 1;
      const nextRevisionDate = new Date();
      nextRevisionDate.setDate(
        nextRevisionDate.getDate() + daysUntilNextRevision
      );

      const updated = await Problem.findByIdAndUpdate(
        problemId,
        {
          $set: {
            "revision.markedForRevision": true,
            "revision.nextRevisionDate": nextRevisionDate,
            "revision.confidenceLevel": confidenceLevel,
            "revision.easeFactor": 2.5,
            "revision.intervalDays": daysUntilNextRevision,
            "revision.sm2Repetitions": 0,
          },
        },
        { new: true }
      );

      if (!updated) {
        throw new Error("Failed to update problem for revision");
      }

      return updated;
    } catch (error) {
      logger.error(`Failed to mark for revision: ${error}`);
      throw error;
    }
  }

  async getTopicDistribution(userId: string): Promise<Record<string, number>> {
    try {
      const result = await Problem.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $unwind: "$topics" },
        {
          $group: {
            _id: "$topics",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]);

      const distribution: Record<string, number> = {};
      result.forEach((item) => {
        distribution[item._id] = item.count;
      });

      return distribution;
    } catch (error) {
      logger.error(`Failed to get topic distribution: ${error}`);
      throw error;
    }
  }

  async getDifficultyBreakdown(userId: string): Promise<Record<string, number>> {
    try {
      const result = await Problem.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: "$difficulty",
            count: { $sum: 1 },
          },
        },
      ]);

      const breakdown: Record<string, number> = {
        Easy: 0,
        Medium: 0,
        Hard: 0,
      };

      result.forEach((item) => {
        breakdown[item._id] = item.count;
      });

      return breakdown;
    } catch (error) {
      logger.error(`Failed to get difficulty breakdown: ${error}`);
      throw error;
    }
  }

  async getWeakAreas(userId: string): Promise<string[]> {
    try {
      const result = await Problem.aggregate([
        {
          $match: {
            userId: require("mongoose").Types.ObjectId(userId),
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

      return result.map((item) => item._id);
    } catch (error) {
      logger.error(`Failed to get weak areas: ${error}`);
      throw error;
    }
  }

  async getPendingRevisions(userId: string, limit: number = 10): Promise<IProblem[]> {
    try {
      const problems = await Problem.find({
        userId,
        "revision.markedForRevision": true,
        "revision.nextRevisionDate": { $lte: new Date() },
      })
        .sort({ "revision.nextRevisionDate": 1 })
        .limit(limit);

      return problems;
    } catch (error) {
      logger.error(`Failed to get pending revisions: ${error}`);
      throw error;
    }
  }
}

export const problemsService = new ProblemsService();
