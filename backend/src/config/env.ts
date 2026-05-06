import dotenv from "dotenv";

dotenv.config();

export const config = {
  server: {
    port: parseInt(process.env.PORT || "5000", 10),
    nodeEnv: process.env.NODE_ENV || "development",
    isDev: process.env.NODE_ENV === "development",
  },
  database: {
    mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/codetrack",
    dbName: process.env.MONGO_DB_NAME || "codetrack",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "your_jwt_secret_key_change_in_production",
    expiresIn: process.env.JWT_EXPIRE || "7d",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "your_refresh_secret_key",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE || "30d",
  },
    cors: {
    origin: [
      "http://localhost:3000",
      "https://code-x-iota-ruddy.vercel.app",
    ],
    credentials: true,
  },
  email: {
    service: process.env.EMAIL_SERVICE || "gmail",
    user: process.env.EMAIL_USER || "",
    password: process.env.EMAIL_PASS || "",
  },
  logging: {
    level: process.env.LOG_LEVEL || "info",
  },
};

// Validate required environment variables
export function validateConfig() {
  const required = ["MONGO_URI", "JWT_SECRET"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn(
      `⚠️  Missing environment variables: ${missing.join(", ")}`
    );
  }
}
