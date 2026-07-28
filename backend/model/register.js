import mongoose from "mongoose";

const registerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    Password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "teacher", "student"],
      default: "student",
      required: true,
    },
    bio: {
      type: String,
      default: "",
    },
    subject: {
      type: String,
      default: "",
    },
    experience: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const register = mongoose.model("register", registerSchema);

export default register;
