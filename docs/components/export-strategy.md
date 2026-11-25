# 组件导出与包结构设计

> 状态：草案。本文件只提结构建议，不修改现有构建配置或源码。

## 1. 结论

- 保持**单 npm 包、单 JS 入口、单 CSS 入口**。
- 公开导入只支持：
  ```tsx
  import { Button, Card, Input } from 'archive-ui-react';
  import 'archive-ui-react/style.css';
  ```
- **不新增子路径导入**（如 `archive-ui-react/components/button`）。现有 Vite 单入口 + 全量 CSS 的构建下，子路径只会增加构建复杂度，收益不足。
- 组件源码按功能域分组目录；公共入口保持不变。
- 所有组件使用具名导出，不使用 default export。
- 所有公共类型从主入口导出；内部实现类型不导出。

## 2. 建议的源码结构

```text
src/
├── components/
│   ├── general/
│   │   ├── Button/{Button.tsx, index.ts}
│   │   ├── IconButton/...
│   │   ├── Typography/...
│   │   ├── Badge/...
│   │   ├── Tag/...
│   │   ├── Divider/...
│   │   ├── Spinner/...
│   │   ├── Skeleton/...
│   │   ├── Avatar/...
│   │   ├── Tooltip/...
│   │   └── index.ts
│   ├── form/
│   │   ├── Input/...
│   │   ├── Textarea/...
│   │   ├── Checkbox/...
│   │   ├── Radio/...
│   │   ├── Switch/...
│   │   ├── Select/...
│   │   ├── NumberInput/...
│   │   ├── Slider/...
│   │   ├── DatePicker/...
│   │   ├── FormField/...
│   │   └── index.ts
│   ├── feedback/
│   │   ├── Dialog/...
│   │   ├── AlertDialog/...
│   │   ├── Popover/...
│   │   ├── DropdownMenu/...
│   │   ├── ContextMenu/...
│   │   ├── Toast/...          # ToastProvider + useToast + 内部展示项
│   │   ├── Alert/...
│   │   ├── Progress/...
│   │   ├── Accordion/...
│   │   └── index.ts
│   ├── navigation/
│   │   ├── Tabs/...
│   │   ├── Breadcrumb/...
│   │   ├── Pagination/...
│   │   ├── Menu/...
│   │   ├── NavigationMenu/...
│   │   ├── Steps/...
│   │   └── index.ts
│   ├── data-display/
│   │   ├── Panel/...
│   │   ├── Card/...
│   │   ├── List/...
│   │   ├── Table/...
│   │   ├── Timeline/...
│   │   ├── Empty/...
│   │   ├── Descriptions/...
│   │   ├── Image/...
│   │   ├── Statistic/...
│   │   ├── Tree/...
│   │   └── index.ts
│   └── archive/
│       ├── ArchiveCard/...
│       ├── ArchivePanel/...
│       ├── ArchiveHeader/...
│       ├── ArchiveMetadata/...
│       ├── ArchiveStamp/...
│       ├── ArchiveCover/...
│       ├── ArchiveIndex/...
│       └── index.ts
├── internal/
│   ├── overlay/
│   ├── menu/                  # MenuEntry 类型 + menu core
│   ├── icons/
│   ├── slot/
│   ├── date/
│   ├── surface/
│   └── hooks/
├── styles/
│   ├── components/
│   │   ├── button.css
│   │   ├── icon-button.css
│   │   └── ...
│   ├── tokens/ themes/ materials/
│   └── style.css
├── tokens/
├── utils/cn.ts
└── index.ts
```

说明：

- `Panel` 从 `src/components/Panel/` 移到 `src/components/data-display/Panel/`；**公共导入路径不变**，但这是一次仓库结构变更，需确认。
- 域 `index.ts` 是内部聚合，不是公共子路径；避免调用方依赖域路径。
- `internal/` 不导出任何内容，不出现在 `package.json` 的 `exports` 中。
- 样式文件保持现有的扁平 `styles/components/{component}.css`（不按域再分一层），减少对 `style.css` 的改动；组件数量增加不构成必须分组的理由。
- 不新增路径别名；内部使用相对路径，避免扩展构建配置。

## 3. 导出层级

### 3.1 组件内部导出

每个组件目录 `index.ts` 导出：

- 组件函数（具名）。
- 该组件的 Props 类型与公开联合类型/数据模型。
- Compound 子组件与其 Props（如 `TabsList`、`TabsTrigger`、`TabsContent`）。

不导出：

- 内部 context、hook、样式变量、DOM 子组件、Slot、测试工具。

### 3.2 功能域导出

`components/{domain}/index.ts` 显式 re-export 该域所有公开组件与类型：

```ts
export { Button, type ButtonProps, type ButtonVariant } from './Button';
export { Card, type CardProps } from './Card';
// ...
```

不使用 `export *`，保证公共 API 可审查、避免内部符号泄漏。

### 3.3 主入口导出

`src/index.ts` 显式 re-export 五个域：

```ts
export * from './components/general';
export * from './components/form';
export * from './components/feedback';
export * from './components/navigation';
export * from './components/data-display';
export * from './components/archive';
```

域内部已经显式导出，主入口可用 `export *` 聚合域；也可以全部显式列出。推荐保留一层显式域入口 + 主入口 `export *`，避免主入口变成 500 行的维护负担。

### 3.4 类型导出

必须导出：

| 类别 | 示例 |
| --- | --- |
| 组件 Props | `ButtonProps`、`DialogProps`、`TableProps<Row>` |
| 公开联合类型 | `ButtonVariant`、`DialogSize`、`TabsProps` 的 `orientation` 等 |
| 数据模型 | `SelectOption`、`MenuEntry`、`TableColumn<Row>`、`TableSort`、`TreeNode`、`BreadcrumbItem`、`StepItem`、`TimelineItem`、`DescriptionItem`、`ArchiveMetadataItem` |
| Toast API | `ToastOptions`、`ToastProviderProps`、`ToastApi` |
| 共享基础类型 | `Size`、`SurfaceMaterial`、`AccentTone`、`FeedbackTone`、`Orientation`、`Align`、`Placement`、`HeadingLevel`、`SurfaceScaleProps`、`OverlayStateProps` |

不导出：内部 context 类型、`Slot`、`MenuCore`、`OverlayPositioner`、测试辅助类型、任何 `Internal*` 命名类型。

`MenuEntry` 必须由中立内部模块定义、从主入口导出，禁止调用方从 `components/feedback/DropdownMenu` 深层导入。

## 4. 子路径导入评估

| 方案 | 结论 | 理由 |
| --- | --- | --- |
| `archive-ui-react/components/button` | 不采用 | 需多入口构建、类型声明子路径、CSS 仍全量；收益主要是心理上的“按需”，而 ESM tree-shaking 已能移除未用 JS |
| `archive-ui-react/form` | 不采用 | 同上；CSS 无法按需，导入子路径仍要全量样式 |
| `archive-ui-react/style.css` | 保留 | 现有构建产物；必须保留 |
| `archive-ui-react/tokens` | 暂不新增 | TS Token 目前从主入口导出；若未来需要主题工具，可单独评估 |

首版全量 CSS 是既定架构（AGENTS.md），组件级按需 CSS 明确不做。因此子路径导入不能带来真正的样式按需收益。若未来构建支持 CSS 拆分，再单独立项。

## 5. package.json

建议保持现状，不修改：

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./style.css": "./dist/style.css"
  },
  "sideEffects": ["**/*.css"],
  "files": ["dist", "README.md"]
}
```

- 新增组件目录后，Vite 仍从 `src/index.ts` 打包；类型声明通过 `tsc -p tsconfig.lib.json` 生成到 `dist/components/...`，由 `dist/index.d.ts` 引用。
- 不新增 `exports` 子路径；否则必须同步构建与类型声明，本阶段不做。
- 不把 `internal/` 编译成公共可导入路径；它会被 tsc 产出 `.d.ts`，但没有 exports 入口，调用方不应依赖。

## 6. 当前公共符号的处置建议

| 当前导出 | 建议 | 说明 |
| --- | --- | --- |
| `Panel` | 保留，正式 API 需审核 | 现有验证组件；M3 迁移 |
| `PanelProps` / `PanelMaterial` | 保留并扩展 | `PanelMaterial` 建议与 `SurfaceMaterial` 统一/别名，需确认 |
| `cn` | **建议移出公共 API** | 内部 class 工具，不应成为组件库契约；删除是破坏性变更，需确认 |
| `primitives` / `semanticDark` / `semanticLight` | 暂保留 | 架构注明用于脚本/主题工具；若保留，文档必须标注“非组件 API” |
| `typography` / `spacing` TS Token | 暂保留 | 同上；避免调用方直接用它们生成第二套样式 |

本阶段不修改 `src/index.ts`；以上为 M1 前的 API 清理建议。

## 7. 使用与构建验证

```tsx
import 'archive-ui-react/style.css';
import { Button, Card, Input, Select } from 'archive-ui-react';
import type { SelectOption, TableColumn } from 'archive-ui-react';
```

- 类型导入与值导入分开；确保 `verbatimModuleSyntax`/`isolatedModules` 下可用（当前 tsconfig 未启用 `verbatimModuleSyntax`，但保持习惯）。
- 每次新增组件后执行 `pnpm build`、`pnpm typecheck`，并用 `pnpm pack` 在独立项目验证：
  - 根入口导入；
  - 类型解析；
  - `style.css` 与资产路径有效；
  - 未使用组件可被 tree-shaking（检查产物）。
- Playground 继续使用根导入路径，不引用内部路径。

## 8. 待确认

1. 是否接受按域分组目录（需移动 Panel）。
2. 是否将 `cn` 移出公共 API。
3. 是否继续导出 TS Token；若保留，文档如何标注。
4. `PanelMaterial` 是保留旧名，还是统一为 `SurfaceMaterial`（需兼容策略）。
5. 未来是否需要 CSS 拆分/子路径；本阶段明确不做。
