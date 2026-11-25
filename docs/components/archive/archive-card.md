# ArchiveCard

> 状态：草案（阶段一）· 需人工审核。M4 档案特色组件。

## 1. 职责

档案记录卡：以固定信息结构呈现一份档案的编号、标题、分类、日期、摘要、元数据、封面与印章。它解决的是“档案条目需要一致的身份结构与视觉语义”的问题。

**使用场景**：档案网格、检索结果、目录条目、最近调阅。
**不适用**：通用内容卡片（用 Card）；页面分区（用 Panel/ArchivePanel）；单纯图片（用 ArchiveCover）；需要点击整卡行为（由调用方包裹链接）。
**区别**：ArchiveCard 固定档案字段与默认 paper 材质；Card 是通用槽位；ArchivePanel 是卷宗级容器。

## 2. 边界

- 不内置点击/链接/选中行为；`selected` 只是视觉提示。
- 不内置封面/印章组件；通过 `cover` / `stamp` 传入 ReactNode（通常为 ArchiveCover / ArchiveStamp）。
- 不格式化日期/编号；`archiveNo` 是字符串，日期是 ReactNode。
- 不负责数据的必填校验；只负责展示结构。
- 不提供任意布局插槽替代字段；需要完全自定义时用 Card。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `archiveNo` | `string` | **必填** | 档案编号，保留前导零/连字符 |
| `title` | `ReactNode` | **必填** | 档案标题 |
| `subtitle` | `ReactNode` | — | 副标题/系列名 |
| `classification` | `ReactNode` | — | 分类/密级；通常为 Tag/ArchiveLabel |
| `date` | `ReactNode` | — | 日期展示；不解析 |
| `summary` | `ReactNode` | — | 摘要 |
| `metadata` | `ArchiveMetadataItem[]` | — | 结构化元数据，内部渲染 ArchiveMetadata |
| `cover` | `ReactNode` | — | 封面槽，通常为 ArchiveCover |
| `stamp` | `ReactNode` | — | 印章槽，通常为 ArchiveStamp |
| `actions` | `ReactNode` | — | 操作区 |
| `footer` | `ReactNode` | — | 页脚/索引信息 |
| `material` | `SurfaceMaterial` | `'paper'` | 表面材质 |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | 封面与内容布局 |
| `size` | `Size` | `'md'` | 尺寸/间距 |
| `selected` | `boolean` | `false` | 选中视觉提示 |
| `headingLevel` | `HeadingLevel` | `3` | 标题级别 |
| `textureIntensity` / `lightingIntensity` | `number` | `1` | 0–2 强度 |

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import type { HeadingLevel, SurfaceMaterial, Size } from '../api-conventions';
import type { ArchiveMetadataItem } from './archive-metadata';

export interface ArchiveCardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  archiveNo: string;
  title: ReactNode;
  subtitle?: ReactNode;
  classification?: ReactNode;
  date?: ReactNode;
  summary?: ReactNode;
  metadata?: readonly ArchiveMetadataItem[];
  cover?: ReactNode;
  stamp?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  material?: SurfaceMaterial;
  orientation?: 'vertical' | 'horizontal';
  size?: Size;
  selected?: boolean;
  headingLevel?: HeadingLevel;
  textureIntensity?: number;
  lightingIntensity?: number;
}
```

## 4. 事件与状态

- 无自定义事件；原生事件透传根 `<article>`。
- 状态：Default、Selected、Hover（仅当调用方包裹链接/按钮时由容器样式提供；组件自身不添加假 hover）。
- 不提供 loading/empty；用 Skeleton/Empty。
- `selected` 需要调用方同时提供可访问状态（如链接 `aria-current` 或列表选择语义），不能只改视觉。

## 5. 视觉

- 默认 paper 材质，强度等级 2；密集列表可降为 plain 避免噪声。
- 结构：编号行（numeric） + 标题（display/title） + 分类/日期 meta + 摘要 + 元数据 + 印章/操作/页脚。
- 编号使用 numeric 字体；标题使用 display/editorial；分类使用 Tag/ArchiveLabel；元数据使用 ArchiveMetadata。
- 印章位置建议右上/右下，允许小角度旋转；同一列表不要每张都盖章。
- 封面由 ArchiveCover 提供，比例由封面控制；卡片不裁剪任意媒体。
- 选中态使用边框/编号标记 + 背景，不只靠颜色。

## 6. 组合与扩展

- 封面：ArchiveCover 或 Image；印章：ArchiveStamp；分类：Tag/ArchiveLabel；元数据：结构化 `metadata` 或传入 ArchiveMetadata。
- 需要点击整卡：调用方用 `<a>` 包裹 ArchiveCard（避免内部再嵌套链接/按钮），或只让标题成为链接。组件不内置 `href`。
- 需要“档案操作菜单”：actions 中放 DropdownMenu/IconButton。
- 不把 ArchiveCard 用作通用 Card；需要完全自由布局时用 Card。

## 7. 无障碍

- 根 `<article>`；标题渲染为 `h{headingLevel}`。
- 标题是主要可访问名称；编号/日期/分类为补充文本，不能只画图形。
- 封面 alt 由封面组件负责；印章文本必须可读（或 `decorative` 时隐藏）。
- `selected` 视觉若表达当前项，调用方需提供 `aria-current` 或列表语义。
- 卡片本身不可点击；不要添加 role=button。若整卡包链接，内部不得再嵌套链接/按钮。
- 装饰角饰/纹样 `aria-hidden`。

## 8. 示例

```tsx
<ArchiveCard
  archiveNo="AR-1972-031"
  title="雨夜来信"
  subtitle="私人通信"
  classification={<Tag tone="gold">机密</Tag>}
  date="1972-11-03"
  summary="一封带有水渍的未署名信件。"
  cover={<ArchiveCover src="/letter.webp" alt="信件封面" title="雨夜来信" />}
  stamp={<ArchiveStamp label="已归档" tone="accent" rotate={-4} />}
  metadata={[
    { label: '来源', value: '伦敦私人捐赠' },
    { label: '材质', value: '纸、墨' },
  ]}
  actions={<Button size="sm">查看</Button>}
/>
```

## 9. 边界情况

- `archiveNo` 为空：允许但开发环境警告；档案卡缺少编号会削弱语义。
- `title` 为空：无障碍不合格；开发环境报错。
- 无封面：内容占满宽度，不留空白。
- 元数据为空数组：不渲染 ArchiveMetadata 区域。
- 印章过多/重复：组件不限制，视觉规范限制；由调用方克制。
- 超长标题/摘要：换行；不截断为不可访问文本。
- 横向布局在窄容器：由调用方切换 orientation。
- selected 但不可点击：视觉提示必须由父列表解释，否则用户困惑。
- 整卡包 `<a>` 且 actions 含按钮：非法嵌套；必须改为标题链接或拆分布局。
- 嵌套 paper：卡片在 paper 面板中可能纹理叠加过重；建议内层降 plain。

## 10. 依赖与实现注意

- 依赖 Card（表面/布局）、ArchiveMetadata、ArchiveStamp/ArchiveCover 通过 ReactNode 注入；不硬依赖后两者。
- 默认 material 为 paper；但必须允许 plain 以适配密集列表。
- 编号使用字符串，不做数字解析/补零。
- 不内置 selected 的可访问语义；组件只负责视觉。
