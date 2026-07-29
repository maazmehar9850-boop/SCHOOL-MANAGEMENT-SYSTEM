import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const BASE_URL = process.env.APP_URL || "http://localhost:5173";
const API_URL = process.env.API_URL || "http://localhost:3030/api/v1";
const OUTPUT_DIR = path.resolve(process.cwd(), "recordings");

const PUBLIC_PAGES = [
  { name: "01-landing", path: "/" },
  { name: "02-login", path: "/login" },
  { name: "03-register", path: "/register" },
  { name: "04-forgot-password", path: "/forgot-password" },
  { name: "05-reset-password", path: "/reset-password" },
];

const ROLE_TOURS = {
  admin: [
    { name: "admin-dashboard", path: "/admin-dashboard" },
    { name: "admin-students", path: "/students" },
    { name: "admin-teachers", path: "/teachers" },
    { name: "admin-courses", path: "/courses" },
    { name: "admin-enrollments", path: "/enrollments" },
    { name: "admin-assignments", path: "/assignments" },
    { name: "admin-teacher-tools", path: "/teacher-tools" },
    { name: "admin-attendance", path: "/admin-attendance" },
    { name: "admin-marks", path: "/admin-marks" },
    { name: "admin-resources", path: "/resources" },
    { name: "admin-add-teacher", path: "/add-teacher" },
    { name: "admin-add-course", path: "/add-course" },
    { name: "admin-password-resets", path: "/password-resets" },
    { name: "admin-profile", path: "/profile" },
  ],
  teacher: [
    { name: "teacher-dashboard", path: "/teacher-dashboard" },
    { name: "teacher-my-students", path: "/my-students" },
    { name: "teacher-add-student", path: "/add-student" },
    { name: "teacher-courses", path: "/courses" },
    { name: "teacher-attendance", path: "/attendance" },
    { name: "teacher-marks", path: "/marks" },
    { name: "teacher-assignments", path: "/assignments" },
    { name: "teacher-tools", path: "/teacher-tools" },
    { name: "teacher-resources", path: "/resources" },
    { name: "teacher-profile", path: "/profile" },
  ],
  student: [
    { name: "student-home", path: "/student-home" },
    { name: "student-courses", path: "/courses" },
    { name: "student-attendance", path: "/student-attendance" },
    { name: "student-results", path: "/student-results" },
    { name: "student-subjects", path: "/student-subjects" },
    { name: "student-assignments", path: "/assignments" },
    { name: "student-resources", path: "/resources" },
    { name: "student-profile", path: "/profile" },
  ],
};

const ACCOUNTS = {
  admin: { email: "admin@gmail.com", Password: "123456" },
  teacher: { email: "teacher@gmail.com", Password: "123456" },
  student: { email: "student@gmail.com", Password: "123456" },
};

async function login(role) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ACCOUNTS[role]),
  });

  if (!res.ok) {
    throw new Error(`Login failed for ${role}: ${res.status}`);
  }

  const data = await res.json();
  const user = data.User;

  return {
    token: data.token,
    role: user.role,
    name: user.name || user.email,
    email: user.email || "",
    userId: user._id,
  };
}

async function visitPage(page, route, pauseMs = 2200) {
  await page.goto(`${BASE_URL}${route.path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(pauseMs);
}

async function seedAuth(page, auth) {
  await page.addInitScript((session) => {
    localStorage.setItem("token", session.token);
    localStorage.setItem("role", session.role);
    localStorage.setItem("name", session.name);
    localStorage.setItem("email", session.email);
    localStorage.setItem("userId", session.userId);
    localStorage.setItem("sms_last_activity_at", String(Date.now()));
  }, auth);
}

async function runTour(page, routes, pauseMs = 2200) {
  for (const route of routes) {
    console.log(`  -> ${route.path}`);
    await visitPage(page, route, pauseMs);
  }
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: OUTPUT_DIR,
      size: { width: 1440, height: 900 },
    },
  });

  const page = await context.newPage();

  console.log("Recording SchoolMS frontend demo...");
  console.log(`App: ${BASE_URL}`);

  console.log("\nPublic pages");
  await runTour(page, PUBLIC_PAGES, 2500);

  for (const role of ["admin", "teacher", "student"]) {
    console.log(`\n${role.toUpperCase()} pages`);
    const auth = await login(role);
    await seedAuth(page, auth);
    await visitPage(page, { path: "/login" }, 800);
    await runTour(page, ROLE_TOURS[role], 2200);
    await page.evaluate(() => localStorage.clear());
  }

  console.log("\nLanding page (closing)");
  await visitPage(page, { path: "/" }, 2500);

  const video = page.video();
  await context.close();
  await browser.close();

  if (video) {
    const tempPath = await video.path();
    const finalPath = path.join(OUTPUT_DIR, "schoolms-frontend-full-demo.webm");
    fs.renameSync(tempPath, finalPath);
    console.log(`\nSaved: ${finalPath}`);
  } else {
    console.log("\nVideo saved in recordings folder.");
  }
}

main().catch((error) => {
  console.error("Recording failed:", error.message);
  process.exit(1);
});
