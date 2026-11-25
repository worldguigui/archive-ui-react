# ArchivePanel

> 状态：草案（阶段一）· 需人工审核。M4 档案特色组件。

## 1. 职责

档案卷宗/章节容器：在 Panel 的表面能力之上，增加档案编号、标题、分类、日期、印章、操作与页脚等结构。它解决的是“整份卷宗需要稳定的档案头部与容器语义”的问题。

**使用场景**：卷宗详情页、档案章节、档案室分区、完整档案内容。
**不适用**：档案网格条目（用 ArchiveCard）；通用区域（用 Panel）；纯封面展示（用 ArchiveCover）。
**区别**：ArchivePanel 是卷宗级容器；ArchiveCard 是记录卡片；Panel 是无档案语义的通用区域。

## 2. 边界

- 不内置内容分栏、侧栏、目录；ArchiveIndex 由 children/footer 组合。
- 不内置折叠/展开；需要时用 Accordion。
- 不格式化日期/编号；日期为 ReactNode，编号为字符串。
- 不内置点击/路由；操作由 actions 提供。
- 默认 paper 材质，但允许 plain；film 仅用于展示型卷宗（长正文禁用）。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `archiveNo` | `string` | **必填** | 档案编号 |
| `title` | `ReactNode` | **必填** | 卷宗标题 |
| `subtitle` | `ReactNode` | — | 副标题/系列 |
| `classification` | `ReactNode` | — | 分类/密级 |
| `date` | `ReactNode` | — | 日期展示 |
| `meta` | `ReactNode` | — | 额外头部元信息 |
| `stamp` | `ReactNode` | — | 印章槽 |
| `actions` | `ReactNode` | — | 头部操作 |
| `footer` | `ReactNode` | — | 页脚/索引/编号信息 |
| `children` | `ReactNode` | — | 内容 |
| `material` | `SurfaceMaterial` | `'paper'` | 材质 |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | 内容留白 |
| `bordered` | `boolean` | `true` | 边框 |
| `elevation` | `'none' \| 'soft' \| 'deep'` | `'soft'` | 阴影 |
| `corners` | `boolean` | `false` | 四角装饰（过渡 API） |
| `headingLevel` | `HeadingLevel` | `2` | 标题级别 |
| `textureIntensity` / `lightingIntensity` | `number` | `1` | 0–2 强度 |

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import type { HeadingLevel, SurfaceMaterial } from '../api-conventions';

export interface ArchivePanelProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  archiveNo: string;
  title: ReactNode;
  subtitle?: ReactNode;
  classification?: ReactNode;
  date?: ReactNode;
  meta?: ReactNode;
  stamp?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  material?: SurfaceMaterial;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  bordered?: boolean;
  elevation?: 'none' | 'soft' | 'deep';
  corners?: boolean;
  headingLevel?: HeadingLevel;
  textureIntensity?: number;
  lightingIntensity?: number;
}
```

## 4. 事件与状态

- 无自定义事件；原生事件透传根 `<section>`。
- 状态：Default、Hover（仅显式 interactive？本组件不提供 interactive，静态容器不发光）。
- 无 disabled/loading；加载用 Skeleton，空内容用 Empty。
- 折叠/展开由 Accordion 或调用方状态实现。

## 5. 视觉

- 默认 paper 材质；头部包含编号（numeric）、标题（display）、分类/日期（meta）、印章（右上/右下）、操作。
- 头部与正文之间用蚀刻线或结构线分隔；页脚使用 UI/caption 字体。
- 印章与装饰克制：一个卷宗通常只盖一个章；不要每段都加纹样。
- `corners` 为过渡装饰；正式 decoration API 立项后迁移。
- film 材质只用于展示型卷宗封面/海报位，不用于长正文。
- 同页多个 ArchivePanel 时只允许一个视觉主角（强调色）。

## 6. 组合与扩展

- 内部头部由 ArchiveHeader 实现；也可通过 `meta`/`stamp`/`actions` 扩展。
- 目录/索引：在 children 中放 ArchiveIndex，或在 footer 放编号信息；不提供 `index` prop，避免布局假设。
- 内容可自由组合 Table、Descriptions、Timeline、Alert 等。
- 需要单条记录卡片用 ArchiveCard，不把 ArchivePanel 塞进网格。
- 需要侧栏布局时由调用方 CSS Grid 组合，不扩展组件。

## 7. 无障碍

- 根 `<section>`；标题渲染为 `h{headingLevel}`，并作为 `aria-labelledby`。
- 编号、分类、日期必须为可读文本；不能只使用图形/颜色。
- 印章文本可读；装饰性印章 `aria-hidden`。
- actions 是真实按钮/链接；不要用 div 伪装。
- footer 是 `<footer>`；不要重复过多 landmark。
- 角饰/纹样 `aria-hidden`。

## 8. 示例

```tsx
<ArchivePanel
  archiveNo="AR-1972-031"
  title="雨夜来信"
  classification={<Tag tone="gold">机密</Tag>}
  date="1972-11-03"
  stamp={<ArchiveStamp label="已归档" tone="accent" rotate={-4} />}
  actions={<Button size="sm">编辑</Button>}
  footer="最后复核：1984-06-17"
  corners
>
  <Descriptions items={metadata} />
  <ArchiveIndex ... />
</ArchivePanel>
```

## 9. 边界情况

- `archiveNo` 或 `title` 为空：开发环境警告/报错；档案容器缺少核心语义。
- 无 footer：不渲染页脚。
- 无 stamp/actions：头部保持对齐，不留下空洞占位。
- 超长标题/分类：换行；操作按钮不被挤压到不可用。
- 嵌套 ArchivePanel：不建议；如需嵌套，内层必须降 plain 并减少装饰。
- paper 嵌套 paper：纹理叠加过重；内层降级由调用方负责。
- film 材质 + 长正文：文档禁止；不强制运行时报错。
- `corners` 与无边框组合：角饰可能悬空，需视觉确认。
- 强度越界：钳制并警告。

## 10. 依赖与实现注意

- 依赖 Panel（表面）、ArchiveHeader（头部）；不依赖 ArchiveCard/Cover。
- 不复制 Panel 的全部实现；通过组合/共享 Surface 机制。
- 默认 headingLevel 2，适合页面级卷宗；嵌套章节由调用方调整。
- 不硬编码编号/日期格式；保持展示由调用方控制。
