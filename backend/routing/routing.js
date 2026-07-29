import express from "express";
import sendMail from "../nodemailer/gmail.js";
import { authenticate, authorizeRoles } from "../middleware/middleware.js";
import { validate } from "../middleware/validate.js";
import {
  registerValidation,
  signupValidation,
  loginValidation,
  addStudentByTeacherValidation,
  updateMeValidation,
  updateUserValidation,
  updateStudentByTeacherValidation,
  courseValidation,
  enrollmentValidation,
  assignmentValidation,
  passwordResetRequestValidation,
  passwordResetCompleteValidation,
  passwordResetRejectValidation,
} from "../validators/authValidators.js";
import {
  registeruser,
  signupUser,
  login,
  logoutUser,
  updateuser,
  deleteone,
  getMe,
  updateMe,
  getStudents,
  getStudentById,
  getTeachers,
  addStudentByTeacher,
  updateStudentByTeacher,
  deleteStudentByTeacher,
} from "../controller/student.js";
import { getCourses, addCourse, updateCourse, deleteCourse } from "../controller/course.js";
import {
  addSyllabus,
  getSyllabi,
  updateSyllabus,
  deleteSyllabus,
  addDatesheet,
  getDatesheets,
  updateDatesheet,
  deleteDatesheet,
  getExamReadiness,
  finalizeExam,
  finalizeDatesheetById,
  unfinalizeExam,
  unfinalizeDatesheetById,
  getMarksEligibility,
  addPaper,
  getPapers,
  updatePaper,
  deletePaper,
  addAttendance,
  getAttendance,
  saveAttendanceBulk,
  updateAttendance,
  deleteAttendance,
  addMark,
  getMarks,
  saveMarksBulk,
  updateMark,
  deleteMark,
} from "../controller/resourceController.js";
import {
  enrollStudent,
  getEnrollments,
  getMyStudents,
  unenrollStudent,
} from "../controller/enrollmentController.js";
import {
  addAssignment,
  getAssignments,
  updateAssignment,
  deleteAssignment,
} from "../controller/assignmentController.js";
import { getDashboardStats, getPublicStats } from "../controller/dashboardController.js";
import {
  submitAssignment,
  getAssignmentSubmissions,
  getMySubmissions,
  gradeSubmission,
} from "../controller/submissionController.js";
import { uploadSubmission, uploadCourseMedia, uploadResource } from "../middleware/upload.js";
import {
  requestPasswordReset,
  getResetRequestStatus,
  getPasswordResetRequests,
  approvePasswordResetRequest,
  rejectPasswordResetRequest,
  completePasswordReset,
} from "../controller/passwordResetController.js";
import { getNotifications } from "../controller/notificationController.js";

const router = express.Router();

// Auth
router.post("/register", authenticate, authorizeRoles("admin"), registerValidation, validate, registeruser);
router.post(
  "/teachers/students",
  authenticate,
  authorizeRoles("teacher"),
  addStudentByTeacherValidation,
  validate,
  addStudentByTeacher
);
router.put(
  "/teachers/students/:id",
  authenticate,
  authorizeRoles("teacher"),
  updateStudentByTeacherValidation,
  validate,
  updateStudentByTeacher
);
router.delete(
  "/teachers/students/:id",
  authenticate,
  authorizeRoles("teacher"),
  deleteStudentByTeacher
);
router.post("/signup", signupValidation, validate, signupUser);
router.post("/login", loginValidation, validate, login);
router.post("/logout", authenticate, logoutUser);

// Password reset (admin-approved)
router.post(
  "/password-reset/request",
  passwordResetRequestValidation,
  validate,
  requestPasswordReset
);
router.get("/password-reset/status", getResetRequestStatus);
router.post(
  "/password-reset/complete",
  passwordResetCompleteValidation,
  validate,
  completePasswordReset
);
router.get(
  "/password-reset/requests",
  authenticate,
  authorizeRoles("admin"),
  getPasswordResetRequests
);
router.post(
  "/password-reset/requests/:id/approve",
  authenticate,
  authorizeRoles("admin"),
  approvePasswordResetRequest
);
router.post(
  "/password-reset/requests/:id/reject",
  authenticate,
  authorizeRoles("admin"),
  passwordResetRejectValidation,
  validate,
  rejectPasswordResetRequest
);

// Profile
router.get("/me", authenticate, getMe);
router.put("/me", authenticate, updateMeValidation, validate, updateMe);

// Users
router.get("/students", authenticate, authorizeRoles("admin"), getStudents);
router.get("/student/:id", authenticate, authorizeRoles("admin", "teacher"), getStudentById);
router.get("/teachers", authenticate, authorizeRoles("admin"), getTeachers);
router.put(
  "/update/:id",
  authenticate,
  authorizeRoles("admin"),
  updateUserValidation,
  validate,
  updateuser
);
router.delete("/delete/:id", authenticate, authorizeRoles("admin"), deleteone);

// Dashboard
router.get("/public/stats", getPublicStats);
router.get("/dashboard/stats", authenticate, getDashboardStats);
router.get("/notifications", authenticate, getNotifications);

// Teacher's assigned students
router.get("/my-students", authenticate, authorizeRoles("teacher"), getMyStudents);

// Enrollments
router.post(
  "/enrollments",
  authenticate,
  authorizeRoles("teacher"),
  enrollmentValidation,
  validate,
  enrollStudent
);
router.get("/enrollments", authenticate, getEnrollments);
router.delete("/enrollments/:id", authenticate, authorizeRoles("teacher"), unenrollStudent);

// Assignments
router.post(
  "/assignments",
  authenticate,
  authorizeRoles("teacher"),
  assignmentValidation,
  validate,
  addAssignment
);
router.get("/assignments", authenticate, getAssignments);
router.put("/assignments/:id", authenticate, authorizeRoles("teacher"), updateAssignment);
router.delete("/assignments/:id", authenticate, authorizeRoles("teacher"), deleteAssignment);

// Submissions (assignment workflow)
router.post(
  "/assignments/:id/submit",
  authenticate,
  authorizeRoles("student"),
  (req, res, next) => {
    uploadSubmission.single("file")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message || "Upload failed" });
      }
      next();
    });
  },
  submitAssignment
);
router.get(
  "/assignments/:id/submissions",
  authenticate,
  authorizeRoles("teacher", "admin"),
  getAssignmentSubmissions
);
router.get("/submissions/mine", authenticate, getMySubmissions);
router.put(
  "/submissions/:id/grade",
  authenticate,
  authorizeRoles("teacher"),
  gradeSubmission
);

// Mail & health
router.post("/sendMail", authenticate, authorizeRoles("admin"), sendMail);
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// Courses (admin can attach video / PDF materials)
const courseMediaUpload = (req, res, next) => {
  uploadCourseMedia.fields([
    { name: "video", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message || "Upload failed" });
    next();
  });
};

router.post(
  "/courses",
  authenticate,
  authorizeRoles("admin"),
  courseMediaUpload,
  courseValidation,
  validate,
  addCourse
);
router.get("/courses", authenticate, getCourses);
router.put(
  "/courses/:id",
  authenticate,
  authorizeRoles("admin"),
  courseMediaUpload,
  updateCourse
);
router.delete("/courses/:id", authenticate, authorizeRoles("admin"), deleteCourse);

// Syllabus
const resourceFileUpload = (req, res, next) => {
  uploadResource.single("file")(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
};

// Syllabus — teachers/admin create; admin edits/deletes; all reads are scoped
router.post(
  "/syllabus",
  authenticate,
  authorizeRoles("teacher", "admin"),
  resourceFileUpload,
  addSyllabus
);
router.get("/syllabus", authenticate, getSyllabi);
router.put(
  "/syllabus/:id",
  authenticate,
  authorizeRoles("admin"),
  resourceFileUpload,
  updateSyllabus
);
router.delete("/syllabus/:id", authenticate, authorizeRoles("admin"), deleteSyllabus);

// Datesheet — teachers/admin create; admin edits/deletes; all reads are scoped
router.post("/datesheet", authenticate, authorizeRoles("teacher", "admin"), addDatesheet);
router.get("/datesheet/exam-readiness", authenticate, authorizeRoles("admin"), getExamReadiness);
router.post("/datesheet/finalize", authenticate, authorizeRoles("admin"), finalizeExam);
router.post("/datesheet/unfinalize", authenticate, authorizeRoles("admin"), unfinalizeExam);
router.post("/datesheet/:id/finalize", authenticate, authorizeRoles("admin"), finalizeDatesheetById);
router.post(
  "/datesheet/:id/unfinalize",
  authenticate,
  authorizeRoles("admin"),
  unfinalizeDatesheetById
);
router.get("/datesheet", authenticate, getDatesheets);
router.put("/datesheet/:id", authenticate, authorizeRoles("admin"), updateDatesheet);
router.delete("/datesheet/:id", authenticate, authorizeRoles("admin"), deleteDatesheet);

// Paper — teacher creates only for allotted courses; admin can view all
router.post(
  "/paper",
  authenticate,
  authorizeRoles("teacher"),
  resourceFileUpload,
  addPaper
);
router.get("/paper", authenticate, getPapers);
router.put(
  "/paper/:id",
  authenticate,
  authorizeRoles("teacher"),
  resourceFileUpload,
  updatePaper
);
router.delete("/paper/:id", authenticate, authorizeRoles("teacher"), deletePaper);

// Attendance
router.post("/attendance", authenticate, authorizeRoles("teacher"), addAttendance);
router.post(
  "/attendance/bulk",
  authenticate,
  authorizeRoles("teacher", "admin"),
  saveAttendanceBulk
);
router.get("/attendance", authenticate, getAttendance);
router.put("/attendance/:id", authenticate, authorizeRoles("teacher"), updateAttendance);
router.delete("/attendance/:id", authenticate, authorizeRoles("teacher"), deleteAttendance);

// Marks
router.post("/marks", authenticate, authorizeRoles("teacher"), addMark);
router.post(
  "/marks/bulk",
  authenticate,
  authorizeRoles("teacher", "admin"),
  saveMarksBulk
);
router.get("/marks/eligibility", authenticate, getMarksEligibility);
router.get("/marks", authenticate, getMarks);
router.put("/marks/:id", authenticate, authorizeRoles("teacher"), updateMark);
router.delete("/marks/:id", authenticate, authorizeRoles("teacher"), deleteMark);

export default router;
