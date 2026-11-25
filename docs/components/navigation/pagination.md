# Pagination

> 状态：草案（阶段一）· 需人工审核。M3 导航组件。

## 1. 职责

在大数据集的分页视图中切换页码。它解决的是“数据量超过一屏，需要分段浏览”的问题。

**使用场景**：表格、档案列表、检索结果。
**不适用**：步骤流程（用 Steps）；标签视图（用 Tabs）；单页内容锚点导航（用目录/ArchiveIndex）。
**区别**：Pagination 操作数据集页；Steps 表达流程；Breadcrumb 表达层级。

## 2. 边界

- 不加载数据、不做排序/筛选；只发页码变化。
- 不内置每页条数选择；`pageSize` 由调用方控制。
- 不内置虚拟滚动；大数据集性能由数据层解决。
- 不自动修正父级的越界页码（避免渲染期副作用）；只做视觉钳制并警告。
- 不提供“跳至页码”输入框；等待独立需求。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `total` | `number` | **必填** | 总条数，≥0 |
| `pageSize` | `number` | **必填** | 每页条数，>0 |
| `page` | `number` | — | 受控页码，1 起 |
| `defaultPage` | `number` | `1` | 非受控初值 |
| `onPageChange` | `(page: number) => void` | — | 用户切换页码 |
| `siblingCount` | `number` | `1` | 当前页左右页数 |
| `boundaryCount` | `number` | `1` | 首尾页数 |
| `disabled` | `boolean` | `false` | 整体禁用 |
| `showFirstLast` | `boolean` | `false` | 显示首页/末页按钮 |
| `showTotal` | `boolean \| (total, range) => ReactNode` | `false` | 总条数/范围显示 |
| `size` | `Size` | `'md'` | 按钮尺寸 |
| `labels` | `PaginationLabels` | 中文默认 | 箭头/地标名称 |

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import type { Size } from '../api-conventions';

export interface PaginationLabels {
  navigation: string;
  previous: string;
  next: string;
  first: string;
  last: string;
  page: (page: number) => string;
}

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  total: number;
  pageSize: number;
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  siblingCount?: number;
  boundaryCount?: number;
  disabled?: boolean;
  showFirstLast?: boolean;
  showTotal?: boolean | ((total: number, range: [number, number]) => ReactNode);
  size?: Size;
  labels?: Partial<PaginationLabels>;
}
```

## 4. 页码计算

- `pageCount = Math.max(1, Math.ceil(total / pageSize))`。
- `total=0` 时仍显示 1 页，但所有页码置灰并禁用（没有可浏览数据）；范围显示 `[0, 0]`。
- 当前页钳制到 `1..pageCount`；受控值越界时只影响显示，开发环境警告，不自动回调。
- 范围：`start = total === 0 ? 0 : (page - 1) * pageSize + 1`，`end = Math.min(page * pageSize, total)`。
- 省略号不是按钮；点击省略号不跳转（不内置跳页）。
- 页码按钮数量受 `siblingCount` / `boundaryCount` 控制；极端参数可能导致重叠，需去重。

## 5. 事件与状态

- 点击页码/上一页/下一页/首页/末页：若目标页与当前不同且未禁用，触发 `onPageChange`。
- 受控模式不自行更新；非受控内部更新。
- 状态：Active（当前页）、Disabled（边界/整体）、Hover、Focus-visible。
- 当前页按钮 `aria-current="page"`，且不触发重复回调。
- 快速连点：以最后一次点击为准；不排队请求。

## 6. 视觉

- 页码按钮为方形/圆角小按钮；当前页使用边框 + 古金/主文本，不只靠底色。
- 上一页/下一页使用 IconButton，禁用状态明确；必须提供文本名称（labels）。
- 省略号使用低对比文本，不响应点击。
- `showTotal` 使用 caption/secondary 文本，靠余量放置。
- 不使用纸面纹理；属于密集数据导航。
- 窄屏可减少可见页码；组件不内置断点。

## 7. 组合与扩展

- 与 Table 组合时，分页在表格外；Table 不内置分页。
- 每页条数选择由调用方用 Select 组合，改变 pageSize 时通常重置到第 1 页（调用方负责）。
- 不提供跳页输入；需要时在旁组合 FormField/Input。
- 不把 Pagination 用作 Steps 或 Tab。

## 8. 无障碍

- 根 `<nav aria-label={labels.navigation}>`。
- 页码使用按钮；当前页 `aria-current="page"`。
- 上一页/下一页/首页/末页必须有名称；图标 `aria-hidden`。
- 省略号 `aria-hidden` 或带“更多页”文本但不聚焦。
- 禁用按钮使用原生 disabled；不要只加颜色。
- 不实现方向键网格；Tab 顺序即可。
- `showTotal` 文本不应重复播报每个页码；保持简洁。

## 9. 示例

```tsx
<Pagination total={1240} pageSize={20} defaultPage={1} onPageChange={setPage} />
<Pagination total={0} pageSize={20} showTotal />
<Pagination
  total={1240}
  pageSize={20}
  page={page}
  onPageChange={setPage}
  showFirstLast
  showTotal={(total, [start, end]) => `${start}–${end} / ${total}`}
/>
```

## 10. 边界情况

- `pageSize <= 0` / `NaN`：开发环境警告，按 1 处理；可能产生巨大页数。
- `total < 0`：按 0 处理。
- `page` 越界：显示钳制页并警告；不回调。
- `pageCount=1`：所有导航按钮禁用；仍显示第 1 页。
- `siblingCount` / `boundaryCount` 过大：去重页码，省略号可能消失；仍保持顺序。
- 快速点击不同页：调用方负责取消过期请求。
- 受控 page 不更新：界面停留在原页。
- 省略号出现在首尾：应避免；实现时折叠算法需保证边界页可见。

## 11. 依赖与实现注意

- 依赖 IconButton；不依赖 Select。
- 折叠页码算法需单测：首页/末页/当前页相邻/仅 1 页/总数 0。
- 不把页码按钮做成链接；分页是状态变化，不是独立 URL（路由同步由调用方完成）。
- 不硬编码按钮尺寸；使用 size 与间距 Token。
