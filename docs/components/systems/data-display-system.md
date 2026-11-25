# 数据展示系统专项设计

> 状态：草案。覆盖 Card、Panel、List、Table、Timeline、Empty、Descriptions、Image、Statistic、Tree，以及它们在 Archive 层的边界。

## 1. 组件选择指南

| 需求 | 应使用 | 不应使用 |
| --- | --- | --- |
| 页面分区 / 带标题的表面容器 | Panel | Card（Card 面向内容卡片，不是布局分区） |
| 带封面、标题、操作的内容卡片 | Card | Panel（除非只需要一个语义标题栏） |
| 档案记录卡片 | ArchiveCard | Card（ArchiveCard 固定档案信息结构） |
| 简单展示列表 | List | Table（无需列对齐/排序/选择） |
| 行列对齐、可排序、可选行 | Table | List |
| 标签-值对 | Descriptions | Table（两列数据不是表格语义） |
| 时间序列 | Timeline | Steps（Steps 是流程进度） |
| 树形层级 | Tree | 嵌套 List（Tree 有独立键盘模型） |
| 空结果 | Empty | Skeleton（Skeleton 是加载占位） |
| 单值指标 | Statistic | Typography（Statistic 负责数值语义与格式化） |
| 带档案处理的图片 | ArchiveCover / Image | 原生 `<img>` 直接堆叠滤镜（不可控） |

## 2. 数据驱动 vs 组合

| 模型 | 组件 | 理由 |
| --- | --- | --- |
| 数据驱动 | Table、Tree、List、Timeline、Descriptions、Breadcrumb、Steps | 统一键盘、选中、ARIA 与视觉节奏 |
| 组合 / slots | Panel、Card、ArchiveCard、ArchivePanel、Image | 内容结构差异大，props 槽位比数据数组更自然 |
| 混合 | Table（列定义 + `cell` 渲染函数） | 列是数据，单元格内容是任意 ReactNode |

不提供通用 `renderItem` 抽象；每个数据驱动组件的渲染函数只服务于该组件。

## 3. Panel 与 Card 的边界

- **Panel**：低层表面容器，负责材质、标题栏、页脚、边界与装饰。`as` 可选 `section/article/div/aside`。它是布局区域，不是内容卡片。
- **Card**：内容卡片，负责封面/媒体、标题、描述、操作、页脚与交互提示。可以内部组合 Panel 的表面能力，但不得把 Panel 的所有布局 props 原样透传形成“双层 API”。
- **ArchiveCard**：在 Card 之上固定档案字段（档案编号、分类、日期、印章、元数据、索引），默认 paper 材质。它不是“Card + 装饰”，而是有领域信息结构的组件。
- 不能用 Card 替代 Panel 做页面布局；也不能用 Panel 假装 Card 的媒体卡片。

Panel 是 M3 的正式候选，但当前 `src/components/Panel/Panel.tsx` 是验证组件；本阶段给出正式草案，需确认破坏性变更（见 `consistency-review.md`）。

## 4. 列表、表格与描述列表

### 4.1 List

- 展示型，不实现 listbox / option 语义。
- 数据项可带 `href` 成为链接；无 `href` 时不可点击。
- 不提供单选/多选状态，不做键盘 roving focus；选择行为应由 Menu、Table 或调用方实现。
- 适合短列表；不做虚拟滚动，超长列表由调用方接管。

### 4.2 Table

- 泛型 `<Row>`；列定义必须提供 `cell(row, index)` 渲染函数，避免 `dataIndex` 魔法与不安全索引。
- 排序**不由组件执行**；`sort` / `onSortChange` 只表达表头状态，数据排序由调用方完成。原因是服务端排序、分页排序与多列排序策略差异大。
- 行选择使用公共 Checkbox；`selectedKeys` / `onSelectionChange` 受控。V1 支持 `single` / `multiple`，不支持展开行、列拖拽、列固定、虚拟滚动。
- 分页不内置于 Table；与 Pagination 组合使用。
- 空数据渲染 `empty` 插槽，默认仅显示文本；不自动引入 Empty 组件，避免展示层反向依赖。
- `onRowClick` 仅在该行没有嵌套交互元素时使用；有按钮/链接的单元格应自行阻止冒泡。

### 4.3 Descriptions

- 语义为 `<dl>`，不是视觉上的“两列表格”。
- 标签与值必须成对；`columns` 控制视觉列数，不改变语义。
- ArchiveMetadata 是 Descriptions 的档案语义预设，保留独立名称与数据契约，但内部可复用实现。

## 5. 时间、流程与状态

- Timeline 展示已发生/计划中的事件序列；Steps 展示流程当前进度。二者不可互换。
- Timeline 的 `status` 表达事件语义（完成后/当前/错误），不是单纯的装饰色。
- Steps 的 `current` 是唯一驱动；每个 Step 的 `status` 只能覆盖异常状态（如 error），不能改变当前索引。
- Empty 用于“没有数据”，Skeleton 用于“数据尚未到达”，Loading overlay 用于“已有内容正在刷新”。三者不可混用。

## 6. 树

- V1 范围：展开、收起、单选、键盘导航、禁用节点。
- V1 不做：复选、半选、异步加载、虚拟滚动、拖拽排序。
- 节点必须有稳定 `id`；展开集合为 `string[]`，选中为 `string | null`。
- `aria-expanded` / `aria-selected` / `aria-level` / `aria-setsize` / `aria-posinset` 由组件维护。
- 大数据量（>500 节点）不承诺性能；需要时另立项虚拟化。

## 7. 图片与档案处理

- Image 提供基础图片语义、比例、填充、加载与错误回退；`treatment` 是**预设**（如 archival / film），不暴露滤镜参数。
- ArchiveCover 在 Image 之上增加档案封面结构（标题、副标题、印章、说明、遮罩渐变），默认使用档案处理。
- ImageLayer、FilmFrame、PaperSheet 建议内部化，不作为公开组件；它们的视觉能力通过 Image / ArchiveCover / Panel 的预设暴露。详见 `archive-system.md`。
- 图片必须有 `alt`；纯装饰图片使用 `alt=""` 并确保不是唯一信息载体。
- 图片懒加载使用原生 `loading`；不实现 IntersectionObserver 自研逻辑。

## 8. 数值与格式化

- Statistic 使用 numeric 字体角色与等宽数字；`value` 支持 number / string，`formatter` 负责业务格式。
- 不在组件内做本地化货币/百分比猜测；调用方通过 `formatter` 或 `prefix/suffix` 表达。
- `trend` 只表达方向，必须有可访问文本；不能只靠颜色/箭头。
- 大数缩写（1.2k / 1.2M）不是默认行为，避免精度误解。

## 9. 加载、空与错误

| 状态 | 组件表现 |
| --- | --- |
| 首次加载 | Skeleton 占位；不显示空状态 |
| 刷新 | 保留旧内容 + 轻量 loading 覆盖（Table 可用）；不让布局跳动 |
| 空结果 | Empty + 可选操作 |
| 错误 | Alert 或 Empty + 重试操作；Table 不内置错误态 |
| 部分失败 | 由调用方决定；组件不隐藏错误 |

所有加载状态必须配 `aria-busy`；Skeleton 本身 `aria-hidden`，由容器宣告忙碌。

## 10. 溢出与长内容

- Table 外层必须可横向滚动；表头 sticky 需要显式开启。
- 单元格默认不截断；需要截断时由调用方传 className 或使用 Typography 的 truncate，不内置省略号交互。
- Descriptions 的值允许换行；`columns` 在窄屏由调用方调整，无内置断点。
- Timeline / List 的超长标题换行，不省略为不可访问内容。
- Tree 的长标签截断时必须保留 `title` 或可访问名称。

## 11. 无障碍

- Table：`<caption>`（可选但推荐）、`<th scope="col">`、排序状态 `aria-sort`；行选择有可访问标签。
- List：`<ul>/<li>`；链接项使用 `<a>`。
- Descriptions：`<dl>/<dt>/<dd>`。
- Timeline：有序列表；时间用 `<time dateTime>`（若可提供）。
- Tree：完整 treeview 键盘模型；见组件文档。
- Empty / Statistic：不产生无意义 landmark；标题层级由调用方决定。
- Image：`alt` 必填；caption 使用 `<figcaption>`。

## 12. Token 缺口

- 状态色（success/warning/danger/info）缺失，影响 Timeline、Statistic、Table 选择与 Empty 错误态。
- 表格密度、行高、sticky 阴影、图片处理预设尚无 Token；实施前需视觉校准。
- 图片处理（archival / film）涉及滤镜与叠加，必须遵守“滤镜进资产、不进运行时”的渲染原则；若无法用 CSS/资产实现，需另立资产决策。
