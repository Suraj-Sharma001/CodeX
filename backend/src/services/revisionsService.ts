import mongoose from "mongoose";
import { Problem, IProblem } from "../models/Problem.js";
import { User } from "../models/User.js";
import { logger } from "../utils/logger.js";
import { nextSm2State } from "../utils/spacedRepetition.js";

export interface CompleteRevisionInput {
  performanceRating: number;
  canSolveAgain: boolean;
}

class RevisionsService {
  async getPendingRevisions(
    userId: string,
    limit: number = 50
  ): Promise<IProblem[]> {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const problems = await Problem.find({
      userId: userObjectId,
      "revision.markedForRevision": true,
      "revision.nextRevisionDate": { $lte: new Date() },
    })
      .sort({ "revision.nextRevisionDate": 1 })
      .limit(limit);

    return problems;
  }

  async completeRevision(
    userId: string,
    problemId: string,
    input: CompleteRevisionInput
  ): Promise<IProblem> {
    const { performanceRating, canSolveAgain } = input;
    if (
      performanceRating === undefined ||
      performanceRating < 1 ||
      performanceRating > 5
    ) {
      throw new Error("performanceRating must be between 1 and 5");
    }

    const problem = await Problem.findOne({
      _id: problemId,
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!problem) {
      throw new Error("Problem not found");
    }

    const quality = performanceRating;
    const prev = {
      easeFactor: problem.revision?.easeFactor ?? 2.5,
      intervalDays: problem.revision?.intervalDays ?? 1,
      repetitions: problem.revision?.sm2Repetitions ?? 0,
    };

    const next = nextSm2State(prev, quality);
    const nextRevisionDate = new Date();
    nextRevisionDate.setDate(nextRevisionDate.getDate() + next.intervalDays);

    const updated = await Problem.findOneAndUpdate(
      { _id: problemId, userId: new mongoose.Types.ObjectId(userId) },
      {
        $set: {
          lastReviewedAt: new Date(),
          "revision.nextRevisionDate": nextRevisionDate,
          "revision.easeFactor": next.easeFactor,
          "revision.intervalDays": next.intervalDays,
          "revision.sm2Repetitions": next.repetitions,
          "revision.canSolveAgain": canSolveAgain,
          "revision.markedForRevision": true,
        },
        $inc: {
          revisionCount: 1,
          "revision.revisionCount": 1,
        },
        $push: {
          "revision.revisedAt": new Date(),
        },
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw new Error("Problem not found");
    }

    await User.findByIdAndUpdate(userId, {
      $inc: { "stats.totalRevisions": 1 },
    });

    logger.info(`Revision completed for problem ${problemId} by user ${userId}`);
    return updated;
  }

  async getRevisionStats(userId: string): Promise<{
    dueNow: number;
    overdue: number;
    upcomingWeek: number;
    markedTotal: number;
  }> {
    const now = new Date();
    const weekAhead = new Date();
    weekAhead.setDate(weekAhead.getDate() + 7);

    const base = {
      userId: new mongoose.Types.ObjectId(userId),
      "revision.markedForRevision": true,
    };

    const [dueNow, overdue, upcomingWeek, markedTotal] = await Promise.all([
      Problem.countDocuments({
        ...base,
        "revision.nextRevisionDate": { $lte: now },
      }),
      Problem.countDocuments({
        ...base,
        "revision.nextRevisionDate": { $lt: now },
      }),
      Problem.countDocuments({
        ...base,
        "revision.nextRevisionDate": { $gt: now, $lte: weekAhead },
      }),
      Problem.countDocuments(base),
    ]);

    return { dueNow, overdue, upcomingWeek, markedTotal };
  }
}

export const revisionsService = new RevisionsService();
