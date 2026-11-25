# FilmFrame

> 状态：**待确认——建议内部化，不公开导出**。M4 档案特色组件。
> 建议以 `ArchiveCover frame="film"`（未来可扩展到 `Image frame="film"`）的视觉预设存在，而不是独立 React 组件。

## 1. 建议

FilmFrame 是“齿孔条/胶片画框”的 L4 构成装饰。它没有独立信息结构，行为只是包裹内容并绘制装饰；公开后：

- 与 `ArchiveCover` 的 `frame` 预设重叠；
- 与 `Image` 的边框/处理预设重叠；
- 调用方需要理解 L4 装饰与材质槽的边界，违背“基础使用保持简单”。

建议内部化为画框预设，由 ArchiveCover 暴露 `frame="film"`。

## 2. 若公开的职责

在任意内容外绘制胶片齿孔画框与帧号，模拟底片条。它解决的是“展示位需要胶片叙事装饰”的问题——属于视觉预设，而非交互组件。

## 3. 若公开的 Props 草案

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `children` | `ReactNode` | **必填** | 被框住的内容 |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | 齿孔方向 |
| `frameNo` | `string` | — | 帧号，numeric 字体 |
| `tone` | `'neutral' \| 'gold'` | `'neutral'` | 画框/齿孔颜色 |
| `inset` | `boolean` | `true` | 内容是否内缩留出画框 |

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import type { Orientation } from '../api-conventions';

export interface FilmFrameProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  orientation?: Orientation;
  frameNo?: string;
  tone?: 'neutral' | 'gold';
  inset?: boolean;
}
```

## 4. 语义与风险（若公开）

- 纯装饰根节点；没有语义角色，容易被误用为布局容器。
- 齿孔资产需要在不同尺寸下保持比例；任意 children 可能破坏画框比例。
- 内容溢出/滚动时，画框如何裁剪没有通用答案。
- `frameNo` 是叙事文本，屏幕阅读器应否朗读取决于上下文；API 无法自动判断。
- 与 ArchiveCover 的 `frame` 重复，形成两个入口。

## 5. 视觉约束

- 齿孔条是 L4 构成资产，不继承面板材质纹理；不得占用 `::before` / `::after`。
- 画框允许轻微不对称/磨损，但不得影响内容可读性。
- frameNo 使用 numeric 字体，位置固定在齿孔条边缘。
- 不烘焙暗角；暗角属于素材/图片处理层。
- 不播放胶片抖动动画；仪式性动效另立项。

## 6. 内部契约（推荐）

- `ArchiveCover` 的 `frame="film"` 渲染内部 FilmFrame，加载齿孔/画框资产。
- 未来若 `Image` 需要，也复用同一内部组件；不公开。
- 资产路径与尺寸由视觉规范控制；调用方只选择 `frame` 预设。
- 画框与 `treatment="film"` 是正交的：可以只加画框不调色，也可以只调色不加画框；默认组合需视觉确认。

## 7. 无障碍（若公开）

- 装饰齿孔/画框 `aria-hidden`；frameNo 默认装饰性，若承载信息需调用方提供文本。
- children 的阅读顺序不受画框影响。
- 不添加 tabIndex；画框不可交互。
- 高对比模式下装饰可隐藏，但内容保留。

## 8. 边界情况

- 内容为空：仍绘制空画框；建议调用方避免。
- 超长内容：画框不无限拉伸；内部滚动/裁剪需定义。
- 极小尺寸：齿孔不可辨；低于阈值时隐藏装饰，只保留内容。
- 嵌套 FilmFrame：禁止；会造成双重画框。
- 打印：装饰资产可能失真；不承诺。

## 9. 结论

- 默认：**内部化**，不进入公共导出。
- 对外只暴露 `ArchiveCover frame="film"` 预设；若未来需要独立画框组件，应重新设计为通用的 `Frame` 布局组件，而不是单一胶片皮肤。
