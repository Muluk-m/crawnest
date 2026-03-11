## ADDED Requirements

### Requirement: OpenClaw 配置管理
Settings 页 SHALL 提供 OpenClaw 相关配置的编辑界面（Provider 配置、Gateway 端口等）。

#### Scenario: 修改 Gateway 端口
- **WHEN** 用户在 Settings 页修改 Gateway 端口并保存
- **THEN** 配置写入 `config/gateway-config.json`，提示需要重启服务生效

### Requirement: 飞书配置管理
Settings 页 SHALL 提供飞书集成相关配置的编辑界面。

#### Scenario: 更新飞书配置
- **WHEN** 用户修改飞书相关配置并保存
- **THEN** 配置持久化到用户数据目录

### Requirement: 开机启动开关
Settings 页 SHALL 提供开机自启的开关控制。

#### Scenario: 启用开机启动
- **WHEN** 用户打开开机启动开关
- **THEN** 应用注册系统开机启动项

### Requirement: 运行环境信息展示
Settings 页 SHALL 显示日志目录路径和运行环境路径。

#### Scenario: 查看路径信息
- **WHEN** 用户打开 Settings 页
- **THEN** 显示当前日志目录、配置目录、Node runtime 路径
