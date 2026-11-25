# Avatar

> 状态：草案（阶段一）· 需人工审核。M1 基础组件。

## 1. 职责

展示人物/实体的头像，支持图片、姓名首字母回退与加载失败回退。它解决的是“图片不可用时仍保持身份可识别”的问题。

**使用场景**：档案人物、用户、机构标识、评论区。
**不适用**：一般装饰图片（用 Image）；产品/项目封面（用 ArchiveCover/Image）；可点击入口（Avatar 不是按钮）。
**区别**：Avatar 有固定的身份回退与形状语义；Image 是通用图片。

## 2. 边界

- 不内置上传/裁剪/编辑能力。
- 不做在线状态角标；需要时与 Badge 组合。
- 不提供 `href`/点击行为；需要入口时用链接包裹。
- 不负责生成复杂图片；回退文本只做显示名称的 initials。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` | — | 图片地址 |
| `alt` | `string` | `name ?? ''` | 图片替代文本；纯装饰用空串 |
| `name` | `string` | — | 显示名，用于 initials 与回退可访问名称 |
| `fallback` | `ReactNode` | initials / 图标 | 自定义回退内容 |
| `size` | `Size` | `'md'` | 32 / 40 / 56 |
| `shape` | `'circle' \| 'square'` | `'circle'` | 形状 |
| `onImageError` | `(event: SyntheticEvent<HTMLImageElement>) => void` | — | 图片加载失败回调；组件仍会回退 |

```tsx
import type { HTMLAttributes, ReactNode, SyntheticEvent } from 'react';
import type { Size } from '../api-conventions';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  src?: string;
  alt?: string;
  name?: string;
  fallback?: ReactNode;
  size?: Size;
  shape?: 'circle' | 'square';
  onImageError?: (event: SyntheticEvent<HTMLImageElement>) => void;
}
```

## 4. 事件与状态

- `onImageError`：图片失败时触发一次；内部状态切换到回退。
- 无 `onLoad`；需要加载状态时由外层控制。
- 状态：Image、Fallback、Loading（图片请求中，显示回退占位）、Error（回退）。
- 不提供 disabled/selected；这些属于容器或 Badge。

## 5. 视觉

- 图片 `object-fit: cover`；圆形/方形由 `shape` 决定。
- 回退底色使用 `bg-elevated` 或 accent 的低强度表面；文字使用 UI/numeric 字体，居中。
- initials：拉丁名取前两个词首字母大写；中文名取前两个字符；单字名取一字。
- 不在头像上叠加强纹理；film/paper 材质不适用于头像。
- 无边框或仅有 hairline 边框；不使用发光。

## 6. 组合与扩展

- 在线状态：与 Badge 组合（Badge 附着模式），不要给 Avatar 增加 `status`。
- 用户菜单：Avatar 作为触发元素的视觉内容，外层用 Button/Popover。
- 群组头像：由调用方叠放多个 Avatar，组件不提供 AvatarGroup（待确认需求）。

## 7. 无障碍

- 有 `src` 且信息性：`alt` 必填或使用 `name`；不要朗读“头像”这种无信息文本。
- 纯装饰头像：`alt=""`，且同一信息在文本中存在。
- 回退时，根元素提供可访问名称（`role="img"` + `aria-label={name}`），或由调用方在外部提供。
- 不把 initials 本身作为唯一名称；`aria-label` 使用完整名称。
- 图片加载失败时，回退不应丢失可访问名称。

## 8. 示例

```tsx
<Avatar src="/agents/verne.webp" name="Verne" alt="维尔纳" />
<Avatar name="张岱" />
<Avatar fallback={<UserGlyph aria-hidden />} alt="" />
<Avatar size="lg" shape="square" src={src} name="档案室" />
```

## 9. 边界情况

- 无 src、无 name、无 fallback：渲染空占位；建议开发环境警告并允许纯装饰。
- 图片 404：回退 initials/fallback；`onImageError` 仍触发。
- `src` 变化：重新尝试加载新图，失败状态重置。
- 长姓名/无空格：initials 截取前两个字符，不撑破圆形。
- 非拉丁字符：按 grapheme 切分，避免拆断组合字符。
- `alt=""` 且无外部名称：允许纯装饰，但不得承载唯一身份信息。

## 10. 依赖与实现注意

- 无组件依赖；不依赖 Image，避免把通用图片能力与身份回退耦合。
- 图片使用原生 `<img>`；设置 `decoding="async"` 可作为实现细节。
- 内部维护图片错误状态；`src` 改变时重置。
- 不硬编码头像尺寸色值；使用语义 Token。
