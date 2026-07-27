import mongoose from "mongoose";

const datesheetSchema = new mongoose.Schema({
  title: { type: String, required: true },
  course: { type: String, required: true },
  teacher: { type: String },
  /** Rich HTML notes / instructions */
  notes: { type: String, default: "" },
  entries: [
    {
      subject: String,
      date: String,
      startTime: String,
      endTime: String,
      /** Legacy single time string; also used as "start - end" display */
      time: String,
      room: String,
      invigilator: String,
    },
  ],
  /** draft = editable; finalized = locked after admin approves exam readiness */
  status: { type: String, enum: ["draft", "finalized"], default: "draft" },
  finalizedAt: { type: Date, default: null },
  finalizedBy: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

datesheetSchema.pre("save", function () {
  this.updatedAt = new Date();
});

export default mongoose.model("Datesheet", datesheetSchema);
