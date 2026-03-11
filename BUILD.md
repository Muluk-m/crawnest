# OpenClaw Desktop - Build Guide

## Prerequisites

- **Node.js** >= 18
- **Rust** >= 1.77.2
- **npm** >= 9

### macOS

- Xcode Command Line Tools: `xcode-select --install`

### Windows

- [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with C++ workload
- [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) (pre-installed on Windows 11)

## Project Structure

```
openclaw-desktop/
  scripts/
    download-node.js      # Downloads Node.js binaries per platform
    prepare-runtime.js    # Installs OpenClaw npm package
    prepare-plugin.js     # Installs Feishu plugin
    verify-build.js       # Pre-build verification
  src/                    # React frontend
  src-tauri/
    binaries/             # Node.js sidecar binaries (generated)
    resources/
      openclaw-runtime/   # OpenClaw npm runtime (generated)
      scripts/            # Runtime helper scripts
      templates/          # Default config templates
    src/                  # Rust backend
```

## Quick Start (Development)

```bash
cd openclaw-desktop

# Install frontend dependencies
npm install

# Download Node.js binary for current platform only
npm run download-node:current

# Prepare OpenClaw runtime and plugin
npm run prepare-runtime
npm run prepare-plugin

# Start dev mode (Tauri + Vite HMR)
npm run tauri dev
```

## Build Steps

### 1. Prepare All Artifacts

```bash
# Downloads Node binaries for all target platforms,
# installs OpenClaw runtime, and installs Feishu plugin
npm run prepare-all
```

Or run each step individually:

```bash
npm run download-node       # All platforms
npm run download-node:current  # Current platform only
npm run prepare-runtime
npm run prepare-plugin
```

### 2. Build Frontend

```bash
npm run build
```

### 3. Verify Build Artifacts

```bash
npm run verify-build
```

This checks:
- Node.js binaries are present for the target platform
- OpenClaw npm package is installed in the runtime directory
- Feishu plugin is available
- Runtime scripts (start-openclaw.cjs, bootstrap-runtime.cjs, healthcheck.cjs) exist
- Default config template exists
- Frontend dist/ is built

### 4. Build Native App

```bash
# macOS: produces .app and .dmg
npm run tauri build

# Or use the all-in-one commands:
npm run package:mac    # prepare + build + verify + tauri build
npm run package:win    # same for Windows
```

Build output location:
- macOS: `src-tauri/target/release/bundle/dmg/`
- Windows: `src-tauri/target/release/bundle/msi/`

## Build for Specific Platform

When building for current platform only (recommended for development):

```bash
npm run download-node:current
npm run prepare-runtime
npm run prepare-plugin
npm run build
npm run verify-build
npm run tauri build
```

## Troubleshooting

### Node binary not found
Run `npm run download-node` or `npm run download-node:current` to re-download.

### OpenClaw runtime missing
Run `npm run prepare-runtime` to reinstall.

### Verification fails
Run `npm run verify-build` to see which artifacts are missing, then re-run the corresponding prepare script.

### macOS Gatekeeper blocks app
The app is unsigned in PoC stage. Right-click the app and select "Open" to bypass, or run:
```bash
xattr -cr "OpenClaw Desktop.app"
```

### Windows SmartScreen warning
The installer is unsigned. Click "More info" then "Run anyway".
