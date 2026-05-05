import { User, IUser } from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { logger } from "../utils/logger.js";

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  async register(data: RegisterData) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email: data.email }, { username: data.username }],
      });

      if (existingUser) {
        throw new Error("User with this email or username already exists");
      }

      // Create new user
      const user = new User({
        email: data.email,
        username: data.username,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      await user.save();

      // Generate tokens
      const accessToken = generateAccessToken({
        userId: user._id.toString(),
        email: user.email,
      });

      const refreshToken = generateRefreshToken({
        userId: user._id.toString(),
        email: user.email,
      });

      logger.info(`User registered: ${user.email}`);

      return {
        token: accessToken,
        refreshToken,
        user: this.formatUser(user),
      };
    } catch (error) {
      logger.error(`Registration failed: ${error}`);
      throw error;
    }
  }

  async login(data: LoginData) {
    try {
      // Find user by email
      const user = await User.findOne({ email: data.email }).select("+password");

      if (!user) {
        throw new Error("Invalid email or password");
      }

      // Compare password
      const isPasswordValid = await user.comparePassword(data.password);

      if (!isPasswordValid) {
        throw new Error("Invalid email or password");
      }

      // Generate tokens
      const accessToken = generateAccessToken({
        userId: user._id.toString(),
        email: user.email,
      });

      const refreshToken = generateRefreshToken({
        userId: user._id.toString(),
        email: user.email,
      });

      logger.info(`User logged in: ${user.email}`);

      return {
        token: accessToken,
        refreshToken,
        user: this.formatUser(user),
      };
    } catch (error) {
      logger.error(`Login failed: ${error}`);
      throw error;
    }
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = verifyRefreshToken(refreshToken);

      if (!payload) {
        throw new Error("Invalid refresh token");
      }

      const user = await User.findById(payload.userId);

      if (!user) {
        throw new Error("User not found");
      }

      const newAccessToken = generateAccessToken({
        userId: user._id.toString(),
        email: user.email,
      });

      return {
        token: newAccessToken,
        user: this.formatUser(user),
      };
    } catch (error) {
      logger.error(`Token refresh failed: ${error}`);
      throw error;
    }
  }

  async getUserById(userId: string) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error("User not found");
      }

      return this.formatUser(user);
    } catch (error) {
      logger.error(`Failed to get user: ${error}`);
      throw error;
    }
  }

  private formatUser(user: IUser) {
    return {
      _id: user._id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      preferences: user.preferences,
      stats: user.stats,
    };
  }
}

export const authService = new AuthService();
