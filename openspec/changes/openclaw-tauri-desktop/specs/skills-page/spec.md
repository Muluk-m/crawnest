## ADDED Requirements

### Requirement: 已安装技能列表
Skills 页 SHALL 展示当前已安装的技能列表及其状态。

#### Scenario: 显示技能列表
- **WHEN** 用户进入 Skills 页
- **THEN** 显示所有已安装技能的名称、版本和状态（正常/错误）

### Requirement: 本地技能目录入口
Skills 页 SHALL 提供打开本地技能目录的入口。

#### Scenario: 打开技能目录
- **WHEN** 用户点击"打开技能目录"
- **THEN** 使用系统文件管理器打开本地技能存放目录

### Requirement: 技能刷新与重载
Skills 页 SHALL 提供刷新按钮，重新扫描并加载技能。

#### Scenario: 刷新技能列表
- **WHEN** 用户点击刷新按钮
- **THEN** 重新扫描技能目录并更新列表

### Requirement: 错误状态展示
Skills 页 SHALL 对加载失败的技能显示错误信息。

#### Scenario: 技能加载失败
- **WHEN** 某个技能加载失败
- **THEN** 该技能行显示错误状态和错误信息
