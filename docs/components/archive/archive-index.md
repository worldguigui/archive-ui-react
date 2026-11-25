# ArchiveIndex

> 状态：草案（阶段一）· 需人工审核。M4 档案特色组件。

## 1. 职责

编目索引/目录：以编号、层级、定位符与引导线组织可定位的条目。它解决的是“档案卷宗需要目录式导航，而普通列表无法表达编号与层级”的问题。

**使用场景**：卷宗目录、档案分类索引、章节导航、展览图录。
**不适用**：数据表格（用 Table）；普通链接列表（用 List）；时间序列（用 Timeline）；步骤流程（用 Steps）。
**区别**：ArchiveIndex 是静态目录/索引；List 无编号/定位语义；Table 是二维数据。

## 2. 边界

- 只读；不提供编辑、排序、筛选、拖拽。
- 不自动从标题生成目录；entries 由调用方提供。
- 层级通过 `level` 表达视觉缩进；V1 不构建嵌套列表语义。
- 不处理路由；`href` / `active` 由调用方提供。
- 不提供折叠/展开；需要时用 Accordion 包裹多个索引。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `entries` | `ArchiveIndexEntry[]` | **必填** | 索引条目 |
| `title` | `ReactNode` | — | 索引标题 |
| `variant` | `'plain' \| 'dotted' \| 'numbered'` | `'dotted'` | 引导线/编号样式 |
| `size` | `'sm' \| 'md'` | `'md'` | 尺寸/间距 |
| `headingLevel` | `HeadingLevel` | `4` | 标题级别 |
| `aria-label` | `string` | — | 导航名称；有 title 时可用 labelledby |

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import type { HeadingLevel } from '../api-conventions';

export interface ArchiveIndexEntry {
  id: string;
  label: ReactNode;
  number?: string;      // 编号，如 “01” / “A-12”
  locator?: string;     // 页码/位置
  level?: number;       // 0 起，视觉缩进
  href?: string;
  active?: boolean;
}

export interface ArchiveIndexProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'title'> {
  entries: readonly ArchiveIndexEntry[];
  title?: ReactNode;
  variant?: 'plain' | 'dotted' | 'numbered';
  size?: 'sm' | 'md';
  headingLevel?: HeadingLevel;
}
```

## 4. 结构

- 根 `<nav class="au-archive-index">`；有 title 时 `aria-labelledby` 指向标题，否则需 `aria-label`（开发环境警告）。
- 标题渲染为 `h{headingLevel}`。
- 条目 `<ol>`；每项 `<li>`。
- 条目布局：number（numeric，可选） + label + 引导线（CSS） + locator（numeric）。
- 有 href：label 渲染 `<a>`；active 加 `aria-current="page"`。
- 无 href：渲染文本；active 仍可视觉标记，但无导航语义。
- `level` 只做视觉缩进，不超过 4 级建议；负值按 0。
- `variant` 只影响视觉：`plain` 无引导线，`dotted` 点线，`numbered` 强调编号。
- 空 entries：不渲染列表，警告。

## 5. 事件与状态

- 只有链接原生的点击/键盘事件；无自定义回调。
- 状态：Default、Hover（链接）、Focus-visible、Active（当前项）。
- 无受控状态；active 由数据决定。
- 不自动滚动到 active 项。

## 6. 视觉

- 编号/定位符使用 numeric 字体，右对齐/等宽；标题使用 title/heading。
- 引导线使用定位线 Token，长度随内容弹性；不要盖过文字。
- 缩进层级用左内边距递增；层级不宜超过 4 级。
- active 使用古金/锈橙标记 + 字重，不只靠颜色。
- 不使用 paper/film 纹理；索引属于信息密集区。
- 索引标题与条目之间可有一条结构线；不堆叠装饰。

## 7. 组合与扩展

- 可作为 ArchivePanel 的 children 或侧栏内容；不提供 `index` prop 强制布局。
- 需要折叠分组时，用 Accordion + 多个 ArchiveIndex。
- 需要二维数据时用 Table；不要给 ArchiveIndex 增加排序/筛选。
- 需要页码跳转时，href 使用锚点（如 `#page-12`）；组件不处理滚动。

## 8. 无障碍

- 根 `<nav>` 必须有名称；有 title 时用 aria-labelledby，否则 aria-label。
- 条目为有序列表；顺序即阅读顺序。
- 当前项 `aria-current="page"`（仅链接项）；无链接的 active 用文本/视觉说明。
- 编号与定位符是文本，不是背景图；屏幕阅读器可读。
- 缩进是视觉，不替代层级语义；V1 不声明 aria-level，文档明确“扁平索引”。
- 链接文本必须表达目标；不要只有编号。
- 不实现方向键；Tab 顺序即链接顺序。

## 9. 示例

```tsx
<ArchiveIndex
  title="卷宗目录"
  entries={[
    { id: 'a', number: '01', label: '来源说明', href: '#origin' },
    { id: 'b', number: '02', label: '保存状况', href: '#condition', level: 1 },
    { id: 'c', number: '03', label: '数字化记录', href: '#digitization', active: true },
  ]}
/>
```

## 10. 边界情况

- 空 entries：不渲染；警告。
- 重复 id：key 冲突；警告。
- `level` 跳跃（0→3）：视觉缩进不连续；允许但建议调用方保持层级连贯。
- 超长 label：换行；引导线不挤占文字。
- 无 number/locator：只显示 label，布局仍对齐。
- active 项无 href：允许；但导航语义缺失，建议提供链接。
- 多个 ArchiveIndex：各自需要名称；避免 page 级重复 landmark。
- 索引与标题重复：不要在 Panel 标题和索引标题重复同一文案。

## 11. 依赖与实现注意

- 无组件依赖。
- 引导线使用伪元素/CSS，不占用材质槽；索引无材质。
- 不自动生成 id/锚点；由调用方提供。
- 不硬编码编号格式；number 是字符串。
