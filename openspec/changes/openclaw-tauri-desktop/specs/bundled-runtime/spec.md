## ADDED Requirements

### Requirement: 应用内置 Node.js runtime
应用 SHALL 在 `src-tauri/binaries/` 目录中包含各平台对应的 Node.js 可执行文件（darwin-aarch64、darwin-x64、win-x64），不依赖用户系统已安装的 Node.js。

#### Scenario: macOS ARM 用户启动应用
- **WHEN** 用户在 macOS ARM64 机器上启动应用
- **THEN** 应用使用内置的 `node-darwin-aarch64` 二进制执行 OpenClaw

#### Scenario: 系统无 Node.js
- **WHEN** 用户系统未安装任何版本的 Node.js
- **THEN** 应用仍能正常启动并运行 OpenClaw gateway

### Requirement: 应用内置 OpenClaw npm 包
应用 SHALL 在 `src-tauri/resources/openclaw-runtime/` 目录中包含固定版本的 OpenClaw npm 包及其完整 node_modules 依赖。

#### Scenario: 内置 runtime 完整性
- **WHEN** 应用首次安装后启动
- **THEN** `resources/openclaw-runtime/node_modules/` 包含完整可运行的 OpenClaw 依赖，无需网络下载

### Requirement: 启动脚本入口
应用 SHALL 提供 `resources/scripts/start-openclaw.js` 作为统一启动入口，通过内置 Node 执行该脚本来启动 OpenClaw gateway。

#### Scenario: 启动脚本调用
- **WHEN** GUI 触发启动操作
- **THEN** 应用执行 `<bundled-node> <resource-dir>/scripts/start-openclaw.js`，不依赖 shell 或系统 PATH

### Requirement: 环境变量隔离
启动脚本 SHALL 显式删除所有代理相关环境变量（HTTP_PROXY、HTTPS_PROXY、ALL_PROXY 及其小写变体），构造最小化干净环境。

#### Scenario: 代理变量清理
- **WHEN** 用户系统设置了 HTTP_PROXY=127.0.0.1:7897
- **THEN** OpenClaw gateway 进程的环境中不包含任何代理变量
