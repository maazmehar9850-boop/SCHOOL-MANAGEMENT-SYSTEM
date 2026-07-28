import mongoose from "mongoose";

const passwordResetRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "register",
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, default: "" },
    role: {
      type: String,
      enum: ["teacher", "student"],
      required: true,
    },
    reason: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },
    resetTokenHash: { type: String, default: null },
    resetTokenExpiresAt: { type: Date, default: null },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "register",
      default: null,
    },
    reviewedAt: { type: Date, default: null },
    adminNote: { type: String, default: "" },
  },
  { timestamps: true }
);

passwordResetRequestSchema.index({ email: 1, status: 1 });
passwordResetRequestSchema.index({ resetTokenHash: 1 });

const PasswordResetRequest = mongoose.model(
  "PasswordResetRequest",
  passwordResetRequestSchema
);

export default PasswordResetRequest;
