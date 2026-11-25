# Spinner

> 状态：草案（阶段一）· 需人工审核。M1 基础组件。

## 1. 职责

表达“正在加载/处理中”的不确定进度指示器。它只解决短时、无确定百分比的等待；确定进度用 Progress。

**使用场景**：按钮 loading、局部内容加载、异步提交、页面内轻量等待。
**不适用**：确定百分比（用 Progress）；骨架占位（用 Skeleton）；需要长时间停留的说明性加载（用 Empty/Alert + 文案）。
**区别**：Spinner 是循环动画；Progress 是确定进度；Skeleton 是内容占位。

## 2. 边界

- 不显示百分比、不显示剩余时间。
- 不自动包裹父容器或改变布局；由调用方决定尺寸与位置。
- 不负责 live region 的完整上下文；只提供自身的 status 语义与标签。
- 不提供彩色/多环/粒子等装饰预设；仪式性特效属于未来 interaction-effects，不在 Spinner 中实现。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 16 / 20 / 24px |
| `tone` | `'current' \| 'muted' \| 'accent' \| 'gold'` | `'current'` | `current` 继承文字颜色 |
| `label` | `string` | `'加载中'` | 屏幕阅读器文本；不显示（除非调用方另行渲染） |
| `aria-hidden` | `boolean` | `false` | 作为纯装饰时隐藏；与 label 互斥使用 |

```tsx
import type { HTMLAttributes } from 'react';

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md' | 'lg';
  tone?: 'current' | 'muted' | 'accent' | 'gold';
  label?: string;
}
```

## 4. 事件与状态

- 无交互事件。
- 状态：Spinning（默认）、Reduced Motion（静态或降速）。
- 无 hover/focus/disabled；它不是一个可交互元素。
- 颜色继承由 `tone="current"` 表达；父级文字颜色变化时同步。

## 5. 视觉

- 使用细线环/刻度环，颜色来自文字色或语义色；不得使用彩色渐变。
- 动画缓慢、克制，符合 `--au-transition-base` 的节奏；不做弹性/跳动。
- `label` 通过视觉隐藏文本输出，不显示在界面上。
- 尺寸必须与行高协调；按钮内使用 `sm`，独立区域使用 `md`。

## 6. 组合与扩展

- Button / IconButton 内部使用 `sm`，并由父组件统一 `aria-busy`，Spinner 自身可设 `aria-hidden` 避免重复播报。
- 页面级加载：由一个可见文本 + Spinner 组成，不要把 Spinner 作为唯一信息。
- 需要确定进度时改用 Progress，不用 Spinner 伪装。

## 7. 无障碍

- 根元素 `role="status"`、`aria-live="polite"`；`label` 作为可访问文本。
- 若是纯装饰（父级已播报忙碌），设 `aria-hidden="true"` 并不要传 label。
- 动画必须尊重 `prefers-reduced-motion`：可降为静态图形或极慢旋转；仍需可感知“加载中”状态。
- 不抢焦点、不阻塞屏幕阅读器。
- `label` 应本地化；默认中文仅为项目基线，调用方可覆盖。

## 8. 示例

```tsx
<Spinner />
<Spinner size="sm" tone="muted" label="正在同步" />
<Spinner size="lg" tone="gold" />
```

## 9. 边界情况

- 同时传 `aria-hidden` 与 `label`：`aria-hidden` 优先，开发环境警告。
- 在 disabled 按钮内：不应出现；由 Button 的 loading 语义控制。
- 长时间加载：Spinner 本身不提示超时；调用方增加文案或错误处理。
- 动画被系统关闭：必须有静态替代，不能变成空白。
- 颜色对比：`tone="muted"` 在案头上需保证可见，不依赖低透明度。

## 10. 依赖与实现注意

- 无组件依赖。
- 不引入第三方动画库；CSS 动画即可。
- 动画层 `pointer-events: none`；不改变父布局。
- 未来 interaction-effects 的“环形刻度”可复用视觉语言，但不得把 effect 系统塞进 Spinner API。
