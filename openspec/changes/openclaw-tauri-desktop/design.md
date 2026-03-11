## Context

OpenClaw 当前是一个 Node.js CLI 工具，用户需要自行安装 Node.js、npm、全局 openclaw 包和飞书插件。跨平台（macOS/Windows）部署中，环境差异（bash/PowerShell、PATH、代理变量、权限）导致大量问题。参考项目 openclaw-desktop 和 crawbot 已验证"内置 runtime + GUI 壳"的产品方向可行。

本项目在同一代码仓库（crawnest）中新建 Tauri + React 桌面应用，将 Node.js runtime、OpenClaw npm 包和飞书插件打包到应用内部，提供完整 GUI 交互。

## Goals / Non-Goals

**Goals:**

- 用户安装一个桌面应用即可运行 OpenClaw gateway，无需任何开发环境
- macOS + Windows 双平台支持
- 内置 Node runtime 和 OpenClaw 依赖，不依赖系统环境
- 提供 Setup Wizard、Dashboard、Settings、Logs、Diagnostics 等完整 GUI
- 预留 Workspace/Chat、Skills、Automation 页面入口
- 支持开机自启和系统托盘

**Non-Goals:**

- 不实现完整的 AI Chat/Assistant 交互系统（首版仅占位）
- 不实现在线插件市场或自动更新下载
- 不支持 Linux 平台（首版）
- 不实现多用户/多实例管理
- 不处理 macOS 签名/公证（PoC 阶段）

## Decisions

### 1. GUI 框架：Tauri v2 + React

**选择**: Tauri v2（Rust 后端）+ React（前端）

**替代方案**: Electron + React

**理由**: Tauri 包体更小（~10MB vs ~150MB）、系统集成更自然、安全模型更好。虽然 openclaw-desktop 用了 Electron，但我们需要 macOS + Windows 双平台且追求更轻量的方案。

### 2. Runtime 内置策略：Sidecar Binary + Resources

**选择**: Node.js 二进制放在 `src-tauri/binaries/`（Tauri sidecar），OpenClaw runtime 放在 `src-tauri/resources/`

**替代方案**: 直接用 Rust 重写 OpenClaw 核心逻辑

**理由**: OpenClaw 是成熟的 Node.js 生态项目，重写成本极高且无必要。Tauri 原生支持 sidecar binary 和 resource 目录，能直接调用内置 Node 执行 OpenClaw。

### 3. 进程管理：Tauri Command + Rust 侧 Child Process

**选择**: 通过 Tauri command 在 Rust 侧 spawn 子进程，管理 PID、stdout/stderr 流

**替代方案**: 前端通过 shell-open 直接调用

**理由**: Rust 侧管理进程更可靠，能实现优雅停止（SIGTERM → SIGKILL）、进程监控、日志采集。Tauri 的 shell plugin 提供了 sidecar 管理能力。

### 4. 用户数据目录：平台标准目录

**选择**: macOS `~/Library/Application Support/OpenClawDesktop/`，Windows `%AppData%\OpenClawDesktop\`

**替代方案**: 应用目录内存储

**理由**: 遵循平台规范，应用升级不丢失用户数据，Tauri 的 `app_data_dir()` API 原生支持。

### 5. 飞书插件预装：资源目录预置 + 首次启动复制

**选择**: 构建时将插件放入 `resources/openclaw-runtime/node_modules/`，首次启动时复制到用户扩展目录

**替代方案**: 仅放在应用内 node_modules

**理由**: 双重保障——如果 OpenClaw 能从 node_modules 发现插件则直接使用，否则从用户扩展目录加载。需要 PoC 验证 OpenClaw 的插件发现机制。

### 6. 前端路由与页面结构

**选择**: React Router，侧边栏导航，页面结构参考 crawbot

**页面列表**: Setup Wizard（条件路由）→ Dashboard / Workspace / Skills / Automation / Settings / Logs / Diagnostics / Updates

**理由**: crawbot 已验证 workspace 型桌面应用的信息架构，避免做成纯 launcher。

### 7. 构建流水线：多阶段脚本

**选择**: npm scripts 编排，分步执行 download-node → prepare-runtime → prepare-plugin → tauri build

**理由**: 参考 openclaw-desktop 的构建拆分，保持可调试性和可重复性。

### 8. 环境隔离：启动脚本显式清理

**选择**: start-openclaw.js 启动时显式删除代理变量（HTTP_PROXY 等），构造最小环境变量集

**理由**: 解决实际遇到的代理环境污染问题（127.0.0.1:7897），确保 gateway 在干净环境中运行。

## Risks / Trade-offs

- **[Node binary 体积]** 每个平台的 Node 二进制约 50-80MB → 使用 Node.js 精简版本，仅保留必要功能；接受包体增大换取环境独立性
- **[OpenClaw CLI 入口变化]** npm 包升级后 CLI 入口可能变化 → 固定 OpenClaw 版本，构建时验证入口存在
- **[插件发现机制未确认]** OpenClaw 对插件的扫描规则不明确 → PoC 第 2 步专门验证，必要时复制到用户扩展目录
- **[代理环境污染]** macOS LaunchAgent 或终端代理变量可能影响运行 → 启动脚本显式清理所有代理变量
- **[macOS 签名与公证]** 未签名应用被 Gatekeeper 拦截 → PoC 阶段暂不处理，正式分发前补充
- **[Windows SmartScreen 警告]** 未签名安装包触发警告 → 分发前加代码签名
- **[Tauri sidecar 跨平台差异]** macOS 和 Windows 的进程管理、信号处理不同 → 抽象进程管理层，分平台实现停止逻辑
