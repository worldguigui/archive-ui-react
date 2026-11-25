# Divider

> 状态：草案（阶段一）· 需人工审核。M1 基础组件。

## 1. 职责

分隔内容区域或表达结构层级。设计语言要求线条有层级与节奏（结构线 / 装饰线 / 定位线 / 轨迹线），Divider 只承担其中的**结构线/装饰线**基础能力。

**使用场景**：表单区块分隔、列表项之间、标题与正文之间、工具栏分组。
**不适用**：表达流程步骤（用 Steps）；表达时间线（用 Timeline）；绘制复杂装饰边框（等待装饰 API）。
**区别**：Divider 是单一线段；装饰边框/角饰属于未来 `decoration` 预设，不是 Divider 的变体。

## 2. 边界

- 不承担布局间距；间距由容器 gap/margin 控制。
- 不提供任意 SVG 或图案；只使用 Token 定义的线型。
- 垂直分隔符依靠父容器高度；组件不自动撑满。
- 带文字标签时仅支持水平方向。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | 方向 |
| `variant` | `'solid' \| 'dashed' \| 'dotted' \| 'etch'` | `'solid'` | 线型；etch 为蚀刻渐变线 |
| `tone` | `'subtle' \| 'metal' \| 'accent'` | `'subtle'` | 颜色层级 |
| `thickness` | `'hairline' \| 'normal' \| 'emphasis'` | `'hairline'` | 线宽 Token |
| `label` | `ReactNode` | — | 水平分隔线中的文字 |
| `labelPosition` | `'start' \| 'center' \| 'end'` | `'center'` | 标签位置 |
| `decorative` | `boolean` | `false` | 纯装饰时 `aria-hidden`，不声明 separator |

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import type { Orientation } from '../api-conventions';

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: Orientation;
  variant?: 'solid' | 'dashed' | 'dotted' | 'etch';
  tone?: 'subtle' | 'metal' | 'accent';
  thickness?: 'hairline' | 'normal' | 'emphasis';
  label?: ReactNode;
  labelPosition?: 'start' | 'center' | 'end';
  decorative?: boolean;
}
```

## 4. 语义与状态

- 非装饰时：`role="separator"`，`aria-orientation` 与方向一致；带标签时仍是 separator。
- 装饰时：`aria-hidden="true"`，不输出 role。
- 无交互状态、无事件。
- `label` 与 `orientation="vertical"` 同时使用：忽略 label，开发环境警告。

## 5. 视觉

- `tone="subtle"` 使用 `--au-color-border-subtle`；`metal` 使用 `--au-color-border-metal`；`accent` 使用 `--au-color-accent-primary`。
- `variant="etch"` 使用 `--au-gradient-etch-line`（胡桃木→余烬→胡桃木）；仍是直线，不是装饰图案。
- 线宽：hairline 1px、normal 1px（语义区分由颜色/透明度承担）、emphasis 2px；不得为了视觉粗细硬编码 0.5px。
- 标签使用 caption/label 字体角色，与线同色或次级色；两侧留白由组件内 padding 控制。
- 垂直方向宽度为 1px / 2px，高度由父容器决定；不设置固定高度。

## 6. 组合与扩展

- 可在 Panel 头部、表单区块、列表内使用；不要用来替代布局 gap。
- 与标题组合时，建议用 `label` 而非外部绝对定位；需要复杂标题栏时使用 Panel header。
- 不提供 `margin` / `spacing` prop；布局由外层控制。

## 7. 无障碍

- 默认语义 separator 可能被屏幕阅读器朗读；纯视觉分隔应设 `decorative`。
- 带标签时，标签文本属于 separator 的一部分；不要依赖它传递唯一必要信息。
- 垂直分隔线不改变阅读顺序。
- 不使用颜色作为唯一层级提示；粗细/线型需可辨。

## 8. 示例

```tsx
<Divider />
<Divider variant="etch" tone="metal" />
<Divider label="档案附录" labelPosition="start" />
<Divider orientation="vertical" />
<Divider decorative />
```

## 9. 边界情况

- 垂直分隔线在无高度容器中不可见：由父布局负责。
- 标签超长：允许换行或由调用方截断；不得把分隔线挤出容器。
- `labelPosition` 与无 label 同时使用：忽略，不报错。
- `thickness="emphasis"` 在小尺寸区域内可能过重；由视觉校准。
- 多根 Divider 堆叠：不合并、不自动去重。

## 10. 依赖与实现注意

- 无组件依赖。
- 不使用 `hr`：带 label / 垂直 / 装饰场景需要更灵活的容器；统一用 `div` + role。
- 线条颜色必须来自 Semantic Token；etch 使用既有光影 Token。
- 装饰 API 立项后，复杂边框/纹样不并入 Divider。
