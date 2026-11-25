# 浮层与交互系统专项设计

> 状态：草案。覆盖 Tooltip、Popover、DropdownMenu、ContextMenu、Dialog、AlertDialog、Select、DatePicker、NavigationMenu 浮层与 Toast。
> 实现依赖尚未立项；本文件只定义接口与行为契约。

## 1. 结论先行

1. 所有浮层共享**一套内部浮层基础设施**，不各自实现定位、Portal、外部点击与焦点。
2. 现阶段不引入第三方 Headless Primitive；但**完整实现前必须做一次依赖决策**。推荐优先评估 `@floating-ui/react`（仅定位与 dismiss）或 Radix Primitives 的对应模块；生产依赖需维护者批准。
3. Tooltip、Popover、DropdownMenu、ContextMenu、Select、DatePicker 共用定位与层叠能力，但**语义与键盘模型各自独立**，不能互相替代。
4. 浮层状态统一使用 `open` / `defaultOpen` / `onOpenChange`；受控时不自行关闭。
5. Portal 默认挂载到 `document.body`；通过 `portalContainer` 支持 Shadow DOM / iframe / 测试容器；SSR 首次渲染不挂载 Portal。
6. z-index、遮罩、动效时长目前没有完整 Token；在补齐前不得硬编码分散的层级数字。

## 2. 内部基础设施（非公开 API）

| 能力 | 职责 | 是否公开 |
| --- | --- | --- |
| `OverlayPortal` | 延迟挂载、容器选择、SSR 安全 | 否 |
| `OverlayPositioner` | 锚点测量、placement、flip/shift、箭头偏移 | 否 |
| `DismissableLayer` | Escape、外部 pointerdown、焦点离开（可选） | 否 |
| `FocusScope` | 模态焦点陷阱、初始焦点、焦点恢复 | 否 |
| `LayerStack` | 嵌套浮层层级、顶层判定、滚动锁计数 | 否 |
| `Presence` | 退出动画期间保持挂载 | 否 |
| `RovingFocus` | Tabs / Menu / Tree / RadioGroup 的方向键与 tabindex | 否 |
| `Typeahead` | Select / Menu / Tree 的字符搜索 | 否 |

公共组件只使用这些能力的公开 Props，不暴露其内部实现。内部基础设施没有独立 npm 子路径。

## 3. 组件矩阵

| 组件 | 模态 | 焦点 | 打开方式 | 关闭方式 | 特有语义 |
| --- | --- | --- | --- | --- | --- |
| Tooltip | 否 | 不移动焦点 | hover / focus | 离开、Escape、失焦 | `role="tooltip"`，内容不可交互 |
| Popover | 默认非模态 | 可选进入 | 触发元素点击 | Escape、外部点击、受控 | 任意内容容器，非对话框 |
| DropdownMenu | 否 | roving focus | 触发元素点击/键盘 | 选择、Escape、外部点击 | `role="menu"`，菜单键盘模型 |
| ContextMenu | 否 | roving focus | 右键 / Shift+F10 / 长按 | 选择、Escape、外部点击 | 以指针位置定位，无固定 trigger |
| Dialog | 是 | 焦点陷阱 | 受控 / defaultOpen | 关闭按钮、Escape、遮罩点击（可配） | `role="dialog"`，模态 |
| AlertDialog | 是 | 焦点陷阱 | 受控 / defaultOpen | 确认/取消；默认不响应 Escape/外部点击 | `role="alertdialog"`，必须明确选择 |
| Select | 否 | 列表 roving focus | 触发按钮 | 选择、Escape、外部点击 | 单选 listbox，表单控件 |
| DatePicker | 否 | 日历网格 roving focus | 触发输入/按钮 | 选择日期、Escape、外部点击 | 日期网格，表单控件 |
| NavigationMenu 浮层 | 否 | 有限 | hover / focus / 点击 | 离开、Escape、外部点击 | 站点导航，非命令菜单 |
| Toast | — | 不抢焦点 | 命令式 show | 计时、手动关闭 | live region，独立队列 |

## 4. 受控与非受控

统一使用 `api-conventions.md` §7：

```ts
interface OverlayStateProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  portalContainer?: HTMLElement | null;
}
```

默认值：`closeOnEscape = true`，`closeOnOutsideClick = true`。

- 受控模式：组件只发出关闭意图；父组件不更新 `open` 时，浮层保持打开。
- AlertDialog：`closeOnEscape` / `closeOnOutsideClick` 默认 `false`；不渲染右上角关闭按钮。
- Tooltip 不使用 `closeOnOutsideClick`；其关闭由 hover/focus 生命周期决定。
- ContextMenu 的受控模式需要同时提供位置；见组件文档。
- 浮层内容在关闭后是否保留 DOM：默认卸载；需要退出动画时由内部 `Presence` 延迟卸载，不公开 `forceMount`。

## 5. Portal 与层叠

1. 默认 `document.body`；`portalContainer` 可传 `null` 表示当前父节点（测试/受限环境），但生产不推荐。
2. 首次客户端挂载后才创建 Portal；服务端渲染不输出浮层内容。
3. 浮层内容必须位于触发元素的层叠上下文之外；触发元素若创建了 `transform`/`filter` 上下文，调用方应使用 `portalContainer` 指定容器。
4. z-index 由内部层级栈分配，不暴露 `zIndex` prop。当前没有 `--au-z-*` Token，实施前需新增。
5. 嵌套浮层：子层高于父层；Escape 只关闭最顶层；外部点击关闭命中的层及其后代，祖先按自身边界独立判断。
6. 模态 Dialog 打开时锁定 body 滚动，使用引用计数，支持多个模态嵌套；Toast 不锁滚动。
7. **NavigationMenu 例外**：V1 的导航浮层采用本地定位，不使用 Portal，以保持 Tab 顺序和 `<nav>` 结构；若页面 `overflow` 裁切，由调用方调整容器。未来若改为 Portal，必须重新验证焦点顺序。

## 6. 焦点管理

### 6.1 Dialog / AlertDialog

- 打开：焦点移入内容容器；默认聚焦第一个可聚焦元素，可通过 `initialFocusRef` 指定。
- 陷阱：Tab / Shift+Tab 在内容内循环；不可聚焦到背景。
- 关闭：焦点返回打开前的 `document.activeElement`；若元素已移除，退回 body。
- AlertDialog：危险操作默认聚焦“取消”；`initialFocus="confirm"` 可覆盖。
- 内容必须至少包含一个可关闭/可操作元素；空对话框不合格。

### 6.2 Popover / menus / Select / DatePicker

- Popover 默认非模态，不强制陷阱；`modal` 为真时启用陷阱与滚动锁。
- 菜单打开后聚焦第一项或当前选中项；关闭后焦点回到触发元素。
- Select / DatePicker 打开后聚焦选中项/当前日期；关闭后回到触发按钮。
- 外部点击导致关闭时，不强制抢回焦点；焦点自然落到点击目标。

### 6.3 Tooltip

- 不进入焦点顺序，不包含链接/按钮等交互内容。
- 由触发元素的 `aria-describedby` 关联；Escape 关闭但不移动焦点。
- 触摸设备不依赖 hover：触发元素获得焦点时展示；不实现长按 Tooltip。

## 7. 关闭策略

| 场景 | 行为 |
| --- | --- |
| Escape | 仅最顶层可关闭浮层响应；`closeOnEscape=false` 时忽略 |
| 外部 pointerdown | 在 `closeOnOutsideClick=true` 时关闭；不是 click，避免拖拽误关 |
| 焦点离开 | Popover 可选；menus / select / datepicker 在焦点彻底离开浮层与触发元素后关闭 |
| 选择菜单项 | 默认选择后关闭整个菜单链；`closeOnSelect=false` 保留打开（用于多选类菜单项） |
| 路由变化 | 组件不监听；调用方在导航时关闭 |
| 窗口 resize / scroll | 重新定位；超出视口时 flip/shift；不自动关闭 |
| 触发元素移除 | 浮层关闭并清理监听 |

异步行为：浮层不等待 Promise 再关闭。确认类操作由调用方控制 `open` 和 `loading`。

## 8. 键盘模型

| 组件 | 键盘 |
| --- | --- |
| Popover | Enter/Space 打开；Escape 关闭；Tab 按非模态顺序离开 |
| DropdownMenu | ↑/↓ 移动；Home/End；Enter/Space 激活；→ 进入子菜单；← 返回；Escape 关闭；typeahead |
| ContextMenu | 同菜单；Shift+F10 / ContextMenu 键打开；打开后自动聚焦第一项 |
| Select | ↑/↓/Home/End；Enter/Space 选择；Escape 关闭；typeahead；字母跳转 |
| DatePicker | 方向键移动日；PageUp/PageDown 换月；Shift+Page 换年；Home/End 周首/周末；Enter 选择；Escape 关闭 |
| Dialog | Escape 关闭（可配）；Tab 陷阱；初始焦点与恢复 |
| AlertDialog | 默认禁止 Escape/外部关闭；Tab 在两个操作间循环 |
| Tooltip | 无打开快捷键；Escape 关闭 |
| NavigationMenu | ←/→ 切换顶层项；Enter/Space/↓ 打开；Escape 关闭；Tab 离开 |

## 9. 视觉与动效

- 浮层表面采用 `plain` 材质等级 0–1 或专用表面；不在浮层里叠加 paper/film 的强纹理，避免正文可读性下降。档案馆藏语境可用 paper 作为 Dialog 可选预设，但 V1 不开放 `material`，待视觉验证。
- 阴影使用 `--au-shadow-deep`；边框 hairline + `--au-color-border-metal`。
- 遮罩使用 `--au-color-overlay`；不使用纯黑不透明遮罩。
- 动效使用 `--au-transition-base`；当前缺少专用 enter/exit 时长 Token，实施前需补齐或只用 base。
- 必须尊重 `prefers-reduced-motion`；关闭位移/缩放，仅保留即时显示。
- 箭头（Tooltip/Popover）是装饰，`aria-hidden`。

## 10. 无障碍要求

- Dialog/AlertDialog 必须有可访问名称；本设计通过必填 `title` 保证，`description` 可选。
- AlertDialog 必须提供至少一个可操作按钮；危险操作需明确动作文本，不使用“是/否”。
- Tooltip 内容不得承载唯一必要信息；触发元素自身必须有名称。
- Menu 使用 `role="menu"` / `menuitem` / `menuitemcheckbox` / `menuitemradio`；普通导航链接使用 NavigationMenu，不使用 role=menu。
- Select 使用 `role="combobox"` + `aria-expanded` + `aria-controls` + `role="listbox"`；触发器不是原生 `<select>`，必须提供隐藏 input 供表单提交。
- DatePicker 的日期网格使用 `role="grid"`；选中日期 `aria-selected`；当前日期与选中日期分别表达。
- Toast 使用 live region：普通消息 `polite`，错误/危险可 `assertive`；同一条消息只播报一次。

## 11. 依赖决策（必须确认）

| 方案 | 优点 | 风险 |
| --- | --- | --- |
| 内部自研 | 零运行时依赖、视觉完全可控 | 定位/flip/嵌套/焦点边界复杂，易产生可访问性缺陷 |
| `@floating-ui/react` | 定位与 dismiss 成熟，体积可控 | 新增生产依赖；需确认版本与许可 |
| Radix Primitives | 完整 a11y 行为 | 依赖多、包体大、视觉需完全重做，API 可能反向影响本设计 |

推荐：**定位与 dismiss 使用 Floating UI；焦点陷阱、菜单键盘、Toast 队列仍由本库实现**。若维护者坚持零依赖，则 M1 只实现 Tooltip 的简化定位，M3 浮层整体延后，不能以“先凑合”的方式交付。

## 12. 测试重点

- 受控/非受控打开关闭；Escape/外部点击；嵌套层级。
- 焦点进入、陷阱循环、关闭后恢复；AlertDialog 默认不关闭。
- Portal 容器、SSR 不崩溃、卸载清理。
- 键盘完整路径与 typeahead；菜单选择后关闭。
- 滚动锁引用计数；reduced motion。
- 移动端触摸：浮层不被键盘遮挡、外部触摸关闭。
