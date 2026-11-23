# archive-ui-react

## 简介

仿照游戏《重返未来：1999》美术风格的前端组件库，用于特定风格的网页搭建。

基于 React + TypeScript + CSS Variables 开发，目标是提供具有复古档案、古典出版物、神秘学视觉气质的统一设计系统：多层背景材质、纹理叠加、装饰边框与角饰、出版物式文字层次，以及统一的设计 Token 与主题机制。

## 技术栈

| 项目 | 技术 |
|---|---|
| UI 框架 | React（peerDependencies，>=18.2.0 <20.0.0） |
| 开发语言 | TypeScript |
| 样式方案 | CSS + CSS Variables |
| 构建 | Vite（lib 模式）+ esbuild（CSS） |
| 包管理 | pnpm |
| 单元测试 | Vitest |
| 浏览器测试 | Playwright |

## 安装

```bash
pnpm add archive-ui-react
```

## 基本使用

```tsx
import 'archive-ui-react/style.css';
import { Panel } from 'archive-ui-react';

export default function App() {
  return (
    <Panel title="卷宗" material="paper" corners footer="档案编号 001">
      内容区域
    </Panel>
  );
}
```

暗色主题：在根节点设置 `data-theme="dark"`。

> 当前处于工程初始化阶段，仅提供 Panel 验证组件，组件 API 与视觉规范尚未最终确定，不建议用于生产。

## 本地开发

```bash
pnpm install          # 安装依赖
pnpm dev              # 启动 Playground（http://localhost:5173）
pnpm build            # 构建 npm 包产物到 dist/
pnpm test             # 运行单元测试
pnpm typecheck        # 类型检查
pnpm lint             # ESLint 检查
```

详细说明见 [docs/development.md](docs/development.md)，架构见 [docs/architecture.md](docs/architecture.md)，设计系统见 [docs/design-system.md](docs/design-system.md)。

## 项目结构

```text
archive-ui-react/
├── src/                  # 组件库源码（tokens / styles / assets / components）
├── playground/           # 开发预览应用（Overview / Components / Materials / Theme Editor）
├── docs/                 # 项目文档
├── public/playground/    # Playground 专属静态资源
└── tests/                # 单元测试与 E2E 测试
```

## 版本变更

### v0.1.0 工程初始化

1. 建立工程骨架：Vite lib 模式构建、TypeScript 类型声明、全量 style.css 入口、Vitest / Playwright / ESLint / Prettier 配置。
2. Design Tokens（颜色 / 字体 / 间距）与 CSS Variables 主题机制（含暗色主题）。
3. 最小验证组件 Panel：Props 类型、`au-` 命名、paper 材质纹理、四角装饰。
4. Playground 四页面骨架与主题变量实时编辑验证。
5. npm 包链路验证：pnpm pack 归档在独立 React 项目中完成导入 / 样式 / 类型 / 静态资源验证。

### v0.0.1 项目初始化

1. 项目初始化，readme.md和.gitignore的创建。
