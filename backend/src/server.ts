import { createApp } from "./app";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { config, validateConfig } from "./config/env";
import { logger } from "./utils/logger";

validateConfig();

const app = createApp();
const PORT = Number(process.env.PORT) || config.server.port;

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();

    // Start server
    const server = app.listen(PORT,  "0.0.0.0", () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`📚 Environment: ${config.server.nodeEnv}`);
    });

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      logger.info("SIGTERM signal received: closing HTTP server");
      server.close(async () => {
        logger.info("HTTP server closed");
        await disconnectDatabase();
        process.exit(0);
      });
    });

    process.on("SIGINT", async () => {
      logger.info("SIGINT signal received: closing HTTP server");
      server.close(async () => {
        logger.info("HTTP server closed");
        await disconnectDatabase();
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error}`);
    process.exit(1);
  }
}

startServer();
