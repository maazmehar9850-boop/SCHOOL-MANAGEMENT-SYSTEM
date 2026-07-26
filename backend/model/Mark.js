import mongoose from "mongoose";

const markSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "register",
    default: null,
  },
  course: { type: String, required: true },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    default: null,
  },
  subject: { type: String, required: true },
  score: { type: Number, required: true },
  teacher: { type: String, required: true },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "register",
    default: null,
  },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Mark", markSchema);
