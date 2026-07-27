import mongoose from "mongoose";

const materialSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["video", "pdf"], required: true },
    title: { type: String, default: "" },
    fileUrl: { type: String, required: true },
    fileName: { type: String, default: "" },
  },
  { _id: true }
);

const courseSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    courseCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    teacher: {
      type: String,
      required: true,
      trim: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "register",
      default: null,
    },
    className: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    maxStudents: {
      type: Number,
      default: 30,
    },
    roomNumber: {
      type: String,
      default: "",
    },
    schedule: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    videoUrl: {
      type: String,
      default: "",
    },
    pdfUrl: {
      type: String,
      default: "",
    },
    materials: {
      type: [materialSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
