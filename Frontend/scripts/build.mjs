import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const bindingVersion = "1.0.3";
const linuxBindingName = "@rolldown/binding-linux-x64-gnu";
const localBindingPath = path.resolve(
  process.cwd(),
  "node_modules",
  "@rolldown",
  "binding-linux-x64-gnu"
);
const viteCliPath = path.resolve(process.cwd(), "node_modules", "vite", "bin", "vite.js");

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (process.platform === "linux" && !existsSync(localBindingPath)) {
  console.log(`Missing ${linuxBindingName}; installing fallback binding...`);
  run(process.platform === "win32" ? "npm.cmd" : "npm", [
    "install",
    "--no-save",
    `${linuxBindingName}@${bindingVersion}`,
  ]);
}

run(process.execPath, [viteCliPath, "build"]);
