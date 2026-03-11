## ADDED Requirements

### Requirement: 飞书插件预置于应用资源
应用 SHALL 在构建阶段将飞书 OpenClaw 插件打包到 `resources/openclaw-runtime/node_modules/` 中，用户无需手动执行 `npm install -g`。

#### Scenario: 插件预装完整性
- **WHEN** 应用安装完成后首次启动
- **THEN** 飞书插件已存在于应用资源目录中，可被 OpenClaw 加载

### Requirement: 首次启动插件复制
应用 SHALL 在首次启动时检查用户扩展目录，若飞书插件不存在则从应用资源复制到用户扩展目录。

#### Scenario: 用户扩展目录不存在插件
- **WHEN** 首次启动且用户扩展目录 `extensions/feishu-openclaw-plugin/` 不存在
- **THEN** 应用自动从资源目录复制插件到用户扩展目录并写入插件配置

#### Scenario: 用户扩展目录已有插件
- **WHEN** 启动时用户扩展目录已存在该插件
- **THEN** 应用不覆盖现有插件

### Requirement: 离线可用
插件安装过程 SHALL 不依赖网络连接，所有资源必须在构建阶段预置。

#### Scenario: 无网络环境安装
- **WHEN** 用户在无网络环境中安装并启动应用
- **THEN** 飞书插件仍能正常加载和使用
