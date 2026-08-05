import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");

const png64 = fs.readFileSync(path.join(publicDir, "favicon-64.png"));
const b64 = png64.toString("base64");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <image href="data:image/png;base64,${b64}" width="64" height="64"/>
</svg>
`;
fs.writeFileSync(path.join(publicDir, "favicon.svg"), svg);
console.log("wrote favicon.svg", fs.statSync(path.join(publicDir, "favicon.svg")).size);
