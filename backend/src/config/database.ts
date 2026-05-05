import mongoose from "mongoose";
import { config } from "./env.js";
import { logger } from "../utils/logger.js";

export async function connectDatabase() {
  try {
    const conn = await mongoose.connect(config.database.mongoUri, {
      dbName: config.database.dbName,
      maxPoolSize: 10,
      minPoolSize: 5,
    });

    logger.info(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`❌ MongoDB connection failed: ${error}`);
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
    logger.info("✅ MongoDB disconnected");
  } catch (error) {
    logger.error(`❌ MongoDB disconnection failed: ${error}`);
    process.exit(1);
  }
}
