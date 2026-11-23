# 任务：初始化 archive-ui-react 前端组件库项目

## 一、项目背景与定位

我要创建一个独立的 React 前端 UI 组件库，项目名称为 `archive-ui-react`。

archive-ui-react 是一个基于 React 和 TypeScript 开发的独立前端 UI 组件库。

项目旨在为具有复古档案、古典出版物、神秘学等视觉气质的 Web 应用提供一套具有统一设计语言的 UI 组件与视觉系统。

项目的核心目标不是简单地提供一套配色或 CSS 皮肤，而是构建一套可复用、可组合、具有自身视觉表现力的设计系统。

核心视觉能力包括：

- 多层背景与材质组合。
- 组件之间风格化的布局。
- 纹理叠加与表面效果。
- 图片嵌入背景及多种构图方式。
- 装饰性边框、角饰、印章与分隔线。
- 出版物式的文字组织和信息层次。
- 统一的主题、颜色、字体与设计 Token。

项目将作为独立 Git 仓库开发，最终构建为 npm 包，供其他 React 项目安装使用。

---

## 二、已经确定的技术决策

请严格遵循以下决策，不要擅自更换技术路线。

| 项目 | 决策 |
|---|---|
| 项目名称 | archive-ui-react |
| UI 框架 | React |
| 开发语言 | TypeScript |
| 样式方案 | CSS + CSS Variables |
| 包管理器 | pnpm |
| 构建工具 | Vite |
| 单元测试 | Vitest |
| 浏览器测试 | Playwright |
| 文档与预览 | React Playground |
| 发布生态 | npm |
| 仓库结构 | 独立 Git 仓库，单仓库、单 npm 包 |

React 和 React DOM 应作为 peerDependencies，不应由组件库重复打包。

首版只支持 React，不开发 Vue 版本，也不需要为其他框架预留适配架构。

### 2.1 依赖管理

- React 和 React DOM 应作为 peerDependencies。
- React 和 React DOM 不得被重复打包进组件库产物。
- 其他开发工具和测试工具根据实际需要配置。
- 使用 pnpm 管理项目依赖。

**React 版本兼容约定：**

- 首版 peerDependencies 采用 `react >=18.2.0 <20.0.0`。
- `react-dom` 采用相同的版本范围。
- React 与 React DOM 应保持相同主版本。
- Vite 构建时必须将 React、React DOM 及其相关运行时入口正确配置为 external。
- 不得通过重复安装 React 的方式解决组件库与宿主项目之间的依赖问题。
- 版本范围表示声明的兼容目标，仍需通过实际测试验证 React 18 和 React 19 的兼容性。
- 未经过验证，不要擅自扩大兼容版本范围。

### 2.2 构建与发布

- 使用 Vite 完成组件库构建。
- 构建产物应包含 JavaScript、TypeScript 类型声明和 CSS。
- 组件库应支持通过 npm 生态安装和使用。
- 字体、纹理、装饰图片等静态资源应具有明确的组织和引用方式。
- 不得假设开发环境中的资源路径在 npm 安装后仍然有效。
- 构建产物应能够在独立 React 项目中正常使用。

### 2.3 CSS 发布策略

首版采用全量 CSS 发布策略：

- 提供统一的 `style.css` 样式入口。
- 使用者通过一次 CSS 导入即可加载组件库样式。
- 首版不实现组件级按需 CSS 导出。
- 不要求首版实现 CSS-in-JS 或运行时样式生成。
- 后续如果组件规模和实际使用需求增加，再评估组件级 CSS 拆分。

推荐使用方式：

```tsx
import 'archive-ui-react/style.css';
import { Panel, Button } from 'archive-ui-react';
```

实际导出路径必须与构建产物和 package.json exports 保持一致。

### 2.4 工程组织策略

首版采用单仓库、单 npm 包结构。

- 根目录作为组件库 npm 包。
- Playground 作为组件库的独立开发预览入口。
- Playground 与组件库共享根项目的开发依赖和 TypeScript 配置。
- 不启用 pnpm workspace。
- 不拆分多个 npm 包。
- 不为了 Playground 创建额外的包管理层级。

如果未来 Playground 需要独立发布或出现多个可独立管理的工作区，再考虑引入 pnpm workspace。

---

## 三、架构原则

### 3.1 设计系统优先

组件库应围绕统一的设计系统组织，而不是让每个组件独立定义颜色、字体、间距和视觉效果。

优先建立统一的 Design Tokens，包括但不限于：

- 颜色。
- 字体与字号。
- 间距。
- 圆角。
- 边框。
- 阴影。
- 层级。
- 动效。

Design Tokens 应同时考虑 TypeScript 使用方式和 CSS Variables 使用方式。

### 3.2 组件职责明确

- 每个组件应具有明确的职责和使用场景。
- 公共组件应提供清晰、稳定的 Props API。
- 避免组件之间不必要的强耦合。
- 避免为了抽象而抽象。
- 不要过早建立复杂的组件继承体系。

### 3.3 样式统一管理

- 优先通过 Design Tokens 管理共享视觉属性。
- CSS Variables 用于实现主题和动态样式配置。
- 避免在多个组件中重复定义相同的视觉参数。
- 组件样式应具有明确的作用范围，避免污染外部应用。

**CSS 命名规范：**

所有组件库自定义 CSS class 必须使用统一前缀 `au-`。

例如：

```css
.au-panel {}
.au-panel__header {}
.au-panel__content {}

.au-button {}
.au-button--primary {}
.au-button--disabled {}
```

具体约定：

- 组件根节点使用 `au-{component}`。
- 子元素使用 `au-{component}__{element}`。
- 状态和变体使用 `au-{component}--{modifier}`。
- 不得使用容易与宿主项目冲突的通用 class 名称，例如 `.container`、`.header`、`.content`。
- 不得随意覆盖宿主项目的全局样式。
- 不得将组件样式泄漏到不相关的 DOM 元素。
- 全局 CSS 只允许在明确需要的基础样式和主题变量范围内使用。

CSS 前缀是样式隔离的基础措施，不代表完整的 Shadow DOM 隔离。

### 3.4 主题机制

首版采用纯 CSS Variables 驱动主题。

基本原则：

- Design Tokens 提供默认主题变量。
- 主题通过 CSS Variables 实现。
- 使用 `data-theme` 属性或明确的主题根节点切换主题。
- 组件通过引用 CSS Variables 获取颜色、字体、边框等视觉属性。
- 不在组件内部硬编码大量主题相关数值。

例如：

```css
:root {
  --au-color-background: #f1eadb;
  --au-color-text: #352d25;
  --au-color-border: #a99b82;
}

[data-theme="dark"] {
  --au-color-background: #29251f;
  --au-color-text: #e5dccb;
  --au-color-border: #766b59;
}
```

上述颜色仅为示例，不代表最终设计规范。

首版不引入 React Theme Context Provider，也不要求通过 React Context 管理主题。

后续如果确实需要主题状态管理、主题编辑器或复杂的组件级主题继承，再根据实际需求引入相应机制。

### 3.5 视觉资源分层

纹理、图片、字体、装饰元素等资源应与组件逻辑保持清晰的组织关系。

对于复杂视觉组件，应允许多个视觉层共同构成最终表现。

例如，一个 Panel 可以在概念上包含：

1. 基础背景。
2. 材质与纹理。
3. 图片图层。
4. 遮罩。
5. 内容。
6. 边框与装饰。

不要求本次初始化实现完整的视觉图层系统，只需为后续扩展提供合理的工程基础。

### 3.6 静态资源管理

组件库的静态资源必须考虑 npm 安装后的实际运行环境。

资源管理约定：

- 组件运行时依赖的字体、纹理、装饰图片等资源，应放在组件库源码可管理的资源目录中。
- 组件源码和 CSS 应通过相对路径引用对应资源。
- 优先采用 Vite 能够识别和处理的资源导入方式。
- 构建时由 Vite 负责资源复制、文件名生成和引用路径处理。
- 构建后的资源应随 npm 包一起发布，推荐组织在 `dist/assets/` 下。
- CSS 中的字体和图片引用必须经过构建处理，不能依赖开发服务器路径。
- 不允许在组件源码中直接使用 `/public/...` 或其他依赖宿主网站根路径的资源地址。
- 不允许将 Playground 专属资源路径当作组件库运行时资源路径。
- 不允许将资源路径硬编码为某个具体开发环境的绝对路径。

`public/` 目录可以用于 Playground 或开发预览专属的静态资源，但不应作为组件库运行时资源的默认引用方式。

构建完成后，必须检查资源是否真正进入 npm 包，以及 CSS、JavaScript 中的资源引用是否有效。

### 3.7 可维护性优先

- 保持代码结构清晰。
- 优先采用简单、成熟的实现。
- 不引入当前阶段不需要的复杂依赖。
- 不创建没有实际用途的抽象层。
- 不为了追求目录完整而创建大量空文件。

---

## 四、项目目录结构

首版采用单仓库、单 npm 包，不拆分多个独立 npm 包。

请在保持合理模块边界的前提下，建立以下目录结构：

```text
archive-ui-react/
│
├── src/
│   ├── tokens/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── index.ts
│   │
│   ├── styles/
│   │   ├── base.css
│   │   ├── themes/
│   │   ├── materials/
│   │   ├── textures/
│   │   ├── decorations/
│   │   └── components/
│   │
│   ├── assets/
│   │   ├── fonts/
│   │   ├── textures/
│   │   └── ornaments/
│   │
│   ├── components/
│   │   ├── Panel/
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Badge/
│   │   ├── Heading/
│   │   └── Input/
│   │
│   ├── hooks/
│   ├── utils/
│   └── index.ts
│
├── playground/
│   └── src/
│
├── docs/
│   ├── design-system.md
│   ├── architecture.md
│   ├── component-guidelines.md
│   └── development.md
│
├── public/
│   └── playground/
│
├── tests/
│
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.ts
├── .gitignore
└── README.md
```

说明：

- `src/assets/` 用于组件库运行时需要的静态资源。
- `public/` 用于 Playground 或开发预览专属的静态资源。
- `src/styles/` 管理组件样式、主题、材质及装饰样式。
- `src/tokens/` 管理设计系统的 TypeScript Tokens。
- `src/components/` 管理实际对外提供的 React 组件。
- `playground/` 管理独立的开发预览界面。
- `tests/` 管理测试代码。

可以根据实际工程需要调整细节，但不得破坏上述模块职责。

不要为了目录结构好看而创建大量空文件和无意义抽象。

---

## 五、Playground 要求

Playground 是组件库的重要开发设施，不只是一个静态文档页面。

请基于 React + Vite 建立独立的开发预览入口。

首版规划以下页面：

1. Overview：项目介绍与设计理念。
2. Components：组件预览、属性和状态展示。
3. Materials：材质、纹理、图片图层、遮罩和边框调试。
4. Theme Editor：Design Tokens 编辑与实时主题预览。

当前任务只需要搭建页面结构和基础导航，不需要提前实现完整的视觉编辑器。

但必须保证后续能够逐步加入实时属性调节、材质切换和组合预览功能。

Playground 应直接使用正在开发的组件库代码，避免维护一套与实际发布版本不一致的演示实现。

**额外要求：**

- Playground 必须能够加载组件库实际 CSS。
- Playground 不得自行复制一套组件实现。
- Playground 可以为开发预览提供独立布局和辅助样式。
- Playground 的专属样式不得污染组件库样式。
- Playground 应能够验证主题变量的实时变化。
- Playground 中使用的组件必须与组件库实际导出的组件保持一致。

除源码开发预览外，还应提供独立 npm 包验证方式：

1. 构建组件库。
2. 使用 `pnpm pack` 或等效方式生成 npm 包归档。
3. 在独立 React 测试项目中安装该归档。
4. 验证组件导入、CSS 导入、类型声明和静态资源加载。

不能仅凭 Playground 能够正常显示，就认定 npm 包可以正常使用。

---

## 六、工程配置要求

请完成以下基础配置：

1. pnpm 项目初始化。
2. TypeScript 配置。
3. React 和 React DOM 配置。
4. Vite 开发与构建配置。
5. Vitest 测试配置。
6. ESLint 配置。
7. Prettier 配置。
8. Playwright 基础配置。
9. npm 包构建配置。
10. TypeScript 类型声明导出。
11. CSS 样式入口导出。
12. 合理的 package.json exports 配置。

React 和 React DOM 应配置为 external，并通过 peerDependencies 声明兼容版本。

组件库应提供类似以下的使用方式：

```tsx
import 'archive-ui-react/style.css';

import { Panel, Button } from 'archive-ui-react';
```

具体导出路径应与实际构建产物保持一致。

构建产物至少需要考虑：

- JavaScript 模块。
- TypeScript 类型声明。
- CSS 样式文件。
- 运行时需要的字体、纹理及其他静态资源。

注意静态资源在 npm 包安装后的路径问题，不要让资源只能在 Playground 中正常加载。

**CSS 导出要求：**

- 首版只提供全量 `style.css`。
- package.json 的 exports 应明确声明样式入口。
- `sideEffects` 配置必须考虑 CSS 文件，不能因为 Tree Shaking 导致样式被错误删除。
- CSS 应能够在宿主 React 项目中正常加载。

**类型声明要求：**

- 组件 Props 应具有明确的 TypeScript 类型。
- 对外公开的组件类型应能够从主入口导出。
- 类型声明应与实际 JavaScript 导出保持一致。
- 不允许依赖 Playground 内部类型才能使用组件库。

**静态资源要求：**

- 资源必须能够随 npm 包发布。
- 不得依赖开发服务器的 public 路径。
- 构建后必须检查资源引用的完整性。
- npm 包应包含运行组件所必需的资源文件。

---

## 七、文档要求

初始化完成后，应提供以下文档。

### 7.1 README.md

至少包含：

- 项目简介。
- 项目定位。
- 技术栈。
- 安装方式。
- 基本使用示例。
- 本地开发方式。
- 构建和测试命令。

### 7.2 docs/architecture.md

记录当前项目实际采用的架构，包括：

- 项目模块划分。
- 组件组织方式。
- 样式组织方式。
- Design Tokens 的组织方式。
- 主题机制。
- CSS 命名规范。
- 资源管理方式。
- 构建产物组织方式。
- Playground 与组件库的关系。

注意：只记录已经实际确定或实现的架构，不要将推测性的未来设计写成既定事实。

### 7.3 docs/development.md

记录：

- 环境要求。
- 依赖安装。
- 本地开发。
- Playground 启动。
- 测试。
- 类型检查。
- 构建。
- 代码规范。
- npm 包本地验证方式。

### 7.4 文档真实性

- 如果某文档已存在，则在已有文档内容的基础上进行增量更新。
- 文档必须与实际代码和配置保持一致。
- 不得虚构已经实现的功能。
- 尚未实现的能力应明确标记为计划或待实现。
- 如果实际实现与本文档中的预期存在差异，应在交付报告中说明。

---

## 八、本次任务的开发范围

本次任务是工程初始化，不是完整组件库开发。

请按照以下顺序执行。

### 阶段 1：工程骨架

- 创建项目目录。
- 初始化 Git。
- 配置 pnpm。
- 建立目录结构。
- 配置 TypeScript、Vite 和 React。
- 确保依赖可以正常安装。

### 阶段 2：基础工程能力

- 配置构建。
- 配置 CSS 入口。
- 配置类型声明。
- 配置测试。
- 配置代码规范。
- 配置 Playground。
- 配置 npm 包导出。
- 确保 CSS 前缀和主题变量机制具备基础支持。
- 确保静态资源能够被正确构建和发布。

### 阶段 3：最小端到端验证

实现一个最小的 Panel 组件，验证完整开发链路：

- 可以在 Playground 中正常显示。
- 可以使用 TypeScript Props。
- 可以加载组件库 CSS。
- 可以应用一个简单的材质样式。
- 可以正常构建。
- 可以通过基础测试。
- 可以模拟从其他 React 项目导入使用。
- 组件 CSS class 遵循 `au-` 命名规范。
- 组件使用 CSS Variables 获取基础视觉属性。
- 构建后的 CSS 和静态资源能够在独立项目中正常加载。

这个 Panel 只是工程验证组件，不代表最终的组件 API 和视觉设计已经确定。

### 阶段 4：文档与交付

- 完成四份基础文档。
- 更新 README。
- 检查目录和依赖关系。
- 执行完整验证。
- 验证 npm 包实际安装和使用流程。

---

## 九、Git 规范

保持 main 分支始终可运行。

功能开发使用 `feat/*` 分支。

提交信息遵循 Conventional Commits：

- feat
- fix
- refactor
- docs
- test
- chore

如果当前目录尚未关联远程仓库，请不要猜测或创建虚假的远程地址。

完成本地 Git 初始化，并在报告中说明如何关联 GitHub 仓库。

---

## 十、质量要求

1. 不要为了目录结构好看而创建大量空文件和无意义抽象。
2. 不要提前实现全部 UI 组件。
3. 不要引入不必要的第三方 UI 组件库。
4. 不要把业务项目特有的样式写入组件库。
5. 不要为了跨框架兼容而增加抽象层。
6. 不要把图片资源路径设计成只能在 Playground 中使用。
7. 注意字体、纹理等静态资源在 npm 构建后的路径问题。
8. 注意 CSS 导入、Tree Shaking 和 TypeScript 类型导出。
9. 关注组件的键盘操作、语义化 HTML 和可访问性。
10. 所有配置应当真实可运行，不接受仅创建文件但配置无法工作的情况。
11. 不要擅自扩大任务范围，也不要提前实现尚未确定的设计规范。
12. React 组件与 CSS 可以根据实际需求紧密协作，不需要人为维持跨框架边界。
13. 所有组件库 CSS class 必须使用 `au-` 前缀。
14. 不得在组件源码中直接引用依赖开发环境路径的静态资源。
15. 首版不引入 React Theme Context Provider。
16. 首版只提供全量 `style.css`，不实现组件级按需 CSS。
17. 不要为了 Playground 单独引入 pnpm workspace。
18. React 和 React DOM 不得进入组件库最终打包产物。

---

## 十一、验收标准

完成后必须实际执行并报告：

```bash
pnpm install

pnpm dev

pnpm build

pnpm test

pnpm typecheck

pnpm lint
```

其中：

- `pnpm dev` 应能够成功启动 Playground。
- `pnpm build` 应能够生成可发布的组件库产物。
- `pnpm test` 应能够执行测试。
- `pnpm typecheck` 应能够完成类型检查。
- `pnpm lint` 应能够完成代码规范检查。

另外，验证构建产物可以被一个独立的 React 测试项目正常导入。

**额外检查：**

- 检查 React 和 React DOM 是否被正确 external。
- 检查组件库是否正确导出 TypeScript 类型。
- 检查 `style.css` 是否存在且可以正常导入。
- 检查 CSS class 是否遵循 `au-` 前缀。
- 检查主题变量是否能够正常应用。
- 检查字体、纹理和装饰资源是否包含在 npm 包中。
- 检查 npm 包中的资源引用是否有效。
- 检查 package.json exports 是否与实际构建产物一致。

如果某项检查没有完成，必须明确说明原因，不得声称全部通过。

---

## 十二、最终交付报告

完成后请提供：

1. 实际创建的项目目录结构。
2. 使用的技术及版本。
3. 各配置文件的作用。
4. 各模块的职责和依赖关系。
5. Playground 的启动方式。
6. Panel 最小验证组件的实现说明。
7. 各项测试与构建的真实执行结果。
8. 构建产物的实际内容和 npm 包使用方式。
9. 静态资源的组织方式及 npm 发布后的引用方式。
10. 主题机制和 CSS 命名规范的实现情况。
11. 尚未完成的事项和已知问题。
12. 下一阶段建议的开发顺序。

---

**最重要的要求：先建立可靠、可运行、易于持续开发的 React 组件库工程基础。项目只服务 React，不需要为 Vue 或其他框架预留兼容架构。**