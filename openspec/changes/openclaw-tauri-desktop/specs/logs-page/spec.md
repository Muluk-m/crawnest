## ADDED Requirements

### Requirement: 实时日志展示
Logs 页 SHALL 实时显示 OpenClaw gateway 的 stdout 和 stderr 输出。

#### Scenario: 实时查看日志
- **WHEN** gateway 运行中且用户打开 Logs 页
- **THEN** 页面实时滚动显示最新日志输出

#### Scenario: gateway 未运行
- **WHEN** gateway 未运行且用户打开 Logs 页
- **THEN** 显示最近一次运行的历史日志（如有）

### Requirement: 错误高亮
Logs 页 SHALL 对 stderr 输出和错误信息进行视觉区分。

#### Scenario: 错误日志高亮
- **WHEN** gateway 输出 stderr 内容
- **THEN** 该行日志以红色或警告色显示

### Requirement: 日志复制
Logs 页 SHALL 支持复制日志内容到剪贴板。

#### Scenario: 复制日志
- **WHEN** 用户点击"复制日志"按钮
- **THEN** 当前显示的日志内容复制到系统剪贴板

### Requirement: 查看最近错误
Logs 页 SHALL 提供快速筛选查看最近错误的功能。

#### Scenario: 筛选错误日志
- **WHEN** 用户点击"仅显示错误"筛选
- **THEN** 仅显示 stderr 和错误级别的日志
