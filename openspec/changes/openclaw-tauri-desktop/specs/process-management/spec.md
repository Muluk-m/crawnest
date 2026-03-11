## ADDED Requirements

### Requirement: 启动 OpenClaw gateway 进程
应用 SHALL 通过 Tauri Rust 侧 spawn 子进程的方式启动 OpenClaw gateway，使用内置 Node 执行启动脚本。

#### Scenario: 成功启动
- **WHEN** GUI 发起启动请求
- **THEN** Rust 侧使用内置 Node 二进制执行 start-openclaw.js，记录进程 PID，开始采集 stdout/stderr

#### Scenario: 启动失败
- **WHEN** 启动脚本执行失败（端口占用、配置错误等）
- **THEN** 捕获错误信息并通过事件通知前端

### Requirement: 停止 OpenClaw gateway 进程
应用 SHALL 支持优雅停止进程：先发送终止信号，超时后强制终止。

#### Scenario: macOS 优雅停止
- **WHEN** 在 macOS 上请求停止服务
- **THEN** 先发送 SIGTERM，等待 5 秒，若进程仍在则发送 SIGKILL

#### Scenario: Windows 停止
- **WHEN** 在 Windows 上请求停止服务
- **THEN** 先尝试正常终止，失败后强制终止进程树

### Requirement: 进程状态监控
应用 SHALL 持续监控 gateway 进程状态，进程意外退出时通知前端。

#### Scenario: 进程意外退出
- **WHEN** gateway 进程非用户操作退出
- **THEN** 前端收到进程退出事件，Dashboard 状态更新为"已停止"

### Requirement: stdout/stderr 流采集
应用 SHALL 实时采集 gateway 进程的 stdout 和 stderr 输出，通过 Tauri 事件转发给前端。

#### Scenario: 日志实时转发
- **WHEN** gateway 进程输出日志
- **THEN** 前端在 500ms 内收到日志内容
