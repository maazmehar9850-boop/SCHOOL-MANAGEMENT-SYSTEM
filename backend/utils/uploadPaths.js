import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");

export const uploadsRoot = process.env.VERCEL
  ? path.join("/tmp", "schoolms", "uploads")
  : path.join(projectRoot, "uploads");

export const submissionsRoot = path.join(uploadsRoot, "submissions");
export const coursesRoot = path.join(uploadsRoot, "courses");
export const resourcesRoot = path.join(uploadsRoot, "resources");

export function ensureUploadDirs() {
  [uploadsRoot, submissionsRoot, coursesRoot, resourcesRoot].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}
