## Why

OpenClaw 当前以命令行工具交付，最终用户必须自行处理 Node.js 安装、npm 全局权限、bash/PowerShell 差异、飞书插件安装、代理环境污染和后台启动等问题。这导致部署门槛高、环境问题频发、跨平台体验不一致。需要将运行环境应用化，彻底从用户机器的开发环境中解耦，让用户只需安装一个桌面应用即可完成配置和运行。

## What Changes

- 新建 Tauri + React 桌面应用项目，内置 Node runtime、OpenClaw npm 包和飞书插件
- 实现 Setup Wizard（四步引导：欢迎、环境检查、Provider/Gateway 配置、飞书集成）
- 实现 Dashboard 首页（服务状态、启动/停止/重启、快捷入口）
- 实现 Settings 配置页（OpenClaw 配置、飞书配置、开机启动开关）
- 实现 Workspace/Chat 占位页（预留工作区入口）
- 实现 Skills 管理页（已安装技能列表、本地目录入口）
- 实现 Automation 页（任务列表占位、手动执行入口）
- 实现 Logs 日志页（实时 stdout/stderr、错误查看、日志复制）
- 实现 Diagnostics 诊断页（Runtime 路径、版本、插件状态、代理检查）
- 实现 Updates 更新页（版本信息、检查更新、修复入口）
- 实现 Rust 后端进程管理（启动/停止/监控 OpenClaw gateway）
- 实现用户数据目录初始化与配置管理
- 实现构建流水线（下载 Node、准备 runtime、打包 macOS/Windows）

## Capabilities

### New Capabilities

- `bundled-runtime`: 内置 Node.js runtime 和 OpenClaw npm 包，不依赖用户系统环境
- `plugin-preinstall`: 飞书插件离线预装，无需用户手动 npm install
- `setup-wizard`: 四步首次安装向导（欢迎、环境检查、配置、飞书集成）
- `dashboard`: 主控面板，展示服务状态并提供启停控制
- `process-management`: Tauri Rust 侧进程管理，启动/停止/监控 OpenClaw gateway 进程
- `user-data-management`: 用户数据目录初始化、配置管理、状态持久化
- `settings-page`: 配置管理页面（OpenClaw 配置、飞书配置、开机启动）
- `workspace-page`: 工作区/Chat 占位页面，预留产品扩展入口
- `skills-page`: 技能管理页面（列表、目录入口、刷新重载）
- `automation-page`: 自动化任务页面（任务列表占位、手动执行）
- `logs-page`: 实时日志查看页面
- `diagnostics-page`: 运行环境诊断页面
- `updates-page`: 版本管理与更新页面
- `build-pipeline`: 跨平台构建流水线（Node 下载、runtime 准备、macOS/Windows 打包）
- `auto-start`: 开机自启管理（macOS/Windows）

### Modified Capabilities

（无现有 capabilities 需要修改）

## Impact

- **新增项目**: 创建 `openclaw-desktop/` 项目目录，包含 Tauri Rust 后端和 React 前端
- **依赖**: Tauri v2、React、Node.js 二进制（darwin-aarch64/x64, win-x64）、OpenClaw npm 包、飞书插件包
- **平台**: macOS（.app/.dmg）和 Windows（.msi/.exe）双平台支持
- **构建系统**: 需要新的构建脚本处理 Node 下载、runtime 准备和跨平台打包
- **用户数据**: macOS `~/Library/Application Support/OpenClawDesktop/`，Windows `%AppData%\OpenClawDesktop\`
