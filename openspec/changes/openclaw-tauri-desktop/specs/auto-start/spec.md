## ADDED Requirements

### Requirement: macOS 开机自启
应用 SHALL 支持在 macOS 上通过应用内逻辑注册/注销开机启动项。

#### Scenario: macOS 启用开机启动
- **WHEN** 用户在 Settings 中打开开机启动开关（macOS）
- **THEN** 应用注册为系统登录项，下次开机自动启动

#### Scenario: macOS 禁用开机启动
- **WHEN** 用户在 Settings 中关闭开机启动开关
- **THEN** 取消系统登录项注册

### Requirement: Windows 开机自启
应用 SHALL 支持在 Windows 上通过应用内逻辑注册/注销开机启动项。

#### Scenario: Windows 启用开机启动
- **WHEN** 用户在 Settings 中打开开机启动开关（Windows）
- **THEN** 应用写入注册表启动项或使用 Tauri autostart 插件

#### Scenario: Windows 禁用开机启动
- **WHEN** 用户关闭开机启动开关
- **THEN** 移除注册表启动项

### Requirement: 开机启动目标为 GUI 应用
开机自启 SHALL 启动 GUI 应用本身（或其后台模式），而不是直接启动 OpenClaw 命令。

#### Scenario: 开机自启后行为
- **WHEN** 系统开机后应用自动启动
- **THEN** GUI 应用启动并根据用户配置决定是否自动启动 gateway 服务
