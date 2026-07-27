import { body } from "express-validator";

export const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("Password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .optional()
    .isIn(["admin", "teacher", "student"])
    .withMessage("Invalid role"),
];

export const signupValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("Password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .optional()
    .isIn(["teacher"])
    .withMessage("Public signup is for teachers only; students are added by teachers"),
];

export const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("Password").notEmpty().withMessage("Password is required"),
];

export const updateMeValidation = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("email").optional().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("Password")
    .optional({ values: "falsy" })
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("bio").optional().isString(),
  body("subject").optional().isString(),
  body("experience").optional().isString(),
  body("phone").optional().isString(),
];

export const updateUserValidation = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("email").optional().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("Password")
    .optional({ values: "falsy" })
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role").optional().isIn(["admin", "teacher"]).withMessage("Invalid role"),
  body("bio").optional().isString(),
  body("subject").optional().isString(),
  body("experience").optional().isString(),
  body("phone").optional().isString(),
];

export const updateStudentByTeacherValidation = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("email").optional().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("Password")
    .optional({ values: "falsy" })
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
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
