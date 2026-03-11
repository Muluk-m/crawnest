#!/usr/bin/env node

/**
 * Installs the Feishu OpenClaw plugin into the runtime's node_modules.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const PLUGIN_PACKAGE = "@larksuiteoapi/feishu-openclaw-plugin";
const RUNTIME_DIR = path.join(__dirname, "..", "src-tauri", "resources", "openclaw-runtime");

function main() {
  console.log("Preparing Feishu plugin...");

  if (!fs.existsSync(path.join(RUNTIME_DIR, "package.json"))) {
    console.error("ERROR: Runtime not prepared yet. Run prepare-runtime first.");
    process.exit(1);
  }

  // Check if a local .tgz file is provided via env var
  const localPlugin = process.env.FEISHU_PLUGIN_PATH;

  if (localPlugin && fs.existsSync(localPlugin)) {
    console.log(`Installing from local path: ${localPlugin}`);
    execSync(`npm install "${localPlugin}" --save --production`, {
      cwd: RUNTIME_DIR,
      stdio: "inherit",
    });
  } else {
    console.log(`Installing ${PLUGIN_PACKAGE} from registry...`);
    try {
      execSync(`npm install ${PLUGIN_PACKAGE} --save --production`, {
        cwd: RUNTIME_DIR,
        stdio: "inherit",
      });
    } catch {
      console.warn(
        `WARNING: Could not install ${PLUGIN_PACKAGE} from registry.`,
        "Set FEISHU_PLUGIN_PATH env var to a local .tgz file."
      );
      return;
    }
  }

  // Verify
  const pluginDir = path.join(RUNTIME_DIR, "node_modules", PLUGIN_PACKAGE);
  if (fs.existsSync(pluginDir)) {
    console.log(`${PLUGIN_PACKAGE} installed successfully.`);
  } else {
    console.warn(`WARNING: ${PLUGIN_PACKAGE} directory not found after install.`);
  }

  console.log("Done!");
}

main();
