import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const PREVIEW_DIR = path.join(ROOT, "fiverr-preview");
const ASSETS_DIR = path.join(PREVIEW_DIR, "assets");

const BASE_URL = process.env.APP_URL || "http://localhost:5173";

const ACCOUNTS = {
  admin: { email: "admin@gmail.com", Password: "123456" },
  teacher: { email: "teacher@gmail.com", Password: "123456" },
  student: { email: "student@gmail.com", Password: "123456" },
};

const sessionCache = {};

const CAPTURES = [
  {
    key: "landing-hero",
    route: "/",
    auth: null,
    scrollTo: null,
    title: "Homepage Hero — Desktop + Mobile",
    subtitle: "College website landing experience",
    badge: "WEBSITE",
    sectionPng: "section-homepage.png",
  },
  {
    key: "dashboard",
    route: "/admin-dashboard",
    auth: "admin",
    scrollTo: ".stat-card__value",
    title: "Admin Dashboard — Desktop + Mobile",
    subtitle: "Executive overview with charts & KPIs",
    badge: "LIVE • ADMIN",
    sectionPng: "section-admin-dashboard.png",
  },
  {
    key: "featured-programs",
    route: "/",
    auth: null,
    scrollTo: "text=Explore pathways that shape your future",
    title: "Featured Programs — Desktop + Mobile",
    subtitle: "Homepage module",
    badge: "SECTION",
    sectionPng: "section-featured-programs.png",
  },
  {
    key: "campus-life",
    route: "/",
    auth: null,
    scrollTo: "text=A vibrant community beyond the classroom",
    title: "Campus Life — Desktop + Mobile",
    subtitle: "Homepage campus highlights",
    badge: "SECTION",
    sectionPng: "section-campus-life.png",
  },
  {
    key: "login",
    route: "/login",
    auth: null,
    scrollTo: null,
    title: "Login Page — Desktop + Mobile",
    subtitle: "Secure portal sign-in for admin, teacher & student",
    badge: "AUTH",
    sectionPng: "section-login.png",
  },
  {
    key: "contact-form",
    route: "/contact",
    auth: null,
    scrollTo: "form.site-card",
    title: "Contact Form — Desktop + Mobile",
    subtitle: "Inquiry form and campus details",
    badge: "FORM",
    sectionPng: "section-contact-form.png",
  },
];

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
  showcase: { width: 1920, height: 1080 },
};

function resolveBrowserExecutable() {
  const candidates = [];
  const localAppData = process.env.LOCALAPPDATA;

  if (localAppData) {
    const cacheRoot = path.join(localAppData, "Temp", "cursor-sandbox-cache");
    if (fs.existsSync(cacheRoot)) {
      for (const entry of fs.readdirSync(cacheRoot, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        const playwrightRoot = path.join(cacheRoot, entry.name, "playwright");
        if (!fs.existsSync(playwrightRoot)) continue;
        for (const browserDir of fs.readdirSync(playwrightRoot, { withFileTypes: true })) {
          if (!browserDir.isDirectory() || !browserDir.name.startsWith("chromium-")) continue;
          candidates.push(
            path.join(playwrightRoot, browserDir.name, "chrome-win64", "chrome.exe")
          );
        }
      }
    }
    candidates.push(
      path.join(localAppData, "Google", "Chrome", "Application", "chrome.exe"),
      path.join(localAppData, "Microsoft", "Edge", "Application", "msedge.exe")
    );
  }

  return candidates.find((candidate) => fs.existsSync(candidate));
}

async function login(role) {
  if (sessionCache[role]) return sessionCache[role];

  // Match Frontend VITE_API_URL first so JWT and data requests use the same host.
  const endpoints = [
    process.env.API_URL,
    "https://cms-backen.vercel.app/api/v1",
    "http://localhost:3030/api/v1",
  ].filter(Boolean);

  let lastError = null;

  for (const base of endpoints) {
    try {
      const response = await fetch(`${base}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ACCOUNTS[role]),
      });

      if (!response.ok) {
        lastError = new Error(`Login failed for ${role}: ${response.status} @ ${base}`);
        continue;
      }

      const data = await response.json();
      const user = data.User;
      console.log(`  Logged in via ${base}`);

      sessionCache[role] = {
        token: data.token,
        role: user.role,
        name: user.name || user.email,
        email: user.email || "",
        userId: user._id,
      };
      return sessionCache[role];
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error(`Login failed for ${role}`);
}

async function seedAuth(page, session) {
  await page.addInitScript((authSession) => {
    localStorage.setItem("token", authSession.token);
    localStorage.setItem("role", authSession.role);
    localStorage.setItem("name", authSession.name);
    localStorage.setItem("email", authSession.email);
    localStorage.setItem("userId", authSession.userId);
    localStorage.setItem("sms_last_activity_at", String(Date.now()));
  }, session);
}

async function cleanUi(page) {
  await page.addStyleTag({
    content: `
      .app-toaster,
      [class*="toast"],
      [role="status"],
      [data-sonner-toaster],
      #vite-error-overlay {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
    `,
  });

  await page.evaluate(() => {
    try {
      if (window.__REACT_HOT_TOAST__?.dismiss) window.__REACT_HOT_TOAST__.dismiss();
    } catch {}

    document
      .querySelectorAll(
        ".app-toaster, [class*='toast'], [role='status'], #vite-error-overlay"
      )
      .forEach((node) => node.remove());
  });
}

async function focusShot(page, scrollTo) {
  if (!scrollTo) {
    await page.evaluate(() => window.scrollTo(0, 0));
    return;
  }

  try {
    const target = page.locator(scrollTo).first();
    await target.waitFor({ state: "visible", timeout: 15000 });

    // Pin section near the top so cards/forms stay visible (not centered away).
    await page.evaluate((selector) => {
      const isText = selector.startsWith("text=");
      let el = null;

      if (isText) {
        const needle = selector.slice(5).toLowerCase();
        const nodes = Array.from(document.querySelectorAll("h1,h2,h3,p,section,.site-section"));
        el = nodes.find((node) => (node.textContent || "").toLowerCase().includes(needle)) || null;
        if (el?.closest("section")) el = el.closest("section");
      } else {
        el = document.querySelector(selector);
        if (el?.tagName?.toLowerCase() === "form") {
          // Keep contact cards + form together.
          el = el.closest(".site-section") || el;
        } else if (el?.closest("section")) {
          el = el.closest("section");
        }
      }

      if (!el) return;
      const absoluteTop = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: Math.max(absoluteTop - 28, 0), behavior: "instant" });
    }, scrollTo);

    await page.waitForTimeout(500);

    // Force lazy images + reveal framer-motion / stagger items for clean shots.
    await page.evaluate(() => {
      document.querySelectorAll("img").forEach((img) => {
        if (img.loading === "lazy") img.loading = "eager";
        const src = img.currentSrc || img.src;
        if (src) img.src = src;
      });

      document.querySelectorAll("[style*='opacity'], [style*='transform']").forEach((node) => {
        node.style.opacity = "1";
        node.style.transform = "none";
        node.style.visibility = "visible";
      });
    });

    try {
      await page.waitForFunction(
        () => {
          const imgs = Array.from(document.querySelectorAll("img")).filter((img) => {
            const rect = img.getBoundingClientRect();
            return rect.bottom > 0 && rect.top < window.innerHeight && rect.width > 40;
          });
          if (!imgs.length) return true;
          return imgs.every((img) => img.complete && img.naturalWidth > 0);
        },
        { timeout: 10000 }
      );
    } catch {}

    await page.waitForTimeout(900);
  } catch (error) {
    console.log(`  Scroll target missed (${scrollTo}): ${error.message}`);
  }
}

async function waitForStablePage(page, scrollTo) {
  await page.waitForLoadState("domcontentloaded");
  try {
    await page.waitForLoadState("networkidle", { timeout: 15000 });
  } catch {}

  try {
    await page.waitForSelector(
      ".stat-card__value, .dashboard-chart, .site-hero, .site-masonry, form.site-card, .site-card, .input-glass, h1",
      {
        timeout: 12000,
        state: "visible",
      }
    );
  } catch {}

  await page.waitForTimeout(1800);
  await focusShot(page, scrollTo);
  await cleanUi(page);
  await page.waitForTimeout(400);
}

async function captureViewport(
  browser,
  route,
  auth,
  viewport,
  outputPath,
  isMobile = false,
  scrollTo = null
) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 2,
    isMobile,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(90000);

  if (auth) {
    const session = await login(auth);
    await seedAuth(page, session);
  }

  await page.goto(`${BASE_URL}${route}`, {
    waitUntil: "domcontentloaded",
    timeout: 90000,
  });

  await waitForStablePage(page, scrollTo);

  await page.screenshot({
    path: outputPath,
    fullPage: false,
    timeout: 90000,
  });

  await context.close();
}

async function capturePage(browser, pageConfig) {
  console.log(`\nCapturing ${pageConfig.title}`);
  console.log(`  Desktop: ${pageConfig.route} → ${pageConfig.scrollTo || "top"}`);
  await captureViewport(
    browser,
    pageConfig.route,
    pageConfig.auth,
    VIEWPORTS.desktop,
    path.join(ASSETS_DIR, `${pageConfig.key}.png`),
    false,
    pageConfig.scrollTo
  );

  console.log(`  Mobile: ${pageConfig.route} → ${pageConfig.scrollTo || "top"}`);
  await captureViewport(
    browser,
    pageConfig.route,
    pageConfig.auth,
    VIEWPORTS.mobile,
    path.join(ASSETS_DIR, `${pageConfig.key}-mobile.png`),
    true,
    pageConfig.scrollTo
  );
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function sharedCss() {
  return `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 1920px;
      height: 1080px;
      overflow: hidden;
      font-family: Inter, system-ui, sans-serif;
      color: #fff;
      background:
        radial-gradient(circle at 88% 12%, rgba(56,189,248,0.18), transparent 28%),
        radial-gradient(circle at 10% 80%, rgba(37,99,235,0.16), transparent 30%),
        linear-gradient(135deg, #050b18 0%, #0a1630 48%, #071224 100%);
    }
  `;
}

function buildMainPreviewHtml() {
  const cards = CAPTURES.map(
    (item) => `
      <div class="card">
        <div class="card-label">${escapeHtml(item.title.replace(" — Desktop + Mobile", ""))} — Desktop + Mobile</div>
        <div class="devices">
          <div class="desktop"><img src="assets/${item.key}.png" alt="${escapeHtml(item.key)}" /></div>
          <div class="phone"><img src="assets/${item.key}-mobile.png" alt="${escapeHtml(item.key)} mobile" /></div>
        </div>
      </div>
    `
  ).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>College Management System - Main Preview</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    ${sharedCss()}
    .wrap { width: 1920px; height: 1080px; padding: 48px 56px 40px; position: relative; }
    .badge {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 8px 14px; border-radius: 999px;
      border: 1px solid rgba(148,163,184,0.22);
      background: rgba(15,23,42,0.55); font-size: 12px;
      letter-spacing: 0.14em; font-weight: 700; color: #cbd5e1;
    }
    h1 {
      margin-top: 16px; font-size: 64px; line-height: 1.02;
      letter-spacing: -0.045em; font-weight: 800; max-width: 980px;
    }
    .subtitle { margin-top: 12px; font-size: 20px; color: #94a3b8; }
    .layout {
      margin-top: 28px; display: grid;
      grid-template-columns: 320px 1fr; gap: 28px; height: 700px;
    }
    .profile {
      border-radius: 28px; overflow: hidden;
      border: 1px solid rgba(148,163,184,0.18);
      background: rgba(15,23,42,0.7);
      box-shadow: 0 28px 70px rgba(2,6,23,0.45);
      position: relative;
    }
    .profile img {
      width: 100%; height: 100%; object-fit: cover;
      object-position: center top; display: block;
    }
    .profile-meta {
      position: absolute; left: 0; right: 0; bottom: 0;
      padding: 22px 20px 20px;
      background: linear-gradient(180deg, transparent, rgba(2,6,23,0.92));
    }
    .profile-meta h3 { font-size: 28px; font-weight: 800; letter-spacing: -0.03em; }
    .profile-meta p { margin-top: 4px; color: #38bdf8; font-weight: 700; font-size: 15px; }
    .grid {
      display: grid; grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(2, 1fr); gap: 16px;
    }
    .card {
      border-radius: 20px; padding: 12px 12px 10px;
      border: 1px solid rgba(148,163,184,0.14);
      background: rgba(15,23,42,0.5);
      box-shadow: 0 18px 40px rgba(2,6,23,0.28);
    }
    .card-label {
      font-size: 12px; font-weight: 700; letter-spacing: 0.04em;
      color: #94a3b8; margin-bottom: 10px; white-space: nowrap;
      overflow: hidden; text-overflow: ellipsis;
    }
    .devices { position: relative; height: calc(100% - 24px); }
    .desktop {
      width: 100%; height: 100%; border-radius: 12px; overflow: hidden;
      border: 1px solid rgba(148,163,184,0.2); background: #0f172a;
    }
    .desktop img {
      width: 100%; height: 100%; object-fit: cover;
      object-position: top center; display: block;
    }
    .phone {
      position: absolute; right: 10px; bottom: 0;
      width: 78px; height: 158px; border-radius: 14px;
      border: 2px solid #334155; background: #020617; overflow: hidden;
      box-shadow: 0 14px 30px rgba(2,6,23,0.55);
    }
    .phone img {
      width: 100%; height: 100%; object-fit: cover;
      object-position: top center; display: block;
    }
    .footer {
      position: absolute; left: 56px; right: 56px; bottom: 34px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .footer h4 { font-size: 34px; font-weight: 800; letter-spacing: -0.03em; }
    .footer p { margin-top: 2px; color: #38bdf8; font-weight: 700; font-size: 16px; }
    .footer small { display: block; margin-top: 4px; color: #64748b; font-size: 13px; }
    .cta {
      padding: 16px 34px; border-radius: 16px; font-size: 18px; font-weight: 700;
      background: linear-gradient(135deg, #2563eb, #0891b2);
      box-shadow: 0 18px 40px rgba(37,99,235,0.35);
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="badge">FIVERR • MAIN PREVIEW</div>
    <h1>College Management System</h1>
    <p class="subtitle">Full Stack MERN Application • Responsive UI • Admin Dashboard</p>

    <div class="layout">
      <div class="profile">
        <img src="assets/profile.png" alt="Developer profile" />
        <div class="profile-meta">
          <h3>Maaz M</h3>
          <p>Full Stack Developer</p>
        </div>
      </div>
      <div class="grid">${cards}</div>
    </div>

    <div class="footer">
      <div>
        <h4>Maaz M</h4>
        <p>Full Stack Developer</p>
        <small>College Management System • MERN Stack</small>
      </div>
      <div class="cta">Live Project Demo</div>
    </div>
  </div>
</body>
</html>`;
}

function buildSectionHtml(item) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(item.title)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    ${sharedCss()}
    .wrap { width: 1920px; height: 1080px; padding: 56px 64px; }
    .pill {
      display: inline-flex; padding: 8px 14px; border-radius: 999px;
      border: 1px solid rgba(148,163,184,0.22);
      background: rgba(15,23,42,0.55); font-size: 12px;
      letter-spacing: 0.14em; font-weight: 700; color: #cbd5e1;
    }
    h1 {
      margin-top: 18px; font-size: 56px; line-height: 1.05;
      letter-spacing: -0.04em; font-weight: 800;
    }
    .sub { margin-top: 10px; color: #94a3b8; font-size: 18px; }
    .stage {
      margin-top: 36px; display: flex; align-items: flex-end;
      gap: 42px; height: 760px;
    }
    .monitor {
      flex: 1; height: 100%; border-radius: 28px; overflow: hidden;
      border: 1px solid rgba(148,163,184,0.2); background: #0b1220;
      box-shadow: 0 36px 80px rgba(2,6,23,0.5);
      padding: 14px;
    }
    .monitor-inner {
      width: 100%; height: 100%; border-radius: 18px; overflow: hidden;
      background: #020617;
    }
    .monitor img {
      width: 100%; height: 100%; object-fit: cover;
      object-position: top center; display: block;
    }
    .phone {
      width: 320px; height: 680px; flex-shrink: 0;
      border-radius: 42px; border: 4px solid #1f2937;
      background: #020617; overflow: hidden;
      box-shadow: 0 30px 70px rgba(2,6,23,0.55);
      position: relative;
    }
    .phone::before {
      content: ""; position: absolute; top: 12px; left: 50%;
      transform: translateX(-50%); width: 90px; height: 18px;
      border-radius: 999px; background: #0f172a; z-index: 2;
    }
    .phone img {
      width: 100%; height: 100%; object-fit: cover;
      object-position: top center; display: block;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="pill">${escapeHtml(item.badge)}</div>
    <h1>${escapeHtml(item.title)}</h1>
    <p class="sub">${escapeHtml(item.subtitle)}</p>
    <div class="stage">
      <div class="monitor">
        <div class="monitor-inner">
          <img src="assets/${item.key}.png" alt="Desktop" />
        </div>
      </div>
      <div class="phone">
        <img src="assets/${item.key}-mobile.png" alt="Mobile" />
      </div>
    </div>
  </div>
</body>
</html>`;
}

function buildIndexHtml(files) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>College Management System — Fiverr Preview Pack</title>
  <style>
    body { font-family: Inter, system-ui, sans-serif; background: #0b1220; color: #e2e8f0; padding: 36px; max-width: 920px; margin: 0 auto; }
    h1 { margin-bottom: 8px; }
    p { color: #94a3b8; line-height: 1.6; }
    a { display: block; margin: 10px 0; padding: 14px 16px; border-radius: 12px; background: #111827; color: #38bdf8; text-decoration: none; font-weight: 600; }
    a:hover { background: #1f2937; }
  </style>
</head>
<body>
  <h1>College Management System</h1>
  <p>Premium Fiverr gallery images (1920×1080). Upload these PNGs directly.</p>
  ${files.map((file) => `<a href="${file}" target="_blank">${file}</a>`).join("")}
</body>
</html>`;
}

async function screenshotHtml(browser, htmlPath, pngPath) {
  const page = await browser.newPage({
    viewport: VIEWPORTS.showcase,
    deviceScaleFactor: 1,
  });
  const fileUrl = `file:///${htmlPath.replace(/\\/g, "/")}`;
  await page.goto(fileUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: pngPath, fullPage: false });
  await page.close();
}

async function main() {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });

  if (!fs.existsSync(path.join(ASSETS_DIR, "profile.png"))) {
    throw new Error("Missing fiverr-preview/assets/profile.png");
  }

  const onlyKey = process.env.CAPTURE_ONLY?.trim() || null;
  const skipLive = process.env.SKIP_LIVE_CAPTURE === "1";
  const captures = onlyKey
    ? CAPTURES.filter((item) => item.key === onlyKey)
    : CAPTURES;

  if (onlyKey && captures.length === 0) {
    throw new Error(`Unknown CAPTURE_ONLY key: ${onlyKey}`);
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: resolveBrowserExecutable(),
  });

  if (!skipLive) {
    console.log("Step 1: Capture live app screenshots");
    console.log(`App: ${BASE_URL}`);
    if (onlyKey) console.log(`Only: ${onlyKey}`);

    for (const pageConfig of captures) {
      await capturePage(browser, pageConfig);
    }
  } else {
    console.log("Step 1: Skipped live captures (SKIP_LIVE_CAPTURE=1)");
  }

  console.log("\nStep 2: Build Fiverr presentation PNGs");

  const generated = [];

  const mainHtml = path.join(PREVIEW_DIR, "main-preview.html");
  fs.writeFileSync(mainHtml, buildMainPreviewHtml());
  await screenshotHtml(browser, mainHtml, path.join(PREVIEW_DIR, "fiverr-main-preview.png"));
  generated.push("fiverr-main-preview.png");
  console.log("  fiverr-main-preview.png");

  for (const item of CAPTURES) {
    const htmlPath = path.join(PREVIEW_DIR, item.sectionPng.replace(".png", ".html"));
    fs.writeFileSync(htmlPath, buildSectionHtml(item));
    await screenshotHtml(browser, htmlPath, path.join(PREVIEW_DIR, item.sectionPng));
    generated.push(item.sectionPng);
    console.log(`  ${item.sectionPng}`);
  }

  fs.writeFileSync(path.join(PREVIEW_DIR, "index.html"), buildIndexHtml(generated));

  await browser.close();
  console.log("\nDone! Upload PNGs from fiverr-preview/");
}

main().catch((error) => {
  console.error("Fiverr preview build failed:", error);
  process.exit(1);
});

