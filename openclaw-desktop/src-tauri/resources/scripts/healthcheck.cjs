#!/usr/bin/env node

/**
 * Healthcheck script - verifies the OpenClaw gateway service is responsive.
 *
 * Args via env:
 *   OPENCLAW_GATEWAY_HOST - default 127.0.0.1
 *   OPENCLAW_GATEWAY_PORT - default 3000
 *
 * Exits 0 if healthy, 1 if not.
 */

const http = require("http");

const host = process.env.OPENCLAW_GATEWAY_HOST || "127.0.0.1";
const port = parseInt(process.env.OPENCLAW_GATEWAY_PORT || "3000", 10);

const req = http.get(`http://${host}:${port}/`, { timeout: 5000 }, (res) => {
  if (res.statusCode && res.statusCode < 500) {
    console.log(JSON.stringify({ healthy: true, status: res.statusCode }));
    process.exit(0);
  } else {
    console.log(JSON.stringify({ healthy: false, status: res.statusCode }));
    process.exit(1);
  }
});

req.on("error", (err) => {
  console.log(JSON.stringify({ healthy: false, error: err.message }));
  process.exit(1);
});

req.on("timeout", () => {
  req.destroy();
  console.log(JSON.stringify({ healthy: false, error: "timeout" }));
  process.exit(1);
});
