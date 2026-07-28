import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const linuxOptionalPackages = [
  {
    name: "@rolldown/binding-linux-x64-gnu",
    version: "1.0.3",
    localPath: path.resolve(
      process.cwd(),
      "node_modules",
      "@rolldown",
      "binding-linux-x64-gnu"
    ),
  },
  {
    name: "lightningcss-linux-x64-gnu",
    version: "1.32.0",
    localPath: path.resolve(
      process.cwd(),
      "node_modules",
      "lightningcss-linux-x64-gnu"
    ),
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
  for (const pkg of linuxOptionalPackages) {
    if (existsSync(pkg.localPath)) continue;

    console.log(`Missing ${pkg.name}; installing fallback binding...`);
    run(process.platform === "win32" ? "npm.cmd" : "npm", [
      "install",
      "--no-save",
      `${pkg.name}@${pkg.version}`,
    ]);
  }
}

run(process.execPath, [viteCliPath, "build"]);
