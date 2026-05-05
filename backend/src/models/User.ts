import mongoose, { Schema, Document } from "mongoose";
import bcryptjs from "bcryptjs";

export interface IUser extends Document {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  preferences: {
    darkMode: boolean;
    emailNotifications: boolean;
    revisionReminders: boolean;
    timezone: string;
  };
  stats: {
    totalProblems: number;
    totalRevisions: number;
    currentStreak: number;
    longestStreak: number;
  };
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Invalid email"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    preferences: {
      darkMode: { type: Boolean, default: false },
      emailNotifications: { type: Boolean, default: true },
      revisionReminders: { type: Boolean, default: true },
      timezone: { type: String, default: "UTC" },
    },
    stats: {
      totalProblems: { type: Number, default: 0 },
      totalRevisions: { type: Number, default: 0 },
      currentStreak: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
    return;
  }

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return await bcryptjs.compare(password, this.password);
};

// Index for email and username queries
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

export const User = mongoose.model<IUser>("User", userSchema);
