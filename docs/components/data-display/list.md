# List

> 状态：草案（阶段一）· 需人工审核。M3 数据展示。

## 1. 职责

以行展示一组同构内容，支持前导/尾随内容与链接项。它解决的是“简单集合的阅读与跳转”问题。

**使用场景**：档案条目、最近打开、通知列表、目录、链接集合。
**不适用**：需要列对齐/排序（用 Table）；需要多选（用 Checkbox + 自定义列表）；命令菜单（用 Menu）；层级数据（用 Tree）。
**区别**：List 是展示型；Table 是二维数据；Menu 有菜单语义；Tree 有层级与独立键盘模型。

## 2. 边界

- 不提供单选/多选/listbox 语义；不做 roving focus。
- 不提供行点击回调；只有 `href` 的项成为链接。需要按钮行时由调用方在行内放按钮。
- 不做虚拟滚动；超长列表由调用方接管。
- 不提供分组、拖拽、排序、展开。
- 不内置 Empty 组件；提供 `empty` 插槽。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `items` | `ListItemData[]` | **必填** | 列表数据 |
| `variant` | `'plain' \| 'divided' \| 'bordered'` | `'divided'` | 分隔样式 |
| `size` | `Size` | `'md'` | 行高/字号等级 |
| `empty` | `ReactNode` | — | 空数据内容 |
| `aria-label` | `string` | — | 列表名称（原生属性） |

```tsx
import type { HTMLAttributes, MouseEventHandler, ReactNode } from 'react';
import type { Size } from '../api-conventions';

export interface ListItemData {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  href?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  selected?: boolean;
  disabled?: boolean;
}

export interface ListProps extends Omit<HTMLAttributes<HTMLUListElement>, 'children'> {
  items: readonly ListItemData[];
  variant?: 'plain' | 'divided' | 'bordered';
  size?: Size;
  empty?: ReactNode;
}
```

## 4. 结构

- 根 `<ul>`；每项 `<li>`。
- 有 `href` 且未 disabled：渲染 `<a>` 作为行内容。
- 有 `href` 且 disabled：渲染 `<span aria-disabled="true">`，不可聚焦，不触发点击。
- 无 href：渲染 `<div>`/`<span>` 内容；`onClick` 不生效（避免伪造按钮语义）。
- leading / title / description / trailing 在行内按固定顺序布局；不提供任意插槽。
- `empty` 仅在 `items.length === 0` 时渲染；不渲染空 `<ul>` 行。

## 5. 事件与状态

- 链接项：原生点击与键盘 Enter；`onClick` 由调用方决定是否 preventDefault 接入路由。
- 非链接项：无点击行为。
- 状态：Default、Hover（链接）、Focus-visible（链接）、Selected、Disabled（链接）。
- `selected` 是视觉状态；需要 `aria-current="page"` 时由调用方通过链接语义获得？V1 组件在项选中时给链接加 `aria-current="page"`，文档明确。
- 无受控选择状态。

## 6. 视觉

- 行内 leading 图标/头像，title 主文本，description 次级，trailing 元信息/操作。
- `divided` 使用结构线；`bordered` 外层边框；`plain` 无分隔。
- 链接 hover 背景轻提亮 + 边框/文字变化；selected 使用古金/锈橙标记 + 背景，不只靠颜色。
- 行高随 size；description 可换行。
- 不使用 paper/film 强纹理；List 属于中高密度区域。

## 7. 组合与扩展

- 前导头像用 Avatar；trailing 操作可用 IconButton/DropdownMenu，但交互元素不得嵌套在链接内。
- 需要多选/单选时，调用方用 Checkbox/Radio 作为 leading，并自行管理状态；List 不提供 selection API。
- 空状态用 Empty 传入 `empty`，或在外层条件渲染。
- 需要列对齐或排序时使用 Table。

## 8. 无障碍

- 根 `<ul>`；项 `<li>`；链接 `<a>`。
- 列表名称可选；多组列表建议 aria-label/labelledby。
- 链接项必须有可读文本；不能只有图标。
- trailing 中的按钮不得嵌套在 `<a>` 内；必须放在链接外。
- disabled 链接不使用 `href`；使用 `aria-disabled` 且不可聚焦。
- selected 的 `aria-current` 语义需由组件固定；不要只改颜色。
- 不做方向键导航；Tab 顺序为链接顺序。

## 9. 示例

```tsx
<List
  aria-label="最近档案"
  items={[
    { id: '1', title: '雨夜来信', description: 'AR-1972-031', href: '/a/1', leading: <Avatar name="信件" /> },
    { id: '2', title: '潮汐记录', description: 'AR-1972-044', href: '/a/2', selected: true },
    { id: '3', title: '已封存', disabled: true },
  ]}
/>

<List items={[]} empty={<Empty title="暂无档案" />} />
```

## 10. 边界情况

- 空 items 且有 empty：渲染 empty；无 `<ul>` 空壳。
- 空 items 且无 empty：渲染空 ul，开发环境警告。
- 重复 id：开发环境警告；key 冲突。
- 超长标题/描述：换行；trailing 固定不被挤压到不可用。
- 链接嵌套按钮：不合法；文档禁止，组件不自动拆分。
- `onClick` 无 href：忽略并警告（避免无声按钮）。
- `selected` 只在链接项上有可访问语义；非链接项仅视觉，调用方需补充语义。多个 selected 会导致多个 `aria-current="page"`，开发环境警告；一个列表最多一个当前项。
- 图片/头像失败：由子组件回退，不影响行布局。

## 11. 依赖与实现注意

- 无组件依赖；不依赖 Empty/Table。
- 行布局使用 CSS Grid/Flex；不硬编码宽度。
- 不为 List 添加 listbox role；保持列表语义。
- hover 只在链接/可交互项出现；静态项不出现假 affordance。
