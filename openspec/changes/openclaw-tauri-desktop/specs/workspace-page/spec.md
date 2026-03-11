## ADDED Requirements

### Requirement: 工作区页面入口
应用 SHALL 提供 Workspace/Chat 页面作为一级导航入口，首版为占位实现。

#### Scenario: 访问工作区页面
- **WHEN** 用户点击侧边栏 Workspace 入口
- **THEN** 显示工作区页面，包含 gateway 状态、空白工作区占位和常用动作入口

### Requirement: Gateway 状态展示
Workspace 页 SHALL 展示当前 gateway 运行状态。

#### Scenario: 工作区显示状态
- **WHEN** 用户进入 Workspace 页且 gateway 运行中
- **THEN** 页面顶部显示 gateway 运行状态

### Requirement: 最近运行记录
Workspace 页 SHALL 展示最近的运行记录列表（首版可为空状态占位）。

#### Scenario: 无运行记录
- **WHEN** 尚无任何运行记录
- **THEN** 显示空状态提示
