import Fee from "../model/Fee.js";
import register from "../model/register.js";

function computeStatus(amountDue, amountPaid) {
  const due = Number(amountDue) || 0;
  const paid = Number(amountPaid) || 0;
  if (paid <= 0) return "pending";
  if (paid >= due) return "paid";
  return "partial";
}

function nextReceiptNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `RCP-${y}${m}${d}-${rand}`;
}

function serializeFee(fee) {
  const doc = fee.toObject ? fee.toObject() : fee;
  const balance = Math.max(0, Number(doc.amountDue || 0) - Number(doc.amountPaid || 0));
  return { ...doc, balance };
}

/** Admin: list all fees (optional status / search filters) */
export const getFees = async (req, res) => {
  try {
    const { status, q } = req.query;
    const filter = {};

    if (status && status !== "all") {
      if (!["pending", "partial", "paid"].includes(status)) {
        return res.status(400).json({ message: "Invalid status filter" });
      }
      filter.status = status;
    }

    if (q && String(q).trim()) {
      const term = String(q).trim();
      filter.$or = [
        { studentName: { $regex: term, $options: "i" } },
        { studentEmail: { $regex: term, $options: "i" } },
        { title: { $regex: term, $options: "i" } },
        { term: { $regex: term, $options: "i" } },
        { receiptNumber: { $regex: term, $options: "i" } },
      ];
    }

    const fees = await Fee.find(filter).sort({ createdAt: -1 }).lean();
    return res.json(fees.map((f) => serializeFee(f)));
  } catch (error) {
    console.error("getFees error:", error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};

/** Admin: summary totals */
export const getFeeSummary = async (_req, res) => {
  try {
    const [pending, partial, paid, totals] = await Promise.all([
      Fee.countDocuments({ status: "pending" }),
      Fee.countDocuments({ status: "partial" }),
      Fee.countDocuments({ status: "paid" }),
      Fee.aggregate([
        {
          $group: {
            _id: null,
            totalDue: { $sum: "$amountDue" },
            totalPaid: { $sum: "$amountPaid" },
          },
        },
      ]),
    ]);

    const totalDue = totals[0]?.totalDue || 0;
    const totalPaid = totals[0]?.totalPaid || 0;

    return res.json({
      pending,
      partial,
      paid,
      totalDue,
      totalPaid,
      totalBalance: Math.max(0, totalDue - totalPaid),
    });
  } catch (error) {
    console.error("getFeeSummary error:", error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};

/** Admin: get one fee (receipt data) */
export const getFeeById = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) return res.status(404).json({ message: "Fee record not found" });
    return res.json(serializeFee(fee));
  } catch (error) {
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};

/** Admin: assign fee to one student */
export const createFee = async (req, res) => {
  try {
    const { studentId, title, term, amountDue, dueDate, notes } = req.body;

    if (!studentId || !title || amountDue == null) {
      return res.status(400).json({ message: "studentId, title, and amountDue are required" });
    }

    const amount = Number(amountDue);
    if (Number.isNaN(amount) || amount < 0) {
      return res.status(400).json({ message: "amountDue must be a valid non-negative number" });
    }

    const student = await register.findOne({ _id: studentId, role: "student" });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const fee = await Fee.create({
      studentId: student._id,
      studentName: student.name,
      studentEmail: student.email || "",
      title: String(title).trim(),
      term: String(term || "").trim(),
      amountDue: amount,
      amountPaid: 0,
      status: "pending",
      dueDate: dueDate ? new Date(dueDate) : null,
      notes: String(notes || "").trim(),
      recordedBy: req.user.id,
      recordedByName: req.user.name || "Admin",
    });

    return res.status(201).json({
      message: "Fee assigned successfully",
      fee: serializeFee(fee),
    });
  } catch (error) {
    console.error("createFee error:", error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};

/** Admin: assign the same fee to all students */
export const assignFeeToAll = async (req, res) => {
  try {
    const { title, term, amountDue, dueDate, notes } = req.body;

    if (!title || amountDue == null) {
      return res.status(400).json({ message: "title and amountDue are required" });
    }

    const amount = Number(amountDue);
    if (Number.isNaN(amount) || amount < 0) {
      return res.status(400).json({ message: "amountDue must be a valid non-negative number" });
    }

    const students = await register.find({ role: "student" }).select("name email");
    if (!students.length) {
      return res.status(404).json({ message: "No students found to assign fees" });
    }

    const docs = students.map((student) => ({
      studentId: student._id,
      studentName: student.name,
      studentEmail: student.email || "",
      title: String(title).trim(),
      term: String(term || "").trim(),
      amountDue: amount,
      amountPaid: 0,
      status: "pending",
      dueDate: dueDate ? new Date(dueDate) : null,
      notes: String(notes || "").trim(),
      recordedBy: req.user.id,
      recordedByName: req.user.name || "Admin",
    }));

    const created = await Fee.insertMany(docs);

    return res.status(201).json({
      message: `Fee assigned to ${created.length} students`,
      count: created.length,
    });
  } catch (error) {
    console.error("assignFeeToAll error:", error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};

/** Admin: collect / update payment on a fee */
export const collectFee = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) return res.status(404).json({ message: "Fee record not found" });

    const { amountPaid, paymentMethod, notes, markFullyPaid } = req.body;

    let paid;
    if (markFullyPaid) {
      paid = Number(fee.amountDue);
    } else if (amountPaid != null) {
      paid = Number(amountPaid);
      if (Number.isNaN(paid) || paid < 0) {
        return res.status(400).json({ message: "amountPaid must be a valid non-negative number" });
      }
      if (paid > Number(fee.amountDue)) {
        paid = Number(fee.amountDue);
      }
    } else {
      return res.status(400).json({ message: "amountPaid or markFullyPaid is required" });
    }

    const status = computeStatus(fee.amountDue, paid);
    fee.amountPaid = paid;
    fee.status = status;

    if (paymentMethod) {
      const allowed = ["Cash", "Bank Transfer", "Online", "Cheque", "Other"];
      if (!allowed.includes(paymentMethod)) {
        return res.status(400).json({ message: "Invalid payment method" });
      }
      fee.paymentMethod = paymentMethod;
    }

    if (notes != null) fee.notes = String(notes).trim();

    if (status === "paid" || status === "partial") {
      fee.paidAt = fee.paidAt || new Date();
      if (!fee.receiptNumber) fee.receiptNumber = nextReceiptNumber();
    }

    fee.recordedBy = req.user.id;
    fee.recordedByName = req.user.name || "Admin";

    await fee.save();

    return res.json({
      message:
        status === "paid"
          ? "Fee collected — marked as paid"
          : status === "partial"
            ? "Partial payment recorded"
            : "Fee updated",
      fee: serializeFee(fee),
    });
  } catch (error) {
    console.error("collectFee error:", error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};

/** Admin: delete a fee record */
export const deleteFee = async (req, res) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);
    if (!fee) return res.status(404).json({ message: "Fee record not found" });
    return res.json({ message: "Fee record deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};

/** Student: own fees */
export const getMyFees = async (req, res) => {
  try {
    const fees = await Fee.find({ studentId: req.user.id }).sort({ createdAt: -1 }).lean();
    return res.json(fees.map((f) => serializeFee(f)));
  } catch (error) {
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};
