# 架构说明

本文档记录 archive-ui-react 当前实际采用的架构。只记录已实现的内容，未实现的能力会在文末明确标注。

## 项目定位

独立 Git 仓库、单 npm 包的 React UI 组件库，为复古档案、古典出版物、神秘学视觉气质的 Web 应用提供统一设计语言的组件与视觉系统。

技术栈：React + TypeScript + CSS Variables + Vite，pnpm 管理依赖，Vitest 单元测试，Playwright 浏览器测试。

## 模块划分

```text
archive-ui-react/
├── src/                  # 组件库源码（npm 包主体）
│   ├── tokens/           # Design Tokens 的 TypeScript 定义
│   ├── styles/           # 全量样式入口、主题、材质、组件样式
│   ├── assets/           # 运行时静态资源（纹理、装饰 SVG）
│   ├── components/       # React 组件（每组件一个目录）
│   ├── utils/            # 内部工具函数
│   └── index.ts          # 包主入口
├── playground/           # 开发预览应用（独立 Vite 应用）
├── docs/                 # 项目文档
├── public/playground/    # Playground 专属静态资源
├── tests/
│   ├── unit/             # Vitest 单元测试
│   ├── setup.ts          # Vitest setup（jest-dom）
│   └── e2e/              # Playwright 浏览器测试
├── vite.config.ts        # 组件库构建配置（lib 模式）
├── playground/vite.config.ts  # Playground 构建配置
├── vitest.config.ts      # 测试配置
├── tsconfig.json         # TypeScript 基础配置
├── tsconfig.lib.json     # 声明文件构建配置
└── package.json
```

## 组件组织方式

- 每个组件一个目录：`src/components/{Component}/`。
- 组件实现放在 `{Component}.tsx`，目录 `index.ts` 负责统一导出组件与 Props 类型。
- Props 类型从主入口导出，使用方无需依赖内部路径。
- 组件通过 `utils/cn.ts` 合并 class，不引入第三方 class 工具。

## 样式组织方式

- `src/styles/style.css` 是全量样式入口，通过 `@import` 聚合所有样式文件（加载顺序：Token → 主题 → 基础 → 材质 → 组件）。
- 构建时由 esbuild 单独打包为 `dist/style.css`（见下文"构建产物组织方式"）。
- 样式文件分层：
  - `styles/tokens/`：Primitive Token 层，六组文件（`primitives.css` 原始色板、`typography.css` 字体角色、`spacing.css` 间距/圆角/边框、`materials.css` 材质强度、`lighting.css` 阴影/辉光/氛围渐变、`decoration.css` 装饰分级）。组件禁止直接引用本层变量。
  - `styles/themes/default.css`：Semantic 语义层，把 Primitive 值按用途映射（`--au-color-bg-canvas` 等）。默认主题为暗色档案（Ink Archival），`[data-theme='light']` 提供亮色羊皮纸变体。
  - `styles/base.css`：作用于 `au-` 前缀 class 的基础规则（box-sizing、editorial 正文排版基线）。
  - `styles/materials/`：材质层（当前实现 `plain.css` 哑光底材、`paper.css` 暗色纸张、`film.css` 底片乳剂，均只写槽位变量）。
  - `styles/components/`：各组件样式。
- 所有 class 使用 `au-` 前缀 BEM 命名：`au-panel`、`au-panel__header`、`au-panel--corners`。
- 组件不直接 import CSS，消费方通过 `import 'archive-ui-react/style.css'` 一次性加载全量样式（首版策略）。
- 设计语言本体（九维度、色彩逻辑、材质分级、使用边界）见 `docs/design-system.md`。

## Design Tokens 组织方式

- CSS 侧三层：Primitive（`styles/tokens/`）→ Semantic（`styles/themes/default.css`）→ 组件引用语义变量。命名统一为 `--au-*`。
- TS 侧 `src/tokens/` 与 CSS 数值一一对应：`colors.ts`（`primitives` 原始色板 + `semanticDark`/`semanticLight` 语义映射）、`typography.ts`（display/editorial/ui/numeric 四角色）、`spacing.ts`。
- TS Token 仅用于脚本场景（如 Playground 主题编辑器），组件样式一律引用 CSS Variables。

## 主题机制

- 纯 CSS Variables 驱动，无 React Theme Context。
- 默认主题（暗色档案）定义在 `:root`；亮色羊皮纸主题通过 `[data-theme='light']` 选择器重新映射语义变量。
- 使用方在任意根节点设置 `data-theme="light"` 即可切换，语义 Token 名保持不变。
- 组件内不硬编码主题数值，全部引用语义层 `--au-color-*` 等变量。

## 静态资源管理

- 运行时资源位于 `src/assets/`（`textures/`、`ornaments/`；`fonts/` 预留，首版使用系统字体栈）。
- CSS 通过相对路径（如 `../../assets/textures/paper-grain.svg`）引用，构建工具负责改写与拷贝。
- `public/` 仅服务于 Playground 预览，组件库构建配置中 `publicDir: false`，保证 public 资源不混入 npm 包。

## 构建产物组织方式

`pnpm build` 依次执行三个步骤：

1. `vite build`（lib 模式）：打包 JS，输出 `dist/index.js`（ESM）与 `dist/index.cjs`（CJS）。React、React DOM 及 `react/jsx-runtime` 等运行时入口通过正则 `/^react($|\/)/`、`/^react-dom($|\/)/` 声明为 external，不进入产物。
2. `pnpm build:css`（esbuild）：将 `src/styles/style.css` 打包为 `dist/style.css`，CSS 中 `url()` 引用的资产（SVG 与位图 webp/jpg/png）输出到 `dist/assets/` 并改写为相对路径。
3. `tsc -p tsconfig.lib.json`：生成声明文件到 `dist/`（与 JS 产物目录结构一致），入口为 `dist/index.d.ts`。

`package.json` 关键字段：

- `exports`：`.` 指向 JS 与类型入口，`./style.css` 指向样式入口。
- `sideEffects: ["**/*.css"]`：保证 CSS 不被 Tree Shaking 误删。
- `files: ["dist", "README.md"]`。
- `peerDependencies`: `react` 与 `react-dom` `>=18.2.0 <20.0.0`。

## Playground 与组件库的关系

- Playground 是独立 Vite 应用（`playground/vite.config.ts`，root 为 `playground/`）。
- 通过 resolve alias 将 `archive-ui-react` 指向 `src/index.ts`、`archive-ui-react/style.css` 指向 `src/styles/style.css`，因此 Playground 的导入路径与 npm 安装后的真实用法完全一致，不维护第二套组件实现。
- Playground 专属样式使用 `pg-` 前缀（`playground/src/playground.css`），与 `au-` 前缀严格分离。
- Theme Editor 页面通过直接修改 `document.documentElement` 上的 CSS Variables 验证主题机制，未引入 React Context。

## pnpm-workspace.yaml 说明

仓库根目录存在 `pnpm-workspace.yaml`，但其中只有 pnpm 的依赖构建脚本审批配置（`allowBuilds: esbuild: true`，pnpm 10+ 对安装脚本的安全策略要求），没有 `packages` 字段，未启用 workspace。

## 当前未实现（计划中）

- 完整组件集：当前仅有 Panel（工程验证组件），组件 API 已有规范约束但会持续演进。
- 视觉图层系统：油墨 / 金属 / 木质 / 烟熏玻璃材质仅定义了 Token，样式未实现（设计规范见 docs/design-system.md 维度 02；plain / paper / film 已实现，参数见 docs/materials/）。
- 装饰预设 API（`decoration` prop）：装饰词汇已冻结，API 待组件集开发时立项。
- 仪式性交互系统（点击特效）：设计定义完成（维度 09），`src/interaction-effects/` 模块为计划任务。
- 场景主题：`rainy` / `botanical` / `archival` 未实现。
- `src/hooks/`：尚无 hook，目录未创建（避免空目录）。
- 字体文件：首版使用系统字体栈，未随包分发字体。
- 组件级按需 CSS：首版明确不做。

## 文档地图

| 文档 | 职责 |
| --- | --- |
| `docs/design-system.md` | 设计语言规范（九维度、色彩、装饰、验收标准） |
| `docs/rendering-system.md` | 渲染体系与美术资源架构（五层模型、槽位、资产规范） |
| `docs/materials/` | 材质规范（每材质参数明细） |
| `docs/decisions/` | 决策记录（影响长期架构的关键抉择） |
| `docs/component-guidelines.md` | 组件开发规范 |
| `docs/playground.md` | Playground 说明（正式展示 / 校准 / 实验区分区） |
| `docs/architecture.md` / `docs/development.md` | 工程架构 / 开发流程 |
