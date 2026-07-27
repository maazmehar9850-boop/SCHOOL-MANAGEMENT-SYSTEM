import mongoose from "mongoose";

const syllabusSchema = new mongoose.Schema({
  title: { type: String, required: true },
  course: { type: String, required: true },
  subject: { type: String, default: "" },
  teacher: { type: String },
  content: { type: String, default: "" },
  topics: { type: String, default: "" },
  fileUrl: { type: String, default: "" },
  fileName: { type: String, default: "" },
  fileType: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

syllabusSchema.pre("save", function () {
  this.updatedAt = new Date();
});

export default mongoose.model("Syllabus", syllabusSchema);
