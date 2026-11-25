# ArchiveHeader

> 状态：草案（阶段一）· 需人工审核。M4 档案特色组件。

## 1. 职责

可复用的档案头部：编号、标题、副标题、分类、日期、附加元信息、印章与操作。它解决的是“不同档案容器需要一致的头部信息层级”的问题。

**使用场景**：ArchivePanel 的头部、自定义档案布局、档案详情页首屏、档案封面旁的信息区。
**不适用**：通用页面标题（用 Typography）；卡片标题（用 Card/ArchiveCard）；封面图（用 ArchiveCover）。
**区别**：ArchiveHeader 只负责头部信息结构，不提供表面容器。

## 2. 边界

- 不渲染外层材质/边框/阴影；由父容器提供。
- 不解析/格式化日期与编号；日期为 ReactNode，编号为字符串。
- 不内置布局分栏/响应式折叠；窄屏由调用方调整或简化字段。
- 不负责路由/操作行为；actions 由调用方提供。
- 印章通过 ReactNode 注入，不强制依赖 ArchiveStamp。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `title` | `ReactNode` | **必填** | 标题 |
| `archiveNo` | `string` | — | 档案编号 |
| `subtitle` | `ReactNode` | — | 副标题/系列 |
| `classification` | `ReactNode` | — | 分类/密级 |
| `date` | `ReactNode` | — | 日期展示 |
| `meta` | `ReactNode` | — | 额外元信息 |
| `stamp` | `ReactNode` | — | 印章槽 |
| `actions` | `ReactNode` | — | 操作区 |
| `headingLevel` | `HeadingLevel` | `3` | 标题级别 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 间距/字号等级 |

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import type { HeadingLevel } from '../api-conventions';

export interface ArchiveHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode;
  archiveNo?: string;
  subtitle?: ReactNode;
  classification?: ReactNode;
  date?: ReactNode;
  meta?: ReactNode;
  stamp?: ReactNode;
  actions?: ReactNode;
  headingLevel?: HeadingLevel;
  size?: 'sm' | 'md' | 'lg';
}
```

## 4. 结构

- 根 `<header class="au-archive-header">`。
- 顶部元信息行：编号、分类、日期、meta；使用 numeric/UI 字体。
- 标题行：标题 + 副标题；标题为 `h{headingLevel}`。
- 右侧/下方：actions 与 stamp 槽；无内容时不保留空占位。
- 无 archiveNo 时顶部行仍可由分类/日期/meta 组成；全部为空则不渲染该行。
- 不提供 `index` 或目录；用 ArchiveIndex 单独组合。

## 5. 事件与状态

- 无自定义事件；原生事件透传根。
- 状态：Default、Compact（size=sm）、Large（size=lg）。
- 无 hover/focus/disabled；交互由 actions 提供。
- 不自动播报。

## 6. 视觉

- 编号使用 numeric 字体，字距略增；分类使用 Tag/ArchiveLabel；日期使用 numeric。
- 标题使用 display/heading；副标题使用 caption/secondary。
- 顶部元信息与标题之间用留白或细线分隔；不要过度装饰。
- 印章位于右上/右下，允许小角度旋转；不要与 actions 重叠。
- 不继承面板材质纹理（装饰/文字属于 L4，不叠加纸纹）。
- 大小随 size；窄屏由调用方隐藏次要字段或换行。

## 7. 组合与扩展

- 被 ArchivePanel 使用；也可独立放在 ArchiveCover 旁边形成自定义详情头部。
- actions 可放 Button/IconButton/DropdownMenu。
- 不提供 `badge`/`tag` 专用 props；classification 接收 ReactNode。
- 需要更多元信息时用 `meta` 自由组合，不无限增加字段。

## 8. 无障碍

- 根 `<header>`；标题是页面/区段标题，级别由 headingLevel 控制。
- 编号/分类/日期是文本，不使用背景图承载唯一信息。
- 印章文本可读；装饰性印章由调用方设 `decorative`。
- actions 必须是真实按钮/链接并具备名称。
- 视觉顺序与 DOM 阅读顺序一致；不要用 grid 把标题排到编号前面却保留错误 DOM 顺序。
- `header` 在 section/article 内是区段头部；独立使用时不要制造多余地标。

## 9. 示例

```tsx
<ArchiveHeader
  archiveNo="AR-1972-031"
  title="雨夜来信"
  subtitle="私人通信"
  classification={<Tag tone="gold">机密</Tag>}
  date="1972-11-03"
  stamp={<ArchiveStamp label="已归档" />}
  actions={<DropdownMenu ... />}
  headingLevel={2}
/>
```

## 10. 边界情况

- `title` 为空：开发环境报错；头部失去语义。
- 所有元信息为空：只渲染标题/副标题/操作。
- 超长标题：换行；actions 不被挤到不可点。
- 印章与 actions 同时存在：布局需留出两者空间；窄屏可把印章移到标题下方。
- 分类内容复杂（多标签）：由调用方控制数量；头部不应变成标签墙。
- 日期格式不一致：组件不格式化，调用方负责统一。
- 嵌套 header：不要嵌套；页面/区段各用一次。

## 11. 依赖与实现注意

- 无组件依赖；ArchivePanel 依赖本组件。
- 不硬编码字号；使用 HeadingLevel 与排版 Token。
- 不渲染材质；不占用 `::before`/`::after` 槽。
- 装饰印章的定位由父容器/本组件布局共同决定，需与视觉规范校准。
