import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

export interface JwtPayload {
  userId: string;
  email: string;
}

export function generateAccessToken(payload: JwtPayload): string {
  const options: any = { expiresIn: config.jwt.expiresIn };
  return jwt.sign(payload, config.jwt.secret as string, options);
}

export function generateRefreshToken(payload: JwtPayload): string {
  const options: any = { expiresIn: config.jwt.refreshExpiresIn };
  return jwt.sign(payload, config.jwt.refreshSecret as string, options);
}

export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, config.jwt.secret) as JwtPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
  } catch {
    return null;
  }
}
