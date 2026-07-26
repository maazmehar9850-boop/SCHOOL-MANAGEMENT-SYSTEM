import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
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
  date: { type: String, required: true },
  status: { type: String, enum: ["Present", "Absent"], required: true },
  teacher: { type: String, required: true },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "register",
    default: null,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Attendance", attendanceSchema);
