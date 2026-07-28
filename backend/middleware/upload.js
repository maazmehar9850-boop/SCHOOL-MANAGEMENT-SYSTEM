import multer from "multer";
import {
  coursesRoot,
  ensureUploadDirs,
  resourcesRoot,
  submissionsRoot,
} from "../utils/uploadPaths.js";

ensureUploadDirs();

const makeStorage = (dest) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dest),
    filename: (_req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      cb(null, `${Date.now()}-${safe}`);
    },
  });

const submissionAllowed = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const courseAllowed = new Set([
  "application/pdf",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
]);

export const uploadSubmission = multer({
  storage: makeStorage(submissionsRoot),
  fileFilter: (_req, file, cb) => {
    if (submissionAllowed.has(file.mimetype)) cb(null, true);
    else cb(new Error("Only PDF, JPG, PNG, or WEBP files are allowed"), false);
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const uploadCourseMedia = multer({
  storage: makeStorage(coursesRoot),
  fileFilter: (_req, file, cb) => {
    if (courseAllowed.has(file.mimetype)) cb(null, true);
    else cb(new Error("Only PDF or video (MP4/WEBM/MOV) files are allowed"), false);
  },
  limits: { fileSize: 80 * 1024 * 1024 },
});

const resourceAllowed = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

export const uploadResource = multer({
  storage: makeStorage(resourcesRoot),
  fileFilter: (_req, file, cb) => {
    if (resourceAllowed.has(file.mimetype)) cb(null, true);
    else cb(new Error("Only PDF, JPG, PNG, or WEBP files are allowed"), false);
  },
  limits: { fileSize: 15 * 1024 * 1024 },
});

export const detectFileType = (mimetype) => {
  if (mimetype === "application/pdf") return "pdf";
  return "image";
};
