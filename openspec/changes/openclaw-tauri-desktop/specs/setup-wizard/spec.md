## ADDED Requirements

### Requirement: 首次启动进入安装向导
应用 SHALL 在首次启动时（未完成初始配置）自动进入安装向导，而不是直接显示主界面。

#### Scenario: 全新安装首次打开
- **WHEN** 用户首次安装并打开应用
- **THEN** 应用显示安装向导而非 Dashboard

#### Scenario: 已完成配置后启动
- **WHEN** 用户已完成安装向导且配置文件存在
- **THEN** 应用直接进入 Dashboard

### Requirement: 欢迎步骤
向导第一步 SHALL 展示欢迎信息，介绍应用功能和接下来的配置流程。

#### Scenario: 显示欢迎页
- **WHEN** 用户进入安装向导
- **THEN** 显示欢迎信息和"下一步"按钮

### Requirement: 运行环境检查步骤
向导第二步 SHALL 检查内置 runtime 完整性（Node 二进制、OpenClaw 包、飞书插件）。

#### Scenario: 环境检查通过
- **WHEN** 所有内置资源完整
- **THEN** 显示全部检查项为通过状态，允许进入下一步

#### Scenario: 环境检查失败
- **WHEN** 某个内置资源缺失或损坏
- **THEN** 显示具体失败项和修复建议

### Requirement: Provider/Gateway 配置步骤
向导第三步 SHALL 收集 OpenClaw 运行所需的核心配置（Provider 密钥、Gateway 端口等）。

#### Scenario: 填写配置
- **WHEN** 用户填写完 Provider 和 Gateway 配置
- **THEN** 配置保存到用户数据目录的 `config/gateway-config.json`

### Requirement: 飞书集成配置步骤
向导第四步 SHALL 收集飞书集成所需的配置信息。

#### Scenario: 填写飞书配置
- **WHEN** 用户填写完飞书相关配置
- **THEN** 配置保存并标记安装向导完成

#### Scenario: 跳过飞书配置
- **WHEN** 用户选择跳过飞书配置
- **THEN** 向导完成，飞书功能标记为未配置
