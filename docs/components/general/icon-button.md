# IconButton

> 状态：草案（阶段一）· 需人工审核。M1 基础组件。

## 1. 职责

只有一个图标的紧凑操作按钮。它解决的是工具栏、对话框关闭、分页箭头等“空间有限但操作重要”的场景；可访问名称由调用方以文本提供，不能靠图形猜谜。

**使用场景**：工具栏、关闭按钮、翻页、日期切换、紧凑操作区。
**不适用**：有可见文字的按钮（用 Button）；装饰图标（用普通 span）；导航入口（用链接/菜单）。
**区别**：Button 有可见标签；IconButton 无可见标签，因此 `aria-label` 必填。

## 2. 边界

- 不内置图标集；图标由 `children` 提供。
- 不内置 Tooltip。需要悬浮提示时由调用方组合 `<Tooltip trigger={<IconButton .../>}>说明</Tooltip>`；不得依赖 Tooltip 获得可访问名称。
- 不提供 `href`；导航型图标入口应使用 `<a>` 或 NavigationMenu。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `aria-label` | `string` | **必填** | 可访问名称；TypeScript 强制 |
| `children` | `ReactNode` | **必填** | 图标内容，通常为 SVG |
| `variant` | `'solid' \| 'outline' \| 'ghost'` | `'ghost'` | 不含 `link`（无文本可链接） |
| `tone` | `AccentTone \| 'danger'` | `'neutral'` | 颜色语义 |
| `size` | `Size` | `'md'` | 与 Button 相同高度 |
| `shape` | `'square' \| 'circle'` | `'square'` | 外轮廓 |
| `disabled` | `boolean` | `false` | 原生 disabled |
| `loading` | `boolean` | `false` | 显示 Spinner，阻止激活 |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | 原生语义 |

```tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { AccentTone, Size } from '../api-conventions';

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  'aria-label': string;
  children: ReactNode;
  variant?: 'solid' | 'outline' | 'ghost';
  tone?: AccentTone | 'danger';
  size?: Size;
  shape?: 'square' | 'circle';
  loading?: boolean;
}
```

## 4. 事件与状态

- `onClick` 原生；`disabled` 或 `loading` 时不触发。
- 状态：Default、Hover、Focus-visible、Active、Disabled、Loading。
- Loading 保留焦点，设置 `aria-busy` 与 `aria-disabled`；不设置原生 disabled。

## 5. 视觉

- 尺寸与 Button 对齐；圆形与方形只改变外轮廓，不改变命中区。
- ghost 为默认：无边框，hover 出现表面色；outline/solid 供强调操作。
- 图标尺寸随 size 缩放（建议 16 / 18 / 20），不得通过外部 font-size 意外改变布局。
- 图标默认 `aria-hidden="true"`；仅图标本身不提供名称。

## 6. 组合与扩展

- 图标由调用方传入，可自由使用已有 SVG；组件不管理图标颜色，使用 `currentColor`。
- 与 Tooltip 组合时，Tooltip 只作补充说明，不替代 `aria-label`。
- 不提供 `icon` prop，避免与 children 双重入口。

## 7. 无障碍

- `aria-label` 必填且必须有意义（“关闭”而不是“按钮”）。
- 图标 `aria-hidden`，避免重复播报。
- focus-visible 与 Button 一致。
- 触摸目标至少 44×44px；视觉尺寸 32/40/48 时通过内边距扩大命中区。
- 禁用态不可读或不可聚焦时，调用方应提供替代说明。

## 8. 示例

```tsx
<IconButton aria-label="关闭档案" onClick={close}>
  <CloseIcon />
</IconButton>

<Tooltip trigger={<IconButton aria-label="上一页" variant="outline"><ChevronLeft /></IconButton>}>
  上一页
</Tooltip>

<IconButton aria-label="删除记录" tone="danger" loading>
  <TrashIcon />
</IconButton>
```

## 9. 边界情况

- 多个图标同时传入：children 只渲染一个根节点；开发环境建议警告。
- 空 children：编译期允许但视觉为空；必须有 aria-label，仍建议开发期警告。
- `loading` 时图标隐藏，尺寸保持不变，避免布局跳动。
- `shape="circle"` 但高度不等于宽度时由组件强制为正方形；调用方无法制造椭圆。
- 触摸与鼠标点击都使用原生 button 行为；不实现长按。

## 10. 依赖与实现注意

- 依赖 Button 的视觉/状态基础或共享样式；依赖 Spinner。
- 不依赖 Tooltip，避免低层组件反向依赖浮层组件。
- 图标颜色使用 `currentColor`，不硬编码。
- `danger` tone 等待状态 Token；当前不得以 accent 冒充。
