# Card

> 状态：草案（阶段一）· 需人工审核。M3 数据展示。

## 1. 职责

内容卡片：媒体、标题、描述、操作与页脚的组织容器。它解决的是“一组相关内容需要作为一个视觉单元呈现”的问题。

**使用场景**：档案条目、文章摘要、产品/藏品卡、带封面的内容块。
**不适用**：页面分区（用 Panel）；档案记录（用 ArchiveCard）；可点击整行列表（用 List/Table）；纯图片（用 Image）。
**区别**：Card 面向内容卡片；Panel 面向区域；ArchiveCard 固定档案信息结构。

## 2. 边界

- Card 是展示型容器，不内置点击/选中/路由行为。
- `interactive` / `selected` 只是视觉提示；语义由调用方提供的链接或按钮承担。
- 不提供媒体裁剪/滤镜细节；媒体内容由 Image/ArchiveCover 提供。
- 不提供任意布局插槽系统；使用固定槽位 + children。
- 不使用 film 做长正文背景；film 只用于展示型封面区域（由 media 内容控制）。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `title` | `ReactNode` | — | 卡片标题 |
| `subtitle` | `ReactNode` | — | 副标题/分类 |
| `description` | `ReactNode` | — | 摘要文本 |
| `media` | `ReactNode` | — | 封面/媒体槽 |
| `headerActions` | `ReactNode` | — | 标题区操作（菜单/收藏） |
| `actions` | `ReactNode` | — | 底部操作区 |
| `footer` | `ReactNode` | — | 底部元信息 |
| `children` | `ReactNode` | — | 自定义正文（追加在 description 后） |
| `material` | `SurfaceMaterial` | `'plain'` | 材质 |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | 媒体与内容布局 |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | 内容区留白 |
| `bordered` | `boolean` | `true` | 边框 |
| `elevation` | `'none' \| 'soft' \| 'deep'` | `'soft'` | 阴影 |
| `selected` | `boolean` | `false` | 选中视觉提示 |
| `interactive` | `boolean` | `false` | hover/focus-within 视觉提示 |
| `as` | `'article' \| 'section' \| 'div'` | `'article'` | 根语义 |
| `headingLevel` | `HeadingLevel` | `3` | 标题级别 |
| `textureIntensity` / `lightingIntensity` | `number` | `1` | 0–2 强度 |

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import type { HeadingLevel, SurfaceMaterial } from '../api-conventions';

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode;
  subtitle?: ReactNode;
  description?: ReactNode;
  media?: ReactNode;
  headerActions?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  material?: SurfaceMaterial;
  orientation?: 'vertical' | 'horizontal';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  bordered?: boolean;
  elevation?: 'none' | 'soft' | 'deep';
  selected?: boolean;
  interactive?: boolean;
  as?: 'article' | 'section' | 'div';
  headingLevel?: HeadingLevel;
  textureIntensity?: number;
  lightingIntensity?: number;
}
```

## 4. 事件与状态

- 无自定义事件；原生事件透传根节点。
- 状态：Default、Hover（interactive）、Focus-within（interactive）、Selected、Disabled（无内置；由内容提供）。
- 不提供 open/loading；内容加载由 Skeleton 占位。
- 点击整卡：调用方可用 `<a>` 包裹或让标题成为链接；Card 不添加 role/button。
- `selected` 需要同时提供可访问状态（如链接 `aria-current` 或外层列表的选中语义），不能只改视觉。

## 5. 视觉

- 默认 plain 表面；档案内容卡建议 paper，但由调用方选择。
- media 槽占满卡片宽度/侧边，内容区 padding 由 `padding` 控制；media 自身处理比例。
- 标题使用 title/heading；副标题 caption/secondary；描述 body/editorial。
- `actions` 位于底部，右对齐或分散；`headerActions` 右上角。
- 选中态使用边框/标记/编号，不只靠背景色。
- 嵌套 Card 禁止重复材质强度；内层默认 plain。

## 6. 组合与扩展

- 媒体：Image、ArchiveCover、自定义视频/图形。
- 操作：IconButton、Button、DropdownMenu。
- 档案信息：优先 ArchiveCard，不把 Card 堆满档案字段。
- 不提供 CardHeader/CardBody/CardFooter 子组件；槽位 props 已覆盖常见结构。需要完全自定义时使用 Panel。
- 不提供 `asChild`；路由由调用方包裹。

## 7. 无障碍

- 根默认 `<article>`；标题渲染 `h{headingLevel}`。
- 标题是卡片可访问名称；没有标题的卡片需 `aria-label`。
- media 的 alt 由媒体组件负责；装饰性媒体 `alt=""`。
- headerActions/actions 必须是真实按钮/链接；Card 不嵌套交互语义。
- interactive 仅视觉；若整卡可点击，必须由调用方提供链接/按钮语义与键盘路径。
- selected 视觉必须对应可访问状态；不能只给颜色。

## 8. 示例

```tsx
<Card
  title="雨夜来信"
  subtitle="AR-1972-031"
  description="一封来自伦敦的未署名信件，纸张有明显水渍。"
  media={<Image src="/cover.webp" alt="" ratio="4/3" treatment="archival" />}
  headerActions={<DropdownMenu ... />}
  actions={<Button size="sm">查看</Button>}
  footer="1972-11-03"
  material="paper"
/>

<Card orientation="horizontal" title="..." media={<ArchiveCover ... />}>
  ...
</Card>
```

## 9. 边界情况

- 无标题：仍可渲染；必须由调用方提供 aria-label，否则开发环境警告。
- media 为空：不渲染媒体区域，不留空白。
- 横向布局在窄容器：由调用方切换 orientation 或 CSS；组件不做断点。
- 超长描述：默认换行；截断由调用方控制。
- 嵌套交互元素：Card 根不是链接/按钮，允许内部按钮；若整卡包 `<a>`，禁止再嵌套链接/按钮。
- selected 与 interactive 同时：视觉叠加需视觉校准；语义仍由调用方负责。
- film 材质 + 长描述：可读性风险；文档禁止，不强制。
- textureIntensity 越界：钳制并警告。

## 10. 依赖与实现注意

- 可组合 Panel 的表面实现，但不透传 Panel 全部 API；共享材质槽位。
- 不依赖 Image/ArchiveCover，媒体通过 ReactNode 注入，避免展示层强耦合。
- 不硬编码标题字号；使用排版 Token。
- Card 没有 loading/empty 内建状态；使用 Skeleton/Empty。
