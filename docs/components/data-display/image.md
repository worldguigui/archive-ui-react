# Image

> 状态：草案（阶段一）· 需人工审核。M3 数据展示。
> 图片处理（archival / film）依赖未来资产与视觉实现；本文件先定义 API。

## 1. 职责

带比例、填充方式、档案处理预设与说明文字的图片展示。它解决的是“图片需要统一裁切、可读性遮罩与错误回退”的问题。

**使用场景**：档案封面、插图、人物照片、展览图片。
**不适用**：头像（用 Avatar）；带完整档案封面结构的图片（用 ArchiveCover）；装饰纹理（属于资产/材质）。
**区别**：Image 是通用图片语义；ArchiveCover 是封面叙事组合；Avatar 是身份回退。

## 2. 边界

- 不做灯箱/预览/缩放；需要时另立 ImagePreview。
- 不做上传/裁剪。
- 不暴露任意滤镜参数；`treatment` 是预设。
- `frame="film"` 不在本组件开放：胶片齿孔属于 ArchiveCover 的 L4 构成资产。
- 不在运行时对图片挂大面积 CSS 滤镜；处理优先资产化或轻量叠加层。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` | **必填** | 图片地址 |
| `alt` | `string` | **必填** | 替代文本；纯装饰用 `''` |
| `ratio` | `number \| string` | — | 宽高比，如 `4/3`、`1.777` |
| `fit` | `'cover' \| 'contain' \| 'fill' \| 'none' \| 'scale-down'` | `'cover'` | object-fit |
| `treatment` | `'none' \| 'archival' \| 'film'` | `'none'` | 档案处理预设 |
| `frame` | `'none' \| 'hairline'` | `'none'` | 边框预设 |
| `caption` | `ReactNode` | — | 图注 |
| `fallback` | `ReactNode` | — | 加载失败时替代内容 |
| `loading` | `'lazy' \| 'eager'` | 原生默认 | 原生懒加载 |
| `onLoad` / `onError` | 原生 | — | 加载事件；组件仍处理回退 |

其余 img 属性（`srcSet`、`sizes`、`decoding`、`referrerPolicy` 等）透传给 `<img>`。

```tsx
import type { ImgHTMLAttributes, ReactNode } from 'react';

export interface ImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  src: string;
  alt: string;
  ratio?: number | string;
  fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  treatment?: 'none' | 'archival' | 'film';
  frame?: 'none' | 'hairline';
  caption?: ReactNode;
  fallback?: ReactNode;
}
```

## 4. DOM 映射

- 根：`<figure class="au-image">`；`className` / `style` / `id` / `data-*` 作用于根。
- `<img>`：src/alt/ratio 之外的原生 img 属性、`onLoad`/`onError`、`ref` 指向 img。
- `caption` 渲染 `<figcaption>`；无 caption 时仍使用 figure 容器以承载比例/处理层。
- 处理层（暗角/颗粒/遮罩）为装饰子元素，`aria-hidden`，`pointer-events: none`。
- 加载失败：内部切换为 `fallback`（或空占位），保留 alt 文本语义；`onError` 仍触发。
- `src` 变化时重置错误状态。

## 5. 事件与状态

- `onLoad` / `onError` 原生，组件内部也监听错误以切换回退；用户回调在内部处理后调用。
- 状态：Loading、Loaded、Error/Fallback。
- 无交互状态；点击/预览不内置。
- 不做骨架屏；加载占位由外层 Skeleton 或 fallback 控制。

## 6. 视觉

- `ratio` 使用 CSS `aspect-ratio`；无 ratio 时保持固有尺寸。
- `fit` 映射 object-fit；不通过背景图模拟。
- `treatment="archival"`：建议暖色调、轻暗角、可读性遮罩；`film`：冷调、颗粒、镜头暗角。两者必须以资产/轻量叠加实现，具体参数待视觉立项；V1 可先不实现，但不得用不可控的运行时滤镜冒充。
- 图片与文字叠加侧必须有遮罩渐变（`--au-color-overlay`），保证对比度。
- `frame="hairline"` 使用 hairline 结构线；不使用金属厚边框。
- 图注使用 caption/secondary，左对齐。

## 7. 组合与扩展

- 作为 Card/ArchiveCard 的 media 内容；作为 ArchiveCover 的底层。
- 需要印章/标题叠层时使用 ArchiveCover，不向 Image 增加任意 overlay children。
- 需要预览时等待 ImagePreview，不把 Dialog 逻辑塞进 Image。
- 需要纯装饰图时 `alt=""`，并确保信息不丢失。

## 8. 无障碍

- `alt` 必填；信息性图片描述内容与用途；装饰图用空串。
- 图注通过 `<figcaption>` 关联；不要把图注重复写入 alt。
- 暗角/颗粒/遮罩 `aria-hidden`。
- 不在图片上直接放文字；若放，必须保证可读并有替代文本。
- 懒加载不影响屏幕阅读器读取 alt。
- 失败回退不能丢失可访问名称；如 fallback 替换图片，需保留语义文本。

## 9. 示例

```tsx
<Image src="/archive/letter.webp" alt="带有水渍的未署名信件" ratio="4/3" treatment="archival" />

<Image
  src="/archive/city.jpg"
  alt=""
  ratio={16 / 9}
  treatment="film"
  caption="伦敦，1972"
/>

<Image
  src={src}
  alt="档案封面"
  fallback={<Empty variant="compact" title="图片不可用" />}
/>
```

## 10. 边界情况

- 无 src：开发环境警告；可渲染 fallback，不发起请求。
- 图片失败：显示 fallback；onError 触发一次；不无限重试。
- 无 ratio + 大图：撑开布局；由调用方设置容器尺寸。
- ratio 非法：忽略并警告，回退固有比例。
- 超长图注：换行；不撑破容器。
- `alt=""` + caption：caption 仍可读，但图片本身被视为装饰。
- 处理预设未实现：不得静默降级为“无处理”却宣称完成；需在文档/发布说明标注。
- 在 Canvas/打印中：CSS 叠加层可能不导出；不承诺。

## 11. 依赖与实现注意

- 不依赖 ArchiveCover；内部可使用共享 ImageLayer 实现处理层（不公开）。
- 不引入图片 CDN/懒加载库；使用原生能力。
- 处理层不得阻挡 pointer events；不得造成布局位移。
- 不硬编码遮罩色；使用语义 overlay/vignette 变量。
