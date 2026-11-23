# 设计系统说明

本文档记录当前已落地的设计系统内容。视觉规范尚未最终确定，随着组件库演进会持续更新。

## 设计理念

archive-ui-react 面向具有复古档案、古典出版物、神秘学气质的 Web 应用。核心不是提供一层配色皮肤，而是建立可组合的视觉系统：

- 多层背景与材质组合（当前已验证：纯色表面 + 纸张纹理层）
- 装饰元素（当前已验证：四角装饰，通过 SVG mask 实现主题感知）
- 出版物式的文字层次（衬线字体栈、印章色标题）
- 统一 Token（颜色 / 字体 / 间距 / 圆角 / 边框 / 阴影）

## Design Tokens

### 颜色

| Token（CSS Variable） | TS Token（colors） | 亮色值 | 暗色值 |
| --- | --- | --- | --- |
| `--au-color-background` | `colors.background` | `#f1eadb` | `#29251f` |
| `--au-color-surface` | `colors.surface` | `#f7f1e3` | `#322d26` |
| `--au-color-surface-paper` | `colors.surfacePaper` | `#efe6cf` | `#2e2922` |
| `--au-color-text` | `colors.text` | `#352d25` | `#e5dccb` |
| `--au-color-text-muted` | `colors.textMuted` | `#7a6f5d` | `#a3967f` |
| `--au-color-border` | `colors.border` | `#a99b82` | `#766b59` |
| `--au-color-accent` | `colors.accent` | `#8c3b2e` | `#b5533f` |
| `--au-color-shadow` | `colors.shadow` | `rgba(53,45,37,.18)` | `rgba(0,0,0,.4)` |

### 字体

首版使用系统衬线字体栈，不随包分发字体文件：

```css
--au-font-family-body: Georgia, 'Times New Roman', 'Songti SC', 'SimSun', serif;
```

字号 xs–xl（0.75rem–1.5rem）、字重 regular/bold、行高 tight/normal 均有对应 Token。

### 间距 / 圆角 / 边框

- 间距：`--au-space-xs` ~ `--au-space-xl`（0.25rem ~ 2rem）
- 圆角：`--au-radius-small/medium/large`（2px / 4px / 8px）
- 边框宽度：`--au-border-width-thin/medium`（1px / 2px）
- 阴影：`--au-shadow-panel`

## 主题机制

纯 CSS Variables 实现，无 React Theme Context：

```css
/* 默认主题在 :root 定义 */
:root { --au-color-background: #f1eadb; ... }

/* 暗色主题通过 data-theme 属性切换 */
[data-theme='dark'] { --au-color-background: #29251f; ... }
```

使用方式：在任意根节点（通常是 `<html>` 或某个容器）设置 `data-theme="dark"`。

## 材质系统（首个验证层）

当前实现了一种材质：

- `paper`：通过 `.au-material--paper` class 应用，在组件表面 `::before` 上叠加 SVG 噪点纹理（`src/assets/textures/paper-grain.svg`），构建后纹理随 npm 包发布到 `dist/assets/`。

材质 class 设计为可组合：任何 `au-` 组件根节点附加 `au-material--paper` 即可获得纸面质感（Panel 的 `material="paper"` prop 内部即应用该 class）。

## 装饰系统（首个验证层）

四角装饰：Panel 的 `corners` prop 渲染四个 `au-panel__corner` 元素，CSS 使用 SVG 作为 `mask`，填充色引用 `--au-color-border`，因此装饰颜色跟随主题变化。

## 命名规范

所有组件库 CSS class 使用 `au-` 前缀 BEM：

```css
.au-panel {}                 /* 组件根节点 */
.au-panel__header {}         /* 子元素 */
.au-panel--corners {}        /* 状态/变体 */
.au-material--paper {}       /* 跨组件材质层 */
```

禁止使用 `.container`、`.header` 等易冲突的通用名称；Playground 专属样式使用 `pg-` 前缀。

## 未实现（计划中）

- 完整 Token 体系：动效 Token（当前仅有 `--au-transition-base`）、层级（z-index）Token 未定义。
- 材质扩展：图片图层、遮罩、多材质组合尚未设计。
- 装饰扩展：印章、分隔线、角饰变体尚未实现。
- 字体：未随包分发主题字体，视觉上依赖系统衬线字体。
