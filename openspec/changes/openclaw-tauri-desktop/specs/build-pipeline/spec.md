## ADDED Requirements

### Requirement: Node runtime 下载
构建流水线 SHALL 提供脚本自动下载指定版本的 Node.js 二进制文件（darwin-aarch64、darwin-x64、win-x64）。

#### Scenario: 下载 Node 二进制
- **WHEN** 执行 `npm run download-node`
- **THEN** 下载指定版本 Node 二进制到 `src-tauri/binaries/`，按 Tauri sidecar 命名规范重命名

### Requirement: Runtime 准备
构建流水线 SHALL 提供脚本安装固定版本的 OpenClaw npm 包到 `resources/openclaw-runtime/`。

#### Scenario: 准备 runtime
- **WHEN** 执行 `npm run prepare-runtime`
- **THEN** 在 `src-tauri/resources/openclaw-runtime/` 中生成包含完整依赖的 node_modules

### Requirement: 插件准备
构建流水线 SHALL 提供脚本将飞书插件安装到 runtime 的 node_modules 中。

#### Scenario: 准备插件
- **WHEN** 执行 `npm run prepare-plugin`
- **THEN** 飞书插件存在于 `resources/openclaw-runtime/node_modules/feishu-openclaw-plugin/`

### Requirement: macOS 打包
构建流水线 SHALL 支持生成 macOS 安装包（.app 和 .dmg）。

#### Scenario: macOS 打包
- **WHEN** 在 macOS 上执行 `npm run package:mac`
- **THEN** 生成可分发的 .app 和 .dmg 文件

### Requirement: Windows 打包
构建流水线 SHALL 支持生成 Windows 安装包（.msi 或 .exe）。

#### Scenario: Windows 打包
- **WHEN** 在 Windows 上执行 `npm run package:win`
- **THEN** 生成可分发的 .msi 安装包

### Requirement: 构建时验证
构建流水线 SHALL 在打包前验证 runtime 完整性（Node 二进制存在、OpenClaw 入口可用、插件就绪）。

#### Scenario: 构建验证失败
- **WHEN** 打包前 OpenClaw 入口文件不存在
- **THEN** 构建报错并提示具体缺失项
