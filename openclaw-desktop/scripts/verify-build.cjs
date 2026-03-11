#!/usr/bin/env node

/**
 * Pre-build verification script.
 * Checks that all required artifacts are in place before `tauri build`.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const BINARIES_DIR = path.join(ROOT, "src-tauri", "binaries");
const RESOURCES_DIR = path.join(ROOT, "src-tauri", "resources");
const RUNTIME_DIR = path.join(RESOURCES_DIR, "openclaw-runtime");
const SCRIPTS_DIR = path.join(RESOURCES_DIR, "scripts");

let hasError = false;

function check(label, ok, detail) {
  if (ok) {
    console.log(`  [OK] ${label}`);
  } else {
    console.error(`  [FAIL] ${label}${detail ? ": " + detail : ""}`);
    hasError = true;
  }
}

function fileExists(p) {
  return fs.existsSync(p);
}

console.log("=== Pre-build Verification ===\n");

// 1. Check Node binaries
console.log("1. Node binaries:");
const os = require("os");
const platform = os.platform();
const arch = os.arch();

if (platform === "darwin") {
  if (arch === "arm64") {
    check("Node (aarch64-apple-darwin)", fileExists(path.join(BINARIES_DIR, "node-aarch64-apple-darwin")));
  } else {
    check("Node (x86_64-apple-darwin)", fileExists(path.join(BINARIES_DIR, "node-x86_64-apple-darwin")));
  }
} else if (platform === "win32") {
  check("Node (x86_64-pc-windows-msvc)", fileExists(path.join(BINARIES_DIR, "node-x86_64-pc-windows-msvc.exe")));
} else {
  // Check all if cross-compiling or unknown
  const binaries = fs.existsSync(BINARIES_DIR) ? fs.readdirSync(BINARIES_DIR).filter((f) => f.startsWith("node-")) : [];
  check("At least one Node binary", binaries.length > 0, `Found: ${binaries.join(", ") || "none"}`);
}

// 2. Check OpenClaw runtime
console.log("\n2. OpenClaw runtime:");
check("Runtime directory exists", fileExists(RUNTIME_DIR));
check("node_modules exists", fileExists(path.join(RUNTIME_DIR, "node_modules")));

const openclawPkg = path.join(RUNTIME_DIR, "node_modules", "openclaw", "package.json");
if (fileExists(openclawPkg)) {
  const pkg = JSON.parse(fs.readFileSync(openclawPkg, "utf-8"));
  check(`OpenClaw package (v${pkg.version})`, true);
} else {
  check("OpenClaw package", false, "openclaw not found in node_modules");
}

// 3. Check Feishu plugin
console.log("\n3. Feishu plugin:");
const pluginDir = path.join(RUNTIME_DIR, "node_modules", "@larksuiteoapi/feishu-openclaw-plugin");
check("@larksuiteoapi/feishu-openclaw-plugin installed", fileExists(pluginDir));

// 4. Check runtime scripts
console.log("\n4. Runtime scripts:");
for (const script of ["start-openclaw.cjs", "bootstrap-runtime.cjs", "healthcheck.cjs"]) {
  check(script, fileExists(path.join(SCRIPTS_DIR, script)));
}

// 5. Check templates
console.log("\n5. Templates:");
check("config.default.json", fileExists(path.join(RESOURCES_DIR, "templates", "config.default.json")));

// 6. Check frontend build
console.log("\n6. Frontend:");
const distDir = path.join(ROOT, "dist");
check("dist/ directory", fileExists(distDir));
check("dist/index.html", fileExists(path.join(distDir, "index.html")));

console.log("\n" + "=".repeat(30));
if (hasError) {
  console.error("\nVerification FAILED. Fix issues above before building.");
  process.exit(1);
} else {
  console.log("\nAll checks passed. Ready to build.");
}
