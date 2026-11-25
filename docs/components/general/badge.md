# Badge

> 状态：草案（阶段一）· 需人工审核。M1 基础组件。

## 1. 职责

显示数量或圆点状态的轻量标记，可独立显示，也可附着在图标、头像等内容右上角。它解决的是“在不打断主内容的情况下提示新消息/数量/在线状态”的问题。

**使用场景**：未读计数、在线/离线圆点、状态角标、列表项数量。
**不适用**：分类标签（用 Tag）；需要点击关闭的标记（用 Tag）；页面级警告（用 Alert）；进度（用 Progress）。
**区别**：Badge 是状态/计数标记；Tag 是内容标签，可移除；二者不合并。

## 2. 边界

- Badge 不负责定位所属内容；只有提供 `children` 时才渲染包装层并定位到右上角。
- Badge 不是按钮，不可点击；需要点击的行为由外层元素提供。
- 不内置动画（脉冲、跳动）；状态变化由调用方控制。
- 不承担“错误提示文字”的职责；需要文字说明时用 Alert。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `count` | `number` | — | 计数；非整数向下取整 |
| `max` | `number` | `99` | 超过时显示 `{max}+` |
| `showZero` | `boolean` | `false` | `count=0` 是否显示 |
| `dot` | `boolean` | `false` | 圆点模式；与 count 互斥，dot 优先 |
| `tone` | `FeedbackTone` | `'neutral'` | 视觉语义；status tone 待 Token |
| `size` | `'sm' \| 'md'` | `'md'` | 标记尺寸；不与控件 Size 完全同义 |
| `label` | `string` | — | 可访问描述；dot 模式必填，count 模式用于补充语义 |
| `children` | `ReactNode` | — | 被标记的内容；提供时启用附着布局 |

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import type { FeedbackTone } from '../api-conventions';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  count?: number;
  max?: number;
  showZero?: boolean;
  dot?: boolean;
  tone?: FeedbackTone;
  size?: 'sm' | 'md';
  label?: string;
  children?: ReactNode;
}
```

## 4. 事件与状态

无交互事件、无 hover/focus 状态。计数变化时不得自动播报；需要播报时由调用方在合适的 live region 中处理。

## 5. 视觉

- count 模式：小尺寸数字，numeric 字体，确保对齐；超过 `max` 显示 `max+`。
- dot 模式：小圆点，不使用数字；必须有 `label` 供屏幕阅读器理解。
- tone 使用语义层；`success/warning/danger/info` 当前缺 Token，见 `api-conventions.md` §12.2。
- 附着布局：badge 绝对定位在内容右上角；不改变父内容布局尺寸。
- 不使用发光动画；状态变化以即时切换为主。

## 6. 组合与扩展

- `<Badge count={3}><IconButton ... /></Badge>` 是常见用法；Badge 只负责标记，不替 IconButton 增加语义。
- 需要自定义位置时不用 Badge 的附着模式，直接使用独立 Badge + 外层定位。
- 不提供 `status` 布尔或 `color` 别名；颜色统一 tone。

## 7. 无障碍

- 计数标记：可读文本为数字；`label` 提供上下文（如“未读消息”）。建议渲染为 `aria-label={`${label} ${count}`}`，避免只读一个孤立数字。
- dot 模式：仅视觉圆点，`label` 必填；无 label 时开发环境警告并 `aria-hidden`，但不能作为唯一状态表达。
- 状态不能只用颜色：在线/离线等需要文本或图例。
- 附着模式下，被标记内容自身的可访问名称不受影响。

## 8. 示例

```tsx
<Badge count={12} label="未读消息">
  <IconButton aria-label="通知"><BellIcon /></IconButton>
</Badge>

<Badge count={128} max={99} tone="danger" />
<Badge dot label="在线" tone="success" />
<Badge count={0} showZero label="待处理" />
```

## 9. 边界情况

- `count` 为负数：按 0 处理并警告。
- `count` 为非整数：向下取整；`NaN` / `Infinity` 不渲染并警告。
- `max` 小于 0：按 0 处理；`max=0` 时任何 count 显示 `0+`，不建议。
- `dot` 与 `count` 同时提供：dot 优先，忽略 count，开发环境警告。
- 没有 count/dot 但有 children：只渲染内容，不渲染标记（避免空角标）。
- 超长 `label`：只用于可访问名称，不影响布局。

## 10. 依赖与实现注意

- 无组件依赖；可选用内部 VisuallyHidden 或 `aria-label`。
- 附着模式需要 `position: relative` 包装，不能改变子元素的定位上下文假设。
- 数字使用 numeric 字体并保持圆形/胶囊尺寸稳定；三位数以上需要自适应宽度。
- 状态色 Token 未建立前，`success/warning/danger/info` 不得以场景 Primitive 硬编码。
