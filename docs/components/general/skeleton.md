# Skeleton

> 状态：草案（阶段一）· 需人工审核。M1 基础组件。

## 1. 职责

在数据到达前占位的骨架屏，保持布局稳定并提示加载。它解决的是“首屏加载时不要空白/跳动”的问题。

**使用场景**：列表、卡片、表格、统计块的首次加载。
**不适用**：短时按钮 loading（用 Spinner）；已有内容的刷新（用轻量 loading/保留旧内容）；空结果（用 Empty）。
**区别**：Skeleton 是占位符，不包含真实数据；Spinner 是不确定进度；Empty 是“无数据”。

## 2. 边界

- 不自动生成复杂页面骨架；只提供文本/矩形/圆形三种基础形状。
- 不包含动画内容、不加载数据、不管理 loading 状态。
- 不隐藏自身从屏幕阅读器：默认 `aria-hidden`，由容器用 `aria-busy` 宣告加载。
- 不负责布局；宽高由调用方/父布局决定。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `variant` | `'text' \| 'rect' \| 'circle'` | `'text'` | 占位形状 |
| `width` | `string \| number` | 100% / 圆形尺寸 | 数字按 px |
| `height` | `string \| number` | 文本 1em；圆形同宽 | 数字按 px |
| `lines` | `number` | `1` | 仅 text；生成多行，最后一行可短 |
| `animation` | `'pulse' \| 'none'` | `'pulse'` | 播放呼吸动画或静态 |
| `aria-hidden` | `boolean` | `true` | 默认对辅助技术隐藏 |

```tsx
import type { HTMLAttributes } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rect' | 'circle';
  width?: string | number;
  height?: string | number;
  lines?: number;
  animation?: 'pulse' | 'none';
}
```

## 4. 事件与状态

- 无交互。
- 状态：Pulse、Static（`animation="none"` 或 reduced motion）。
- 不表示成功/失败；加载失败由调用方切换到错误状态。
- 不自动消失；由调用方在数据到达后卸载。

## 5. 视觉

- 底色使用 `bg-elevated` / `bg-surface` 的中间层，避免与真实内容混淆；不使用强纹理。
- 形状圆角：text 2px、rect 4px、circle 50%。
- 多行文本骨架行距与目标正文行高一致，最后一行宽度建议 60–80%（实现可固定，不暴露）。
- 不使用闪烁亮度剧烈的 shimmer；呼吸动画缓慢、低对比，符合档案视觉的克制。
- 不使用彩色渐变扫光。

## 6. 组合与扩展

- 多个 Skeleton 由调用方组合成卡片/列表骨架；不提供 `SkeletonCard` 等预设（避免与 Card 重复）。
- 表格骨架可由多个 rect 组合；不内置 Table 专属骨架。
- 与 Image 组合时，Image 的 `fallback` 或外层 Skeleton 均可；不要同时使用造成双重占位。

## 7. 无障碍

- 默认 `aria-hidden="true"`，防止屏幕阅读器朗读无意义占位。
- 父容器必须设置 `aria-busy="true"`，并在数据到达后移除；不要只靠 Skeleton 表达加载。
- 动画尊重 `prefers-reduced-motion`：自动降为静态。
- 不为 Skeleton 提供可聚焦性。

## 8. 示例

```tsx
<div aria-busy="true" aria-label="正在加载档案">
  <Skeleton width="40%" height="1.25rem" />
  <Skeleton lines={3} />
</div>

<Skeleton variant="circle" width={40} height={40} animation="none" />
<Skeleton variant="rect" height={180} />
```

## 9. 边界情况

- `lines=0` 或负数：不渲染内容，开发环境警告。
- `circle` 的宽高不一致：以宽度为准强制正方形，避免椭圆。
- `width` 为 `0`：渲染不可见元素；允许，但不建议。
- 百分比宽度在无宽度父容器中可能塌陷；由调用方保证容器宽度。
- 动画关闭后仍需保留占位形状，不能变成空白。

## 10. 依赖与实现注意

- 无组件依赖。
- 使用 CSS 伪元素或内部 span 绘制；不占用材质槽（Skeleton 不属于材质表面）。
- 动画只改变透明度/颜色，不改变布局。
- 不硬编码颜色；使用语义层背景与 border。
