# FormField

> 状态：草案（阶段一）· 需人工审核。M2 表单组件（组合型）。

## 1. 职责

把标签、描述、错误与单个表单控件组织成一个可访问的整体，并自动建立 ID / ARIA 关联。它解决的是“每个表单控件都手写 id、aria-describedby、aria-invalid”的重复与遗漏。

**使用场景**：Input、Textarea、Select、NumberInput、Slider、DatePicker、RadioGroup 等表单控件的外层。
**不适用**：纯展示文本；非表单的容器布局；多控件复杂布局（可嵌套多个 FormField）。
**区别**：FormField 不渲染控件，只负责关联与布局；控件仍独立可用。

## 2. API 形态

采用 Compound + 内部 Slot：

```tsx
<FormField id="archive-no" invalid={!!error} required>
  <FormFieldLabel>档案编号</FormFieldLabel>
  <FormFieldControl>
    <Input />
  </FormFieldControl>
  <FormFieldDescription>格式：AR-YYYY-NNNN</FormFieldDescription>
  <FormFieldError>{error}</FormFieldError>
</FormField>
```

- 不使用 render prop：关联逻辑内聚，调用点保持声明式。
- 不自动查找第一个 input：对 Select、Slider、组合控件不可靠。
- `FormFieldControl` 只接受**单个** ReactElement，通过内部 cloneElement 注入属性；多子元素或 Fragment 在开发环境报错。

## 3. Props

### FormField

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | 自动 `useId` | 控件 id 基值 |
| `invalid` | `boolean` | `false` | 是否处于错误状态 |
| `required` | `boolean` | `false` | 是否必填 |
| `children` | `ReactNode` | — | 标签、控件、描述、错误 |

### FormFieldLabel

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `requiredIndicator` | `ReactNode` | `*` | 必填视觉标记，`aria-hidden` |
| `children` | `ReactNode` | — | 标签文本 |

### FormFieldControl

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `children` | `ReactElement` | 唯一表单控件 |

### FormFieldDescription / FormFieldError

继承 `HTMLAttributes<HTMLDivElement>`；`children` 为文本或节点。Error 仅在 `invalid` 且 children 非空时渲染。

```tsx
import type { HTMLAttributes, LabelHTMLAttributes, ReactElement, ReactNode } from 'react';

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  id?: string;
  invalid?: boolean;
  required?: boolean;
  children: ReactNode;
}

export interface FormFieldLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  requiredIndicator?: ReactNode;
  children?: ReactNode;
}

export interface FormFieldControlProps {
  children: ReactElement;
}

export interface FormFieldDescriptionProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface FormFieldErrorProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}
```

## 4. 关联机制

FormField 生成并共享：

- `controlId = id ?? useId()`
- `labelId = ${controlId}-label`
- `descriptionId = ${controlId}-description`
- `errorId = ${controlId}-error`

`FormFieldLabel`：

- `id={labelId}`、`htmlFor={controlId}`。
- 必填指示器 `aria-hidden`；必填语义由控件的 `required` / `aria-required` 表达。

`FormFieldControl` 向唯一子元素注入：

- `id={controlId}`（子元素已有 id 时不覆盖）
- `aria-labelledby={labelId}`（保证非 labelable 控件如 Slider 也有名称）
- `aria-describedby`：描述存在时包含 `descriptionId`；错误渲染时追加 `errorId`
- `aria-invalid={invalid}`（显式传入时保留显式值）
- `required={required}`（控件支持时）

`FormFieldDescription` 使用 `descriptionId`；`FormFieldError` 使用 `errorId`、`role="alert"`，仅在 `invalid` 时渲染。

## 5. 事件与状态

- 无自身交互事件；不承载值。
- 状态：Default、Invalid、Required、Disabled（由控件自身表达）。
- 错误出现/消失时 Error 通过 `role="alert"` 播报；描述不重复播报。
- 异步校验：FormField 不做；调用方在异步完成后更新 `invalid` 和错误文本。

## 6. 视觉

- 标签使用 UI 字体、caption/label 角色；与控件间距 `--au-space-xs`。
- 描述使用 secondary 文本；错误使用 danger 色（Token 缺口）。
- 必填标记与标签同色或 accent；不得只用红色星号表达必填。
- 布局为纵向堆叠；不提供 inline label 布局（需要时由调用方组合）。
- 错误文本出现不得导致控件跳动；预留最小高度或使用平滑布局。

## 7. 组合与扩展

- 可嵌套：外层 FormField 说明整个区域，内层 FormField 说明具体控件；避免同一控件被两个 FormField 注入 ID。
- 与 Checkbox/Radio 内联标签组合时，FormField 的外部标签可能重复；多选/单选组推荐 fieldset + legend，单项推荐内联标签。
- 不提供 `labelWidth`、`layout` 等视觉变体；需要复杂表单布局时用业务层 CSS Grid 包裹多个 FormField。
- 不导出内部 Slot；`FormFieldControl` 是唯一注入入口。

## 8. 无障碍

- Label 与控件的关联通过 `htmlFor` + `id`，同时用 `aria-labelledby` 兜底非 labelable 控件。
- `aria-describedby` 同时包含描述与错误，顺序为描述在前、错误在后。
- 错误容器 `role="alert"`；不要对描述使用 alert。
- 必填语义由控件表达，不以星号替代。
- 控件自身仍必须支持 ARIA 注入；若第三方控件不支持透传，FormFieldControl 在开发环境警告。
- 表单提交后的焦点管理不在 FormField 范围内，由调用方负责。

## 9. 示例

```tsx
<FormField id="title" required invalid={!!errors.title}>
  <FormFieldLabel>标题</FormFieldLabel>
  <FormFieldControl>
    <Input placeholder="输入卷宗标题" />
  </FormFieldControl>
  <FormFieldDescription>将显示在档案卡正面</FormFieldDescription>
  <FormFieldError>{errors.title}</FormFieldError>
</FormField>

<FormField id="range" invalid={!!error}>
  <FormFieldLabel>敏感度</FormFieldLabel>
  <FormFieldControl>
    <Slider min={0} max={10} defaultValue={5} formatValue={(v) => `${v} 级`} />
  </FormFieldControl>
  <FormFieldError>{error}</FormFieldError>
</FormField>
```

## 10. 边界情况

- `FormFieldControl` 多个子元素：开发环境报错，不注入。
- 子控件已被外部 `<label htmlFor>` 关联：仍注入 `aria-labelledby`，可能造成双重名称；文档建议二选一。
- 条件渲染 Error：描述 id 始终稳定；错误 id 只在渲染时加入 describedby，避免指向不存在节点。
- 嵌套 FormField：ID 必须不同；自动 useId 可避免冲突，显式 id 由调用方负责。
- `invalid=true` 但 Error 为空：只设置 aria-invalid，不渲染空 alert。
- 控件不支持 ref/属性透传：无法保证关联，需在文档中明确或替换控件。

## 11. 依赖与实现注意

- 依赖内部 Slot（cloneElement）与 `useId`；不依赖任何具体表单控件。
- 不修改控件内部 DOM；注入仅限 props。
- Slot 必须只接受一个有效元素；Fragment/字符串/数组报错。
- 不把 FormField 做成表单状态库；值、校验、提交都由调用方或表单库管理。
- 该 Compound 形态需确认；若维护者更倾向 render prop，应统一修改表单系统文档。
