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

主题：默认为暗色档案主题（Ink Archival）；在根节点设置 `data-theme="light"` 切换到亮色羊皮纸主题。设计语言见 [docs/design-system.md](docs/design-system.md)。

> 当前视觉基线已冻结（设计规范见 [docs/design-system.md](docs/design-system.md)，渲染架构见 [docs/rendering-system.md](docs/rendering-system.md)），进入组件集开发阶段；现有 Panel 为验证组件，组件 API 将随组件集开发持续演进，不建议用于生产。

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
├── playground/           # 开发预览应用（Overview / Components / Materials / Render Lab / Theme Editor）
├── docs/                 # 项目文档
├── public/playground/    # Playground 专属静态资源
└── tests/                # 单元测试与 E2E 测试
```

## 版本变更

### v0.2.1 2026-11-25 组件开发文档

1. 文档待审阅

### v0.2.0 设计语言 V0.1（ARCHIVE UI）· 视觉基线冻结

1. 确立设计语言「ARCHIVE UI · Retro-Futurist Editorial」，九维度设计规范见 docs/design-system.md。
2. Token 重构为三层：Primitive（原始色板/字体角色/材质/光影/装饰）→ Semantic（用途映射）→ 组件引用。
3. 默认主题切换为暗色档案（Ink Archival），新增亮色羊皮纸主题（data-theme="light"）。
4. 字体体系改为四角色（display / editorial / ui / numeric）；Panel、材质、角饰按新规范重做。
5. 光影 Token（暗角/环境光/辉光/旧金属渐变）落地；paper 材质增加暗角层与强度 Token 化。
6. 渲染体系定稿：五层模型（Base/Texture/Lighting/Structure/Interaction）、三槽位合成、纹理混合模式入口（normal / multiply）、氛围层、主题成对图源机制（见 docs/rendering-system.md 与 docs/decisions/）。
7. 三材质定稿：plain（哑光微颗粒+纵深）、paper（深棕+灯光氛围+纤维斑驳）、film（真实乳剂亮度图 × multiply，明暗成对）；参数见 docs/materials/。
8. 装饰体系：边框/角饰/分隔线/纹章/纹样词汇冻结（含 Signature 致敬复用），实现规则见 design-system 维度 04。
9. Playground 扩展 Render Lab（资产目录/槽位解构/图层沙盘/混合矩阵/材质样品/维度归因/构成变体库），说明见 docs/playground.md；构建管线支持位图资产（webp/jpg/png）。

### v0.1.0 工程初始化

1. 建立工程骨架：Vite lib 模式构建、TypeScript 类型声明、全量 style.css 入口、Vitest / Playwright / ESLint / Prettier 配置。
2. Design Tokens（颜色 / 字体 / 间距）与 CSS Variables 主题机制（含暗色主题）。
3. 最小验证组件 Panel：Props 类型、`au-` 命名、paper 材质纹理、四角装饰。
4. Playground 四页面骨架与主题变量实时编辑验证。
5. npm 包链路验证：pnpm pack 归档在独立 React 项目中完成导入 / 样式 / 类型 / 静态资源验证。

### v0.0.1 项目初始化

1. 项目初始化，readme.md和.gitignore的创建。
