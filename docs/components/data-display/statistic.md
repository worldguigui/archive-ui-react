# Statistic

> 状态：草案（阶段一）· 需人工审核。M3 数据展示。

## 1. 职责

突出展示单个数值指标，支持标题、前后缀、格式化、趋势与加载占位。它解决的是“关键数字需要被快速扫读”的问题。

**使用场景**：档案总数、本月新增、扫描完成率、容量。
**不适用**：多指标比较（用 Table/图表）；进度（用 Progress）；普通正文数字（用 Typography）。
**区别**：Statistic 有指标语义与数字排版；Progress 有进度方向；Typography 只负责排版。

## 2. 边界

- 不做数据请求/计算；value 由调用方提供。
- 不做图表、不做动画计数（count-up）；V1 不引入。
- 不做本地化货币/百分比猜测；用 `formatter`。
- 不提供多值对比/差值计算；差值由调用方算好放入 value 或 description。
- `trend` 只表达方向，不推断业务好坏。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `title` | `ReactNode` | — | 指标名称；Omit 原生 title |
| `value` | `number \| string` | **必填** | 指标值 |
| `precision` | `number` | — | 小数位；仅 number |
| `prefix` / `suffix` | `ReactNode` | — | 前缀/单位 |
| `formatter` | `(value: number \| string) => ReactNode` | — | 完全自定义显示 |
| `trend` | `'up' \| 'down' \| 'flat'` | — | 趋势方向（视觉） |
| `trendLabel` | `ReactNode` | — | 趋势的可访问文本/说明 |
| `tone` | `AccentTone` | `'neutral'` | 数值强调色 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 字号/间距 |
| `loading` | `boolean` | `false` | 显示 Skeleton，`aria-busy` |

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import type { AccentTone } from '../api-conventions';

export interface StatisticProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  value: number | string;
  precision?: number;
  prefix?: ReactNode;
  suffix?: ReactNode;
  formatter?: (value: number | string) => ReactNode;
  trend?: 'up' | 'down' | 'flat';
  trendLabel?: ReactNode;
  tone?: AccentTone;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}
```

## 4. 格式化与显示

优先级：`formatter` > `precision` + 原始值 > 原始值。
- `precision` 仅对 number 生效；使用四舍五入，不使用银行家舍入（需统一）。
- `prefix` / `suffix` 是视觉内容，不参与 `aria-valuenow`（Statistic 不是 progressbar）。
- 数字使用 numeric 字体与 `font-variant-numeric: tabular-nums`。
- `trend` 使用内部箭头图标；必须有 `trendLabel` 说明（如“较上月 +12%”），否则开发环境警告。
- `loading` 时渲染 Skeleton 替代数字/标题，容器 `aria-busy`。

## 5. 事件与状态

- 无交互事件。
- 状态：Default、Loading、TrendUp、TrendDown、TrendFlat。
- `tone` 只影响数值颜色，不改变趋势语义。
- 值更新不做动画；直接替换，避免虚假动态。

## 6. 视觉

- 标题 caption/label 次级文本；数值 display/numeric 大字；单位较小并与基线对齐。
- `tone="accent/gold"` 用于强调；同一视图只允许一个强调主角。
- 趋势颜色不得作为唯一信号；箭头 + trendLabel 文本。
- 不使用彩色渐变数字、发光描边。
- 卡片内使用不额外加材质；外层由 Panel/Card 提供。

## 7. 组合与扩展

- 多个指标用布局网格组合，不提供 StatisticGroup。
- 与 Progress 组合展示完成率；与 Tag 组合展示状态。
- 需要在数值下显示说明时使用 `trendLabel` 或外部 Typography，不增加 description prop。
- 图表/迷你趋势线不做；等待数据可视化立项。

## 8. 无障碍

- 标题与数值的阅读顺序自然；不要只把数值放在图形中。
- 趋势必须有可访问文本（`trendLabel`）；图标 `aria-hidden`。
- 加载时 `aria-busy`，Skeleton `aria-hidden`。
- 数字的格式化结果应可读；避免用图片替代文本。
- `prefix/suffix` 若是装饰图标，`aria-hidden`；单位文本保留。
- 不自动播报数值变化；实时指标由调用方决定 live region。

## 9. 示例

```tsx
<Statistic title="馆藏总数" value={12480} />
<Statistic title="本月新增" value={128} trend="up" trendLabel="较上月 +12%" tone="gold" />
<Statistic title="扫描完成率" value={0.842} precision={1} suffix="%" />
<Statistic title="容量" value={formatterValue} formatter={(v) => `${v} TB`} loading={loading} />
```

## 10. 边界情况

- `value` 为 `NaN` / `Infinity`：显示 `—` 并警告，不显示 NaN。
- `precision` 为负数：按 0 处理；过大导致浮点噪声，建议 ≤ 4。
- `formatter` 返回 null：允许，但会丢失数值；文档建议不要。
- 超长数值：允许换行/缩小？V1 不自动缩小；由调用方控制容器与字号。
- 负值：正常显示；趋势方向由调用方决定。
- `trend` 无 `trendLabel`：警告；不渲染不可解释的趋势。
- `loading` 与 value 同时提供：显示 Skeleton，不显示旧值（首次加载语义）；刷新场景由调用方保留旧值。
- 多个强调 Statistic：违反视觉规范，组件不阻止。

## 11. 依赖与实现注意

- 依赖 Skeleton（loading）；不依赖 Progress。
- 数字格式化使用 `Intl.NumberFormat` 可选；V1 用 `toFixed`/原始值即可，但不得用隐式 locale 格式化。
- 不硬编码字体；使用 numeric 角色。
- 不引入动画库；不做 count-up。
