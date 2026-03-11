## ADDED Requirements

### Requirement: 用户数据目录初始化
应用 SHALL 在首次启动时在平台标准目录下创建用户数据目录结构（config/、extensions/、logs/、state/）。

#### Scenario: macOS 首次启动
- **WHEN** 在 macOS 上首次启动且 `~/Library/Application Support/OpenClawDesktop/` 不存在
- **THEN** 创建完整目录结构：config/、extensions/、logs/、state/

#### Scenario: Windows 首次启动
- **WHEN** 在 Windows 上首次启动且 `%AppData%\OpenClawDesktop\` 不存在
- **THEN** 创建完整目录结构

### Requirement: 默认配置模板复制
应用 SHALL 在首次启动时将默认配置模板从应用资源复制到用户配置目录。

#### Scenario: 复制默认配置
- **WHEN** 用户配置目录中不存在 `config/app-config.json`
- **THEN** 从 `resources/templates/config.default.json` 复制并重命名

### Requirement: 用户数据自恢复
应用 SHALL 在用户数据目录被删除后能自动重新初始化。

#### Scenario: 数据目录被删除后重启
- **WHEN** 用户删除整个数据目录后重新启动应用
- **THEN** 应用重新进入安装向导，重建目录结构

### Requirement: 运行状态持久化
应用 SHALL 在 `state/runtime.json` 中持久化运行状态信息（上次启动时间、PID、退出状态等）。

#### Scenario: 记录运行状态
- **WHEN** gateway 进程启动成功
- **THEN** `state/runtime.json` 更新为包含 PID 和启动时间的记录
