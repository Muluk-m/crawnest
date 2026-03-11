#!/usr/bin/env node

/**
 * Prepares the OpenClaw runtime in src-tauri/resources/openclaw-runtime/
 * by installing a fixed version of the openclaw npm package.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const OPENCLAW_VERSION = "latest"; // Pin to specific version for production
const RUNTIME_DIR = path.join(__dirname, "..", "src-tauri", "resources", "openclaw-runtime");

function main() {
  console.log("Preparing OpenClaw runtime...");

  fs.mkdirSync(RUNTIME_DIR, { recursive: true });

  // Create a minimal package.json if not exists
  const pkgPath = path.join(RUNTIME_DIR, "package.json");
  if (!fs.existsSync(pkgPath)) {
    fs.writeFileSync(
      pkgPath,
      JSON.stringify(
        {
          name: "openclaw-runtime",
          version: "1.0.0",
          private: true,
          description: "Bundled OpenClaw runtime for desktop app",
        },
        null,
        2
      )
    );
  }

  console.log(`Installing openclaw@${OPENCLAW_VERSION}...`);
  execSync(`npm install openclaw@${OPENCLAW_VERSION} --save --production`, {
    cwd: RUNTIME_DIR,
    stdio: "inherit",
  });

  // Verify installation
  const openclawPkg = path.join(RUNTIME_DIR, "node_modules", "openclaw", "package.json");
  if (fs.existsSync(openclawPkg)) {
    const pkg = JSON.parse(fs.readFileSync(openclawPkg, "utf8"));
    console.log(`OpenClaw ${pkg.version} installed successfully.`);
  } else {
    console.error("ERROR: openclaw package not found after install!");
    process.exit(1);
  }

  console.log("Done!");
}

main();
