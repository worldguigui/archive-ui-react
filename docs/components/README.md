# archive-ui-react 组件 API 设计（阶段一）

> 状态：**草案，等待人工审核**。本文档集是 M1–M4 的接口设计，不是已实现代码。
> 未经确认不得据此进入 M1 组件实现，也不得把草案中的类型当作已冻结的公共 API。

## 1. 本阶段的范围

- 覆盖任务书列出的 56 个候选组件（M1 10 + M2 10 + M3 25 + M4 11）。
- 只做职责、边界、Props、事件、状态、视觉映射、无障碍、依赖与导出设计。
- 不实现 React 组件，不修改 `src/` 下的代码、Token、材质或构建配置。
- 对现有工程与文档的冲突，只记录并给出建议，不擅自选定最终方案。

## 2. 阅读顺序

| 文档 | 作用 |
| --- | --- |
| [inventory.md](./inventory.md) | 56 个组件的类型、公开状态与一句话职责 |
| [api-conventions.md](./api-conventions.md) | **先读**。命名、通用属性、继承、Ref、受控、事件、样式扩展与公共类型 |
| [systems/form-system.md](./systems/form-system.md) | 表单控件共同模型、校验、ID 关联 |
| [systems/overlay-system.md](./systems/overlay-system.md) | 浮层基础设施、焦点、Portal、嵌套、关闭策略 |
| [systems/navigation-system.md](./systems/navigation-system.md) | 导航组件的模式选择与边界 |
| [systems/data-display-system.md](./systems/data-display-system.md) | 数据展示组件的组合与数据模型 |
| [systems/surface-system.md](./systems/surface-system.md) | 材质表面、强度参数、Panel/Card 边界 |
| [systems/archive-system.md](./systems/archive-system.md) | 档案特色组件与通用组件的边界 |
| [dependency-map.md](./dependency-map.md) | 分层、依赖图、循环依赖检查 |
| [export-strategy.md](./export-strategy.md) | 单包、目录、导出与构建策略 |
| [consistency-review.md](./consistency-review.md) | 全局接口一致性审查与冲突登记 |
| [open-questions.md](./open-questions.md) | 必须由人工确认的问题清单 |
| [implementation-plan.md](./implementation-plan.md) | M1–M4 实施顺序与基础设施前置项 |

## 3. 组件目录

### M1 · 基础组件 `general/`

[Button](./general/button.md) ·
[IconButton](./general/icon-button.md) ·
[Typography](./general/typography.md) ·
[Badge](./general/badge.md) ·
[Tag](./general/tag.md) ·
[Divider](./general/divider.md) ·
[Spinner](./general/spinner.md) ·
[Skeleton](./general/skeleton.md) ·
[Avatar](./general/avatar.md) ·
[Tooltip](./general/tooltip.md)

### M2 · 表单组件 `form/`

[Input](./form/input.md) ·
[Textarea](./form/textarea.md) ·
[Checkbox](./form/checkbox.md) ·
[Radio / RadioGroup](./form/radio.md) ·
[Switch](./form/switch.md) ·
[Select](./form/select.md) ·
[NumberInput](./form/number-input.md) ·
[Slider](./form/slider.md) ·
[DatePicker](./form/date-picker.md) ·
[FormField](./form/form-field.md)

### M3 · 交互、反馈与数据展示 `feedback/` `navigation/` `data-display/`

**反馈与浮层**：Dialog、AlertDialog、Popover、DropdownMenu、ContextMenu、Toast、Alert、Progress、Accordion
（见 [feedback/](./feedback/)）

**导航**：Tabs、Breadcrumb、Pagination、Menu、NavigationMenu、Steps
（见 [navigation/](./navigation/)）

**数据展示**：Card、Panel、List、Table、Timeline、Empty、Descriptions、Image、Statistic、Tree
（见 [data-display/](./data-display/)）

### M4 · 档案特色 `archive/`

ArchiveCard、ArchivePanel、ArchiveHeader、ArchiveMetadata、ArchiveStamp、ArchiveLabel、ArchiveCover、ArchiveIndex、ImageLayer、FilmFrame、PaperSheet
（见 [archive/](./archive/)）

## 4. 组件范围调整建议（待确认）

以下不是“已删除”，而是**建议在正式实现前由维护者裁决**。详情见
[consistency-review.md](./consistency-review.md) 与各组件文档的状态标记。

| 建议 | 对象 | 理由摘要 |
| --- | --- | --- |
| 新增公开子组件 | `RadioGroup` | 单选框脱离分组没有完整语义；原生 `name` 与选中值必须由分组统一管理 |
| 新增公开入口 | `ToastProvider` + `useToast` | Toast 需要队列、计时与 live region，单个展示组件无法独立工作 |
| 合并 | `ArchiveLabel` → `Tag` 的 `variant="archive"` | 与 Tag 职责重叠，差异主要是视觉预设 |
| 内部化 | `ImageLayer` | 只是图片叠层能力；公开后与 `Image` / `ArchiveCover` 的 treatment 重叠 |
| 内部化 | `FilmFrame` | 是图片/面板的边框预设，不是独立交互语义；建议作为 `frame="film"` 预设 |
| 内部化 | `PaperSheet` | 是 paper 材质 + 撕边装饰的表面能力；建议由 `Surface`/`Panel` 预设承载 |
| 保留但降级实现 | `ArchiveMetadata` | 与 `Descriptions` 结构相近；建议保留档案语义，内部作为 Descriptions 预设实现 |
| 正式化既有组件 | `Panel` | 当前 Panel 是工程验证组件；本阶段给出可替换的正式 API，需确认破坏性变更 |

## 5. 强制前置基础设施（不在本阶段实施）

在进入 M1 前，至少需要以下内部能力或决策；否则部分组件无法可靠实现：

1. 浮层基础设施：Portal、定位、焦点陷阱、外部点击、Escape、嵌套层级。
2. 状态语义 Token：success / warning / danger / info、disabled、focus ring、z-index、动效时长。
3. 内部图标集：chevron、check、close、plus/minus、calendar、arrow 等（不引入第三方图标库）。
4. 共享 hooks：`useControllableState`、`useId` 兼容封装、ref 合并、存在性动画。
5. 日期工具：仅在本地日历语义下解析 `YYYY-MM-DD`，不引入日期库。
6. 字体基线处理：`base.css` 对所有 `au-*` 应用 editorial 字体，表单/操作组件必须显式切换为 UI 角色。

详见 [consistency-review.md](./consistency-review.md) §10 与 [open-questions.md](./open-questions.md)。

## 6. 关于“最终 API”

本阶段所有接口均为 **Draft**。尤其是以下部分在确认前不能视为稳定：

- 状态色 `success` / `warning` / `danger` / `info`（Token 尚未存在）。
- 浮层实现依赖（自研 vs Headless Primitive）。
- Archive 组件的合并/内部化建议。
- Panel 的正式 API 与现有验证 API 的差异。
- 所有“建议实现值”中的尺寸、间距、动画数值。

## 7. 文档约定

- 标有 **待确认** 的文档表示接口本身或组件存在性尚未定案。
- “必须 / 禁止”是设计约束；“建议 / 默认”是可被实现细节调整的约定。
- 示例仅用于说明 API 形状，不作为已实现能力的证明。
- 所有接口草案不使用 `any`；无法在草案阶段定型的值使用 `unknown` 并说明消费方责任。
- TypeScript 草案中的相对类型导入（如 `from '../api-conventions'`、`from './archive-metadata'`）只表示共享类型的来源，不代表最终源码路径；实现时应集中到内部共享类型模块并从主入口导出。
