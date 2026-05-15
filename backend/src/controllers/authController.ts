import { CookieOptions, Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import { authService, RegisterData, LoginData } from "../services/authService.js";
import { logger } from "../utils/logger.js";
import { config } from "../config/env.js";

const ACCESS_COOKIE_MS = 7 * 24 * 60 * 60 * 1000;
const REFRESH_COOKIE_MS = 30 * 24 * 60 * 60 * 1000;

function authCookieOptions(maxAge: number): CookieOptions {
  return {
    httpOnly: true,
    secure: config.server.nodeEnv === "production",
    sameSite: config.server.nodeEnv === "production" ? "none" : "lax",
    path: "/",
    maxAge,
  };
}

function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string
): void {
  res.cookie("token", accessToken, authCookieOptions(ACCESS_COOKIE_MS));
  res.cookie("refreshToken", refreshToken, authCookieOptions(REFRESH_COOKIE_MS));
}

function clearAuthCookies(res: Response): void {
  const clearOpts = { path: "/" };
  res.clearCookie("token", clearOpts);
  res.clearCookie("refreshToken", clearOpts);
}

export class AuthController {
  async register(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, username, password, firstName, lastName }: RegisterData =
        req.body;

      // Basic validation
      if (!email || !username || !password || !firstName || !lastName) {
        res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
        return;
      }

      const result = await authService.register({
        email,
        username,
        password,
        firstName,
        lastName,
      });

      setAuthCookies(res, result.token, result.refreshToken);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Registration failed";
      logger.error(`Register error: ${message}`);
      res.status(400).json({
        success: false,
        message,
      });
    }
  }

  async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password }: LoginData = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
        return;
      }

      const result = await authService.login({ email, password });

      setAuthCookies(res, result.token, result.refreshToken);

      res.status(200).json({
        success: true,
        data: {
          user: result.user,
          token: result.token,
          refreshToken: result.refreshToken,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      logger.error(`Login error: ${message}`);
      res.status(401).json({
        success: false,
        message,
      }); 
    }
  }

  async refresh(req: AuthRequest, res: Response): Promise<void> {
    try {
      const refreshToken =
        req.body?.refreshToken ||
        (req.cookies as Record<string, string> | undefined)?.refreshToken;

      if (!refreshToken || typeof refreshToken !== "string") {
        res.status(400).json({
          success: false,
          message: "Refresh token is required",
        });
        return;
      }

      const result = await authService.refreshAccessToken(refreshToken);

      setAuthCookies(res, result.token, refreshToken);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Token refresh failed";
      logger.error(`Refresh error: ${message}`);
      res.status(401).json({
        success: false,
        message,
      });
    }
  }

  async getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
        return;
      }

      const user = await authService.getUserById(req.user.userId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to get user";
      logger.error(`GetMe error: ${message}`);
      res.status(400).json({
        success: false,
        message,
      });
    }
  }

  async logout(req: AuthRequest, res: Response): Promise<void> {
    clearAuthCookies(res);
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  }
}

export const authController = new AuthController();
