import { Router, Request, Response, NextFunction } from "express";
import { authController } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// Simple in-memory rate limiter for auth endpoints
interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const rateLimitStore: RateLimitStore = {};
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5;

const authLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || "unknown";
  const now = Date.now();
  const key = `${ip}`;

  if (!rateLimitStore[key]) {
    rateLimitStore[key] = { count: 0, resetTime: now + WINDOW_MS };
  }

  if (now > rateLimitStore[key].resetTime) {
    rateLimitStore[key] = { count: 0, resetTime: now + WINDOW_MS };
  }

  rateLimitStore[key].count++;

  if (rateLimitStore[key].count > MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: "Too many login/register attempts, please try again later",
    });
  }

  next();
};

// Public routes
router.post("/register", authLimiter, (req, res) => authController.register(req, res));
router.post("/login", authLimiter, (req, res) => authController.login(req, res));
router.post("/refresh", (req, res) => authController.refresh(req, res));

// Protected routes
router.get("/me", authMiddleware, (req, res) => authController.getMe(req, res));
router.post("/logout", authMiddleware, (req, res) =>
  authController.logout(req, res)
);

export default router;
