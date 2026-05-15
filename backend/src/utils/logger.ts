import winston from "winston";
import { config } from "../config/env.js";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.printf((info) => {
    const context = info.context ? ` [${info.context}]` : "";
    const requestId = info.requestId ? ` [${info.requestId}]` : "";
    return `${info.timestamp} ${info.level}${requestId}${context}: ${info.message}`;
  })
);

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: "logs/error.log",
    level: "error",
  }),
  new winston.transports.File({
    filename: "logs/all.log",
  }),
];

export const logger = winston.createLogger({
  level: config.logging.level,
  levels,
  format,
  transports,
});

// Helper to generate request ID
export function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 11);
}
