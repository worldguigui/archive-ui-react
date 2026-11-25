# 导航系统专项设计

> 状态：草案。覆盖 Tabs、Breadcrumb、Pagination、Menu、NavigationMenu、Steps。

## 1. 模式选择

| 组件 | 导航性质 | 主要用途 | 状态模型 |
| --- | --- | --- | --- |
| Tabs | 同页视图切换 | 内容分区、设置页 | `value/defaultValue/onValueChange` |
| Breadcrumb | 层级路径 | 当前位置与上级导航 | 无状态；`items` 数据 |
| Pagination | 数据分页 | 列表/表格翻页 | `page/defaultPage/onPageChange` |
| Menu | 应用内命令/导航列表 | 侧栏、工具栏、命令面板 | `selectedId/defaultSelectedId/onSelect` |
| NavigationMenu | 站点级导航 | 顶栏、分区入口与浮层 | `value/defaultValue/onValueChange`（当前打开项） |
| Steps | 流程进度 | 向导、审批流 | `current` 受控 |

四条边界：

1. **Tabs 不是导航。** Tabs 不改变 URL，不承担站点层级；需要 URL 同步时由调用方处理。
2. **Menu 与 DropdownMenu 不是同一件事。** Menu 是常驻可见的命令/导航列表；DropdownMenu 是浮层菜单。二者可共享内部菜单键盘逻辑，但公共 API 不互相包装。
3. **Menu 与 NavigationMenu 不同。** Menu 是纵深型命令列表（可选中、可分组）；NavigationMenu 是站点顶层的横向入口，带浮层面板，通常由 URL 驱动。
4. **Steps 是流程进度，不是导航。** 只有在 `clickable` 时才允许点击跳转，且不自动改变 `current`。

## 2. URL 与路由

- 所有导航组件都**不**内置路由库依赖，也不读写 `window.location`。
- Breadcrumb / NavigationMenu 的 `href` 使用原生 `<a>`；调用方通过 `onSelect` 或自定义 `renderLink` 接入路由（V1 不提供 renderLink，使用 `onClick` + `preventDefault`，见各组件文档）。
- Tabs / Steps / Pagination 只发出状态回调；是否同步 URL 由调用方决定。
- 刷新与深链恢复：调用方根据路由设置受控值；组件不持久化状态。

## 3. 受控与非受控

| 组件 | 受控 | 非受控 | 回调 |
| --- | --- | --- | --- |
| Tabs | `value` | `defaultValue` | `onValueChange(value)` |
| Pagination | `page` | `defaultPage` | `onPageChange(page)` |
| Menu | `selectedId` | `defaultSelectedId` | `onSelect(item)` |
| NavigationMenu | `value`（打开项） | `defaultValue` | `onValueChange(value \| null)` |
| Steps | `current`（必填） | — | `onStepClick`（仅 clickable） |
| Breadcrumb | 无 | 无 | 通过链接 `onClick` |

- Tabs 的 `value` 与 Trigger 的 `value` 必须匹配；不匹配时不渲染任何面板，开发环境警告。
- Pagination 的页码从 1 开始，超出范围时组件钳制显示；是否把钳制后的页码回调给调用方见组件文档。
- Menu / NavigationMenu 的选中/打开是两件事；不要用 `selectedId` 表示浮层打开。

## 4. 键盘与焦点

| 组件 | 键盘模型 |
| --- | --- |
| Tabs | 左右/上下方向键；Home/End；自动激活或手动激活由 `activationMode` 控制 |
| Menu | 上下方向键；Home/End；Enter/Space 激活；typeahead |
| NavigationMenu | 左右方向键切换顶层；Enter/Space/↓ 打开浮层；Escape 关闭；Tab 离开 |
| Pagination | 原生按钮 Tab 顺序；不实现方向键网格（页码不是菜单） |
| Steps | 非交互步骤不可聚焦；clickable 时每个步骤是按钮，Tab 顺序 |
| Breadcrumb | 原生链接 Tab 顺序；分隔符不可聚焦 |

- 方向键导航使用 roving tabindex；同一时刻只有一个可 Tab 聚焦项。
- 焦点环必须可见；不要用 `outline: none` 且无替代。
- 导航项的文字必须能表达目标；仅有图标的入口必须有可访问名称。

## 5. 溢出与响应式

- V1 不提供响应式 props 或内置折叠策略；不引入断点 Token。
- Tabs 溢出：横向滚动或调用方改用 Select；组件不自动生成“更多”菜单。
- NavigationMenu 溢出：调用方负责减少项或切换为移动端抽屉；组件不自动折叠。
- Breadcrumb 超长：默认换行/截断由调用方通过 className 控制；V1 不内置折叠逻辑（折叠需要浮层菜单，且会引入额外语义）。
- Pagination 页码数量由 `siblingCount` / `boundaryCount` 控制，窄屏可减小；不内置媒体查询。
- 所有横向滚动容器必须有可见焦点与键盘可达性。

## 6. 视觉映射

- 导航区属于中密度区域：允许 plain 材质与一级母题，装饰克制。
- 激活项使用古金文字或锈橙标记 + 结构线位置变化；不能只靠颜色。
- 分隔符与连接线使用结构线 Token；不要所有线同粗同色。
- Steps 的编号使用 numeric 字体并等宽对齐；完成态可使用内部图标（check），当前态用 gold，错误态需 danger Token。
- Pagination 当前页用 `aria-current="page"` 与边框/底色双重表达。

## 7. 组件边界细化

### 7.1 Tabs vs Accordion

- Tabs 是同级视图的互斥切换；Accordion 是内容的可折叠展开，允许多项同时展开。
- 移动端把 Tabs 改成 Accordion 属于调用方布局决策，组件不自动转换。

### 7.2 Menu vs List

- List 是展示型列表，不承担焦点管理、选中语义或命令执行。
- Menu 是交互型命令列表，必须实现菜单键盘模型与选中反馈。
- 需要“可点击但无菜单语义”的列表行，使用 List 的链接项或 Table 行，不使用 Menu。

### 7.3 Breadcrumb vs Steps

- Breadcrumb 表示空间层级（你在哪里）；Steps 表示流程进度（进行到哪一步）。
- 不要把 Steps 当成面包屑使用，即使视觉上都是水平序列。

## 8. 无障碍要求

- Tabs：`role="tablist"` / `tab` / `tabpanel`；`aria-selected`、`aria-controls`、`aria-labelledby`；面板需可聚焦或包含可聚焦内容。
- Breadcrumb：`<nav aria-label>` + `<ol>`；当前页 `aria-current="page"`；分隔符 `aria-hidden`。
- Pagination：`<nav aria-label>`；当前页 `aria-current="page"`；上一页/下一页有文本名称，不只图标。
- Menu：`role="menu"` 与 `menuitem`；若为纯站点导航应改用 NavigationMenu。
- NavigationMenu：`<nav>` + 列表语义；浮层触发器使用 `aria-expanded` / `aria-controls`。
- Steps：`<ol>`；当前步骤 `aria-current="step"`；完成/错误状态有文本或可访问名称。

## 9. 测试重点

- 受控/非受控状态；非法 value 的降级。
- 键盘完整路径、roving tabindex、焦点可见。
- 分页边界：第 1 页/最后一页/总数为 0/页码越界。
- 链接与按钮语义不混用；`aria-current` 正确。
- 浮层导航的打开/关闭/焦点返回（NavigationMenu）。
