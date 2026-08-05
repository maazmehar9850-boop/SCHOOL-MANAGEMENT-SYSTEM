/**
 * Build high-contrast Aspira favicons (ICO/PNG/SVG) for Chrome tab visibility.
 * White-on-white source logos often look blank at 16px — pad on navy plate.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const srcLogo = path.join(root, "src", "assets", "aspira-logo.png");

const ps = `
Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Bitmap]::FromFile('${srcLogo.replace(/\\/g, "\\\\")}')
function Save-Icon($size, $outPath) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.PixelOffsetMode = 'HighQuality'
  $g.Clear([System.Drawing.Color]::FromArgb(255, 15, 23, 42))
  $pad = [Math]::Max(1, [int]($size * 0.08))
  $g.DrawImage($src, $pad, $pad, $size - 2*$pad, $size - 2*$pad)
  $g.Dispose()
  $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}
$pub = '${publicDir.replace(/\\/g, "\\\\")}'
Save-Icon 16 (Join-Path $pub '_ico-16.png')
Save-Icon 32 (Join-Path $pub 'favicon.png')
Save-Icon 32 (Join-Path $pub '_ico-32.png')
Save-Icon 48 (Join-Path $pub '_ico-48.png')
Save-Icon 64 (Join-Path $pub 'favicon-64.png')
Save-Icon 192 (Join-Path $pub 'favicon-192.png')
Save-Icon 180 (Join-Path $pub 'apple-touch-icon.png')
$src.Dispose()
Write-Host 'pngs ready'
`;

const r = spawnSync("powershell", ["-NoProfile", "-Command", ps], {
  encoding: "utf8",
  maxBuffer: 10 * 1024 * 1024,
});
if (r.status !== 0) {
  console.error(r.stderr || r.stdout);
  process.exit(1);
}
console.log(r.stdout.trim());

function pngToIco(pngBuffers) {
  const count = pngBuffers.length;
  let offset = 6 + count * 16;
  const entries = [];
  for (const png of pngBuffers) {
    const w = png.readUInt32BE(16);
    const h = png.readUInt32BE(20);
    entries.push({
      w: w >= 256 ? 0 : w,
      h: h >= 256 ? 0 : h,
      size: png.length,
      offset,
      png,
    });
    offset += png.length;
  }
  const buf = Buffer.alloc(offset);
  buf.writeUInt16LE(0, 0);
  buf.writeUInt16LE(1, 2);
  buf.writeUInt16LE(count, 4);
  let eo = 6;
  for (const e of entries) {
    buf.writeUInt8(e.w, eo);
    buf.writeUInt8(e.h, eo + 1);
    buf.writeUInt8(0, eo + 2);
    buf.writeUInt8(0, eo + 3);
    buf.writeUInt16LE(1, eo + 4);
    buf.writeUInt16LE(32, eo + 6);
    buf.writeUInt32LE(e.size, eo + 8);
    buf.writeUInt32LE(e.offset, eo + 12);
    e.png.copy(buf, e.offset);
    eo += 16;
  }
  return buf;
}

const icoPngs = [16, 32, 48].map((s) =>
  fs.readFileSync(path.join(publicDir, `_ico-${s}.png`))
);
fs.writeFileSync(path.join(publicDir, "favicon.ico"), pngToIco(icoPngs));
for (const s of [16, 32, 48]) {
  fs.unlinkSync(path.join(publicDir, `_ico-${s}.png`));
}

const fav32 = fs.readFileSync(path.join(publicDir, "favicon.png"));
const b64 = fav32.toString("base64");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <image href="data:image/png;base64,${b64}" width="32" height="32"/>
</svg>
`;
fs.writeFileSync(path.join(publicDir, "favicon.svg"), svg);

// data URI snippet for index.html injection helper
fs.writeFileSync(
  path.join(publicDir, "favicon-data-uri.txt"),
  `data:image/png;base64,${b64}`
);

console.log("favicon.ico", fs.statSync(path.join(publicDir, "favicon.ico")).size);
console.log("favicon.png", fs.statSync(path.join(publicDir, "favicon.png")).size);
console.log("data-uri length", b64.length);
