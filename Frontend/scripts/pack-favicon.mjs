import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = path.join(root, "public");

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

const icoPngs = ["_i16.png", "_i32.png", "_i48.png"].map((f) =>
  fs.readFileSync(path.join(pub, f))
);
fs.writeFileSync(path.join(pub, "favicon.ico"), pngToIco(icoPngs));
for (const f of ["_i16.png", "_i32.png", "_i48.png"]) {
  fs.unlinkSync(path.join(pub, f));
}

const fav = fs.readFileSync(path.join(pub, "favicon.png"));
const uri = `data:image/png;base64,${fav.toString("base64")}`;
fs.writeFileSync(path.join(pub, "favicon-data-uri.txt"), uri);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <image href="${uri}" width="32" height="32"/>
</svg>
`;
fs.writeFileSync(path.join(pub, "favicon.svg"), svg);

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="${uri}" />
    <link rel="shortcut icon" type="image/png" href="${uri}" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <meta name="theme-color" content="#070b14" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="description" content="Aspira College — campus portal for admins, teachers, and students." />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Sora:wght@500;600;700;800&display=swap"
      rel="stylesheet"
    />
    <title>Aspira College | Campus Portal</title>
    <style>
      html,
      body,
      #root {
        background: #070b14;
        min-height: 100%;
        margin: 0;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;
fs.writeFileSync(path.join(root, "index.html"), html);

console.log("favicon.ico", fs.statSync(path.join(pub, "favicon.ico")).size);
console.log("index.html inline favicon ready");
