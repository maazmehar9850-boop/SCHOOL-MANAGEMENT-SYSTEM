import { body } from "express-validator";
import { validatePasswordStrength } from "../utils/passwordPolicy.js";

const strongPassword = (field = "Password") =>
  body(field).custom((value, { req }) => {
    if (value == null || String(value).trim() === "") {
      if (req.method === "POST" && field === "Password") {
        throw new Error("Password is required");
      }
      return true;
    }
    const error = validatePasswordStrength(value);
    if (error) throw new Error(error);
    return true;
  });

const optionalStrongPassword = (field = "Password") =>
  body(field)
    .optional({ values: "falsy" })
    .custom((value) => {
      if (value == null || String(value).trim() === "") return true;
      const error = validatePasswordStrength(value);
      if (error) throw new Error(error);
      return true;
    });

export const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  strongPassword("Password"),
  body("role")
    .optional()
    .isIn(["admin", "teacher", "student"])
    .withMessage("Invalid role"),
];

export const signupValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  strongPassword("Password"),
  body("role")
    .optional()
    .isIn(["teacher"])
    .withMessage("Public signup is for teachers only; students are added by teachers"),
];

export const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("Password").notEmpty().withMessage("Password is required"),
];

export const addStudentByTeacherValidation = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("courseId").notEmpty().withMessage("courseId is required"),
  body("name")
    .optional({ values: "falsy" })
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty"),
  optionalStrongPassword("Password"),
  body("phone").optional().isString(),
];

export const updateMeValidation = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("email").optional().isEmail().withMessage("Valid email is required").normalizeEmail(),
  optionalStrongPassword("Password"),
  body("bio").optional().isString(),
  body("subject").optional().isString(),
  body("experience").optional().isString(),
  body("phone").optional().isString(),
];

export const updateUserValidation = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("email").optional().isEmail().withMessage("Valid email is required").normalizeEmail(),
  optionalStrongPassword("Password"),
  body("role").optional().isIn(["admin", "teacher"]).withMessage("Invalid role"),
  body("bio").optional().isString(),
  body("subject").optional().isString(),
  body("experience").optional().isString(),
  body("phone").optional().isString(),
];

export const updateStudentByTeacherValidation = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("email").optional().isEmail().withMessage("Valid email is required").normalizeEmail(),
  optionalStrongPassword("Password"),
  body("phone").optional().isString(),
];

export const courseValidation = [
  body("courseName").trim().notEmpty().withMessage("Course name is required"),
  body("courseCode").trim().notEmpty().withMessage("Course code is required"),
  body("teacher").trim().notEmpty().withMessage("Teacher is required"),
  body("className").trim().notEmpty().withMessage("Class name is required"),
  body("duration").trim().notEmpty().withMessage("Duration is required"),
];

export const enrollmentValidation = [
  body("studentId").notEmpty().withMessage("studentId is required"),
  body("courseId").notEmpty().withMessage("courseId is required"),
];

export const assignmentValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("courseId").optional().isString(),
  body("course")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Course is required"),
  body("dueDate")
    .notEmpty()
    .withMessage("Due date is required")
    .isISO8601()
    .withMessage("Invalid due date"),
  body().custom((_, { req }) => {
    if (!req.body.courseId && !req.body.course) {
      throw new Error("courseId or course is required");
    }
    return true;
  }),
];

export const passwordResetRequestValidation = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("reason").optional().isString().isLength({ max: 500 }).withMessage("Reason too long"),
];

export const passwordResetCompleteValidation = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("Password").custom((value) => {
    const error = validatePasswordStrength(value);
    if (error) throw new Error(error);
    return true;
  }),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.Password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
];

export const passwordResetRejectValidation = [
  body("adminNote").optional().isString().isLength({ max: 500 }).withMessage("Note too long"),
];
