# ArchiveCover

> 状态：草案（阶段一）· 需人工审核。M4 档案特色组件。
> `treatment` / `frame="film"` 的视觉实现依赖未来资产；API 先定义，未实现前不得宣称已完成视觉效果。

## 1. 职责

档案封面：以图片为主体，叠加标题、副标题、说明、分类/印章与统一的可读性遮罩。它解决的是“封面需要叙事性排版，而普通图片只有 alt”的问题。

**使用场景**：档案卡封面、卷宗首页、展览海报位、影像档案。
**不适用**：普通内容图片（用 Image）；头像（用 Avatar）；纯文字标题（用 ArchiveHeader）；可点击灯箱（等待 ImagePreview）。
**区别**：ArchiveCover 是封面组合；Image 是图片；ArchiveCard 是记录卡。

## 2. 边界

- 不负责点击/预览/灯箱；由调用方包裹链接或另立 ImagePreview。
- 不解析/格式化标题与说明；全部 ReactNode。
- 不提供任意 overlay children；只支持 title/subtitle/caption/label/stamp 槽。
- 不暴露滤镜参数；treatment/frame 是预设。
- `frame="film"` 是 FilmFrame 内部能力的公开预设；不单独公开 FilmFrame 组件。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` | **必填** | 图片地址 |
| `alt` | `string` | **必填** | 图片替代文本；装饰封面用 `''` |
| `title` | `ReactNode` | — | 封面标题 |
| `subtitle` | `ReactNode` | — | 副标题 |
| `caption` | `ReactNode` | — | 图注（图片下方） |
| `label` | `ReactNode` | — | 分类/编号标签槽 |
| `stamp` | `ReactNode` | — | 印章槽 |
| `treatment` | `'none' \| 'archival' \| 'film'` | `'archival'` | 图片处理预设 |
| `overlay` | `'none' \| 'gradient' \| 'solid'` | `'gradient'` | 文字可读性遮罩 |
| `frame` | `'none' \| 'film'` | `'none'` | 胶片画框预设 |
| `ratio` | `number \| string` | `'4/3'` | 宽高比 |
| `fit` | `'cover' \| 'contain'` | `'cover'` | 填充方式 |
| `loading` | `'lazy' \| 'eager'` | `'lazy'` | 图片加载 |
| `fallback` | `ReactNode` | — | 图片失败回退 |
| `onLoad` / `onError` | 原生图片事件 | — | 加载回调 |
| `headingLevel` | `HeadingLevel` | `3` | 标题级别 |

```tsx
import type { HTMLAttributes, ReactNode, SyntheticEvent } from 'react';
import type { HeadingLevel } from '../api-conventions';

export interface ArchiveCoverProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  src: string;
  alt: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  caption?: ReactNode;
  label?: ReactNode;
  stamp?: ReactNode;
  treatment?: 'none' | 'archival' | 'film';
  overlay?: 'none' | 'gradient' | 'solid';
  frame?: 'none' | 'film';
  ratio?: number | string;
  fit?: 'cover' | 'contain';
  loading?: 'lazy' | 'eager';
  fallback?: ReactNode;
  onLoad?: (event: SyntheticEvent<HTMLImageElement>) => void;
  onError?: (event: SyntheticEvent<HTMLImageElement>) => void;
  headingLevel?: HeadingLevel;
}
```

## 4. 结构

- 根 `<figure class="au-archive-cover">`。
- 媒体层：Image（内部）+ treatment 叠加；`frame="film"` 增加齿孔画框（装饰 span）。
- 遮罩层：`overlay` 控制文字可读性；`gradient` 使用语义 overlay 渐变，`solid` 使用半透明色块。
- 文字层：label/subtitle/title 在下方或左下方；stamp 在右上/右下。
- `caption` 渲染 `<figcaption>`，在图片外；与 overlay title 不重复。
- 所有装饰层 `aria-hidden`、`pointer-events: none`。
- 图片失败：显示 fallback，文字层仍可读；onError 触发。

## 5. 事件与状态

- `onLoad` / `onError` 透传图片事件；组件内部处理回退。
- 状态：Loading、Loaded、Error；无交互状态。
- 点击行为不内置；由调用方包裹链接或按钮。
- 不做 hover 缩放/视差；需要时在父容器实现，避免与材质/装饰冲突。

## 6. 视觉

- 默认 archival：暖调、轻暗角、文字侧渐变遮罩；film：冷调、颗粒、镜头暗角。
- 文字必须与遮罩配合保证对比度；亮图/暗图都要验证。
- 标题使用 display 字体，副标题 caption，label 可放 Tag/ArchiveLabel。
- 印章允许小角度旋转；不要遮住标题。
- `frame="film"` 的齿孔条是 L4 构成资产，不继承图片纹理/材质；不占用伪元素。
- 不使用运行时大滤镜；处理层尽量资产化/CSS 叠加。
- 图注使用 caption/secondary，与封面保持间距。

## 7. 组合与扩展

- 作为 ArchiveCard 的 `cover`；也可独立用于展览位。
- 印章：ArchiveStamp；标签：Tag/ArchiveLabel。
- 需要多图轮播/预览时另立组件，不向 ArchiveCover 添加状态。
- 需要不同画框时通过 `frame` 预设扩展，不开放任意装饰插槽。

## 8. 无障碍

- 图片 `alt` 必填；装饰封面用 `alt=""`。
- 标题若存在，渲染 `h{headingLevel}`；不要只把标题画在图片上而无文本节点。
- 遮罩不得导致文字对比度不足；两主题下都要验证。
- 印章文本可读；装饰印章 `aria-hidden`。
- `caption` 使用 `<figcaption>`，不要与 alt 重复。
- 整卡链接若包裹封面，内部不得再嵌套链接/按钮。
- 文字层不拦截指针事件（除非是链接/按钮）；避免图片无法点击。

## 9. 示例

```tsx
<ArchiveCover
  src="/archive/letter.webp"
  alt="带有水渍的信件封面"
  title="雨夜来信"
  subtitle="私人通信 · 1972"
  label={<Tag tone="gold">机密</Tag>}
  stamp={<ArchiveStamp label="已归档" rotate={-4} />}
  treatment="archival"
  overlay="gradient"
  ratio="4/3"
  caption="信纸边缘有明显水渍与折痕。"
/>

<ArchiveCover
  src="/archive/film.webp"
  alt="夜间街道的胶片影像"
  title="伦敦，1972"
  treatment="film"
  frame="film"
/>

<ArchiveCover src={src} alt="档案封面" fallback={<Empty variant="compact" title="封面不可用" />} />
```

## 10. 边界情况

- 无 title：只显示图片与可选 caption；仍需要 alt。
- 无 src/失败：fallback；不得空白无提示。
- 超长标题：限制最大宽度并换行；不覆盖印章到不可读。
- 亮色图片 + 无遮罩：对比度不足；overlay="none" 由调用方承担风险，文档警告。
- 印章与 label 同时存在：避免右上角拥挤；窄屏可下移。
- `ratio` 非法：回退 4/3 并警告。
- `frame="film"` 资产未实现：不得静默降级并标记完成；需标注 pending。
- 图片为装饰且无 caption：figure 仍保留；无重复朗读。
- 在 paper 面板内：封面不继承面板纹理；使用自身 treatment。

## 11. 依赖与实现注意

- 依赖 Image（底层）、内部 ImageLayer/FilmFrame（不公开）。
- 不依赖 ArchiveCard；ArchiveCard 通过 ReactNode 注入封面。
- 不硬编码遮罩色；使用 `--au-color-overlay` / 光影 Token。
- 齿孔/画框为 L4 构成资产；不得烘焙进图片纹理，也不得占用材质伪元素。
