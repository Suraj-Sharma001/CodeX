import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { config } from "./config/env.js";
import { errorHandlerMiddleware, notFoundMiddleware } from "./middleware/auth.js";
import { logger } from "./utils/logger.js";

// Import routes
import authRoutes from "./routes/auth.js";
import problemsRoutes from "./routes/problems.js";
import analyticsRoutes from "./routes/analytics.js";
import revisionsRoutes from "./routes/revisions.js";
import aiRoutes from "./routes/ai.js";

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cookieParser());
  app.use(
    cors({
      origin: config.cors.origin,
      credentials: config.cors.credentials,
    })
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  // Request logging
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      logger.info(
        `${req.method} ${req.path} ${res.statusCode} ${duration}ms`
      );
    });
    next();
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ success: true, message: "API is running" });
  });

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/problems", problemsRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/revisions", revisionsRoutes);
  app.use("/api/ai", aiRoutes);

  // Error handling
  app.use(notFoundMiddleware);
  app.use(errorHandlerMiddleware);

  return app;
}
