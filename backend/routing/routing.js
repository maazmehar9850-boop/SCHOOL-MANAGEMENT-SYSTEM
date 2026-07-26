import express from "express";
import sendMail from "../nodemailer/gmail.js";
import { authenticate, authorizeRoles } from "../middleware/middleware.js";
import { validate } from "../middleware/validate.js";
import {
  registerValidation,
  signupValidation,
  loginValidation,
  updateMeValidation,
  courseValidation,
  enrollmentValidation,
  assignmentValidation,
} from "../validators/authValidators.js";
import {
  registeruser,
  signupUser,
  login,
  updateuser,
  deleteone,
  getMe,
  updateMe,
  getStudents,
  getStudentById,
  getTeachers,
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
  addPaper,
  getPapers,
  updatePaper,
  deletePaper,
  addAttendance,
  getAttendance,
  updateAttendance,
  deleteAttendance,
  addMark,
  getMarks,
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
import { getDashboardStats } from "../controller/dashboardController.js";

const router = express.Router();

// Auth
router.post("/register", authenticate, authorizeRoles("admin"), registerValidation, validate, registeruser);
router.post("/signup", signupValidation, validate, signupUser);
router.post("/login", loginValidation, validate, login);

// Profile
router.get("/me", authenticate, getMe);
router.put("/me", authenticate, updateMeValidation, validate, updateMe);

// Users
router.get("/students", authenticate, authorizeRoles("admin", "teacher"), getStudents);
router.get("/student/:id", authenticate, authorizeRoles("admin", "teacher"), getStudentById);
router.get("/teachers", authenticate, authorizeRoles("admin"), getTeachers);
router.put("/update/:id", authenticate, authorizeRoles("admin"), updateuser);
router.delete("/delete/:id", authenticate, authorizeRoles("admin"), deleteone);

// Dashboard
router.get("/dashboard/stats", authenticate, getDashboardStats);

// Teacher's assigned students
router.get("/my-students", authenticate, authorizeRoles("teacher"), getMyStudents);

// Enrollments
router.post(
  "/enrollments",
  authenticate,
  authorizeRoles("admin", "teacher"),
  enrollmentValidation,
  validate,
  enrollStudent
);
router.get("/enrollments", authenticate, getEnrollments);
router.delete("/enrollments/:id", authenticate, authorizeRoles("admin", "teacher"), unenrollStudent);

// Assignments
router.post(
  "/assignments",
  authenticate,
  authorizeRoles("teacher", "admin"),
  assignmentValidation,
  validate,
  addAssignment
);
router.get("/assignments", authenticate, getAssignments);
router.put("/assignments/:id", authenticate, authorizeRoles("teacher", "admin"), updateAssignment);
router.delete("/assignments/:id", authenticate, authorizeRoles("teacher", "admin"), deleteAssignment);

// Mail & health
router.post("/sendMail", authenticate, authorizeRoles("admin"), sendMail);
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// Courses
router.post(
  "/courses",
  authenticate,
  authorizeRoles("admin"),
  courseValidation,
  validate,
  addCourse
);
router.get("/courses", authenticate, getCourses);
router.put("/courses/:id", authenticate, authorizeRoles("admin"), updateCourse);
router.delete("/courses/:id", authenticate, authorizeRoles("admin"), deleteCourse);

// Syllabus
router.post("/syllabus", authenticate, authorizeRoles("teacher"), addSyllabus);
router.get("/syllabus", authenticate, getSyllabi);
router.put("/syllabus/:id", authenticate, authorizeRoles("teacher"), updateSyllabus);
router.delete("/syllabus/:id", authenticate, authorizeRoles("teacher"), deleteSyllabus);

// Datesheet
router.post("/datesheet", authenticate, authorizeRoles("teacher"), addDatesheet);
router.get("/datesheet", authenticate, getDatesheets);
router.put("/datesheet/:id", authenticate, authorizeRoles("teacher"), updateDatesheet);
router.delete("/datesheet/:id", authenticate, authorizeRoles("teacher"), deleteDatesheet);

// Paper
router.post("/paper", authenticate, authorizeRoles("teacher"), addPaper);
router.get("/paper", authenticate, getPapers);
router.put("/paper/:id", authenticate, authorizeRoles("teacher"), updatePaper);
router.delete("/paper/:id", authenticate, authorizeRoles("teacher"), deletePaper);

// Attendance
router.post("/attendance", authenticate, authorizeRoles("teacher"), addAttendance);
router.get("/attendance", authenticate, getAttendance);
router.put("/attendance/:id", authenticate, authorizeRoles("teacher"), updateAttendance);
router.delete("/attendance/:id", authenticate, authorizeRoles("teacher"), deleteAttendance);

// Marks
router.post("/marks", authenticate, authorizeRoles("teacher"), addMark);
router.get("/marks", authenticate, getMarks);
router.put("/marks/:id", authenticate, authorizeRoles("teacher"), updateMark);
router.delete("/marks/:id", authenticate, authorizeRoles("teacher"), deleteMark);

export default router;
