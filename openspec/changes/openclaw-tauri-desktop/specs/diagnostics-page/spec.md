## ADDED Requirements

### Requirement: Runtime 信息展示
Diagnostics 页 SHALL 展示 Node runtime 路径、OpenClaw 版本、飞书插件是否存在。

#### Scenario: 查看 runtime 信息
- **WHEN** 用户打开 Diagnostics 页
- **THEN** 显示内置 Node 路径、Node 版本、OpenClaw 版本、飞书插件状态

### Requirement: 配置目录检查
Diagnostics 页 SHALL 显示当前用户配置目录路径和各子目录状态。

#### Scenario: 配置目录完整
- **WHEN** 所有用户数据子目录存在
- **THEN** 每个目录项显示绿色通过状态

### Requirement: 代理环境检查
Diagnostics 页 SHALL 检查并显示当前代理环境变量是否已被清理。

#### Scenario: 代理已清理
- **WHEN** 运行环境中无代理变量
- **THEN** 代理检查项显示"已清理"

#### Scenario: 检测到代理变量
- **WHEN** 运行环境中仍有代理变量残留
- **THEN** 显示警告并提供修复建议

### Requirement: 启动失败原因展示
Diagnostics 页 SHALL 显示最近一次启动失败的原因。

#### Scenario: 查看失败原因
- **WHEN** 最近一次启动失败
- **THEN** 显示失败时间和错误信息

### Requirement: 修复入口
Diagnostics 页 SHALL 提供常见问题的修复操作入口。

#### Scenario: 重置配置
- **WHEN** 用户点击"重置配置"修复操作
- **THEN** 将配置恢复为默认模板并提示重新配置
