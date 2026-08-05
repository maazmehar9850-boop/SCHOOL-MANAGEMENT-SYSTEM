import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const ASSETS_DIR = path.join(ROOT, "fiverr-preview/assets");
const PREVIEW_DIR = path.join(ROOT, "fiverr-preview");

const BASE_URL = process.env.APP_URL || "http://localhost:5173";
const API_URL =
  process.env.API_URL || "https://sms-backendm.vercel.app/api/v1";

const ACCOUNTS = {
  admin: { email: "admin@gmail.com", Password: "123456" },
  teacher: { email: "teacher@gmail.com", Password: "123456" },
  student: { email: "student@gmail.com", Password: "123456" },
};

const CAPTURES = [
  { name: "landing-hero", path: "/", auth: null },
  { name: "dashboard", path: "/admin-dashboard", auth: "admin" },
  { name: "admin", path: "/students", auth: "admin" },
  { name: "teacher", path: "/teacher-dashboard", auth: "teacher" },
  { name: "student", path: "/student-home", auth: "student" },
  { name: "features", path: "/courses", auth: "admin" },
];

async function login(role) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ACCOUNTS[role]),
  });
  if (!res.ok) throw new Error(`Login failed for ${role}: ${res.status}`);
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

async function capturePage(browser, { name, path: routePath, auth }) {
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const desktopPage = await desktopContext.newPage();

  if (auth) {
    const session = await login(auth);
    await seedAuth(desktopPage, session);
  }

  console.log(`  Desktop: ${routePath}`);
  await desktopPage.goto(`${BASE_URL}${routePath}`, {
    waitUntil: "networkidle",
    timeout: 60000,
  });
  await desktopPage.waitForTimeout(3500);
  await desktopPage.screenshot({
    path: path.join(ASSETS_DIR, `${name}.png`),
    fullPage: false,
  });
  await desktopContext.close();

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();

  if (auth) {
    const session = await login(auth);
    await seedAuth(mobilePage, session);
  }

  console.log(`  Mobile: ${routePath}`);
  await mobilePage.goto(`${BASE_URL}${routePath}`, {
    waitUntil: "networkidle",
    timeout: 60000,
  });
  await mobilePage.waitForTimeout(3500);
  await mobilePage.screenshot({
    path: path.join(ASSETS_DIR, `${name}-mobile.png`),
    fullPage: false,
  });
  await mobileContext.close();
}

const SECTIONS = [
  {
    png: "section-landing.png",
    title: "Landing Hero — Desktop + Mobile",
    subtitle: "Homepage module",
    img: "assets/landing-hero.png",
    mobile: "assets/landing-hero-mobile.png",
  },
  {
    png: "section-dashboard.png",
    title: "Admin Dashboard — Desktop + Mobile",
    subtitle: "Executive overview with charts",
    img: "assets/dashboard.png",
    mobile: "assets/dashboard-mobile.png",
  },
  {
    png: "section-admin.png",
    title: "Admin Portal — Desktop + Mobile",
    subtitle: "User & course management",
    img: "assets/admin.png",
    mobile: "assets/admin-mobile.png",
  },
  {
    png: "section-teacher.png",
    title: "Teacher Panel — Desktop + Mobile",
    subtitle: "Attendance & marks",
    img: "assets/teacher.png",
    mobile: "assets/teacher-mobile.png",
  },
  {
    png: "section-student.png",
    title: "Student Portal — Desktop + Mobile",
    subtitle: "Results & assignments",
    img: "assets/student.png",
    mobile: "assets/student-mobile.png",
  },
  {
    png: "section-features.png",
    title: "Features Module — Desktop + Mobile",
    subtitle: "Core modules",
    img: "assets/features.png",
    mobile: "assets/features-mobile.png",
  },
];

async function buildSectionHtml(section) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${section.title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1280px; height: 769px; overflow: hidden;
      font-family: "Inter", sans-serif;
      background: radial-gradient(circle at 90% 10%, rgba(56,189,248,.16), transparent 40%),
        linear-gradient(135deg, #07111f, #0b1a33 55%, #081224);
      color: #fff; padding: 34px 42px;
    }
    h1 { font-size: 40px; font-weight: 800; letter-spacing: -.03em; }
    .sub { margin-top: 8px; color: #94a3b8; font-size: 14px; }
    .stage { margin-top: 26px; display: flex; align-items: flex-end; gap: 28px; height: 560px; }
    .monitor {
      flex: 1; height: 100%; border-radius: 18px;
      border: 1px solid rgba(148,163,184,.22); background: #0f172a;
      overflow: hidden; box-shadow: 0 28px 70px rgba(2,6,23,.45);
    }
    .monitor img { width: 100%; height: 100%; object-fit: cover; object-position: top center; display: block; }
    .phone {
      width: 220px; height: 470px; border-radius: 28px; border: 3px solid #334155;
      background: #020617; overflow: hidden; box-shadow: 0 24px 60px rgba(2,6,23,.5); flex-shrink: 0;
    }
    .phone img { width: 100%; height: 100%; object-fit: cover; object-position: top center; }
  </style>
</head>
<body>
  <h1>${section.title}</h1>
  <p class="sub">${section.subtitle}</p>
  <div class="stage">
    <div class="monitor"><img src="${section.img}" alt="Desktop" /></div>
    <div class="phone"><img src="${section.mobile}" alt="Mobile" /></div>
  </div>
</body>
</html>`;

  const tmpPath = path.join(PREVIEW_DIR, section.png.replace(".png", ".html"));
  fs.writeFileSync(tmpPath, html);
  return tmpPath;
}

async function screenshotHtml(browser, htmlPath, pngPath) {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 769 },
    deviceScaleFactor: 2,
  });
  const fileUrl = `file:///${htmlPath.replace(/\\/g, "/")}`;
  await page.goto(fileUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: pngPath, fullPage: false });
  await page.close();
}

async function main() {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });

  console.log("Step 1: Capture live app screenshots");
  console.log(`App: ${BASE_URL} | API: ${API_URL}`);

  const browser = await chromium.launch({ headless: true });

  for (const capture of CAPTURES) {
    console.log(`\n${capture.name}`);
    await capturePage(browser, capture);
  }

  console.log("\nStep 2: Build Fiverr preview PNGs");

  await screenshotHtml(
    browser,
    path.join(PREVIEW_DIR, "main-preview.html"),
    path.join(PREVIEW_DIR, "fiverr-main-preview.png")
  );
  console.log("  fiverr-main-preview.png");

  for (const section of SECTIONS) {
    const htmlPath = await buildSectionHtml(section);
    await screenshotHtml(
      browser,
      htmlPath,
      path.join(PREVIEW_DIR, section.png)
    );
    console.log(`  ${section.png}`);
  }

  await browser.close();
  console.log("\nDone! Upload PNGs from fiverr-preview/");
}

main().catch((error) => {
  console.error("Fiverr preview build failed:", error.message);
  process.exit(1);
});
