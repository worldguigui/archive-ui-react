# Table

> 状态：草案（阶段一）· 需人工审核。M3 数据展示。

## 1. 职责

以行列展示结构化数据，支持列定义、自定义单元格、排序表头、行选择与加载/空状态。它解决的是“多字段数据需要对齐比较”的问题。

**使用场景**：档案清单、检索结果、管理列表、统计明细。
**不适用**：简单链接列表（用 List）；标签-值对（用 Descriptions）；层级数据（用 Tree）；时间序列（用 Timeline）。
**区别**：Table 是二维表格语义；List 是一维列表；Descriptions 是键值对。

## 2. 边界

- **不执行数据排序**；只表达表头排序状态并发出回调。服务端排序、分页、筛选由调用方负责。
- 不内置分页；与 Pagination 组合。
- 不内置虚拟滚动、列固定、列拖拽、列分组、展开行；等待独立需求。
- 不做单元格编辑；编辑表格另立组件。
- `onRowClick` 只是指针便利，不自动让行可键盘操作；键盘路径必须由单元格内的链接/按钮提供。

## 3. 类型与 Props

```tsx
import type { Align, Size } from '../api-conventions';
import type { MouseEvent, ReactNode, TableHTMLAttributes } from 'react';

export type TableKey = string | number;
export type SortDirection = 'asc' | 'desc';

export interface TableColumn<Row> {
  id: string;
  header: ReactNode;
  cell: (row: Row, rowIndex: number) => ReactNode;
  align?: Align;
  width?: number | string;
  minWidth?: number | string;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
}

export interface TableSort {
  columnId: string;
  direction: SortDirection;
}

export interface TableProps<Row>
  extends Omit<TableHTMLAttributes<HTMLTableElement>, 'children'> {
  columns: readonly TableColumn<Row>[];
  data: readonly Row[];
  rowKey: (row: Row, rowIndex: number) => TableKey;
  caption?: ReactNode;
  density?: Size;                         // 默认 md
  variant?: 'plain' | 'striped' | 'bordered'; // 默认 plain
  stickyHeader?: boolean;                 // 默认 false
  loading?: boolean;                      // 默认 false
  loadingText?: string;                   // 默认 '加载中'
  empty?: ReactNode;                      // 空数据插槽
  rowSelection?: 'none' | 'single' | 'multiple'; // 默认 none
  selectedKeys?: readonly TableKey[];
  defaultSelectedKeys?: readonly TableKey[];
  onSelectionChange?: (keys: TableKey[]) => void;
  sort?: TableSort | null;                // 受控排序状态
  onSortChange?: (sort: TableSort | null) => void;
  onRowClick?: (row: Row, event: MouseEvent<HTMLTableRowElement>) => void;
  getRowDisabled?: (row: Row) => boolean;
  getRowLabel?: (row: Row, rowIndex: number) => string;
  rowClassName?: (row: Row, rowIndex: number) => string | undefined;
}
```

## 4. 数据与渲染

- 列必须提供 `id`（唯一）与 `cell(row, index)`；不提供 `dataIndex` 魔法，避免不安全索引与嵌套路径歧义。
- `rowKey` 必填；重复 key 开发环境警告。
- 无列或 `columns=[]`：不渲染表头；仍渲染 caption/empty，警告。
- 排序：点击可排序表头发出 `onSortChange`；方向循环由调用方决定（建议 asc → desc → null）。组件只渲染 `aria-sort`，不改变数据顺序。
- 选择：
  - `multiple`：表头全选 Checkbox（支持 indeterminate），行 Checkbox；`selectedKeys` 受控 / `defaultSelectedKeys` 非受控。
  - `single`：行 Radio（内部 RadioGroup），无表头全选。
  - `getRowDisabled` 为真的行不可选。
  - `getRowLabel` 提供每行可访问名称；缺失时退回 `String(rowKey)` 并开发警告。
- 加载：保留表头与已有数据，显示轻量覆盖 + Spinner；`aria-busy`；不改变布局高度。
- 空：`data.length===0` 且非 loading 时，渲染跨列 `empty`；无 empty 时显示默认文本；`colSpan` 包含选择列。

## 5. 事件与状态

- `onSelectionChange`：选择变化后触发；只通知，受控模式不自行更新。
- `onSortChange`：可排序表头激活时触发；只通知。
- `onRowClick`：行点击；不自动阻止内部按钮/链接的冒泡，调用方在单元格内阻止。
- 状态：Default、Hover、Selected、Disabled（行/选择）、Focus-visible、Loading、Empty。
- 快速点击表头：以最后一次点击为准；不内置防抖。
- 排序与选择回调都可异步处理；组件不等待。

## 6. 视觉

- 表头使用 UI 字体、caption/label 角色；数据使用 UI 字体，数字使用 numeric 与右对齐建议。
- 表头底为 `bg-surface`，行分隔使用 hairline 结构线；`striped` 使用极轻交替底色。
- 行 hover 只在存在 `onRowClick` 或选择时出现；静态行不发光。
- 排序图标使用内部 chevron；未排序列不显示占位图标导致跳动。
- 选中行使用标记 + 背景/边框，不只靠颜色。
- 表格外层横向滚动；sticky header 需要背景与分隔线，避免内容透出。
- 不使用 film/paper 纹理；密集数据区材质等级 0–1。

## 7. 组合与扩展

- 与 Pagination 组合；分页在表格外，页码变化由数据层重新取数。
- 行操作：在单元格内放 IconButton + DropdownMenu；不要在整行 onClick 中处理。
- 空状态：传入 Empty；默认不回退到 Alert。
- 需要分组/树形数据时用 Tree 或分组行（V1 不做）。
- 不提供 renderRow；行结构由列定义与选择列决定。

## 8. 无障碍

- 原生 `<table>`；`<caption>` 可选但推荐；表头 `<th scope="col">`。
- 排序表头 `aria-sort="ascending" | "descending" | "none"`。
- 选择控件有可访问名称：行选择使用 `getRowLabel`；表头全选有名称（“选择全部”）。
- 行不可仅靠点击操作；键盘用户必须能通过单元格内链接/按钮完成动作。
- 加载时 `aria-busy`；Spinner 可 `aria-hidden` 由 Table 统一播报。
- 横向滚动容器可聚焦（`tabIndex=0` + aria-label），保证键盘可滚动。
- 不为静态行添加 `role="button"`。

## 9. 示例

```tsx
<Table
  caption="1972 年馆藏"
  data={records}
  rowKey={(row) => row.id}
  columns={[
    { id: 'no', header: '编号', cell: (r) => <span className="numeric">{r.no}</span> },
    { id: 'title', header: '标题', cell: (r) => r.title, sortable: true },
    { id: 'date', header: '日期', cell: (r) => r.date, align: 'end' },
    { id: 'actions', header: '操作', cell: (r) => <RowActions record={r} />, align: 'end' },
  ]}
  sort={sort}
  onSortChange={setSort}
  rowSelection="multiple"
  selectedKeys={selected}
  onSelectionChange={setSelected}
  getRowLabel={(r) => `选择 ${r.no}`}
  stickyHeader
/>
```

## 10. 边界情况

- 重复 rowKey：警告；选择状态可能错位。
- 重复 column id：警告；排序/aria 冲突。
- 空列/空单元格：`cell` 返回 null 合法；单元格留空但不破坏布局。
- 超长单元格：默认换行；横向溢出由列宽/滚动处理。
- 大量数据：不虚拟化，性能由调用方负责；文档明确上限不承诺。
- 选择项在数据刷新后消失：调用方负责清理 selectedKeys；组件不自动裁剪。
- 排序状态指向不存在的列：忽略 `aria-sort`，警告。
- 受控选择不更新：界面不变；回调已发。
- 加载中切换数据：以最新 data 为准；不保留旧行选择。
- 无 `onRowClick` 但 cursor pointer 由 className 添加：组件不阻止，但属于调用方选择。

## 11. 依赖与实现注意

- 依赖 Checkbox、RadioGroup/Radio、Spinner；不依赖 Empty/Pagination。
- 泛型 Table 的 `forwardRef` 需使用带泛型签名的组件接口并在内部断言；公共类型不得出现 `any`。
- 列宽使用 `<col>` 或单元格样式；sticky 表头需要正确 background 与层级。
- 移动端不自动改变表格结构；横向滚动或调用方换用 List。
- 不在组件内做排序，避免与服务端/分页产生双重事实来源。
