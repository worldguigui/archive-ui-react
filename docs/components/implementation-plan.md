# 后续 M1–M4 实施建议

> 状态：建议稿。**未经阶段一审核确认，不得据此开始实现。**

## 1. 实施前置门槛

在写第一个正式组件前，必须完成：

1. 确认 `open-questions.md` 的最小决策集（至少 8 项）。
2. 冻结 `api-conventions.md` 与共享类型；后续组件不得自行发明别名。
3. 立项缺失 Token（状态色、disabled、focus、z-index、motion）——可分批，但 M1 前至少确认 disabled/focus 的可用方案。
4. 立项浮层基础设施与图标/日期工具；不要让每个组件自带一套。
5. 确认 Panel 正式 API、RadioGroup、ToastProvider、Archive 范围调整。
6. 确认目录结构与 CSS 文件组织。

**不允许**以“先把组件写出来，接口再对齐”的方式启动；本阶段的目的正是避免这种返工。

## 2. Phase 0：内部基础设施（先于 M1）

建议顺序：

| 步骤 | 内容 | 依赖 | 产出 |
| --- | --- | --- | --- |
| 0.1 | `useControllableState`、`useId` 封装、ref 合并 | 无 | 所有受控组件的基础 |
| 0.2 | `Slot`（单元素 clone） | 0.1 | FormField.Control |
| 0.3 | 内部 Icons（chevron/check/close/plus/minus/calendar/arrow/error） | Token | 组件视觉一致 |
| 0.4 | `OverlayPortal` + `Presence` | React | 浮层/Toast/Tooltip |
| 0.5 | `Positioner` + `DismissableLayer` | 0.4；依赖决策 | Tooltip/Popover/Select/DatePicker/Menu |
| 0.6 | `FocusScope` + `LayerStack` | 0.4 | Dialog/AlertDialog/嵌套 |
| 0.7 | `RovingFocus` + `Typeahead` | 无 | Tabs/Menu/Tree/RadioGroup |
| 0.8 | 日期工具（`YYYY-MM-DD` 本地日历） | 无 | DatePicker |
| 0.9 | 内部 Surface 机制（共享槽位 CSS） | 无 | Panel/Card/Archive |
| 0.10 | 测试工具（user-event）与 a11y 测试基线 | 依赖确认 | 键盘/焦点测试 |

约束：

- Phase 0 的能力不对外导出；没有独立 npm 子路径。
- 若浮层选择第三方库，只替换 0.4–0.6 的实现，不改组件公共 API。
- 不提前创建空目录或占位 API；每项有实际消费者后再落地。

## 3. M1 实施顺序

| 顺序 | 组件 | 理由 |
| --- | --- | --- |
| 1 | Typography | 无依赖，先固定排版映射 |
| 2 | Divider、Spinner、Skeleton | 纯展示/无状态，验证 Token 与基础样式 |
| 3 | Button、IconButton | 控件基线；IconButton 依赖 Button + Spinner |
| 4 | Badge、Tag、Avatar | 展示与状态基础；Tag 依赖内部图标 |
| 5 | Tooltip | 最后做，依赖浮层定位（Phase 0.4/0.5） |

M1 完成标准：

- 每个组件有对应 Playground 示例（正式展示区）。
- 单元测试覆盖：渲染、class、变体、className 合并、受控/非受控（适用时）、键盘（适用时）。
- 无障碍：名称、焦点、键盘、aria 状态、reduced motion。
- `pnpm build` / `pnpm typecheck` / `pnpm lint` 实际通过。
- 视觉在暗/亮主题、sm/md/lg 下校准。
- 不引入未确认的第三方依赖。

## 4. M2 实施顺序

| 顺序 | 组件 | 理由 |
| --- | --- | --- |
| 1 | Input、Textarea | 原生控件基线、DOM 映射测试 |
| 2 | Checkbox、Switch | 原生 checkbox 语义/回退 |
| 3 | RadioGroup、Radio | 分组上下文、原生键盘 |
| 4 | FormField | 依赖 Slot、所有表单控件的关联测试 |
| 5 | NumberInput | 数值解析、边界、步进 |
| 6 | Slider | 指针/键盘、隐藏 input |
| 7 | Select | 依赖浮层、listbox 键盘、表单提交 |
| 8 | DatePicker | 最后做，依赖浮层 + 日期工具 |

注意：

- Input/NumberInput/Checkbox 等混合 DOM 映射必须有专门测试（className 落根、属性落 input、ref 指向 input）。
- Select/DatePicker/Slider 的隐藏 input 与表单 reset 行为需文档化测试。
- FormField 与第三方表单库的集成不在本阶段承诺；至少验证 react-hook-form 的 Controller 模式是否可用。

## 5. M3 实施顺序

### 5.1 浮层与反馈

1. Popover（验证定位/dismiss）
2. Dialog（焦点陷阱/滚动锁）
3. AlertDialog（复用 Dialog）
4. DropdownMenu / ContextMenu / Menu（共享 menu-core）
5. Toast（Provider/hook/live region）
6. Alert、Progress、Accordion

### 5.2 导航

Tabs → Pagination → Breadcrumb → Steps → Menu（若未在浮层阶段完成）→ NavigationMenu。

### 5.3 数据展示

Panel（正式化）→ Card → List → Descriptions → Empty → Timeline → Image → Statistic → Table → Tree。

理由：

- Panel/Card 是表面基线；Archive 依赖它们。
- Table 依赖 Checkbox/RadioGroup，放在 M2 之后。
- Tree 的键盘模型独立，放在最后。
- Image 的处理预设依赖视觉资产，可与 Table 并行。

## 6. M4 实施顺序

1. ArchiveHeader、ArchiveMetadata、ArchiveStamp、ArchiveIndex（无容器依赖）
2. ArchiveCover（依赖 Image/处理预设）
3. ArchiveCard（依赖 Card、Metadata、Cover 槽）
4. ArchivePanel（依赖 Panel、Header）
5. 三个内部化候选（ImageLayer/FilmFrame/PaperSheet）：
   - 默认只作为内部实现，不新增公开组件；
   - 若维护者决定公开，先补独立设计评审，不直接沿用本草案。

M4 开始前必须确认 Archive 范围调整，否则会出现“实现了又要删”的返工。

## 7. 每组件完成定义（Definition of Done）

- [ ] 接口与最终确认的 api-conventions 一致；无未登记的别名。
- [ ] Props / 事件 / 受控 / 非受控 / ref / DOM 映射有单元测试。
- [ ] 键盘、焦点、ARIA、禁用、加载、错误态有测试。
- [ ] 暗/亮主题、sm/md/lg、空/长/溢出内容有 Playground 示例并人工验收。
- [ ] 样式只用 Semantic Token；无硬编码主题值。
- [ ] 材质槽位正确；装饰不占伪元素；`isolation` 正确。
- [ ] 无新增未确认依赖；无内部实现泄漏到公共导出。
- [ ] `pnpm test` / `typecheck` / `lint` / `build` 实际通过，并如实报告。
- [ ] 文档（组件 md）与实现同步；Playground Components 页更新。
- [ ] 包产物验证：独立项目安装 `.tgz`，根导入/类型/样式/资产可用。

## 8. 测试策略

| 层级 | 工具 | 重点 |
| --- | --- | --- |
| 单元 | Vitest + Testing Library | 渲染、class、变体、受控、事件、DOM 映射 |
| 交互 | user-event（建议新增 dev dep） | 键盘、焦点、指针拖拽、选择 |
| 可访问性 | 人工 + 断言 | role/name/state、焦点陷阱、aria-describedby |
| 浏览器 | Playwright | Tooltip/Dialog/Select 的定位与焦点、主题切换 |
| 视觉 | Playground/截图 | 材质、亮暗主题、尺寸、状态矩阵 |
| 包 | pnpm pack + 独立项目 | 类型、CSS、资产、tree-shaking |

禁止：只测“渲染不报错”，不测键盘与焦点；用快照替代可访问性断言；把未执行的检查报告为通过。

## 9. 风险登记

| 风险 | 影响 | 缓解 |
| --- | --- | --- |
| 浮层自研的 a11y 缺陷 | 高 | 依赖决策；优先成熟定位/dismiss；焦点/菜单单独测试 |
| Token 未补齐导致视觉返工 | 高 | 先立项状态色/disabled/focus/z-index |
| Panel 正式化破坏现有使用 | 中 | 明确 breaking；版本策略；Playground 回归 |
| Archive 范围反复 | 中 | M4 前先裁决合并/内部化 |
| 组件数量多导致基础能力重复 | 高 | Phase 0 强制共享；代码审查禁止复制 |
| 表单库集成不符合预期 | 中 | M2 早期做 Controller/原生表单验证 |
| 日期/时区边界 | 中 | 规范字符串 + 本地日历测试；不引入 Date 字符串解析 |
| 泛型 Table 类型复杂 | 中 | 单独设计类型与测试；不暴露 any |
| 样式覆盖/class 命名漂移 | 中 | BEM + `au-` 前缀测试；data-state 值域统一 |
| 主题对比度/禁用态不可读 | 中 | 两主题视觉验收；状态色对比度检查 |

## 10. 建议的审核顺序

1. 先读 `consistency-review.md` §12（现有冲突）与 `open-questions.md` 最小决策集。
2. 确认 `api-conventions.md` 与 `export-strategy.md`。
3. 确认 `dependency-map.md` 与 Phase 0。
4. 逐域审核组件文档；优先 M1/M2，再 M3/M4。
5. 对 Archive 范围调整单独裁决。
6. 冻结接口后，再开 M1 实现任务。

## 11. 本阶段停止点

- 不创建组件实现文件。
- 不修改 Token、材质、构建配置、正式源码。
- 不引入第三方依赖。
- 等待人工审核与上述决策；确认后再进入 M1。
