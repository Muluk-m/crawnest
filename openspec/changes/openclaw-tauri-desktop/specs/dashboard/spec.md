## ADDED Requirements

### Requirement: 服务状态展示
Dashboard SHALL 展示 OpenClaw gateway 的当前运行状态：未启动、启动中、运行中、启动失败。

#### Scenario: 显示运行中状态
- **WHEN** OpenClaw gateway 进程正在运行
- **THEN** Dashboard 显示"运行中"状态指示

#### Scenario: 显示启动失败
- **WHEN** gateway 启动失败
- **THEN** Dashboard 显示"启动失败"状态及最近一条错误信息

### Requirement: 服务控制按钮
Dashboard SHALL 提供启动、停止、重启三个操作按钮。

#### Scenario: 点击启动
- **WHEN** 服务未运行且用户点击启动按钮
- **THEN** 触发 OpenClaw gateway 启动流程，状态变为"启动中"

#### Scenario: 点击停止
- **WHEN** 服务运行中且用户点击停止按钮
- **THEN** 触发优雅停止流程，状态更新

#### Scenario: 点击重启
- **WHEN** 用户点击重启按钮
- **THEN** 先停止再启动服务

### Requirement: 快捷入口
Dashboard SHALL 提供快捷入口跳转到日志、Settings、Skills、Automation 页面。

#### Scenario: 点击查看日志
- **WHEN** 用户点击"查看日志"入口
- **THEN** 跳转到 Logs 页面

### Requirement: 最近活动展示
Dashboard SHALL 展示最近一次任务或会话的简要信息。

#### Scenario: 有最近活动
- **WHEN** 存在最近的运行记录
- **THEN** Dashboard 显示最近活动摘要
