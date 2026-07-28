import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const linuxOptionalPackages = [
  {
    name: "@rolldown/binding-linux-x64-gnu",
    version: "1.0.3",
  },
  {
    name: "lightningcss-linux-x64-gnu",
    version: "1.32.0",
  },
];
const viteCliPath = path.resolve(process.cwd(), "node_modules", "vite", "bin", "vite.js");

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (process.platform === "linux") {
  console.log("Installing Linux native fallback packages for Vercel build...");
  run(process.platform === "win32" ? "npm.cmd" : "npm", [
    "install",
    "--no-save",
    ...linuxOptionalPackages.map((pkg) => `${pkg.name}@${pkg.version}`),
  ]);
}

run(process.execPath, [viteCliPath, "build"]);
