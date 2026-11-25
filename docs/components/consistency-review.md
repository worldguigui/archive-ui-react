# 全局接口一致性审查

> 状态：草案审查报告。审查对象：`docs/components/` 下全部 56 个组件文档与 6 份专项系统文档。
> 本报告不代表 API 已冻结；发现项分为“已一致”“需修正”“待确认”和“阻塞”。

## 1. 审查结论摘要

- 56 个候选组件均已有职责、边界、Props 草案、事件、状态、视觉、无障碍、示例、边界与依赖说明。
- 统一约定已覆盖：命名、原生属性继承、ref、受控/非受控、事件语义、组合、样式扩展、视觉映射。
- **阻塞项 4 类**：浮层基础设施未立项、状态色 Token 缺失、disabled/focus/z-index/motion Token 缺失、图标与日期工具缺失。
- **范围调整项 4 类**：ArchiveLabel 合并、ImageLayer/FilmFrame/PaperSheet 内部化、RadioGroup 新增、ToastProvider/useToast 新增。
- **现有文档/代码冲突 3 处**：Panel `tier`、Panel 无条件 hover、Panel 验证 API 与正式草案差异。
- 未发现运行时循环依赖；唯一类型归属风险是 `MenuEntry`，已要求放入中立内部模块。
- 未发现“同一语义在多个组件中使用不同命名”的未解释情况；存在若干**已解释的例外**（见 §3–§7）。

## 2. 审查方法

逐项对照：

1. 命名与通用属性（api-conventions §3–§4）。
2. 原生属性继承与 Omit（§5）。
3. Ref 目标（§8）。
4. 受控/非受控三态（§7）。
5. 事件签名（§6）。
6. 组合模型（§9）。
7. 样式扩展与内部暴露（§10）。
8. 无障碍基线（§11）。
9. 依赖方向与循环（dependency-map）。
10. 与现有代码/文档的事实一致性。

## 3. 命名一致性

| 语义 | 统一名称 | 例外/说明 |
| --- | --- | --- |
| 尺寸 | `size` | Typography 用 `variant`（语义排版）；Badge/Tag/Descriptions 等使用子集 `sm/md` 或 `sm/md/lg`；Table 用 `density`（行密度，不是控件尺寸） |
| 视觉变体 | `variant` | 仅在有明确视觉分支时出现 |
| 颜色语义 | `tone` | 不使用 `color`；ArchiveStamp 使用 `tone` |
| 材质 | `material` | 仅表面组件 |
| 禁用 | `disabled` | 行级用 `getRowDisabled`（Table）；`List` 项用 `disabled` |
| 错误 | `invalid` | Radio 的 invalid 只在 RadioGroup；Table 无 |
| 必填 | `required` | 原生语义 |
| 加载 | `loading` | Button/IconButton/AlertDialog/Table/Statistic；语义统一为“异步进行中”，具体表现见文档 |
| 占满 | `fullWidth` | 表单/Button；不适用于 Badge/Divider |
| 受控值 | `value` | Checkbox/Switch 用 `checked`；Pagination 用 `page`；Steps 用 `current` |
| 非受控 | `defaultValue` / `defaultChecked` / `defaultPage` | 与状态种类对应 |
| 打开 | `open` | NavigationMenu 用 `value` 表示“打开项”，因为打开对象是 item id；ContextMenu 受控需 `anchorPoint` |
| 事件 | `onX` / `onXChange` | 原生 `onChange` 仅用于原生控件；值型控件用 `onValueChange` |
| 子组件 | 具名导出 | `TabsList` 等；不使用 `Tabs.List` |
| ARIA 名称 | 原生 `aria-label` | Tooltip/Popover 无根节点；Dropdown/Context/Menu 显式声明 `'aria-label'` |

### 3.1 已修正

- Radio 示例曾出现 `RadioGroup.Legend` 静态属性写法，已改为具名 `RadioGroupLegend`。
- FormField 的 `aria-labelledby` 注入已补入 form-system，使 Slider 等非 labelable 控件可获得名称。

### 3.2 需注意的命名例外

1. `Checkbox` 的 `value` 是原生提交值，**不是**选中状态；选中状态统一用 `checked`。文档已说明，但使用方容易误解，需在 M2 文档/Playground 示例中强调。
2. `Table` 的 `density` 与控件 `size` 不同义；这是有意的，不改为 `size`。
3. `Table` 排序使用 `sort` / `onSortChange`，只受控；没有 `defaultSort`，因为组件不排序数据。
4. `Steps` 的 `current` 必须由调用方驱动，没有非受控模式；这是流程状态，不是局部 UI 状态。
5. `NavigationMenu` 的 `value` 表示打开的 item，不是当前页面；当前页用 item 的 `active`。
6. `ContextMenu` 没有 `defaultOpen`；受控打开需要坐标，默认由右键事件驱动。

## 4. 受控/非受控一致性

| 状态 | 组件 | 受控 | 非受控 | 回调 | 结论 |
| --- | --- | --- | --- | --- | --- |
| value | Input/Textarea | 原生 `value` | `defaultValue` | 原生 `onChange` | 一致 |
| checked | Checkbox/Switch | `checked` | `defaultChecked` | 原生 `onChange` | 一致 |
| value | RadioGroup/Select/NumberInput/Slider/DatePicker/Tabs | `value` | `defaultValue` | `onValueChange` | 一致 |
| open | Dialog/AlertDialog/Popover/DropdownMenu/Select/DatePicker/Tooltip/ContextMenu | `open` | `defaultOpen` | `onOpenChange` | 基本一致；ContextMenu 例外见 §3 |
| expanded | Accordion/Tree | `value`/`expandedIds` | `defaultValue`/`defaultExpandedIds` | `onValueChange`/`onExpandedChange` | Accordion 是值型，Tree 是 ID 集合；命名按状态种类，合理 |
| selected | Tree | `selectedId` | `defaultSelectedId` | `onSelect` | 一致 |
| selection | Table | `selectedKeys` | `defaultSelectedKeys` | `onSelectionChange` | 一致 |
| page | Pagination | `page` | `defaultPage` | `onPageChange` | 一致 |
| sort | Table | `sort` | 无 | `onSortChange` | 例外：数据排序归调用方，组件只表达状态 |
| current | Steps | `current` | 无 | `onStepClick` | 例外：流程状态必须受控 |
| open item | NavigationMenu | `value` | `defaultValue` | `onValueChange` | 例外：打开的是 item，不是布尔 |

共同规则已写入 api-conventions §7：受控优先、不可运行时切换、`defaultX` 只读一次、受控不保存影子状态。未发现违反。

## 5. 原生属性继承与 Ref

### 5.1 继承审查

| 组件族 | 继承 | 评价 |
| --- | --- | --- |
| Button/IconButton | `ButtonHTMLAttributes` | 合理；`type` 保留，默认 button |
| Typography | `HTMLAttributes<HTMLElement>` | 合理；`as` 决定标签 |
| Input | `InputHTMLAttributes`，Omit `size/prefix/type` | 合理；`type` 收窄防止与 NumberInput 重叠 |
| Textarea | `TextareaHTMLAttributes` | 合理 |
| Checkbox/Radio/Switch | `InputHTMLAttributes`，Omit `type/size`（Radio 另 Omit checked/onChange/name） | 合理；根 label/内部 input 的映射已明确 |
| Select/DatePicker | `HTMLAttributes<HTMLDivElement>` | 合理；没有原生宿主可继承 |
| NumberInput | `InputHTMLAttributes`，Omit 冲突项 | 合理，但 className/style 落根、其余落 input，属于混合映射 |
| FormField | `HTMLAttributes<HTMLDivElement>` | 合理 |
| Panel/Card/Archive | `HTMLAttributes<HTMLElement>`，Omit title | 合理 |
| Table | `TableHTMLAttributes`，Omit children | 合理 |
| Dialog/AlertDialog | `HTMLAttributes<HTMLDivElement>`，Omit title/children | 合理；className 落内容容器 |
| Tooltip/Popover/DropdownMenu/ContextMenu | 不继承 | 合理；无单一根 |
| ToastProvider | 不继承 | 合理；Provider 非 DOM |

### 5.2 混合 DOM 映射例外（必须测试）

| 组件 | className/style | 原生属性 | ref |
| --- | --- | --- | --- |
| Input | 根 wrapper | 内部 input | input |
| NumberInput | 根 wrapper | 内部 input | input |
| Checkbox/Radio/Switch | 根 label | 内部 input | input |
| Select/DatePicker | 根 wrapper | trigger（id/aria） | trigger button |
| Image | 根 figure | 内部 img | img |
| Dialog/AlertDialog | 内容容器 | 内容容器 | 内容容器 |
| Checkbox 根 label | 标签内容 | input | input |

这些例外是有意的，但必须在实现与测试中固定；不能“有时 className 在 input，有时在 wrapper”。

### 5.3 Ref 审查

- 全部公开组件使用 `forwardRef`；符合 React 18.2+ 约束。
- Typography ref 为 HTMLElement；Button 为 HTMLButtonElement；Input/Textarea 为原生元素；Checkbox/Radio/Switch 为 input；Select/DatePicker 为 trigger；Image 为 img；Table 为 table；Tree 为根 div；Dialog 为内容容器。
- Tooltip 不提供 ref（无稳定公共 DOM）；ToastProvider 无 ref；Toast 通过 hook 操作。
- 泛型 Table 的 forwardRef 实现需特殊处理；已在 table.md 与 export-strategy 记录，不构成 API 问题。

## 6. 事件一致性

| 事件 | 签名约定 | 审查结果 |
| --- | --- | --- |
| 原生 `onChange` | React 原生事件 | 仅用于 Input/Textarea/Checkbox/Switch。**注意**：Radio 的 change 由 RadioGroup 内部处理，不在 Radio 上暴露；文档已说明 |
| `onValueChange` | `(next: T) => void` | Select/NumberInput/Slider/DatePicker/RadioGroup/Tabs/Accordion；无 details 对象，一致 |
| `onOpenChange` | `(open: boolean) => void` | 所有浮层一致 |
| `onExpandedChange` | `(ids: string[]) => void` | Tree 独有 |
| `onPageChange` | `(page: number) => void` | Pagination 独有 |
| `onStepClick` | `(index, item) => void` | Steps 独有 |
| `onSelect` | 菜单项无参；Tree `(id,node)`；NavigationMenu `(item)` | 语义不同：菜单项自身已知 id；Tree/Navigation 需要节点数据。**已解释，不强行统一** |
| `onRemove` / `onDismiss` | 事件可选 | Tag/Alert 一致 |
| `onConfirm` / `onCancel` | 无参 | AlertDialog 一致 |
| `onCheckedChange` | 仅 MenuEntry 复选项 | 不是组件级事件；无原生 input 可用，命名合理 |

风险：

- `onCheckedChange` 只出现在 MenuEntry，容易被误认为 Checkbox 也有；Checkbox 文档明确使用原生 onChange。
- MenuEntry 的 `onSelect` 不接收事件；无法从回调阻止默认行为。需要时用 `closeOnSelect={false}` 或外层控制。
- 自定义浮层关闭回调不能“阻止关闭”；受控模式下父级可忽略。已写入约定。

## 7. 组合与 API 暴露审查

### 7.1 组合模型

| 模型 | 组件 | 评价 |
| --- | --- | --- |
| children/slots | Panel、Card、Dialog、Image、Archive 组件 | 合理 |
| Compound | Tabs、Accordion、FormField、RadioGroup/Radio | 合理；FormField 需要上下文注入 |
| 数据驱动 | Select、Menu、DropdownMenu、ContextMenu、Breadcrumb、Pagination、Steps、Table、List、Timeline、Descriptions、Tree、ArchiveIndex | 合理；需要统一键盘/ARIA 的集合 |
| 两者混合 | Table（列 + cell 函数）、ArchiveCard（字段 + ReactNode 槽） | 合理 |

### 7.2 过度暴露检查

- 未公开内部 Slot、OverlayPositioner、MenuCore、Date utils、Icons。
- 未把纹理图源、混合模式、暗角形状、z-index 暴露为组件 prop。
- `textureIntensity` / `lightingIntensity` 只在表面组件开放，0–2，属于既有架构声明的“语义响应系数”；但仍需确认公开范围（见 open-questions）。
- `className` / `style` / `data-*` 是完整样式扩展面；不承诺内部 class 稳定。
- `TableColumn.cell`、`Statistic.formatter`、`Progress.formatValue`、`Slider.formatValue`、`DatePicker.disabledDate` 是渲染/格式化函数，不是通用 render prop。

### 7.3 未暴露但需要的能力

- 无 `forceMount` / 退出动画控制：由内部 Presence 管理，避免调用方接管挂载。
- 无 `zIndex` / `portal` 位置选择以外的层叠控制。
- 无路由集成 API；使用原生 href/onClick。

## 8. 组件职责重叠与范围调整

| 关系 | 结论 | 状态 |
| --- | --- | --- |
| Badge vs Tag | 保留两者：计数/状态 vs 内容标签 | 通过 |
| Alert vs Toast | 保留：内联持久 vs 浮动短暂 | 通过 |
| Dialog vs AlertDialog | 保留：通用可关闭 vs 强制选择 | 通过 |
| Tooltip vs Popover | 保留：不可交互文本 vs 任意内容 | 通过 |
| DropdownMenu vs ContextMenu | 保留：trigger 打开 vs 指针位置打开；共享 entries | 通过 |
| Menu vs NavigationMenu | 保留：命令菜单 vs 导航地标 | 通过 |
| Panel vs Card | 保留：区域表面 vs 内容卡片；Card 可组合 Panel | 通过 |
| Steps vs Timeline | 保留：流程阶段 vs 事件序列 | 通过 |
| Empty vs Skeleton | 保留：无数据 vs 加载占位 | 通过 |
| Descriptions vs ArchiveMetadata | 结构重叠；建议 ArchiveMetadata 作为 Descriptions 预设，保留独立语义 | **待确认** |
| Tag vs ArchiveLabel | 高度重叠；建议 ArchiveLabel 并入 Tag | **待确认** |
| Image vs ImageLayer | ImageLayer 建议内部化 | **待确认** |
| ArchiveCover vs FilmFrame | FilmFrame 建议内部化为 `frame="film"` | **待确认** |
| Panel vs PaperSheet | PaperSheet 建议内部化到 paper 表面/装饰预设 | **待确认** |
| Radio 单独存在 | 不成立；新增 RadioGroup 是必要依赖 | **待确认新增** |
| Toast 单组件 | 不成立；需要 ToastProvider + useToast | **待确认新增** |
| Panel vs 现有验证组件 | 正式 API 有破坏性变更 | **待确认** |

### 8.1 新增公开入口建议

1. `RadioGroup`（+ `RadioGroupLegend`）：否则 Radio 无完整语义。
2. `ToastProvider` + `useToast`：否则 Toast 无法管理队列与 live region。
3. 内部 `MenuItem` 类型导出为 `MenuEntry`（不是组件）。
4. 内部基础设施不新增公共组件（Portal/Overlay 等）。

## 9. 依赖与循环

- 详细图见 `dependency-map.md`。
- 未发现运行时循环；关键单向关系：
  - IconButton → Button → Spinner。
  - RadioGroup → Radio；FormField → Slot，不反向。
  - AlertDialog → Dialog 内部；Card → Panel；Table → Checkbox/RadioGroup。
  - ArchiveCard → Card；ArchivePanel → Panel/ArchiveHeader；ArchiveMetadata → Descriptions；ArchiveCover → Image。
- **类型归属风险**：`MenuEntry` 若定义在 DropdownMenu 目录，Menu/ContextMenu 会形成组件间的类型依赖。必须在 `src/internal/menu/types.ts` 定义，根入口 re-export。已在 dependency-map 与 export-strategy 记录。
- 低层反向依赖检查：Button 不依赖 Tooltip；Typography 不被任何组件强制 import；没有 Archive 被通用层依赖。

## 10. 视觉与 Token 审查

### 10.1 已对齐

- 所有组件使用 `au-` 前缀和 BEM；compound 子组件应使用 `au-{parent}__{part}`（如 `au-tabs__list`），这一点需在实现时固定。
- 材质只用于表面组件；表单/密集数据保持等级 0–1。
- 表面组件复用三槽位；装饰不占伪元素。
- 不使用彩色渐变按钮；焦点/选中使用 border-lit + glow。
- 字体角色：展示用 display/editorial，操作用 UI，编号用 numeric。
- 尺寸建议值（32/40/48）是候选，不是冻结 Token。

### 10.2 缺口（阻塞或高风险）

| 缺口 | 影响 | 严重度 |
| --- | --- | --- |
| success/warning/danger/info 语义色 | Alert、Toast、Badge、Tag、Table、Timeline、Steps、Statistic、ArchiveStamp、Select/Input invalid 无法完成最终视觉 | **阻塞** |
| disabled 文本/背景/边框 | 所有控件禁用态只能用 opacity 近似，可能不可读 | 高 |
| focus ring | 只能用 border-lit + glow 组合，缺少统一 Token | 高 |
| z-index 层级 | 浮层/Toast/Tooltip 的层级无法统一 | **阻塞（M3）** |
| 动效时长/缓动 | 只有 `--au-transition-base`，浮层进入/退出/Accordion 高度动画无专用 Token | 中 |
| 控件高度/内边距 | 32/40/48 是建议值，未纳入 Token | 中 |
| 图片处理参数 | archival/film 的实现与资产未定义 | 中 |
| 表格密度/行高/sticky 阴影 | Table 视觉需校准 | 中 |

**不能**用场景 Primitive（moss/fog-blue/wine）直接充当状态色绕过语义层；这违反 Token 三层架构。

### 10.3 状态色建议（待立项）

建议新增语义变量（名称待视觉确认）：

```css
--au-color-status-success-fg / -bg / -border
--au-color-status-warning-fg / -bg / -border
--au-color-status-danger-fg / -bg / -border
--au-color-status-info-fg / -bg / -border
--au-color-text-disabled / --au-color-bg-disabled / --au-color-border-disabled
--au-color-focus-ring
--au-z-overlay / --au-z-modal / --au-z-toast / --au-z-tooltip
--au-duration-fast / --au-duration-base / --au-duration-slow
```

本阶段不修改 Token；这些是 M1/M3 前置项。

## 11. DOM/样式扩展约定缺口

- 需明确 `data-state` 的稳定值域：建议浮层 `open|closed`；可勾选 `checked|unchecked|indeterminate`；选中 `selected`；禁用用 `data-disabled`；方向用 `data-orientation`。文档目前多处提到 `data-state` 但未统一值域，**需在实现前补充**。
- Compound 子组件 class 命名需固定为 `au-{parent}__{part}`，不要出现 `au-tabs-list` 这种并列命名。
- 不承诺内部 class 稳定；但 `au-` 根 class 必须稳定，测试覆盖。
- 不提供组件级 CSS 变量契约；若未来需要，统一立项，不在单个组件先开放。

## 12. 与现有代码/文档的事实冲突

| # | 冲突 | 事实 | 处理 |
| --- | --- | --- | --- |
| C1 | `tier` prop | `docs/rendering-system.md` §六声称 `tier` 已实现，并在 §一给出 `<Panel material="paper" tier="editorial" />`；`src/components/Panel/Panel.tsx` 无 `tier`，也无对应样式 | 本草案**不引入 `tier`**；登记待确认。不得用 `padding` 冒充 |
| C2 | Panel hover | 现有 `.au-panel:hover` 无条件提亮/发光 | 正式草案改为 `interactive` 默认 false；属于视觉/行为变更，需确认 |
| C3 | Panel 标题层级 | 现实现硬编码 `<h3>` | 草案增加 `headingLevel`，默认 3，兼容但需确认 |
| C4 | Panel 验证 API | README/architecture 明确 Panel 是验证组件、API 会演进 | 正式 API 保留 title/footer/material/corners，新增可选 props；仍可能改变 hover 与内部 DOM |
| C5 | `PanelMaterial` | 现有导出类型名 `PanelMaterial`；草案共享 `SurfaceMaterial` | 建议统一或提供别名；需确认兼容策略 |
| C6 | `cn` 公共导出 | 当前 `src/index.ts` 导出 `cn` | 建议移出公共 API；需确认 |
| C7 | 版本号 | 现有 `package.json` 0.2.0；Playground Components 页 footer 文案为 v0.1.0 | 文案陈旧，不属于组件 API；建议顺手更新（不属本阶段） |
| C8 | `decoration` API | 文档提到装饰预设；当前仅 `corners` | 草案不新增 decoration prop；`corners` 为过渡 |
| C9 | 状态色 | 设计规范有错误/成功语义，但无 Token | 阻塞；不得凭空硬编码 |
| C10 | 图标 | 无 Icon 组件/图标依赖 | 新增内部图标集；不公开 Icon 组件（待确认是否需要） |

未发现代码与设计文档在材质、槽位、主题、构建方面的其它冲突。

## 13. 组件覆盖与状态

### M1（10）

| 组件 | 文档 | 状态 |
| --- | --- | --- |
| Button | general/button.md | 草案 |
| IconButton | general/icon-button.md | 草案 |
| Typography | general/typography.md | 草案 |
| Badge | general/badge.md | 草案 |
| Tag | general/tag.md | 草案（ArchiveLabel 合并待确认） |
| Divider | general/divider.md | 草案 |
| Spinner | general/spinner.md | 草案 |
| Skeleton | general/skeleton.md | 草案 |
| Avatar | general/avatar.md | 草案 |
| Tooltip | general/tooltip.md | 草案（依赖浮层决策） |

### M2（10）

| 组件 | 文档 | 状态 |
| --- | --- | --- |
| Input | form/input.md | 草案 |
| Textarea | form/textarea.md | 草案 |
| Checkbox | form/checkbox.md | 草案 |
| Radio / RadioGroup | form/radio.md | 草案（RadioGroup 新增待确认） |
| Switch | form/switch.md | 草案 |
| Select | form/select.md | 草案（浮层依赖） |
| NumberInput | form/number-input.md | 草案 |
| Slider | form/slider.md | 草案（区间模式未做） |
| DatePicker | form/date-picker.md | 草案（浮层/日期工具） |
| FormField | form/form-field.md | 草案（Compound 形态待确认） |

### M3（25）

| 组件 | 文档 | 状态 |
| --- | --- | --- |
| Dialog | feedback/dialog.md | 草案（浮层依赖） |
| AlertDialog | feedback/alert-dialog.md | 草案（浮层/状态色） |
| Popover | feedback/popover.md | 草案（浮层依赖） |
| DropdownMenu | feedback/dropdown-menu.md | 草案（浮层依赖） |
| ContextMenu | feedback/context-menu.md | 草案（浮层依赖） |
| Toast | feedback/toast.md | 草案（Provider 新增待确认） |
| Alert | feedback/alert.md | 草案（状态色） |
| Progress | feedback/progress.md | 草案 |
| Accordion | feedback/accordion.md | 草案 |
| Tabs | navigation/tabs.md | 草案 |
| Breadcrumb | navigation/breadcrumb.md | 草案 |
| Pagination | navigation/pagination.md | 草案 |
| Menu | navigation/menu.md | 草案 |
| NavigationMenu | navigation/navigation-menu.md | 草案（浮层/无 Portal 决策） |
| Steps | navigation/steps.md | 草案（状态色） |
| Card | data-display/card.md | 草案 |
| Panel | data-display/panel.md | 草案（现有组件正式化待确认） |
| List | data-display/list.md | 草案 |
| Table | data-display/table.md | 草案（RadioGroup/选择语义） |
| Timeline | data-display/timeline.md | 草案（状态色） |
| Empty | data-display/empty.md | 草案 |
| Descriptions | data-display/descriptions.md | 草案 |
| Image | data-display/image.md | 草案（处理预设待实现） |
| Statistic | data-display/statistic.md | 草案 |
| Tree | data-display/tree.md | 草案 |

### M4（11）

| 组件 | 文档 | 状态 |
| --- | --- | --- |
| ArchiveCard | archive/archive-card.md | 草案 |
| ArchivePanel | archive/archive-panel.md | 草案 |
| ArchiveHeader | archive/archive-header.md | 草案 |
| ArchiveMetadata | archive/archive-metadata.md | 草案（Descriptions 预设待确认） |
| ArchiveStamp | archive/archive-stamp.md | 草案（状态色） |
| ArchiveLabel | archive/archive-label.md | **待确认：建议并入 Tag** |
| ArchiveCover | archive/archive-cover.md | 草案（视觉资产待实现） |
| ArchiveIndex | archive/archive-index.md | 草案 |
| ImageLayer | archive/image-layer.md | **待确认：建议内部化** |
| FilmFrame | archive/film-frame.md | **待确认：建议内部化** |
| PaperSheet | archive/paper-sheet.md | **待确认：建议内部化** |

## 14. 需要统一修订的事项

如果维护者确认以下事项，应**统一修订所有相关文档**，而不是在单个组件里打补丁：

1. 状态色 Token 的名称与明暗映射 → 所有 tone/status 文档。
2. 浮层实现依赖（自研/Floating UI/Radix）→ overlay-system 与所有浮层组件。
3. Panel `tier` 去留 → surface-system、Panel、ArchivePanel。
4. `textureIntensity`/`lightingIntensity` 的公开范围 → Panel/Card/Archive 文档。
5. `cn` 是否公开 → export-strategy、README、src/index.ts（后续）。
6. `RadioGroup`/`ToastProvider` 是否新增 → 组件清单、依赖图、导出策略。
7. Archive 合并/内部化 → README、archive-system、依赖图、导出策略。
8. `data-state` 值域与 compound class 命名 → api-conventions、全部组件实现约定。

## 15. 结论

- 接口设计在命名、受控、事件、继承、依赖与无障碍方面整体一致；未发现必须推翻的上位原则。
- 当前不能进入实现，原因不是文档不足，而是**基础设施与 Token 未就绪**，且存在若干必须由维护者裁决的范围问题。
- 建议按 open-questions 中的 P0 项逐项确认后，再冻结 api-conventions 与 M1 接口。
