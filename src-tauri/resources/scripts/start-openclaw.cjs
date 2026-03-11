#!/usr/bin/env node

/**
 * Unified entry point for starting OpenClaw gateway.
 *
 * Responsibilities:
 * 1. Clean proxy environment variables
 * 2. Set user config directory
 * 3. Spawn `openclaw gateway run` as a child process
 *
 * Called by Tauri via: <bundled-node> <resource-dir>/scripts/start-openclaw.cjs
 * Args passed via env:
 *   OPENCLAW_RUNTIME_DIR - path to the bundled openclaw-runtime
 *   OPENCLAW_USER_DIR    - path to user data directory
 */

// 1. Clean proxy variables
const proxyVars = [
  "HTTP_PROXY",
  "HTTPS_PROXY",
  "ALL_PROXY",
  "http_proxy",
  "https_proxy",
  "all_proxy",
  "NO_PROXY",
  "no_proxy",
];
for (const v of proxyVars) {
  delete process.env[v];
}

const path = require("path");
const { spawn } = require("child_process");
const runtimeDir = process.env.OPENCLAW_RUNTIME_DIR;
const userDir = process.env.OPENCLAW_USER_DIR;

if (!runtimeDir) {
  console.error("ERROR: OPENCLAW_RUNTIME_DIR not set");
  process.exit(1);
}

// 2. Set config directory
if (userDir) {
  process.env.OPENCLAW_HOME = userDir;
}

// 3. Find openclaw CLI entry point
const openclawPath = path.join(runtimeDir, "node_modules", "openclaw");
let binPath;

try {
  const pkgJson = require(path.join(openclawPath, "package.json"));
  const binEntry = pkgJson.bin;

  if (typeof binEntry === "string") {
    binPath = path.join(openclawPath, binEntry);
  } else if (typeof binEntry === "object") {
    binPath = path.join(openclawPath, binEntry.openclaw || Object.values(binEntry)[0]);
  }
} catch (err) {
  console.error("ERROR: Could not read openclaw package.json:", err.message);
  process.exit(1);
}

if (!binPath) {
  console.error("ERROR: Could not find openclaw CLI entry point");
  process.exit(1);
}

// 4. Spawn openclaw as a child process (supports ESM entry points)
const child = spawn(process.execPath, [binPath, "gateway", "run"], {
  stdio: "inherit",
  env: process.env,
});

child.on("error", (err) => {
  console.error("ERROR: Failed to start OpenClaw gateway:", err.message);
  process.exit(1);
});

child.on("exit", (code) => {
  process.exit(code || 0);
});

// Forward signals to child
for (const signal of ["SIGTERM", "SIGINT", "SIGHUP"]) {
  process.on(signal, () => {
    child.kill(signal);
  });
}
