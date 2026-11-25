# Archive 特色组件专项设计

> 状态：草案，含**组件范围调整建议**，需维护者确认。
> 目标：让档案特色组件具备独立语义与信息结构，而不是给通用组件加一层装饰。

## 1. 判断标准

一个视觉元素是否值得成为公开 React 组件，必须同时满足：

1. 有独立的语义或信息结构（不只是样式）。
2. 有可复用的行为或布局契约。
3. 无法用现有公开组件 + className 合理表达。
4. 公开后不会与通用组件形成两套竞争 API。

按此标准，本阶段建议：

| 组件 | 建议 | 状态 |
| --- | --- | --- |
| ArchiveCard | 保留公开 | 待审核 |
| ArchivePanel | 保留公开 | 待审核 |
| ArchiveHeader | 保留公开 | 待审核 |
| ArchiveMetadata | 保留公开，作为 Descriptions 的档案预设 | 待确认 |
| ArchiveStamp | 保留公开 | 待审核 |
| ArchiveLabel | **建议并入 Tag** | 待确认 |
| ArchiveCover | 保留公开 | 待审核 |
| ArchiveIndex | 保留公开 | 待审核 |
| ImageLayer | **建议内部化** | 待确认 |
| FilmFrame | **建议内部化** | 待确认 |
| PaperSheet | **建议内部化** | 待确认 |

## 2. 组件边界

### 2.1 ArchiveCard vs Card

- Card：通用内容卡片，媒体 + 标题 + 描述 + 操作。
- ArchiveCard：固定档案记录结构——档案编号、分类、日期、标题、摘要、元数据、印章、封面。默认 paper 材质。
- ArchiveCard 不提供任意布局插槽替代所有字段；字段结构本身就是它的价值。需要完全自定义时使用 Card。
- ArchiveCard 不是可点击组件。需要链接时由调用方把整张卡片包在 `<a>` 中，或只让标题成为链接；组件不内置 role=button。

### 2.2 ArchivePanel vs Panel

- Panel：通用表面区域。
- ArchivePanel：卷宗/档案章节容器，带档案编号、分类、日期、印章、索引等结构化头部；默认 paper。
- ArchivePanel 内部可以复用 Panel 的表面与布局，但不把 Panel 的所有 props 原样暴露成两套重叠 API；只保留档案场景需要的表面参数（material、size、corners、强度）。

### 2.3 ArchiveHeader

- 独立可复用的档案头部：标题、编号、分类、日期、附加 meta、操作区。
- ArchivePanel 使用它；ArchiveCard 的紧凑头部不复用它，避免把大标题结构塞进小卡片。
- ArchiveHeader 只负责头部，不负责容器表面。

### 2.4 ArchiveMetadata vs Descriptions

- Descriptions：通用标签-值对，语义 `<dl>`。
- ArchiveMetadata：档案字段的固定视觉与命名（编号使用 numeric 字体、字段用 hairline 分隔、可带档案分类标记）。
- 建议保留独立公开名称与数据契约，但内部作为 Descriptions 预设实现，避免复制两套布局。
- 若维护者认为差异不足，可合并为 `Descriptions variant="archive"`；本阶段不擅自合并。

### 2.5 ArchiveLabel vs Tag

- Tag：通用标签/分类，可移除，有 tone 与 variant。
- ArchiveLabel：档案分类/索书号/编号标签，通常不可交互，强调等宽编号。
- 二者差异主要是视觉预设与语义名称，交互模型几乎相同。建议并为一个：
  - `Tag variant="archive"` + `monospace` 预设，或在 Tag 中增加 `code` / `index` 内容语义。
  - 若保留 ArchiveLabel，则它必须**不可移除、不可点击**，且只用于档案编号/分类，避免与 Tag 竞争。

### 2.6 ArchiveCover vs Image / ArchiveCard

- Image：基础图片语义、比例、填充、加载回退与通用 treatment。
- ArchiveCover：档案封面，包含标题、副标题、说明、印章/标签叠层与遮罩渐变。
- ArchiveCard 可以使用 ArchiveCover 作为封面；ArchiveCover 也可以独立用于海报/展览位。
- ArchiveCover 不是“给 Image 加一个边框”；它承担封面叙事与文字可读性遮罩。

### 2.7 ArchiveIndex vs List / Table

- List：展示型列表。
- Table：行列数据。
- ArchiveIndex：编目索引，带编号、层级、引导线、页码/位置；语义是可定位的目录，不是数据表格。
- ArchiveIndex 不允许可编辑或排序；它是静态索引。交互仅限链接跳转。

### 2.8 ImageLayer / FilmFrame / PaperSheet

- ImageLayer：图片 + 暗角/颗粒/色调的叠加层。该能力应由 `Image treatment` 与 `ArchiveCover treatment` 预设承载，不需要公开组件。
- FilmFrame：胶片齿孔/画框的 L4 构成资产。应由 `ArchiveCover frame="film"` 或 `Image frame="film"` 预设承载，不公开通用 Frame 组件。
- PaperSheet：paper 材质 + 撕边/压痕的表面能力。应由 Panel/Card 的 paper 材质与未来装饰预设承载。
- 三者若保留为公开组件，会迫使调用方理解内部图层与材质槽，违背“基础使用保持简单”的边界。

## 3. 公共数据模型

### 3.1 档案元数据

```ts
interface ArchiveMetadataItem {
  id?: string;
  label: ReactNode;
  value: ReactNode;
}
```

- 字段顺序由数组决定；不要用对象键顺序表达视觉顺序。
- `value` 可以是链接、日期、编号等 ReactNode；需要纯文本时由调用方提供。
- 不内置“必填字段”校验；档案字段因业务而异。

### 3.2 印章状态

```ts
type ArchiveStampTone = 'neutral' | 'accent' | 'gold' | 'danger';
```

- 印章语义由 `label` 文本承担（如“机密”“已归档”“作废”），`tone` 只做视觉分级。
- 印章不是纯装饰：屏幕阅读器应能读到 label；若确为装饰，使用 `decorative` 并 `aria-hidden`。
- 不内置“approved / classified”等英文枚举；文案由调用方提供，避免语言绑定。

### 3.3 索引

```ts
interface ArchiveIndexEntry {
  id: string;
  label: ReactNode;
  number?: string;      // 编号，如 “01” / “A-12”
  locator?: string;     // 页码/位置
  level?: number;       // 0 起，视觉缩进
  href?: string;
}
```

- 编号使用 numeric 字体；层级缩进是视觉，不作为唯一语义，需要 `aria-level` 或嵌套列表表达。
- 索引项可链接；不可点击项渲染为文本。

## 4. 档案卡/卷宗的信息结构

推荐固定字段：

| 字段 | ArchiveCard | ArchivePanel | ArchiveHeader |
| --- | --- | --- | --- |
| `archiveNo` | 必填 | 必填 | 可选（独立使用时） |
| `title` | 必填 | 必填 | 必填 |
| `classification` | 可选 | 可选 | 可选 |
| `date` | 可选 | 可选 | 可选 |
| `summary` | 可选 | — | — |
| `meta` | 可选（结构化元数据） | 可选 | 可选 |
| `stamp` | 可选 ReactNode | 可选 ReactNode | — |
| `actions` | 可选 | 可选 | 可选 |
| `cover` | 可选 ReactNode | — | — |

- `archiveNo` 使用字符串而不是 number，保留前导零、连字符与字母。
- `ArchiveIndex` 不作为 ArchivePanel 的专用 prop；需要目录时由调用方放入 children/footer，避免组件假设固定侧栏布局。
- 日期展示为 ReactNode；组件不解析、不格式化日期，避免时区问题。
- 分类使用 ReactNode 或建议并入 Tag；V1 草案允许 ReactNode，避免新增枚举。

## 5. 无障碍

- ArchiveCard 根为 `<article>`，标题为可配置级别（默认 h3）；若卡片在列表中，由列表提供结构。
- ArchivePanel 根为 `<section>`，标题为可配置级别（默认 h2/h3）。
- ArchiveHeader 的标题层级可调；编号与分类必须有可访问文本，不能只画图形。
- 印章文本必须可读；旋转角度不得影响阅读顺序。
- 索引使用 `<ol>` 或 `<nav>` + 列表；当前项 `aria-current`；编号/定位符是文本，不是背景图。
- 封面图必须有 `alt`；若封面是纯装饰，`alt=""` 且标题仍可读。
- 装饰性纹样、印章底纹、齿孔全部 `aria-hidden`。

## 6. 视觉与材质

- 默认 paper 材质，强度等级 2；ArchiveCard 在密集列表中可降为 plain 以避免噪声。
- film 只用于封面/展示型区域，不用于整张档案卡正文。
- 印章使用 oxide / gold 等现有强调色；danger 状态需状态 Token，当前不可实施。
- 编号、日期、索引使用 numeric 字体；标题使用 display/editorial；操作使用 UI 字体。
- 角饰、蚀刻线、印章环属于 L4 构成；不得占用材质伪元素槽。
- 同一视图内印章与装饰母题数量受 design-system 维度 04/07 约束，不能每张卡都盖章。

## 7. 依赖建议

- ArchiveCard → Card、ArchiveMetadata、ArchiveCover（可选）、Tag（分类预设，可选）。
- ArchivePanel → Panel、ArchiveHeader。
- ArchiveCover → Image。
- ArchiveMetadata → Descriptions（建议实现复用）。
- ArchiveIndex、ArchiveStamp、ArchiveHeader 尽量无组件依赖，只依赖 Token 与内部图标。
- 禁止 Archive 被通用层依赖；禁止 ArchiveCard 反向依赖 ArchivePanel。

## 8. 待确认

1. ArchiveLabel 是否并入 Tag。
2. ImageLayer / FilmFrame / PaperSheet 是否内部化，以及对外预设名称（`treatment` / `frame`）。
3. ArchiveMetadata 是否保留独立组件，或改为 `Descriptions variant="archive"`。
4. ArchiveCard 是否需要内置链接/选中行为（当前建议不内置）。
5. 印章的状态枚举（当前建议 label + tone，不绑定业务枚举）。
6. 档案编号、分类、日期的展示格式是否由组件约定，还是完全交给调用方。
7. danger 状态色 Token 何时补齐（印章“作废/拒绝”需要）。
