import { createApp } from "./app.ts";
import { connectDatabase, disconnectDatabase } from "./config/database.ts";
import { config, validateConfig } from "./config/env.ts";
import { logger } from "./utils/logger.ts";

validateConfig();

const app = createApp();
const PORT = config.server.port;

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();

    // Start server
    const server = app.listen(PORT, () => {
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
