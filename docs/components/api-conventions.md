# 公共 API 设计原则

> 状态：草案（阶段一）。本文件是全部组件文档的上位约定；若组件文档与本文件冲突，以本文件为审查依据，并登记到 `consistency-review.md`。

## 1. 设计基线

本 API 建立在以下已冻结事实之上：

- React `>=18.2.0 <20.0.0`（开发依赖为 React 18.3.1），因此**不使用 React 19 的 ref-as-prop**，公开组件一律用 `forwardRef`。
- 单 npm 包、Vite lib 模式、全量 `style.css`；首版不做组件级按需 CSS。
- 样式为 CSS + CSS Variables，不使用 CSS-in-JS；主题由 `data-theme` 驱动，无 Theme Provider。
- 视觉基线已冻结：三材质（plain / paper / film）、五层渲染模型、装饰 span 模式、`--au-*` Token 三层结构。
- 组件不得直接引用 Primitive Token；样式只引用 Semantic Token。
- 公共 class 只使用 `au-` 前缀 BEM。

本阶段不修改 Token、材质、构建与现有代码。所发现的工程冲突见 `consistency-review.md`。

## 2. 分层与职责

| 类型 | 定义 | 允许依赖 |
| --- | --- | --- |
| Foundation | 无业务状态、为其他组件与页面提供排版/视觉基元（本范围内仅 Typography） | Semantic Token、内部工具 |
| Primitive | 单一职责、可独立使用的最小交互或展示单元 | Foundation、内部基础设施、更低的 Primitive |
| Composite | 组合多个 Primitive，管理结构化状态、焦点或浮层 | 公开的 Foundation / Primitive / 内部基础设施 |
| Archive | 档案语义组件，承担领域叙事与固定信息结构 | 前三层的公开 API、视觉能力 |

硬性规则：

1. **禁止低层反向依赖高层**。例如 Button 不得依赖 Tooltip；Typography 不得依赖 Card。
2. **Archive 不得被 Foundation / Primitive / Composite 依赖**。
3. 同层依赖必须单向。跨域依赖只允许“展示层 → 表单控件”这种明确向下的方向（如 Table → Checkbox）。
4. 组件之间优先依赖**公开 API**，不依赖对方内部 DOM 或私有 class。

## 3. 命名规范

### 3.1 组件与文件

- 组件名 PascalCase，一个组件一个目录：`src/components/{domain}/{Component}/`（目录域分组为建议，见 `export-strategy.md`）。
- Props 接口：`{Component}Props`；子组件：`{Parent}{Part}Props`，例如 `TabsTriggerProps`。
- 子组件使用**具名导出**，不使用 `Tabs.List` 形式的静态属性：`Tabs`、`TabsList`、`TabsTrigger`、`TabsContent`。
- 子组件的 CSS class 使用父组件的 BEM 元素：`TabsList` → `au-tabs__list`、`AccordionTrigger` → `au-accordion__trigger`；不要使用 `au-tabs-list` 这类并列命名。
- 组件不使用 default export。
- 文档文件名使用 kebab-case；源码目录沿用现有 PascalCase。

### 3.2 属性语义

| 概念 | 统一名称 | 说明 |
| --- | --- | --- |
| 尺寸 | `size` | 仅用于有物理尺寸等级的组件；取值 `'sm' \| 'md' \| 'lg'` |
| 视觉强调/结构 | `variant` | 如 `solid/outline/ghost`、`line/enclosed`；不用于颜色语义 |
| 颜色/语义 | `tone` | 如 `neutral/accent/gold`，状态组件扩展 feedback tone |
| 材质 | `material` | 仅表面组件；`plain/paper/film` |
| 方向 | `orientation` | `horizontal/vertical` |
| 对齐 | `align` | `start/center/end` |
| 浮层方位 | `placement` | 12 方位联合类型 |
| 禁用 | `disabled` | 正向布尔；禁止 `enabled` / `isDisabled` |
| 校验失败 | `invalid` | 与原生 `aria-invalid` 对应；禁止 `error` 布尔名 |
| 只读 | `readOnly` | 只用于原生支持该语义的控件 |
| 必填 | `required` | 与原生属性同名 |
| 加载 | `loading` | 异步进行中；不同组件语义见各自文档 |
| 占满容器 | `fullWidth` | 禁止 `block` / `fluid` 等别名 |
| 受控值 | `value` | 值型状态 |
| 非受控初值 | `defaultValue` | 只在挂载时读取 |
| 选中布尔 | `checked` | 布尔型选中状态 |
| 非受控初值 | `defaultChecked` | 只在挂载时读取 |
| 展开 | `open` | 浮层/弹出层 |
| 非受控初值 | `defaultOpen` | 只在挂载时读取 |
| 事件 | `onX` / `onXChange` | 见 §6 |

禁止事项：

- 不用 `color` 作为语义色属性名；统一 `tone`。
- 不用 `type` 表示视觉变体；`type` 保留给原生语义。
- 不用 `kind`、`mode`、`appearance` 作为 `variant` 的别名。
- 不作 `is*` / `has*` 前缀；除非与原生属性一致（如 `indeterminate` 是 DOM 属性名）。
- 不为同一语义创造多个别名；确需例外时必须在审查报告中登记。

## 4. 通用属性策略

### 4.1 真正的公共约定

以下属性按适用性出现，不强制所有组件都有：

- `className`、`style`：所有渲染 DOM 的组件均有，默认落到根节点。
- `id`：渲染原生元素且具备可关联语义的组件。
- `children`：内容自由的组件；数据驱动组件不使用 `children` 承载数据。
- `aria-*`：通过原生 HTML 属性透传；组件只在内部管理必要 ARIA。
- `ref`：所有公开组件通过 `forwardRef` 暴露根节点或主要焦点元素。
- `data-*`：透传到根节点；组件自身也会输出少量稳定状态属性（见 §9）。

### 4.2 仅部分组件适用

| 属性 | 适用组件 |
| --- | --- |
| `size` | 控件族、Avatar、Spinner、Table、Dialog、Timeline 等；不适用于 Typography（用 `variant`） |
| `variant` | 有明确视觉分支的组件；无分支的组件不添加 |
| `tone` / `FeedbackTone` | 有颜色语义的组件；纯结构组件不添加 |
| `material` | 有表面材质的组件（Panel、Card、Archive 表面）；表单控件不加 |
| `textureIntensity` / `lightingIntensity` | 仅材质表面组件（见 §9.4） |
| `fullWidth` | 表单控件、Button、Card、Panel；不适用于 Badge、Divider |
| `invalid` | 表单控件、Select、DatePicker、FormField |
| `loading` | Button、IconButton、Table、AlertDialog、Statistic；语义各不相同，见各文档 |

### 4.3 组件特有属性

组件特有属性必须在其文档中解释语义、默认值和取值范围；不得出现“无明确用途”的 prop。
内部实现属性（slot 变量、私有 class、内部 ref）不得进入公开 Props。

## 5. HTML 原生属性继承

### 5.1 总原则

1. **有单一原生宿主元素时优先继承**该元素的属性类型，并透传到该元素。
2. 新增语义属性与原生属性冲突时，用 `Omit` 排除原生属性，再重新声明。
3. 组合组件只在根节点是单一 DOM 时继承 `HTMLAttributes<RootElement>`；多个平行根节点（ToastProvider、Tooltip、Popover）不继承。
4. 不为了“统一”给组件添加不适用的原生属性；也不无故屏蔽原生能力。

### 5.2 继承基线

| 组件族 | 继承类型 | 必须 `Omit` 的典型属性 |
| --- | --- | --- |
| Button / IconButton | `ButtonHTMLAttributes<HTMLButtonElement>` | 无（`type` 保留，默认 `button`） |
| Typography | `HTMLAttributes<HTMLElement>` | 无；`as` 决定实际标签 |
| Input | `InputHTMLAttributes<HTMLInputElement>` | `size`（原生数值）、`prefix`（RDFa 字符串）、`type`（收窄为文本类） |
| Textarea | `TextareaHTMLAttributes<HTMLTextAreaElement>` | 无 |
| Checkbox / Radio / Switch | `InputHTMLAttributes<HTMLInputElement>` | `type`、`size`；根为 `<label>` 时 `className/style` 落到根 |
| Select | `HTMLAttributes<HTMLDivElement>` | `onChange`、`defaultValue`、`children` |
| NumberInput | `InputHTMLAttributes<HTMLInputElement>` | `type`、`size`、`value`、`defaultValue`、`onChange`、`min`、`max`、`step` |
| Slider | `HTMLAttributes<HTMLDivElement>` | `onChange`、`defaultValue` |
| DatePicker | `HTMLAttributes<HTMLDivElement>` | `onChange`、`defaultValue` |
| FormField | `HTMLAttributes<HTMLDivElement>` | 无 |
| Panel / Card / Archive 表面 | `HTMLAttributes<HTMLElement>` | `title`（语义标题占用） |
| Image | `ImgHTMLAttributes<HTMLImageElement>` | `src`、`alt`（重新声明为必填） |
| Table | `TableHTMLAttributes<HTMLTableElement>` | `children`（数据驱动） |
| List / Timeline / Steps / Breadcrumb | 对应列表或导航元素属性 | 数据驱动时 `children` |
| Dialog | `HTMLAttributes<HTMLDivElement>` | `title`（语义标题） |
| Tooltip / Popover / DropdownMenu / ContextMenu | 不继承 | 无单一根；触发元素自身的属性由调用方传入 |
| ToastProvider | 不继承 | Provider 不是 DOM |

> **例外说明**：Checkbox / Radio / Switch 的根是 `<label>`，`ref` 指向内部 `<input>`，其余原生属性透传给 `<input>`；`className` / `style` 作用于根 `<label>`。该映射必须在文档与测试中固定。

### 5.3 冲突处理示例

```tsx
// 原生 title 是 string；Panel 的 title 是 ReactNode
export interface PanelProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> { ... }

// 原生 size 是 number；Input 的 size 是设计尺寸
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix' | 'type'> { ... }
```

## 6. 事件接口

### 6.1 两套事件，语义不得混用

| 事件 | 签名 | 使用范围 |
| --- | --- | --- |
| 原生 `onChange` | React 原生 `ChangeEventHandler` | 直接包裹原生 `<input>` / `<textarea>` 的表单控件：Input、Textarea、Checkbox、Switch；Radio 的原生 change 由 RadioGroup 内部处理，不作为 Radio 的公开事件 |
| `onValueChange` | `(next: T) => void` | 非原生或值语义与 DOM 不一致的受控组件：Select、NumberInput、Slider、DatePicker、Tabs、Accordion、RadioGroup |
| `onOpenChange` | `(open: boolean) => void` | 所有可受控浮层 |
| `onExpandedChange` | `(ids: string[]) => void` | Tree |
| `onPageChange` | `(page: number) => void` | Pagination |
| `onStepClick` | `(index: number) => void` | Steps（仅 `clickable`） |
| `onSelect` | `(item: ...) => void` | 数据驱动菜单项、Tree、NavigationMenu |
| `onRemove` / `onDismiss` | `(event?) => void` | Tag、Alert |
| `onConfirm` / `onCancel` | 见 AlertDialog | 确认类对话框 |

**硬性规则：**

- `onChange` 永远表示原生 change 事件；`onValueChange` 永远表示“值变了”，参数是新值。不得让 `onChange` 同时接受“值”和“事件”两种形态。
- `onXChange` 回调只接收下一个状态，不接收 `details` 对象；需要区分交互阶段时使用独立回调（如 Slider 的 `onValueCommit`）。
- 自定义状态回调不提供“阻止”语义；需要阻止默认行为时使用原生事件（`onClick`、`onKeyDown`）或由调用方不更新受控值。
- 回调同步执行；组件不 `await` 用户回调，也不根据 Promise 自动切换 loading。异步流程由调用方通过 `loading` / `open` 等受控状态驱动。
- 所有事件名使用 camelCase；回调类型显式声明，不使用 `Function`。
- 事件不提供 `any` 参数；无法约束的用户数据以泛型或 `unknown` 表达。

### 6.2 触发时机

- 受控组件：在用户意图发生时触发回调，但**不自行更新值**；父组件不更新则界面不变。
- 非受控组件：先更新内部状态，再触发回调。
- 浮层关闭：Escape、外部点击、选择菜单项等均通过 `onOpenChange(false)` 通知；受控模式下不关闭。
- `loading` 状态的 Button 不触发 `onClick`；`disabled` 的原生元素由浏览器/React 阻止事件。
- 快速重复交互：依赖原生或内部状态避免重复提交；组件不内置防抖（Search 输入等由调用方处理）。

## 7. 受控与非受控

### 7.1 状态命名矩阵

| 状态种类 | 受控 | 非受控初值 | 变更回调 | 备注 |
| --- | --- | --- | --- | --- |
| 值 | `value` | `defaultValue` | `onValueChange` 或原生 `onChange` | 以 §6.1 为准 |
| 布尔选中 | `checked` | `defaultChecked` | 原生 `onChange` | Checkbox / Switch |
| 打开 | `open` | `defaultOpen` | `onOpenChange` | 浮层、菜单、Select、DatePicker |
| 展开集合 | `expandedIds` | `defaultExpandedIds` | `onExpandedChange` | Tree |
| 选中项 | `selectedId` | `defaultSelectedId` | `onSelect` | Tree、Menu |
| 页码 | `page` | `defaultPage` | `onPageChange` | Pagination |
| 步骤 | `current` | 无 | 无 | Steps 由调用方驱动 |

### 7.2 共同规则

1. 受控模式优先：同时传入 `value` 与 `defaultValue` 时，`defaultValue` 被忽略，开发环境给出一次警告。
2. 不允许在运行时切换受控/非受控模式；切换行为未定义，文档明确禁止。
3. `defaultX` 只在首次挂载时读取；后续变化不触发内部状态更新。
4. 受控组件不维护“影子状态”；视觉必须直接反映传入值。
5. 不涉及状态的组件不得为了统一而引入 `value` / `defaultValue`。
6. `open` 类浮层在受控模式下，所有关闭路径都只发出 `onOpenChange(false)`；组件不自行关闭。

## 8. Ref 策略

- 所有公开组件使用 `React.forwardRef`；React 18 不支持 ref-as-prop。
- Ref 指向“调用方最可能需要操作的元素”：
  - 原生控件 → 原生元素（`HTMLInputElement` / `HTMLTextAreaElement`）。
  - Checkbox / Radio / Switch → 内部 `<input>`，不是 `<label>`。
  - Select / DatePicker → 触发按钮（便于聚焦与测量）。
  - Dialog → 内容容器；Popover → 内容容器；Tooltip → 不提供 ref（无稳定公共 DOM）。
  - Table → `<table>`；FormField → 根容器；Compound 子组件各自 forwardRef。
  - Image → `<img>`。
- 泛型 Table 的 `forwardRef` 会丢失泛型；实现时使用带泛型调用签名的 `TableComponent` 接口并在内部断言，不把 `any` 暴露到公共类型。
- 不提供 `useImperativeHandle` 命令式方法，除非有无法用受控 prop 表达的焦点需求；目前没有此类需求。

## 9. 组合与扩展方式

### 9.1 组合优先级

1. **children / slots**：内容自由、结构由调用方决定。
2. **Compound components**：需要共享上下文与键盘语义的结构（Tabs、Accordion、FormField）。
3. **数据驱动 items / columns / nodes**：集合必须由组件统一管理键盘、选中与 ARIA（Select、Menu、Table、Tree、Breadcrumb、Steps、Timeline、Descriptions）。
4. **函数属性**：仅用于渲染单元（Table `cell`、Statistic `formatter`、Select `getOptionLabel` 等），不是通用 render prop。
5. **V1 不提供**：`asChild`、公开 Slot、通用 render prop、组件继承体系。FormField 内部可使用 cloneElement 注入关联属性，但不暴露 Slot。

### 9.2 组合边界

- Compound 组件的子组件只能出现在对应父组件内；脱离父组件时，开发环境警告，生产环境不保证行为。
- 数据驱动组件不提供等价的 children 写法；需要完全自定义 DOM 时，应使用更低层组件或自行组装。
- 组件之间不通过 DOM 查询互相协作；跨组件协作使用显式 props 或内部 context。
- 不提供“万能布局组件”。Card / Panel / List 各自有明确语义。

## 10. 样式扩展

### 10.1 允许

- `className` 合并到根节点（例外已在组件文档注明）。
- `style` 用于布局尺寸、间距、定位等调用方局部需求。
- `data-*` 原样透传；组件输出稳定的 `data-disabled`、`data-orientation` 等状态属性供调用方选择器使用。
- `data-state` 的值域统一为：浮层/可展开组件 `open | closed`；可勾选组件 `checked | unchecked | indeterminate`；选中项 `selected | active`。具体组件只使用适用的子集，不自造同义值。
- 覆盖语义层 `--au-*` 变量（全局主题机制），但组件不承诺任意 Primitive 覆盖的视觉效果。
- 表面组件支持 `material` 预设与强度参数；这是选择库内已定义资源，不是自定义材质。

### 10.2 不允许 / 不承诺

- 不把内部槽位变量（纹理图源、混合模式、槽位尺寸等）作为公共 API。
- 不承诺内部 DOM 结构与 class 名稳定；调用方应使用公开 className 与 `data-state`。
- 不允许通过 `style` 重建材质或替换主题色；这类需求走主题层，不走组件。
- 不鼓励 `!important`；组件样式的覆盖优先级必须在文档中可解释。
- 首版不提供组件级 CSS 变量契约。若后续需要，应统一立项，不在单个组件中先行暴露。

### 10.3 材质与强度

表面组件统一使用：

```ts
export interface SurfaceScaleProps {
  /** 纹理强度响应系数，0–2，默认 1；只缩放既有材质资源。 */
  textureIntensity?: number;
  /** 光影强度响应系数，0–2，默认 1；只缩放既有光影资源。 */
  lightingIntensity?: number;
}
```

映射到根节点的 `--au-texture-scale` / `--au-lighting-scale`，不修改全局 `:root`。不暴露图源、混合模式、暗角形状或装饰资产选择。

## 11. 无障碍基线

- 优先使用原生语义元素；只有无法用原生表达时才使用 ARIA。
- 所有交互元素可用键盘操作，焦点可见；焦点样式使用 `--au-color-border-lit` + `--au-glow-gold`，不删除 outline 而不提供替代。
- 图标按钮必须有可访问名称；装饰元素必须 `aria-hidden="true"`。
- 组件不自动注入可见标签；表单控件必须由 FormField、外部 `<label>` 或 `aria-label` 提供名称。
- `disabled` 使用原生 `disabled` 语义；仅在需要保持可聚焦时使用 `aria-disabled`（如 Button/IconButton 的 loading 态、菜单禁用项）。其余场景不得用 `aria-disabled` 替代原生 disabled。
- 加载状态使用 `aria-busy`；Spinner 使用 `role="status"` 与可配置文本。
- 状态不能只靠颜色表达；需要文字、图形或 `aria-*` 辅助。
- 尊重 `prefers-reduced-motion`；所有装饰性动画必须可关闭或降级。
- 触摸目标建议至少 44×44px；密集场景可视觉 32/40px，但通过内边距扩展命中区。
- RTL、响应式断点、强制高对比模式不在 V1 范围内，需单独立项。

## 12. 视觉映射基线

### 12.1 尺寸（建议实现值，需视觉校准）

| size | 控件高度 | 用途 |
| --- | --- | --- |
| `sm` | 32px | 密集工具条、表格内操作 |
| `md` | 40px | 默认 |
| `lg` | 48px | 强调操作、触屏场景 |

Avatar：`sm` 32 / `md` 40 / `lg` 56。Spinner：`sm` 16 / `md` 20 / `lg` 24。
Dialog 最大宽度：`sm` 400 / `md` 560 / `lg` 720。

这些数值是接口设计的一部分，但不是冻结的视觉规范；实现前需在 Playground 校准。

### 12.2 语义色映射

| tone | 当前可用 Token | 状态 |
| --- | --- | --- |
| `neutral` | `--au-color-text-primary` / `--au-color-border-subtle` / `--au-color-bg-surface` | 可实施 |
| `accent` | `--au-color-accent-primary`（oxide） | 可实施 |
| `gold` | `--au-color-accent-gold` | 可实施 |
| `success` / `warning` / `danger` / `info` | **无对应 Semantic Token** | **阻塞，需先补 Token** |

状态色不得直接用 `--au-moss` / `--au-fog-blue` / `--au-wine` 等场景 Primitive 绕过语义层。`danger` 与 `accent` 当前都映射到 oxide 会导致语义混淆，因此状态组件在 Token 补齐前不得标记为可实施。

### 12.3 状态视觉基线

| 状态 | 通用表现 |
| --- | --- |
| Default | 底色 + hairline 边框；不使用彩色渐变 |
| Hover | 边框提亮至 metal / lit；局部暖光克制使用 |
| Focus-visible | 边框 lit + 外发光；必须与 hover 可区分 |
| Active | 底色加深一档，装饰线显现 |
| Selected | 锈橙标记、古金文字或编号，不只靠背景色 |
| Disabled | 降低对比度、去除辉光、光标 `not-allowed`；不允许仅靠 opacity 导致不可读 |
| Loading | Spinner / 细线进度 + `aria-busy`；阻止重复提交 |
| Invalid | danger 边框 + 文本说明 + `aria-invalid`；颜色不是唯一提示 |

## 13. 公共类型草案

以下类型是草案的一部分，最终应从包主入口导出。未标注的类型不得从内部路径导入。

```ts
/** 控件物理尺寸。 */
export type Size = 'sm' | 'md' | 'lg';

/** 表面材质预设。film 仅用于展示型表面。 */
export type SurfaceMaterial = 'plain' | 'paper' | 'film';

/** 当前 Token 可支持的强调色。 */
export type AccentTone = 'neutral' | 'accent' | 'gold';

/** 反馈语义色；依赖尚未建立的 Semantic Token。 */
export type FeedbackTone = AccentTone | 'success' | 'warning' | 'danger' | 'info';

export type Orientation = 'horizontal' | 'vertical';
export type Align = 'start' | 'center' | 'end';

export type Placement =
  | 'top' | 'top-start' | 'top-end'
  | 'right' | 'right-start' | 'right-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end';

export type HeadingLevel = 2 | 3 | 4 | 5 | 6;

export interface SurfaceScaleProps {
  textureIntensity?: number;
  lightingIntensity?: number;
}

/** 可受控浮层的共同状态；具体组件按需裁剪。 */
export interface OverlayStateProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  portalContainer?: HTMLElement | null;
}
```

## 14. 审查用检查表

每个组件文档必须回答：

- [ ] 为什么需要这个组件，而不是组合现有组件？
- [ ] 与最相近的组件边界在哪里？
- [ ] 哪些 Props 是公共约定，哪些是组件特有，哪些不应暴露？
- [ ] 继承哪些原生属性，排除了什么，为什么？
- [ ] 有状态时，受控/非受控/回调是否完整一致？
- [ ] 键盘、焦点、ARIA、禁用、加载是否覆盖？
- [ ] 视觉是否只使用既有 Token 与材质语言？
- [ ] 依赖是否单向，是否引入循环或高层反向依赖？
- [ ] 是否暴露了内部实现？
- [ ] 空值、超长内容、溢出、快速交互、异步是否有明确行为？
