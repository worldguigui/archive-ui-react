# Typography

> 状态：草案（阶段一）· 需人工审核。M1 基础组件。

## 1. 职责

统一文字角色与层级的排版组件，把已冻结的四类字体、字号、字距、行高映射为有限变体。它不是为了给每个文字加 class，而是为了防止组件库与业务页面各自发明标题层级。

**使用场景**：标题、正文、说明、标签、编号、展示性文字。
**不适用**：表单控件内部文字（由控件自身管理）；需要复杂富文本排版的长文档（使用 prose 样式或业务层）；图标（不是文字）。
**设计依据**：design-system 维度 05；四字体角色与五档字号。

## 2. 边界

- Typography 不提供颜色主题之外的装饰（边框、背景、材质）。
- 不提供任意字号/字重/行高数值；只使用 Token 变体，防止视觉漂移。
- 不自动生成语义标签；`as` 由调用方选择，组件只给默认映射。
- 与 FormField.Label 的区别：FormField.Label 负责表单关联，Typography 不负责。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `variant` | `'display' \| 'heading' \| 'title' \| 'body' \| 'caption' \| 'label' \| 'numeric'` | `'body'` | 字体角色 + 字号 + 行高组合 |
| `as` | 元素联合 | 按 variant 映射 | 语义标签；覆盖默认 |
| `tone` | `'primary' \| 'secondary' \| 'accent' \| 'gold'` | `'primary'` | 文本颜色 |
| `align` | `'start' \| 'center' \| 'end' \| 'justify'` | `'start'` | 文本对齐 |
| `weight` | `'regular' \| 'bold'` | 按 variant | 字重 |
| `italic` | `boolean` | `false` | 斜体 |
| `truncate` | `boolean \| number` | `false` | `true` 单行省略；数字为多行 clamp |
| `children` | `ReactNode` | — | 文本内容 |

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import type { Align } from '../api-conventions';

export type TypographyVariant =
  | 'display' | 'heading' | 'title' | 'body' | 'caption' | 'label' | 'numeric';

export type TypographyElement =
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'p' | 'span' | 'div' | 'blockquote' | 'figcaption' | 'time' | 'label';

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  as?: TypographyElement;
  tone?: 'primary' | 'secondary' | 'accent' | 'gold';
  align?: Align | 'justify';
  weight?: 'regular' | 'bold';
  italic?: boolean;
  truncate?: boolean | number;
  children?: ReactNode;
}
```

## 4. 默认映射

| variant | 字体角色 | 字号/行高 | 默认标签 |
| --- | --- | --- | --- |
| display | display | 3rem / tight，字距 display | `h1` |
| heading | display | 1.75rem / tight，字距 heading | `h2` |
| title | display | 1.25rem / tight，字距 heading | `h3` |
| body | editorial | 0.9375rem / editorial | `p` |
| caption | editorial | 0.75rem / normal | `span` |
| label | ui | 0.75rem，字距 label | `span` |
| numeric | numeric | 0.9375rem / normal，等宽 | `span` |

`as` 可覆盖默认；标题层级由页面结构决定，组件不校验层级跳跃。

## 5. 事件与状态

无交互状态。`onClick` 等原生事件可通过 HTML 属性透传，但 Typography 不因此变成按钮；若需要点击，使用 Button 或链接。

## 6. 视觉

- 只使用四个字体角色的 Token；不得用 `font-family` 内联覆盖。
- `tone="accent"` / `"gold"` 用于强调；正文区域不得整段使用强调色。
- `numeric` 开启等宽数字（`font-variant-numeric: tabular-nums`），用于编号、时间、统计。
- `truncate` 使用 CSS 单行/多行省略；不截断到 DOM 中丢失内容，完整文本仍可由屏幕阅读器读取。
- 不支持渐变文字、描边字、阴影文字。

## 7. 组合与扩展

- 可嵌套在其他组件中；组件不强制任何外边距，由布局控制。
- 不提供 `asChild`、不提供 render prop。
- 需要复杂排版（首字下沉、分栏、旁注）时，在业务层用 className 组合多个 Typography 或直接写结构化 HTML；不扩展成 RichText 组件。

## 8. 无障碍

- 标题必须用真实标题标签（`as="h2"` 等），不要用样式伪造。
- 不跳过标题层级是调用方责任，文档给出建议。
- `truncate` 不得隐藏唯一必要信息；需要时提供 `title` 或可聚焦/可读全文的入口。
- `label` variant 只是视觉标签；表单标签必须使用 FormField.Label 或原生 `<label>`。
- 斜体不用于大段中文正文，避免可读性下降。

## 9. 示例

```tsx
<Typography variant="display" as="h1">ARCHIVE</Typography>
<Typography variant="heading" as="h2" tone="gold">卷宗目录</Typography>
<Typography variant="body">正文使用编辑衬线，保持杂志式阅读节奏。</Typography>
<Typography variant="caption" tone="secondary">最后修订：1972-11-03</Typography>
<Typography variant="numeric" as="time" dateTime="1972-11-03">1972.11.03</Typography>
<Typography variant="body" truncate={2}>超长摘要……</Typography>
```

## 10. 边界情况

- 空 children：渲染空元素，不报错；布局占位由调用方控制。
- 超长无空格文本：由 CSS `overflow-wrap` 处理，不横向撑破容器。
- `truncate` 为 0 或负数：视为 `false`，开发环境警告。
- `as` 与 variant 语义冲突（如 display + span）：允许，但文档提示标题语义缺失。
- 嵌套 Typography：禁止改变外层排版的外边距；组件自身不设 margin。

## 11. 依赖与实现注意

- 无组件依赖；只消费字体与颜色 Token。
- 默认标签映射见 §4；实现时需保证 `ref` 指向实际元素。
- 不提供 size prop；不要用 `size` 与 `variant` 两套重叠 API。
- 若未来引入自带字体，Typography 不需要 API 变化，只改 Token。
