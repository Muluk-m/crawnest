#!/usr/bin/env node

/**
 * Downloads Node.js binaries for each target platform into src-tauri/binaries/
 * and renames them per Tauri sidecar naming convention:
 *   node-<target-triple>[.exe]
 *
 * Tauri target triples:
 *   - aarch64-apple-darwin
 *   - x86_64-apple-darwin
 *   - x86_64-pc-windows-msvc
 */

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const NODE_VERSION = "v22.16.0";
const BINARIES_DIR = path.join(__dirname, "..", "src-tauri", "binaries");

const TARGETS = [
  {
    platform: "darwin",
    arch: "arm64",
    triple: "aarch64-apple-darwin",
    archiveName: `node-${NODE_VERSION}-darwin-arm64.tar.gz`,
    binaryPath: `node-${NODE_VERSION}-darwin-arm64/bin/node`,
    outputName: "node-aarch64-apple-darwin",
  },
  {
    platform: "darwin",
    arch: "x64",
    triple: "x86_64-apple-darwin",
    archiveName: `node-${NODE_VERSION}-darwin-x64.tar.gz`,
    binaryPath: `node-${NODE_VERSION}-darwin-x64/bin/node`,
    outputName: "node-x86_64-apple-darwin",
  },
  {
    platform: "win32",
    arch: "x64",
    triple: "x86_64-pc-windows-msvc",
    archiveName: `node-${NODE_VERSION}-win-x64.zip`,
    binaryPath: `node-${NODE_VERSION}-win-x64/node.exe`,
    outputName: "node-x86_64-pc-windows-msvc.exe",
  },
];

function download(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function downloadTarget(target) {
  const outputPath = path.join(BINARIES_DIR, target.outputName);

  if (fs.existsSync(outputPath)) {
    console.log(`  [skip] ${target.outputName} already exists`);
    return;
  }

  const url = `https://nodejs.org/dist/${NODE_VERSION}/${target.archiveName}`;
  console.log(`  Downloading ${target.archiveName}...`);

  const archivePath = path.join(BINARIES_DIR, target.archiveName);
  const data = await download(url);
  fs.writeFileSync(archivePath, data);

  console.log(`  Extracting ${target.binaryPath}...`);

  if (target.archiveName.endsWith(".tar.gz")) {
    execSync(`tar -xzf "${archivePath}" -C "${BINARIES_DIR}" "${target.binaryPath}"`, {
      stdio: "pipe",
    });
    const extractedPath = path.join(BINARIES_DIR, target.binaryPath);
    fs.renameSync(extractedPath, outputPath);
    // Clean up extracted directory
    const extractedDir = path.join(BINARIES_DIR, target.binaryPath.split("/")[0]);
    fs.rmSync(extractedDir, { recursive: true, force: true });
  } else {
    // .zip for Windows
    execSync(`unzip -o "${archivePath}" "${target.binaryPath}" -d "${BINARIES_DIR}"`, {
      stdio: "pipe",
    });
    const extractedPath = path.join(BINARIES_DIR, target.binaryPath);
    fs.renameSync(extractedPath, outputPath);
    const extractedDir = path.join(BINARIES_DIR, target.binaryPath.split("/")[0]);
    fs.rmSync(extractedDir, { recursive: true, force: true });
  }

  // Clean up archive
  fs.unlinkSync(archivePath);

  // Make executable on unix
  if (!target.outputName.endsWith(".exe")) {
    fs.chmodSync(outputPath, 0o755);
  }

  console.log(`  [done] ${target.outputName}`);
}

async function main() {
  console.log(`Downloading Node.js ${NODE_VERSION} binaries...`);
  fs.mkdirSync(BINARIES_DIR, { recursive: true });

  // If --current-only flag, only download for current platform
  const currentOnly = process.argv.includes("--current-only");

  for (const target of TARGETS) {
    if (currentOnly && (target.platform !== process.platform || target.arch !== process.arch)) {
      console.log(`  [skip] ${target.outputName} (not current platform)`);
      continue;
    }
    await downloadTarget(target);
  }

  console.log("Done!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
