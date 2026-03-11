## ADDED Requirements

### Requirement: 版本信息展示
Updates 页 SHALL 显示当前应用版本和内置 runtime 版本。

#### Scenario: 查看版本信息
- **WHEN** 用户打开 Updates 页
- **THEN** 显示应用版本号、Node runtime 版本、OpenClaw 版本

### Requirement: 检查更新
Updates 页 SHALL 提供检查更新的功能（首版为手动检查）。

#### Scenario: 检查更新
- **WHEN** 用户点击"检查更新"按钮
- **THEN** 显示当前是否为最新版本

### Requirement: 手动替换指导
Updates 页 SHALL 提供手动替换运行时包的操作指引。

#### Scenario: 查看手动更新指引
- **WHEN** 用户需要手动更新
- **THEN** 显示操作步骤说明

### Requirement: 修复入口
Updates 页 SHALL 提供重新初始化 runtime 的修复操作。

#### Scenario: 修复 runtime
- **WHEN** 用户点击修复按钮
- **THEN** 重新从应用资源复制 runtime 到用户目录
