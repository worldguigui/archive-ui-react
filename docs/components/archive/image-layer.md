# ImageLayer

> 状态：**待确认——建议内部化，不公开导出**。M4 档案特色组件。
> 若维护者决定公开，以下接口草案可作为起点；当前默认结论是：它应作为 `Image` / `ArchiveCover` 的 `treatment` 实现细节存在。

## 1. 建议

ImageLayer 只是“图片 + 处理叠加层（暗角/颗粒/色调/遮罩）”，没有独立语义；公开后会与：

- `Image` 的 `treatment` / `fallback` / `caption` 重叠；
- `ArchiveCover` 的封面叙事与遮罩重叠；
- 未来 `ImagePreview` 的媒体层重叠。

建议不公开，内部命名为图片处理能力，由 `Image treatment="archival" | "film"` 和 `ArchiveCover` 使用。

## 2. 若公开的职责

以图片为底层，叠加统一的档案处理层，并可承载覆盖内容。它解决的是“图片处理层需要在多个媒体组件间复用”的问题——这是实现问题，不是调用方问题。

## 3. 若公开的 Props 草案

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` | **必填** | 图片地址 |
| `alt` | `string` | **必填** | 替代文本 |
| `treatment` | `'none' \| 'archival' \| 'film'` | `'none'` | 处理预设 |
| `overlay` | `'none' \| 'gradient' \| 'solid'` | `'none'` | 可读性遮罩 |
| `ratio` | `number \| string` | — | 宽高比 |
| `fit` | `'cover' \| 'contain' \| 'fill' \| 'none' \| 'scale-down'` | `'cover'` | 填充方式 |
| `fallback` | `ReactNode` | — | 失败回退 |
| `children` | `ReactNode` | — | 覆盖内容（标题/印章等） |

```tsx
import type { HTMLAttributes, ReactNode } from 'react';

export interface ImageLayerProps extends HTMLAttributes<HTMLDivElement> {
  src: string;
  alt: string;
  treatment?: 'none' | 'archival' | 'film';
  overlay?: 'none' | 'gradient' | 'solid';
  ratio?: number | string;
  fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  fallback?: ReactNode;
  children?: ReactNode;
}
```

## 4. 语义与风险（若公开）

- 根是 `<div>`，没有图片的 figure 语义；alt 只能作为内部 img 的 alt，容器本身不表达媒体角色。
- 若承载 children，遮罩层必须 `pointer-events: none`，但文字/按钮可交互；焦点顺序与图片关系难以统一。
- 与 Image 的 `caption`、`ArchiveCover` 的 title/stamp 高度重叠，调用方会困惑该用哪一个。
- 没有独立状态；加载/错误只是内部实现。
- 无障碍责任模糊：alt 与覆盖文本谁是主信息？无法从 API 表达。

## 5. 视觉约束（无论是否公开）

- 处理层不得使用大面积运行时 CSS 滤镜；优先资产化/轻量叠加。
- 遮罩必须保证文字对比度；不覆盖整个图片到不可读。
- 装饰层 `aria-hidden`；不得阻挡图片点击（若外层是链接）。
- 不占用面板材质槽；图片处理与面板材质是两套维度。
- 两主题下都需验证；film 的冷调在亮色主题需反转/降低强度。

## 6. 内部契约（推荐）

```ts
interface ImageTreatmentLayerProps {
  treatment: 'archival' | 'film';
  overlay: 'gradient' | 'solid';
  children?: ReactNode;   // 仅由 ArchiveCover 使用
}
```

- 内部组件不导出，不承诺 API 稳定。
- `Image` 使用处理层但不暴露 children 覆盖；`ArchiveCover` 使用处理层并拥有自己的文字/印章布局。
- 资产/参数由视觉规范控制；调用方只选择预设。

## 7. 无障碍（若公开）

- `alt` 必填；装饰图 `alt=""`。
- 覆盖文字必须是真实 DOM 文本，不能只画在图片上。
- 覆盖层中的按钮/链接必须可键盘操作，且有名称。
- 处理层/遮罩 `aria-hidden`。
- 图片失败时覆盖内容仍可读。

## 8. 边界情况

- 图片失败：回退；不重复 onError 循环。
- 无 children 但有 overlay：允许，纯视觉处理。
- 覆盖内容超长：不遮挡关键图像；由调用方控制。
- 多个处理层嵌套：禁止；会产生叠加失真。
- 打印/导出：CSS 叠加可能丢失，不承诺。

## 9. 结论

- 默认：**内部化**，不进入公共导出。
- 如果产品确实需要“任意图片 + 覆盖内容”的公开基础组件，应重新命名为 `Media` 或 `ImageFrame` 并单独设计语义、焦点与状态；不要以 ImageLayer 名义仓促公开。
