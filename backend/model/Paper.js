import mongoose from "mongoose";

const paperSchema = new mongoose.Schema({
  title: { type: String, required: true },
  course: { type: String, required: true },
  subject: { type: String, default: "" },
  teacher: { type: String },
  /** Rich HTML instructions / header for the paper */
  instructions: { type: String, default: "" },
  questions: [
    {
      q: String,
      marks: Number,
    },
  ],
  fileUrl: { type: String, default: "" },
  fileName: { type: String, default: "" },
  fileType: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

paperSchema.pre("save", function () {
  this.updatedAt = new Date();
});

export default mongoose.model("Paper", paperSchema);
