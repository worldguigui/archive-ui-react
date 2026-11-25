# 待确认问题清单

> 状态：阶段一交付物。以下问题**不能由本阶段自行定案**；未确认前不应进入 M1 实现。
> 每项给出当前草案的倾向与阻塞范围，便于逐项裁决。

## 1. 优先级定义

| 级别 | 含义 |
| --- | --- |
| **P0** | 不解决就无法开始相应里程碑，或会迫使返工 |
| **P1** | 影响 API 稳定性/一致性，应在对应里程碑开始前解决 |
| **P2** | 可在实现中迭代，但影响使用体验或后续扩展 |

## 2. P0 · 进入 M1 前必须确认

### Q1 浮层实现依赖

- 问题：定位、dismiss、焦点陷阱、嵌套层级是自研，还是引入 Headless Primitive？
- 草案倾向：内部自研 Portal/Dismissable/Focus/LayerStack；定位优先评估 `@floating-ui/react`，焦点与菜单仍自研。
- 影响：Tooltip（M1）、Select/DatePicker（M2）、全部 M3 浮层。
- 不确认的后果：M1 只能做简化 Tooltip；M3 无法可靠交付。
- 需要：维护者批准是否新增生产依赖；若坚持零依赖，明确接受简化范围。

### Q2 状态色 Token

- 问题：success / warning / danger / info 的语义 Token 是否新增？明暗两套值是什么？
- 草案倾向：新增 `--au-color-status-*-fg/bg/border`，禁止用场景 Primitive 代替。
- 影响：Tag/Badge/Alert/Toast/Table/Timeline/Steps/Statistic/ArchiveStamp/所有 invalid 态。
- 不确认的后果：只能交付中性视觉，不能声称状态视觉完成。

### Q3 disabled / focus / z-index / motion Token

- 问题：是否为禁用态、焦点环、浮层层级、动效时长增加 Token？
- 草案倾向：
  - disabled 文本/背景/边框；
  - `--au-color-focus-ring` 或统一 focus 组合；
  - `--au-z-overlay/modal/toast/tooltip`；
  - `--au-duration-fast/base/slow` 与缓动。
- 影响：全部控件与浮层；目前只能用 opacity 与 base transition 近似。
- 不确认的后果：可访问性与层级行为无法统一验收。

### Q4 Panel `tier` 去留

- 问题：`docs/rendering-system.md` 提到 `tier="editorial"`，但代码不存在。是否引入 `tier`？
- 草案倾向：不引入；不在本阶段用 `padding` 冒充。若需要，单独立项定义取值与视觉。
- 影响：Panel、ArchivePanel、surface-system、文档一致性。
- 不确认的后果：正式 Panel API 可能少一个预期的组织维度。

### Q5 Panel hover 行为与正式化

- 问题：现有 Panel 无条件 hover 发光；正式 API 是否改为 `interactive` 默认 false？
- 草案倾向：改为 `interactive` 控制，静态容器不发光；这是视觉行为变更。
- 影响：现有 Panel 使用方（Playground/验证项目）、Card 的 hover 规则。
- 不确认的后果：Panel 正式 API 与现状不一致，可能造成回归。

### Q6 RadioGroup 是否新增

- 问题：Radio 必须依赖分组才有完整语义；是否新增公开 `RadioGroup`（及 `RadioGroupLegend`）？
- 草案倾向：新增；否则 Radio 文档无法成立，Table 单选也无法可靠实现。
- 影响：M2、Table、导出清单、依赖图。
- 不确认的后果：Radio 只能要求调用方手写原生 input，违背组件化目标。

### Q7 ToastProvider / useToast 是否新增

- 问题：Toast 需要队列、计时、live region；是否新增 Provider + hook 作为公开入口？
- 草案倾向：新增 `ToastProvider` + `useToast`；展示项内部化。
- 影响：M3、导出清单、SSR/多根行为。
- 不确认的后果：Toast 无法作为可靠组件交付。

## 3. P0/P1 · 范围与组件存在性

### Q8 ArchiveLabel 是否并入 Tag

- 问题：两者职责高度重叠；是否删除 ArchiveLabel，改为 `Tag variant="archive"`？
- 草案倾向：并入；若保留，ArchiveLabel 必须不可交互、不可移除。
- 影响：M4、Tag API、导出清单、文档。
- 不确认的后果：两套标签 API 竞争。

### Q9 ImageLayer / FilmFrame / PaperSheet 是否内部化

- 问题：三者是否作为公开组件？
- 草案倾向：全部内部化；对外分别通过 `Image/ArchiveCover treatment`、`ArchiveCover frame="film"`、`Panel/Card material="paper"` + 未来 decoration 暴露。
- 影响：M4、Image/ArchiveCover API、导出清单、依赖图。
- 不确认的后果：调用方需要理解内部图层与材质槽，违背“基础使用简单”。

### Q10 ArchiveMetadata 是否独立

- 问题：是否保留 ArchiveMetadata，还是 `Descriptions variant="archive"`？
- 草案倾向：保留独立名称与数据契约，内部作为 Descriptions 预设；若确认差异不足，再合并。
- 影响：M3/M4、ArchiveCard 的 metadata prop、导出清单。
- 不确认的后果：两套近似键值组件。

### Q11 FormField 形态

- 问题：FormField 采用 Compound + 内部 Slot，还是 render prop / 显式 ID 传递？
- 草案倾向：Compound + Slot；`FormField.Control` 注入 id/aria，支持 Slider 等非 labelable 控件。
- 影响：M2 全部表单、表单库集成、无障碍。
- 不确认的后果：所有表单控件文档需重写。

### Q12 事件约定

- 问题：是否确认“原生控件保留原生 onChange；值型控件使用 onValueChange”的双轨制？
- 草案倾向：确认。统一 onValueChange 会破坏原生表单库；统一 onChange(event) 会让 Select/Slider 等值语义笨重。
- 影响：M1–M3 全部交互组件、表单库接入。
- 不确认的后果：事件命名与类型需全库返工。

### Q13 图标策略

- 问题：是否建立内部图标集（chevron/check/close/plus/minus/calendar/arrow/error）？是否公开 Icon 组件？
- 草案倾向：内部图标集，不公开 Icon 组件；调用方通过 children/icon 槽提供自定义图标。
- 影响：IconButton、Dialog、Select、DatePicker、Pagination、Steps、Tree、Toast。
- 不确认的后果：每个组件各自画图标，风格不一致。

## 4. P1 · API 与包结构

### Q14 `textureIntensity` / `lightingIntensity` 的公开范围

- 问题：是否只在 Panel/Card/Archive 表面公开？范围 0–2 是否确认？
- 草案倾向：只在表面组件公开，0–2，局部写入根节点，不影响全局。
- 影响：Panel/Card/ArchivePanel/ArchiveCard、材质验收。
- 不确认的后果：材质 API 不一致或过度暴露。

### Q15 `cn` 与 TS Token 的公共导出

- 问题：是否将 `cn` 移出公共 API？TS Token 是否继续公开？
- 草案倾向：`cn` 内部化；TS Token 暂保留但标注为工具用途。
- 影响：`src/index.ts`、README、兼容性。
- 不确认的后果：公共 API 面继续膨胀。

### Q16 目录分组与 Panel 移动

- 问题：是否采用 `components/{domain}/{Component}`？Panel 是否移动？
- 草案倾向：采用域分组；Panel 移到 `data-display/Panel`；公共导入不变。
- 影响：仓库结构、测试路径、构建（无逻辑变更）。
- 不确认的后果：56 个组件平铺，维护成本高。

### Q17 `PanelMaterial` 与 `SurfaceMaterial`

- 问题：保留旧类型名还是统一为 `SurfaceMaterial`？
- 草案倾向：统一为 `SurfaceMaterial`，`PanelMaterial` 仅作为兼容别名（或 M1 前删除）。
- 影响：现有 Panel 类型导出、Archive 表面。
- 不确认的后果：两个类型名指向同一概念。

### Q18 状态 tone 的 API 先行

- 问题：在 Token 未就绪时，是否允许 API 类型先包含 success/warning/danger/info？
- 草案倾向：类型保留完整反馈语义，但实现标记为阻塞；未就绪前不得交付状态视觉。
- 影响：Tag/Badge/Alert/Toast/Statistic 等。
- 不确认的后果：要么 API 反复扩展，要么交付半成品。

## 5. P1 · 复杂组件边界

### Q19 ContextMenu 受控模式

- 问题：是否保留 `open` + `anchorPoint` 受控接口？还是只做非受控？
- 草案倾向：保留受控，但必须有坐标；受控无坐标时警告并退化。
- 影响：测试、DismissableLayer、与其他浮层的一致性。
- 不确认的后果：受控用户无法精确控制位置。

### Q20 NavigationMenu 是否使用 Portal

- 问题：为保持 Tab 顺序，草案默认不 Portal；若容器 `overflow` 裁切怎么办？
- 草案倾向：V1 不 Portal；文档要求调用方调整容器；未来可加 `portalContainer`。
- 影响：导航浮层、焦点顺序、布局。
- 不确认的后果：复杂页面可能裁切浮层。

### Q21 DatePicker 值/格式/locale

- 问题：确认 `YYYY-MM-DD` 字符串、本地日历、无时区；默认 `zh-CN`、周一为首日？
- 草案倾向：确认。禁止 `new Date('YYYY-MM-DD')`。
- 影响：M2、表单提交、i18n。
- 不确认的后果：时区/格式反复修改。

### Q22 Slider 范围

- 问题：V1 是否只做单值水平？区间/垂直何时做？
- 草案倾向：只做单值水平；区间另立 RangeSlider。
- 影响：API、双 thumb 键盘模型、表单值。
- 不确认的后果：后期扩展会破坏 value 类型。

### Q23 Select 能力范围

- 问题：V1 是否确认不做分组/搜索/多选/异步？
- 草案倾向：确认；需要时另立 Combobox。
- 影响：API、浮层、键盘。
- 不确认的后果：Select 膨胀成万能组件。

### Q24 Table 选择/排序/行点击

- 问题：单选是否允许依赖 RadioGroup？排序是否只受控且不排序数据？`onRowClick` 是否接受“仅指针便利、不自动键盘化”？
- 草案倾向：是；单选用 RadioGroup；排序由调用方执行；行点击不自动添加 role/键盘，键盘路径由单元格内控件提供。
- 影响：Table、无障碍、表单依赖。
- 不确认的后果：Table API 与语义冲突。

### Q25 CheckboxGroup 是否新增

- 问题：多选组是否需要组件？全选/半选联动由谁负责？
- 草案倾向：V1 不新增；用 fieldset + Checkbox，联动由调用方管理。
- 影响：M2、表单一致性。
- 不确认的后果：多选组 API 缺失或后期返工。

### Q26 ArchiveCard 是否内置链接/点击

- 问题：`ArchiveCard` 是否提供 `href`/整卡点击？
- 草案倾向：不内置；调用方用 `<a>` 包裹或标题链接；避免嵌套交互元素。
- 影响：M4、无障碍、卡片网格。
- 不确认的后果：常见“可点击卡片”需求需额外模式。

### Q27 Toast 的 Provider 作用域

- 问题：是否允许多个 Provider？是否持久化跨路由？
- 草案倾向：每个 Provider 独立队列，不跨 Provider；不持久化，页面卸载即消失。
- 影响：M3、SSR、应用集成。
- 不确认的后果：全局单例与多根行为不一致。

## 6. P2 · 体验与工程

### Q28 RTL / 响应式 / 高对比

- 问题：V1 是否明确不支持 RTL、断点 props、强制高对比？
- 草案倾向：不支持，单独立项；组件不读取方向/断点。
- 影响：Slider/DatePicker/Tabs/NavigationMenu 等。
- 不确认的后果：使用者误以为支持。

### Q29 `data-state` 与 compound class 命名

- 问题：确认 `data-state` 值域（open/closed、checked/unchecked/indeterminate、selected）与 `au-{parent}__{part}` 命名？
- 草案倾向：确认；`data-disabled`、`data-orientation` 独立属性。
- 影响：所有组件样式扩展与测试。
- 不确认的后果：各组件自造状态属性。

### Q30 测试工具

- 问题：是否新增 `@testing-library/user-event`（dev dependency）用于键盘/指针测试？是否新增 Playwright 截图回归？
- 草案倾向：新增 user-event；截图回归在 M1 后逐步建立。
- 影响：测试质量、CI 时间。
- 不确认的后果：键盘/焦点测试用 fireEvent 难以覆盖真实行为。

### Q31 现有文档清理

- 问题：`docs/rendering-system.md` 的 `tier`、Playground 版本文案等陈旧内容是否随 M1 一并修正？
- 草案倾向：随对应实现修正；本阶段只登记。
- 影响：文档可信度。
- 不确认的后果：设计与代码继续不一致。

## 7. 最小决策集（建议维护者先回答）

若希望尽快进入 M1，至少先确认以下 8 项：

1. **Q1** 浮层依赖策略（自研/第三方）。
2. **Q2 + Q3** 状态色、disabled、focus、z-index、motion Token 是否立项。
3. **Q4 + Q5** Panel 的 `tier` 与 `interactive`（正式 API 是否接受破坏性变更）。
4. **Q6 + Q7** RadioGroup 与 ToastProvider 是否新增。
5. **Q11 + Q12** FormField 形态与事件双轨制。
6. **Q13** 内部图标集。
7. **Q8–Q10** ArchiveLabel / 三个内部化 / ArchiveMetadata 的最终去留。
8. **Q16 + Q18** 目录结构与状态 tone API 先行策略。

其余问题可在对应里程碑开始前逐项确认。
