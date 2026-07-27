import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Submission from "../model/Submission.js";
import Assignment from "../model/Assignment.js";
import Enrollment from "../model/Enrollment.js";
import Course from "../model/Course.js";
import Mark from "../model/Mark.js";
import { detectFileType } from "../middleware/upload.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assertStudentEnrolled = async (studentId, courseId) => {
  if (!courseId) return false;
  const enrollment = await Enrollment.findOne({
    studentId,
    courseId,
    status: "active",
  });
  return Boolean(enrollment);
};

const removeFileIfExists = (fileUrl) => {
  if (!fileUrl) return;
  const relative = fileUrl.replace(/^\/+/, "");
  const full = path.join(__dirname, "..", relative);
  if (fs.existsSync(full)) {
    try {
      fs.unlinkSync(full);
    } catch {
      /* ignore */
    }
  }
};

export const submitAssignment = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can submit assignments" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "File is required (PDF or image)" });
    }

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      removeFileIfExists(`/uploads/submissions/${req.file.filename}`);
      return res.status(404).json({ message: "Assignment not found" });
    }

    const enrolled = await assertStudentEnrolled(req.user.id, assignment.courseId);
    if (!enrolled) {
      removeFileIfExists(`/uploads/submissions/${req.file.filename}`);
      return res.status(403).json({ message: "You are not enrolled in this course" });
    }

    if (assignment.dueDate && new Date() > new Date(assignment.dueDate)) {
      const existingLate = await Submission.findOne({
        assignmentId: assignment._id,
        studentId: req.user.id,
      });
      if (!existingLate) {
        removeFileIfExists(`/uploads/submissions/${req.file.filename}`);
        return res.status(400).json({ message: "Deadline has passed" });
      }
    }

    const fileUrl = `/uploads/submissions/${req.file.filename}`;
    const type = detectFileType(req.file.mimetype);

    let submission = await Submission.findOne({
      assignmentId: assignment._id,
      studentId: req.user.id,
    });

    if (submission) {
      if (submission.status === "graded") {
        removeFileIfExists(fileUrl);
        return res.status(400).json({
          message: "Submission already graded. Contact your teacher to revise.",
        });
      }
      if (assignment.dueDate && new Date() > new Date(assignment.dueDate)) {
        removeFileIfExists(fileUrl);
        return res.status(400).json({ message: "Cannot update after deadline" });
      }
      removeFileIfExists(submission.fileUrl);
      submission.fileUrl = fileUrl;
      submission.fileName = req.file.originalname;
      submission.type = type;
      submission.submittedAt = new Date();
      submission.status = "submitted";
      await submission.save();
    } else {
      submission = await Submission.create({
        assignmentId: assignment._id,
        studentId: req.user.id,
        studentName: req.user.name || "",
        fileUrl,
        fileName: req.file.originalname,
        type,
        submittedAt: new Date(),
      });
    }

    const populated = await Submission.findById(submission._id)
      .populate("assignmentId", "title dueDate course courseId")
      .populate("studentId", "name email");

    res.status(201).json({ message: "Submission saved", submission: populated });
  } catch (error) {
    if (req.file?.filename) {
      removeFileIfExists(`/uploads/submissions/${req.file.filename}`);
    }
    if (error.code === 11000) {
      return res.status(409).json({ message: "Already submitted" });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getAssignmentSubmissions = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (
      req.user.role === "teacher" &&
      String(assignment.teacherId) !== String(req.user.id)
    ) {
      return res.status(403).json({ message: "Not your assignment" });
    }

    const submissions = await Submission.find({ assignmentId: assignment._id })
      .populate("studentId", "name email phone")
      .sort({ submittedAt: -1 });

    // Full class roster = enrolled students + submission status
    let enrollments = [];
    if (assignment.courseId) {
      enrollments = await Enrollment.find({
        courseId: assignment.courseId,
        status: "active",
      }).populate("studentId", "name email phone");
    }

    const subByStudent = new Map(
      submissions.map((s) => [String(s.studentId?._id || s.studentId), s])
    );

    const roster = enrollments
      .filter((e) => e.studentId)
      .map((e) => {
        const sid = String(e.studentId._id);
        const submission = subByStudent.get(sid) || null;
        return {
          studentId: e.studentId,
          studentName: e.studentId.name,
          email: e.studentId.email,
          phone: e.studentId.phone || "",
          status: submission
            ? submission.status === "graded"
              ? "graded"
              : "submitted"
            : "not_submitted",
          submission,
        };
      });

    // Include any submissions from students no longer enrolled
    for (const s of submissions) {
      const sid = String(s.studentId?._id || s.studentId);
      if (!roster.some((r) => String(r.studentId?._id || r.studentId) === sid)) {
        roster.push({
          studentId: s.studentId,
          studentName: s.studentId?.name || s.studentName,
          email: s.studentId?.email || "",
          phone: s.studentId?.phone || "",
          status: s.status === "graded" ? "graded" : "submitted",
          submission: s,
        });
      }
    }

    res.status(200).json({
      enrolledCount: enrollments.length,
      submissionCount: submissions.length,
      roster,
      submissions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMySubmissions = async (req, res) => {
  try {
    const filter =
      req.user.role === "student"
        ? { studentId: req.user.id }
        : {};

    if (req.user.role === "teacher") {
      const myAssignments = await Assignment.find({ teacherId: req.user.id }).select("_id");
      filter.assignmentId = { $in: myAssignments.map((a) => a._id) };
    }

    const submissions = await Submission.find(filter)
      .populate("assignmentId", "title dueDate course courseId teacher")
      .populate("studentId", "name email")
      .sort({ submittedAt: -1 });

    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const gradeSubmission = async (req, res) => {
  try {
    const { score, feedback } = req.body;
    if (score === undefined || score === null || Number.isNaN(Number(score))) {
      return res.status(400).json({ message: "Valid score is required" });
    }

    const submission = await Submission.findById(req.params.id).populate("assignmentId");
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const assignment = submission.assignmentId;
    if (!assignment) {
      return res.status(404).json({ message: "Assignment missing" });
    }

    if (
      req.user.role === "teacher" &&
      String(assignment.teacherId) !== String(req.user.id)
    ) {
      return res.status(403).json({ message: "Not your assignment" });
    }

    submission.score = Number(score);
    submission.feedback = feedback || "";
    submission.status = "graded";
    submission.gradedBy = req.user.id;
    submission.gradedAt = new Date();
    await submission.save();

    const course = assignment.courseId
      ? await Course.findById(assignment.courseId)
      : null;

    const markPayload = {
      studentName: submission.studentName || req.body.studentName || "Student",
      studentId: submission.studentId,
      course: assignment.course || course?.courseName || "Course",
      courseId: assignment.courseId || null,
      subject: assignment.title,
      score: Number(score),
      maxScore: 100,
      feedback: feedback || "",
      assignmentId: assignment._id,
      teacher: req.user.name || "",
      teacherId: req.user.id,
      updatedAt: new Date(),
    };

    await Mark.findOneAndUpdate(
      { assignmentId: assignment._id, studentId: submission.studentId },
      markPayload,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const populated = await Submission.findById(submission._id)
      .populate("assignmentId", "title dueDate course")
      .populate("studentId", "name email");

    res.status(200).json({ message: "Graded successfully", submission: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
