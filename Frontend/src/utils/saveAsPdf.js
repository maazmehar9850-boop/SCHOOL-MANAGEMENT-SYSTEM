const LOGO_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 64 64" aria-hidden="true">
  <defs>
    <linearGradient id="smsPdfGrad" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
      <stop stop-color="#3b5bdb"/>
      <stop offset="1" stop-color="#22b8cf"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="url(#smsPdfGrad)"/>
  <path fill="#fff" d="M12 24.5 32 14l20 10.5-20 9.5-20-9.5Z"/>
  <path fill="#fff" fill-opacity=".92" d="M46.5 26.2v8.4c0 1.2-6.2 3.4-14.5 3.4S17.5 35.8 17.5 34.6v-8.4l14.5 6.9 14.5-6.9Z"/>
  <rect x="45.2" y="25.4" width="2.2" height="12.2" rx="1.1" fill="#e0f7fa"/>
  <circle cx="46.3" cy="38.4" r="2.2" fill="#e0f7fa"/>
  <path fill="#fff" d="M16 42.5c4.8-2.2 9.2-2.4 16-2.4v12.8c-6.2.2-11.2.8-16 3.2V42.5Z"/>
  <path fill="#f0f9ff" d="M48 42.5c-4.8-2.2-9.2-2.4-16-2.4v12.8c6.2.2 11.2.8 16 3.2V42.5Z"/>
  <path fill="#3b5bdb" fill-opacity=".35" d="M31.2 40.1h1.6v15.2h-1.6z"/>
</svg>`;

const THEMES = {
  results: {
    label: "ACADEMIC RESULTS",
    accent: "#1e3a8a",
    accentSoft: "#dbeafe",
    ribbon: "#0ea5e9",
    tableHead: "#1e3a8a",
    badge: "#0369a1",
    note: "Official academic performance record",
  },
  marks: {
    label: "MARKS REGISTER",
    accent: "#0f766e",
    accentSoft: "#ccfbf1",
    ribbon: "#14b8a6",
    tableHead: "#115e59",
    badge: "#0f766e",
    note: "Subject marks entry sheet",
  },
  attendance: {
    label: "ATTENDANCE REGISTER",
    accent: "#1d4ed8",
    accentSoft: "#dbeafe",
    ribbon: "#0ea5e9",
    tableHead: "#1e3a8a",
    badge: "#1d4ed8",
    note: "Daily class presence register",
  },
  datesheet: {
    label: "EXAMINATION DATE SHEET",
    accent: "#111827",
    accentSoft: "#f3f4f6",
    ribbon: "#374151",
    tableHead: "#111827",
    badge: "#1f2937",
    note: "Official examination timetable",
  },
  paper: {
    label: "EXAMINATION PAPER",
    accent: "#312e81",
    accentSoft: "#e0e7ff",
    ribbon: "#6366f1",
    tableHead: "#312e81",
    badge: "#4338ca",
    note: "Question paper · attempt all questions carefully",
  },
  syllabus: {
    label: "COURSE SYLLABUS",
    accent: "#1d4ed8",
    accentSoft: "#dbeafe",
    ribbon: "#3b82f6",
    tableHead: "#1e40af",
    badge: "#1d4ed8",
    note: "Approved course outline & learning plan",
  },
  default: {
    label: "OFFICIAL DOCUMENT",
    accent: "#3b5bdb",
    accentSoft: "#e0e7ff",
    ribbon: "#22b8cf",
    tableHead: "#1e293b",
    badge: "#3b5bdb",
    note: "SchoolMS generated document",
  },
};

/**
 * Downloads a professionally styled PDF (no print dialog).
 * @param {string} title
 * @param {string} bodyHtml
 * @param {{ subtitle?: string, type?: keyof typeof THEMES, meta?: Record<string,string>, filename?: string }} options
 */
export async function saveAsPdf(title, bodyHtml, options = {}) {
  const type = THEMES[options.type] ? options.type : "default";
  const theme = THEMES[type];
  const subtitle = options.subtitle || theme.note;
  const generated = new Date().toLocaleString();
  const filename =
    options.filename ||
    `${slugify(title || theme.label)}.pdf`;

  const html = buildDocumentHtml({
    title,
    bodyHtml,
    subtitle,
    generated,
    type,
    theme,
    meta: options.meta || {},
  });

  const host = document.createElement("div");
  host.setAttribute("data-sms-pdf", "true");
  host.style.cssText =
    "position:fixed;left:0;top:0;width:794px;z-index:-1;pointer-events:none;overflow:visible;background:#fff;";
  host.innerHTML = html;
  document.body.appendChild(host);

  const target = host.querySelector(".sms-pdf-page") || host;

  // Let the browser lay out the full document before capture.
  await new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
  await new Promise((resolve) => setTimeout(resolve, 120));

  const captureWidth = Math.ceil(target.scrollWidth || target.offsetWidth || 794);
  const captureHeight = Math.ceil(target.scrollHeight || target.offsetHeight || 1123);
  const scale = captureHeight > 7000 ? 1.35 : captureHeight > 4500 ? 1.6 : 2;

  try {
    const html2pdfModule = await import("html2pdf.js");
    const html2pdf = html2pdfModule.default;
    await html2pdf()
      .set({
        margin: [8, 8, 10, 8],
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          width: captureWidth,
          height: captureHeight,
          windowWidth: captureWidth,
          windowHeight: captureHeight,
          scrollX: 0,
          scrollY: 0,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: {
          mode: ["css", "legacy"],
          before: ".pdf-page-break",
          avoid: ["tr", ".q-block", ".meta-chip"],
        },
      })
      .from(target)
      .save();
  } catch (err) {
    console.error("PDF export failed:", err);
    alert("Could not save PDF. Please try again.");
  } finally {
    host.remove();
  }
}

function buildDocumentHtml({ title, bodyHtml, subtitle, generated, type, theme, meta }) {
  const metaRows = Object.entries(meta)
    .filter(([, v]) => v != null && String(v).trim() !== "")
    .map(
      ([k, v]) =>
        `<div class="meta-chip"><span>${escapeHtml(k)}</span><strong>${escapeHtml(String(v))}</strong></div>`
    )
    .join("");

  return `
<style>${baseCss(theme, type)}</style>
<article class="sms-pdf-page theme-${escapeHtml(type)}">
  <header class="pdf-top">
    <div class="brand-block">
      <div class="logo">${LOGO_SVG}</div>
      <div>
        <div class="brand-name">SchoolMS</div>
        <div class="brand-tag">School Management System</div>
      </div>
    </div>
    <div class="doc-badge">${escapeHtml(theme.label)}</div>
  </header>

  <div class="ribbon"></div>

  <section class="pdf-title-block">
    <h1>${escapeHtml(title)}</h1>
    <p class="subtitle">${escapeHtml(subtitle)}</p>
    ${metaRows ? `<div class="meta-row">${metaRows}</div>` : ""}
  </section>

  ${typeDecor(type)}

  <section class="pdf-body body-${escapeHtml(type)}">${bodyHtml}</section>

  <footer class="pdf-foot">
    <div>
      <strong>SchoolMS</strong> · ${escapeHtml(theme.note)}
    </div>
    <div>Generated ${escapeHtml(generated)}</div>
  </footer>
  <div class="pdf-seal">Verified digital copy</div>
</article>`;
}

function typeDecor(type) {
  if (type === "paper") {
    return `<div class="paper-banner">
      <div>Time Allowed: As notified</div>
      <div>Max. Marks: As per questions</div>
      <div>Answer all questions</div>
    </div>`;
  }
  if (type === "datesheet") {
    return `<div class="notice-box">Students must bring their admit card and arrive 30 minutes before the scheduled time.</div>`;
  }
  if (type === "results") {
    return `<div class="results-band">Performance Summary · Keep this copy for your records</div>`;
  }
  if (type === "attendance") {
    return `<div class="attendance-legend">
      <span class="leg present">Present</span>
      <span class="leg absent">Absent</span>
      <span class="leg late">Late / Leave</span>
    </div>`;
  }
  return "";
}

function baseCss(theme, type) {
  return `
    .sms-pdf-page {
      font-family: "Segoe UI", "DM Sans", Arial, sans-serif;
      color: #0f172a;
      background: #fff;
      width: 794px;
      min-height: auto;
      padding: 28px 32px 48px;
      box-sizing: border-box;
      position: relative;
      overflow: visible;
    }
    .sms-pdf-page * { box-sizing: border-box; }
    .pdf-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
    .brand-block { display: flex; align-items: center; gap: 12px; }
    .logo { width: 48px; height: 48px; flex-shrink: 0; }
    .logo svg { display: block; width: 48px; height: 48px; }
    .brand-name {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: ${theme.accent};
      line-height: 1.1;
    }
    .brand-tag {
      font-size: 11px;
      color: #64748b;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .doc-badge {
      background: ${theme.accentSoft};
      color: ${theme.accent};
      border: 1px solid ${theme.accent}33;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.14em;
      padding: 8px 12px;
      border-radius: 999px;
      white-space: nowrap;
    }
    .ribbon {
      height: 5px;
      margin: 16px 0 20px;
      border-radius: 999px;
      background: linear-gradient(90deg, ${theme.accent}, ${theme.ribbon});
    }
    .pdf-title-block h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: ${theme.accent};
    }
    .subtitle {
      margin: 6px 0 0;
      color: #64748b;
      font-size: 13px;
    }
    .meta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 14px;
    }
    .meta-chip {
      background: ${theme.accentSoft};
      border: 1px solid ${theme.accent}22;
      border-radius: 10px;
      padding: 8px 12px;
      min-width: 120px;
    }
    .meta-chip span {
      display: block;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
      margin-bottom: 2px;
    }
    .meta-chip strong {
      font-size: 13px;
      color: ${theme.accent};
    }
    .pdf-body { margin-top: 18px; font-size: 13px; line-height: 1.55; overflow: visible; }
    .pdf-body table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      font-size: 12.5px;
      page-break-inside: auto;
    }
    .pdf-body thead { display: table-header-group; }
    .pdf-body tbody { display: table-row-group; }
    .pdf-body tr { page-break-inside: avoid; page-break-after: auto; }
    .pdf-body th, .pdf-body td {
      border: 1px solid #e2e8f0;
      padding: 9px 10px;
      text-align: left;
      vertical-align: top;
    }
    .pdf-body th {
      background: ${theme.tableHead};
      color: #fff;
      font-weight: 700;
      font-size: 11px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .pdf-body tr:nth-child(even) td { background: #f8fafc; }
    .pdf-body h2 { font-size: 15px; margin: 20px 0 8px; color: ${theme.accent}; }
    .pdf-body ul, .pdf-body ol { padding-left: 18px; }
    .pdf-body li { margin: 5px 0; }
    .pdf-foot {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      margin-top: 28px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      font-size: 10px;
      color: #94a3b8;
      page-break-inside: avoid;
    }
    .pdf-seal {
      position: relative;
      float: right;
      clear: both;
      margin-top: -36px;
      margin-bottom: 12px;
      border: 2px dashed ${theme.accent}55;
      color: ${theme.accent};
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      padding: 8px 10px;
      border-radius: 8px;
      opacity: 0.55;
      transform: rotate(-8deg);
      page-break-inside: avoid;
    }

    /* RESULTS — report card */
    .theme-results .pdf-title-block {
      text-align: center;
      background: linear-gradient(180deg, ${theme.accentSoft}, #fff);
      border: 1px solid ${theme.accent}22;
      border-radius: 16px;
      padding: 18px 16px;
    }
    .results-band {
      margin-top: 14px;
      text-align: center;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: ${theme.badge};
      background: ${theme.accentSoft};
      padding: 8px;
      border-radius: 8px;
    }
    .body-results table th { background: linear-gradient(90deg, #1e3a8a, #0369a1); }
    .body-results td:nth-child(n+4) { font-weight: 700; color: #0f172a; }

    /* MARKS — ledger */
    .theme-marks .sms-pdf-page {
      background:
        linear-gradient(90deg, transparent 39px, #99f6e422 40px, transparent 41px),
        #fff;
    }
    .body-marks table { border: 2px solid ${theme.accent}; }
    .body-marks th { background: ${theme.tableHead}; }
    .body-marks tr:nth-child(even) td { background: #f0fdfa; }

    /* ATTENDANCE — register */
    .theme-attendance .pdf-title-block h1 { color: ${theme.accent}; }
    .attendance-legend {
      display: flex;
      gap: 10px;
      margin-top: 12px;
      font-size: 11px;
      font-weight: 700;
    }
    .attendance-legend .leg {
      padding: 4px 10px;
      border-radius: 999px;
    }
    .attendance-legend .present { background: #d1fae5; color: #065f46; }
    .attendance-legend .absent { background: #dbeafe; color: #1d4ed8; }
    .attendance-legend .late { background: #fef3c7; color: #92400e; }
    .body-attendance .status-present {
      color: #065f46; background: #d1fae5; font-weight: 800;
      border-radius: 6px; padding: 2px 8px; display: inline-block;
    }
    .body-attendance .status-absent {
      color: #1d4ed8; background: #dbeafe; font-weight: 800;
      border-radius: 6px; padding: 2px 8px; display: inline-block;
    }
    .body-attendance table th { background: ${theme.tableHead}; }

    /* DATESHEET — formal notice */
    .theme-datesheet .pdf-title-block {
      text-align: center;
      border-top: 3px double ${theme.accent};
      border-bottom: 3px double ${theme.accent};
      padding: 14px 8px;
    }
    .theme-datesheet .pdf-title-block h1 {
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-size: 20px;
    }
    .notice-box {
      margin-top: 12px;
      border: 1px solid #9ca3af;
      background: #f9fafb;
      padding: 10px 12px;
      font-size: 12px;
      text-align: center;
      color: #374151;
    }
    .body-datesheet table { border: 2px solid #111827; }
    .body-datesheet th { background: #111827; }
    .body-datesheet td { border-color: #9ca3af; }

    /* PAPER — exam sheet */
    .theme-paper .pdf-title-block {
      border: 2px solid ${theme.accent};
      padding: 14px 16px;
      border-radius: 4px;
    }
    .paper-banner {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px;
      margin-top: 12px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .paper-banner > div {
      border: 1px dashed ${theme.accent};
      padding: 8px;
      text-align: center;
      color: ${theme.accent};
      background: ${theme.accentSoft};
    }
    .body-paper .q-block {
      border-left: 4px solid ${theme.ribbon};
      padding: 10px 12px;
      margin: 12px 0;
      background: #f8fafc;
      border-radius: 0 10px 10px 0;
      page-break-inside: avoid;
    }
    .body-paper .q-head {
      display: flex;
      justify-content: space-between;
      font-weight: 800;
      color: ${theme.accent};
      margin-bottom: 6px;
      font-size: 12px;
    }
    .body-paper .answer-lines {
      margin-top: 10px;
      border-bottom: 1px dotted #cbd5e1;
      height: 18px;
    }

    /* SYLLABUS — academic outline */
    .theme-syllabus .pdf-title-block {
      background: ${theme.accentSoft};
      border-left: 6px solid ${theme.accent};
      padding: 14px 16px;
      border-radius: 0 12px 12px 0;
    }
    .body-syllabus h2 {
      border-bottom: 2px solid ${theme.ribbon};
      padding-bottom: 4px;
    }
  `;
}

export function tableHtml(headers, rows, options = {}) {
  const statusCol = options.statusColumn; // 0-based index for attendance badges
  const head = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("");
  const body = rows
    .map((row) => {
      const cells = row
        .map((cell, idx) => {
          const raw = String(cell ?? "—");
          if (statusCol != null && idx === statusCol) {
            const cls = statusClass(raw);
            return `<td><span class="${cls}">${escapeHtml(raw)}</span></td>`;
          }
          return `<td>${escapeHtml(raw)}</td>`;
        })
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

/** Build exam-paper question blocks with unique styling hooks. */
export function paperQuestionsHtml(questions = []) {
  if (!questions.length) {
    return `<p><em>See attached question file / booklet.</em></p>`;
  }
  return questions
    .map(
      (q, i) => `
      <div class="q-block">
        <div class="q-head"><span>Question ${i + 1}</span><span>${escapeHtml(String(q.marks || 0))} Marks</span></div>
        <div>${q.q || ""}</div>
        <div class="answer-lines"></div>
        <div class="answer-lines"></div>
        <div class="answer-lines"></div>
      </div>`
    )
    .join("");
}

function statusClass(status) {
  const s = String(status).toLowerCase();
  if (s.includes("present")) return "status-present";
  if (s.includes("absent")) return "status-absent";
  return "status-absent";
}

function slugify(str) {
  return String(str || "document")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default saveAsPdf;
