import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const packageLockPath = path.resolve(process.cwd(), "package-lock.json");
const viteCliPath = path.resolve(process.cwd(), "node_modules", "vite", "bin", "vite.js");

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function getLinuxNativePackages() {
  const packageLock = JSON.parse(readFileSync(packageLockPath, "utf8"));
  const packages = packageLock.packages || {};

  return Object.entries(packages)
    .filter(([packagePath, meta]) => {
      if (!packagePath.startsWith("node_modules/")) return false;
      const packageName = packagePath.replace(/^node_modules\//, "");
      return (
        packageName === "@rolldown/binding-linux-x64-gnu" ||
        packageName.endsWith("linux-x64-gnu")
      );
    })
    .map(([packagePath, meta]) => ({
      name: packagePath.replace(/^node_modules\//, ""),
      version: meta.version,
    }))
    .filter((pkg) => typeof pkg.version === "string");
}

if (process.platform === "linux") {
  const linuxNativePackages = getLinuxNativePackages();
  console.log("Installing Linux native fallback packages for Vercel build...");
  run(process.platform === "win32" ? "npm.cmd" : "npm", [
    "install",
    "--no-save",
    ...linuxNativePackages.map((pkg) => `${pkg.name}@${pkg.version}`),
  ]);
}

run(process.execPath, [viteCliPath, "build"]);
