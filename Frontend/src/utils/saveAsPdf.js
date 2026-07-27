/**
 * Opens a styled print dialog — user can choose "Save as PDF" in the browser print UI.
 * Uses a hidden iframe so no pop-up permission is required.
 */
export function saveAsPdf(title, bodyHtml, options = {}) {
  const subtitle = options.subtitle || "SchoolMS · Official document";
  const generated = new Date().toLocaleString();
  const html = buildPrintHtml(title, bodyHtml, subtitle, generated);

  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", "Print preview");
  iframe.style.cssText = "position:fixed;width:0;height:0;border:0;visibility:hidden;";
  document.body.appendChild(iframe);

  const frameWindow = iframe.contentWindow;
  const frameDoc = frameWindow?.document;
  if (!frameDoc) {
    iframe.remove();
    alert("Could not open print preview. Please try again.");
    return;
  }

  frameDoc.open();
  frameDoc.write(html);
  frameDoc.close();

  const cleanup = () => iframe.remove();

  const runPrint = () => {
    frameWindow.focus();
    frameWindow.print();
    frameWindow.addEventListener("afterprint", cleanup, { once: true });
    setTimeout(cleanup, 60_000);
  };

  if (frameDoc.readyState === "complete") {
    setTimeout(runPrint, 250);
  } else {
    iframe.addEventListener("load", () => setTimeout(runPrint, 250), { once: true });
  }
}

function buildPrintHtml(title, bodyHtml, subtitle, generated) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    @page { margin: 18mm; }
    * { box-sizing: border-box; }
    body {
      font-family: "Segoe UI", system-ui, sans-serif;
      color: #0f172a;
      margin: 0;
      padding: 28px;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #3b5bdb;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .brand { font-size: 22px; font-weight: 800; color: #3b5bdb; letter-spacing: -0.02em; }
    .meta { text-align: right; font-size: 12px; color: #64748b; }
    h1 { font-size: 22px; margin: 0 0 6px; }
    .sub { color: #64748b; font-size: 13px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
    th, td { border: 1px solid #e2e8f0; padding: 10px 12px; text-align: left; }
    th { background: #1e293b; color: #fff; }
    tr:nth-child(even) { background: #f8fafc; }
    ul, ol { padding-left: 18px; }
    li { margin: 6px 0; }
    .footer {
      margin-top: 32px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      font-size: 11px;
      color: #94a3b8;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">SchoolMS</div>
      <h1>${escapeHtml(title)}</h1>
      <div class="sub">${escapeHtml(subtitle)}</div>
    </div>
    <div class="meta">Generated<br/>${escapeHtml(generated)}</div>
  </div>
  <div class="content">${bodyHtml}</div>
  <div class="footer">School Management System · Confidential · Save as PDF from the print dialog</div>
</body>
</html>`;
}

export function tableHtml(headers, rows) {
  const head = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("");
  const body = rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${escapeHtml(String(cell ?? "—"))}</td>`).join("")}</tr>`
    )
    .join("");
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default saveAsPdf;
