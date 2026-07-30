import mongoose from "mongoose";

const feeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "register",
      required: true,
      index: true,
    },
    studentName: { type: String, required: true, trim: true },
    studentEmail: { type: String, default: "", trim: true },
    title: { type: String, required: true, trim: true },
    term: { type: String, default: "", trim: true },
    amountDue: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["pending", "partial", "paid"],
      default: "pending",
      index: true,
    },
    dueDate: { type: Date, default: null },
    paidAt: { type: Date, default: null },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Bank Transfer", "Online", "Cheque", "Other", ""],
      default: "",
    },
    receiptNumber: { type: String, default: "", index: true },
    notes: { type: String, default: "", trim: true },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "register",
      default: null,
    },
    recordedByName: { type: String, default: "" },
  },
  { timestamps: true }
);

feeSchema.index({ studentId: 1, status: 1 });
feeSchema.index({ createdAt: -1 });

export default mongoose.model("Fee", feeSchema);
