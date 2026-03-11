#!/usr/bin/env node

/**
 * First-run bootstrap script.
 *
 * Responsibilities:
 * 1. Initialize user data directory structure
 * 2. Copy default config template
 * 3. Copy Feishu plugin to user extensions directory
 *
 * Args via env:
 *   OPENCLAW_USER_DIR    - user data directory path
 *   OPENCLAW_RUNTIME_DIR - bundled runtime directory path
 *   OPENCLAW_TEMPLATES_DIR - templates directory path
 */

const fs = require("fs");
const path = require("path");

const userDir = process.env.OPENCLAW_USER_DIR;
const runtimeDir = process.env.OPENCLAW_RUNTIME_DIR;
const templatesDir = process.env.OPENCLAW_TEMPLATES_DIR;

if (!userDir) {
  console.error("ERROR: OPENCLAW_USER_DIR not set");
  process.exit(1);
}

const dirs = ["config", "extensions", "logs", "state"];

console.log(`Bootstrapping user directory: ${userDir}`);

// 1. Create directory structure
for (const dir of dirs) {
  const dirPath = path.join(userDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`  Created: ${dir}/`);
  }
}

// 2. Copy default config if not exists
const configDest = path.join(userDir, "config", "app-config.json");
if (!fs.existsSync(configDest) && templatesDir) {
  const configSrc = path.join(templatesDir, "config.default.json");
  if (fs.existsSync(configSrc)) {
    fs.copyFileSync(configSrc, configDest);
    console.log("  Copied default config");
  }
}

// 3. Copy Feishu plugin to extensions if not exists
const pluginName = "@larksuiteoapi/feishu-openclaw-plugin";
const pluginDest = path.join(userDir, "extensions", pluginName);
if (!fs.existsSync(pluginDest) && runtimeDir) {
  const pluginSrc = path.join(runtimeDir, "node_modules", pluginName);
  if (fs.existsSync(pluginSrc)) {
    copyDirSync(pluginSrc, pluginDest);
    console.log("  Copied Feishu plugin to extensions");
  }
}

// 4. Initialize runtime state
const statePath = path.join(userDir, "state", "runtime.json");
if (!fs.existsSync(statePath)) {
  fs.writeFileSync(
    statePath,
    JSON.stringify(
      {
        lastBootstrap: new Date().toISOString(),
        pid: null,
        status: "stopped",
      },
      null,
      2
    )
  );
  console.log("  Initialized runtime state");
}

console.log("Bootstrap complete.");

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
