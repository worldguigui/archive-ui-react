# 组件开发规范

本文档规定向 `src/components/` 新增组件时遵循的约定。规范基于 Panel 组件建立的模式，随组件库演进增量调整。

## 目录与文件

```text
src/components/{Component}/
├── {Component}.tsx    # 组件实现
└── index.ts           # 导出组件与 Props 类型
```

- 不在组件目录内放组件 CSS；组件样式统一放在 `src/styles/components/{component}.css`，并在 `src/styles/style.css` 中 `@import`。
- 组件入口必须在 `src/index.ts` 中导出（组件本身 + Props 类型）。

## Props 设计

- Props 接口命名为 `{Component}Props`，从组件文件导出。
- 继承原生元素属性时使用 `HTMLAttributes<HTMLElement>`，并 `Omit` 掉需要覆盖为 ReactNode 的属性（如 Panel 对 `title` 的处理：原生 title 是 string，Panel 的 title 是 ReactNode）。
- 用明确的 prop 类型而不是 string 字面量散落：变体用联合类型（如 `PanelMaterial = 'plain' | 'paper'`）。
- 布尔开关用名词（如 `corners`），变体用名词值（如 `material="paper"`）。
- 支持 `className` 合并（通过 `utils/cn.ts`）与属性透传（展开 rest props），保证使用方可以附加行为与样式。

## 样式规则

- 组件根节点 class：`au-{component}`；子元素：`au-{component}__{element}`；变体/状态：`au-{component}--{modifier}`。
- 组件样式一律引用 CSS Variables（`--au-*`），不得硬编码颜色、字号、间距。
- 视觉数值先查 `src/styles/themes/default.css` 是否已有对应 Token，没有则先补 Token 再使用。
- 不使用行内样式承载主题相关视觉。
- 不编写影响宿主全局元素的样式（如 `body`、`*` 选择器）。

## 资源引用

- 运行时图片/纹理放在 `src/assets/` 对应子目录，CSS 中用相对路径引用。
- 禁止引用 `public/`、开发服务器绝对路径、外部 URL 作为组件运行时资源。
- 新增资源后执行 `pnpm build`，确认资源进入 `dist/assets/` 且 `dist/style.css` 中的引用路径有效。

## 可访问性

- 优先使用语义化 HTML（Panel 使用 `section` + `header`/`footer`）。
- 纯装饰元素设置 `aria-hidden="true"`（如 Panel 的四角装饰）。
- 交互组件需支持键盘操作；后续实现 Button、Input 等交互组件时补充焦点与键盘行为约定。

## 测试要求

新增组件时至少提供（参考 `tests/unit/Panel.test.tsx`）：

- 渲染测试：标题/内容等核心内容可见。
- 命名测试：根节点使用 `au-{component}` class。
- 变体测试：每个变体应用对应 modifier class。
- 合并测试：外部 className 合并与属性透传。

## 文档同步

组件落地后，在 Playground 的 Components 页面添加预览（保持使用与发布版一致的导入路径），并更新 `docs/design-system.md` 中涉及的 Token 或材质说明。
