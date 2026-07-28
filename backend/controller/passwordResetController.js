import bcrypt from "bcrypt";
import register from "../model/register.js";
import PasswordResetRequest from "../model/PasswordResetRequest.js";
import { validatePasswordStrength } from "../utils/passwordPolicy.js";

export const requestPasswordReset = async (req, res) => {
  try {
    const { email, reason } = req.body;
    const emailNorm = String(email || "")
      .toLowerCase()
      .trim();

    const user = await register.findOne({ email: emailNorm });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        message: "Admin passwords must be reset by another administrator",
      });
    }

    const existingPending = await PasswordResetRequest.findOne({
      userId: user._id,
      status: "pending",
    });
    if (existingPending) {
      return res.status(409).json({
        message: "A reset request is already pending admin approval",
      });
    }

    const existingApproved = await PasswordResetRequest.findOne({
      userId: user._id,
      status: "approved",
    });
    if (existingApproved) {
      return res.status(409).json({
        message: "Your reset request is already approved. You can now reset your password.",
      });
    }

    const requestDoc = await PasswordResetRequest.create({
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      reason: reason || "",
      status: "pending",
    });

    return res.status(201).json({
      message: "Reset request submitted. An admin will review it shortly.",
      request: {
        id: requestDoc._id,
        email: requestDoc.email,
        status: requestDoc.status,
        createdAt: requestDoc.createdAt,
      },
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getResetRequestStatus = async (req, res) => {
  try {
    const emailNorm = String(req.query.email || "")
      .toLowerCase()
      .trim();
    if (!emailNorm) {
      return res.status(400).json({ message: "Email is required" });
    }

    const latest = await PasswordResetRequest.findOne({ email: emailNorm })
      .sort({ createdAt: -1 })
      .select("status createdAt reviewedAt adminNote resetTokenExpiresAt");

    if (!latest) {
      return res.status(200).json({ status: "none", message: "No reset request found" });
    }

    const messages = {
      pending: "Your request is waiting for admin approval.",
      approved: "Approved. You can now set a new password.",
      rejected: latest.adminNote || "Your request was rejected by admin.",
      completed: "Password already reset. You can log in with your new password.",
    };

    return res.status(200).json({
      status: latest.status,
      message: messages[latest.status] || "",
      reviewedAt: latest.reviewedAt,
    });
  } catch (error) {
    console.error("Reset status error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getPasswordResetRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;

    const requests = await PasswordResetRequest.find(filter)
      .sort({ createdAt: -1 })
      .populate("reviewedBy", "name email")
      .lean();

    return res.status(200).json(requests);
  } catch (error) {
    console.error("Get reset requests error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const approvePasswordResetRequest = async (req, res) => {
  try {
    const requestDoc = await PasswordResetRequest.findById(req.params.id);
    if (!requestDoc) {
      return res.status(404).json({ message: "Reset request not found" });
    }
    if (requestDoc.status !== "pending") {
      return res.status(400).json({ message: "Only pending requests can be approved" });
    }

    requestDoc.status = "approved";
    requestDoc.resetTokenHash = null;
    requestDoc.resetTokenExpiresAt = null;
    requestDoc.reviewedBy = req.user.id;
    requestDoc.reviewedAt = new Date();
    await requestDoc.save();

    return res.status(200).json({
      message: "Reset approved. The user can now reset their password directly in the app.",
      request: requestDoc,
    });
  } catch (error) {
    console.error("Approve reset error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const rejectPasswordResetRequest = async (req, res) => {
  try {
    const { adminNote } = req.body;
    const requestDoc = await PasswordResetRequest.findById(req.params.id);
    if (!requestDoc) {
      return res.status(404).json({ message: "Reset request not found" });
    }
    if (requestDoc.status !== "pending") {
      return res.status(400).json({ message: "Only pending requests can be rejected" });
    }

    requestDoc.status = "rejected";
    requestDoc.reviewedBy = req.user.id;
    requestDoc.reviewedAt = new Date();
    requestDoc.adminNote = adminNote || "Request rejected by admin";
    await requestDoc.save();

    return res.status(200).json({
      message: "Reset request rejected",
      request: requestDoc,
    });
  } catch (error) {
    console.error("Reject reset error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const completePasswordReset = async (req, res) => {
  try {
    const { email, Password } = req.body;
    const emailNorm = String(email || "").toLowerCase().trim();
    if (!emailNorm) {
      return res.status(400).json({ message: "Email is required" });
    }

    const passwordError = validatePasswordStrength(Password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const requestDoc = await PasswordResetRequest.findOne({
      email: emailNorm,
      status: "approved",
    }).sort({ updatedAt: -1 });

    if (!requestDoc) {
      return res.status(400).json({
        message: "Your reset request is not approved yet. Please wait for admin approval.",
      });
    }

    const user = await register.findById(requestDoc.userId);
    if (!user) {
      return res.status(404).json({ message: "User account not found" });
    }

    user.Password = await bcrypt.hash(Password, 10);
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await user.save();

    requestDoc.status = "completed";
    requestDoc.resetTokenHash = null;
    requestDoc.resetTokenExpiresAt = null;
    await requestDoc.save();

    return res.status(200).json({
      message: "Password reset successful. You can now log in.",
    });
  } catch (error) {
    console.error("Complete reset error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
