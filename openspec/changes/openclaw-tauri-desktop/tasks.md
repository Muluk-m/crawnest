## 1. 项目初始化

- [x] 1.1 使用 `create-tauri-app` 初始化 Tauri v2 + React + TypeScript 项目到 `openclaw-desktop/` 目录
- [x] 1.2 配置 `tauri.conf.json`：应用名称、identifier、窗口尺寸、capabilities
- [x] 1.3 安装前端依赖：React Router、Tailwind CSS（或选定 UI 框架）、状态管理库
- [x] 1.4 搭建前端目录结构：`src/app/`、`src/pages/`、`src/components/`、`src/hooks/`、`src/lib/`
- [x] 1.5 配置前端路由：Dashboard、Settings、Workspace、Skills、Automation、Logs、Diagnostics、Updates、SetupWizard

## 2. 内置 Runtime 准备

- [x] 2.1 编写 `scripts/download-node.js`：下载指定版本 Node.js 二进制（darwin-aarch64、darwin-x64、win-x64）到 `src-tauri/binaries/`
- [x] 2.2 按 Tauri sidecar 命名规范重命名 Node 二进制文件
- [x] 2.3 编写 `scripts/prepare-runtime.js`：在 `src-tauri/resources/openclaw-runtime/` 中安装固定版本 OpenClaw npm 包
- [x] 2.4 编写 `scripts/prepare-plugin.js`：将飞书插件安装到 runtime 的 node_modules 中
- [x] 2.5 创建默认配置模板 `src-tauri/resources/templates/config.default.json`
- [x] 2.6 编写 `src-tauri/resources/scripts/start-openclaw.js`：清理代理变量、指定配置路径、启动 gateway run
- [x] 2.7 编写 `src-tauri/resources/scripts/bootstrap-runtime.js`：首次运行初始化用户目录、复制配置和插件
- [x] 2.8 编写 `src-tauri/resources/scripts/healthcheck.js`：检查服务可用性
- [x] 2.9 在 `package.json` 中配置构建脚本：`download-node`、`prepare-runtime`、`prepare-plugin`

## 3. PoC 验证：本地内置 Runtime 运行

- [x] 3.1 在本地目录中验证内置 Node + 本地 node_modules 能运行 `openclaw gateway run`
- [x] 3.2 验证飞书插件能通过 node_modules 或用户扩展目录被 OpenClaw 发现和加载
- [x] 3.3 验证代理变量清理后 gateway 能正常启动

## 4. Rust 后端：进程管理

- [x] 4.1 实现 Tauri command `start_gateway`：获取平台 Node 路径、构造干净环境变量、spawn 子进程、记录 PID
- [x] 4.2 实现 stdout/stderr 流采集，通过 Tauri event 实时转发到前端
- [x] 4.3 实现 Tauri command `stop_gateway`：macOS SIGTERM→SIGKILL、Windows 正常终止→强制终止
- [x] 4.4 实现进程状态监控：子进程退出时发送事件通知前端
- [x] 4.5 实现 Tauri command `restart_gateway`：先停止再启动
- [x] 4.6 实现 Tauri command `get_gateway_status`：返回当前进程状态

## 5. Rust 后端：用户数据管理

- [x] 5.1 实现用户数据目录初始化：创建 config/、extensions/、logs/、state/ 子目录
- [x] 5.2 实现默认配置模板复制逻辑
- [x] 5.3 实现飞书插件首次复制到用户扩展目录
- [x] 5.4 实现运行状态持久化（state/runtime.json）
- [x] 5.5 实现 Tauri command 供前端读写配置文件
- [x] 5.6 实现数据目录自恢复检测（目录缺失时重新初始化）

## 6. 前端：Setup Wizard

- [x] 6.1 实现向导框架组件（步骤指示器、上一步/下一步导航）
- [x] 6.2 实现 Step 1 - 欢迎页
- [x] 6.3 实现 Step 2 - 运行环境检查页（调用后端检查 runtime 完整性）
- [x] 6.4 实现 Step 3 - Provider/Gateway 配置页（表单输入、配置保存）
- [x] 6.5 实现 Step 4 - 飞书集成配置页（含跳过选项）
- [x] 6.6 实现首次启动条件路由（未配置→向导，已配置→Dashboard）

## 7. 前端：Dashboard

- [x] 7.1 实现服务状态展示组件（未启动/启动中/运行中/启动失败）
- [x] 7.2 实现启动/停止/重启按钮组件，调用后端 Tauri commands
- [x] 7.3 实现最近错误展示组件
- [x] 7.4 实现快捷入口卡片（Logs、Settings、Skills、Automation）
- [x] 7.5 实现最近活动展示组件

## 8. 前端：侧边栏与布局

- [x] 8.1 实现应用主布局（侧边栏 + 内容区）
- [x] 8.2 实现侧边栏导航组件（Dashboard、Workspace、Skills、Automation、Settings、Logs、Diagnostics、Updates）
- [x] 8.3 实现系统托盘图标和菜单

## 9. 前端：Settings 页

- [x] 9.1 实现 OpenClaw 配置编辑表单（Provider、Gateway 端口等）
- [x] 9.2 实现飞书配置编辑表单
- [x] 9.3 实现开机启动开关（调用后端注册/注销系统启动项）
- [x] 9.4 实现运行环境路径信息展示

## 10. 前端：Workspace/Chat 占位页

- [x] 10.1 实现 Workspace 页面骨架（gateway 状态、空白工作区、常用动作入口）
- [x] 10.2 实现最近运行记录列表（含空状态）

## 11. 前端：Skills 页

- [x] 11.1 实现已安装技能列表组件
- [x] 11.2 实现打开本地技能目录功能
- [x] 11.3 实现技能刷新与重载功能
- [x] 11.4 实现技能错误状态展示

## 12. 前端：Automation 页

- [x] 12.1 实现任务列表占位页面
- [x] 12.2 实现手动执行入口
- [x] 12.3 预留 cron 调度 UI 结构

## 13. 前端：Logs 页

- [x] 13.1 实现实时日志展示组件（订阅 Tauri event）
- [x] 13.2 实现 stderr 错误高亮
- [x] 13.3 实现日志复制到剪贴板
- [x] 13.4 实现错误日志筛选

## 14. 前端：Diagnostics 页

- [x] 14.1 实现 Runtime 信息检查展示（Node 路径/版本、OpenClaw 版本、插件状态）
- [x] 14.2 实现配置目录状态检查
- [x] 14.3 实现代理环境检查
- [x] 14.4 实现最近启动失败原因展示
- [x] 14.5 实现修复操作入口（重置配置等）

## 15. 前端：Updates 页

- [x] 15.1 实现版本信息展示
- [x] 15.2 实现检查更新功能
- [x] 15.3 实现手动更新指引展示
- [x] 15.4 实现 runtime 修复操作

## 16. 开机自启

- [x] 16.1 实现 macOS 开机启动注册/注销（Tauri autostart 插件或原生实现）
- [x] 16.2 实现 Windows 开机启动注册/注销
- [x] 16.3 实现开机启动后自动启动 gateway 的配置选项

## 17. 构建与打包

- [x] 17.1 编写构建前验证脚本：检查 Node 二进制、OpenClaw 入口、插件就绪
- [x] 17.2 配置 macOS 打包（.app + .dmg）
- [x] 17.3 配置 Windows 打包（.msi）
- [x] 17.4 编写完整构建流程文档
- [x] 17.5 测试 macOS 安装包的完整安装→配置→运行流程
- [ ] 17.6 测试 Windows 安装包的完整安装→配置→运行流程
