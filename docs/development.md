# 开发指南

## 环境要求

- Node.js >= 20（当前开发环境为 v22.22.2）
- pnpm >= 10（当前开发环境为 v12.5.1）
- Git

## 依赖安装

```bash
pnpm install
```

> pnpm 默认拦截依赖的安装脚本。本项目已在 `pnpm-workspace.yaml` 中批准 `esbuild` 的构建脚本（Vite 的必要依赖），首次安装后如仍提示 ignored build scripts，执行 `pnpm approve-builds esbuild`。

## 本地开发

```bash
# 启动 Playground（http://localhost:5173）
pnpm dev
```

Playground 直接引用组件库源码（通过 alias 映射 `archive-ui-react` 与 `archive-ui-react/style.css` 导入路径），修改源码后浏览器热更新。

## 测试

```bash
# 单元测试（Vitest + jsdom）
pnpm test

# 监听模式
pnpm test:watch

# 浏览器端到端测试（Playwright）
# 首次运行前需要安装浏览器：
pnpm exec playwright install chromium
pnpm test:e2e
```

## 类型检查

```bash
pnpm typecheck
```

## 构建

```bash
# 构建组件库 npm 包产物（JS + 类型声明 + style.css + 静态资源）
pnpm build
```

产物输出在 `dist/`，其中：

- `index.js` / `index.cjs`：ESM / CJS 模块（React 已 external）
- `index.d.ts` 及目录化的 `.d.ts`：类型声明
- `style.css`：全量样式
- `assets/`：CSS 引用的纹理、装饰 SVG

## 代码规范

```bash
# ESLint 检查
pnpm lint

# Prettier 格式化 / 检查
pnpm format
pnpm format:check
```

## npm 包本地验证

在发布前，用独立项目验证构建产物：

```bash
# 1. 构建并生成归档
pnpm build
pnpm pack --pack-destination <输出目录>

# 2. 在独立 React 项目中安装归档
pnpm add <归档文件路径 .tgz>

# 3. 在独立项目中验证
#    - import { Panel } from 'archive-ui-react' 可用
#    - import 'archive-ui-react/style.css' 可用
#    - TypeScript 类型可解析
#    - CSS 中的纹理/装饰资源引用有效
```

参考实现：`d:/codes/au-verify/consumer`（初始化时的验证项目，使用 `file:` 协议安装归档并通过 `vite build && tsc --noEmit` 验证）。

## Git 规范

- `main` 分支保持可运行。
- 功能开发使用 `feat/*` 分支。
- 提交信息遵循 Conventional Commits（feat / fix / refactor / docs / test / chore）。
