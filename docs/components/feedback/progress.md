# Progress

> 状态：草案（阶段一）· 需人工审核。M3 反馈与浮层。

## 1. 职责

展示确定或不确定的任务进度。它解决的是“用户需要知道任务完成到什么程度”的问题。

**使用场景**：上传/归档进度、步骤完成度、批量处理、加载百分比。
**不适用**：短时按钮 loading（用 Spinner）；内容占位（用 Skeleton）；流程导航（用 Steps）。
**区别**：Progress 是只读进度；Spinner 是不确定等待；Steps 是流程阶段。

## 2. 边界

- 不控制任务；只展示传入的值。
- 不做动画式“假进度”；不确定进度用 indeterminate，不伪造百分比。
- 不提供可拖动的进度条（那是 Slider）。
- 不内置取消/暂停按钮；由调用方在旁组合。
- 不显示时间估计；由调用方以文本提供。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `value` | `number` | `0` | 当前值；默认范围 0–100 |
| `max` | `number` | `100` | 最大值 |
| `indeterminate` | `boolean` | `false` | 不确定进度；忽略 value |
| `variant` | `'bar' \| 'ring'` | `'bar'` | 条形/环形 |
| `size` | `Size` | `'md'` | 条厚度/环尺寸 |
| `tone` | `'neutral' \| 'accent' \| 'gold'` | `'accent'` | 颜色语义 |
| `label` | `ReactNode` | — | 可见标签；同时用于 aria-labelledby |
| `showValue` | `boolean` | `false` | 显示数值文本 |
| `formatValue` | `(value: number, max: number) => string` | 百分比 | 数值显示与 aria-valuetext |

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import type { Size } from '../api-conventions';

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  indeterminate?: boolean;
  variant?: 'bar' | 'ring';
  size?: Size;
  tone?: 'neutral' | 'accent' | 'gold';
  label?: ReactNode;
  showValue?: boolean;
  formatValue?: (value: number, max: number) => string;
}
```

## 4. 语义与状态

- 根 `role="progressbar"`；确定进度：`aria-valuemin=0`、`aria-valuemax={max}`、`aria-valuenow={clamped}`、`aria-valuetext`（格式化文本）。
- 不确定进度：不设置 `aria-valuenow`，保留 min/max；`aria-valuetext` 为“加载中”类文本（由 label 提供）。
- 状态：Determinate、Indeterminate、Complete、AtZero。
- 无交互事件；不抢焦点。
- 值更新时平滑过渡；不做长时间“追赶”动画。

## 5. 视觉

- bar：细轨道 + 填充；size 控制高度（建议 2/4/6px）；填充使用 accent/gold，不使用彩色渐变。
- ring：环形刻度/圆弧，适合紧凑展示；中心可显示百分比（由 `showValue` 控制）。
- 轨道使用结构线颜色；填充与背景对比必须可辨。
- 完成态不复用 success 色（无 Token）；可用 gold 或文本说明。
- indeterminate 使用缓慢往复/旋转动画，尊重 reduced motion。
- 标签/数值使用 UI/numeric 字体；数值与标签间距稳定。

## 6. 组合与扩展

- 任务卡片：Progress + 标题/状态文字 + 取消按钮。
- 批量归档：Progress + Statistic（数量）+ Alert（错误摘要）。
- 不确定加载：优先 Spinner；Progress indeterminate 仅用于需要“进度条形态”的场景。
- 不把 Steps 塞进 Progress；阶段语义用 Steps。

## 7. 无障碍

- `role="progressbar"`；必须有可访问名称（label 或 aria-label）。
- 确定进度提供 `aria-valuenow`/`min`/`max`/`valuetext`；不确定进度不要伪造 `aria-valuenow`。
- 更新频率过高会刷屏；进度变化不自动播报，除非调用方使用 live region（谨慎）。
- 颜色不是唯一信息：数值/标签/完成状态文本必须存在。
- reduced motion：关闭往复动画，仍显示静态“不确定”标识。
- 环形进度不能只靠图形；必须有文本。

## 8. 示例

```tsx
<Progress value={42} label="归档进度" showValue />
<Progress value={3} max={7} label="已处理卷宗" showValue formatValue={(v, m) => `${v}/${m}`} />
<Progress indeterminate label="正在扫描索引" />
<Progress variant="ring" value={80} showValue aria-label="完成度" />
```

## 9. 边界情况

- `value` 超出 0–max：显示钳制，`aria-valuenow` 也钳制；不抛错。
- `max <= 0`：开发环境警告，按 100 处理。
- `value` 为 `NaN`：按 0 处理并警告。
- `indeterminate` 为真：忽略 value，不显示假百分比；`showValue` 无效并警告。
- 完成（value=max）：显示 100%；不自动隐藏。
- 超长 label：允许换行，不挤压轨道至不可见。
- 快速更新：视觉平滑但最终值必须准确；不因动画延迟 aria 值。

## 10. 依赖与实现注意

- 无组件依赖；环形可用 CSS conic-gradient 或 SVG；不引入图表库。
- 进度填充的宽度/弧长由计算所得，不暴露内部样式变量。
- 动画使用 transform 而非布局属性，避免重排。
- 不硬编码状态色；完成态如需 success 色，等待 Token。
