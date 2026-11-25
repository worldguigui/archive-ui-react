# Radio / RadioGroup

> 状态：草案（阶段一）· 需人工审核。M2 表单组件。
> **范围说明**：`RadioGroup` 是 Radio 的必要分组组件，建议作为正式公开子组件新增（见 README 范围调整建议），待确认。

## 1. 职责

Radio 表示一组互斥选项中的一个；RadioGroup 统一管理 `name`、当前值、禁用、尺寸与错误状态。它解决的是“多个选项中必须且只能选一个”的问题。

**使用场景**：单选问卷、优先级、分类互斥选项、设置项。
**不适用**：任意多选（用 Checkbox）；即时开关（用 Switch）；大量选项（用 Select）。
**区别**：RadioGroup 是原生单选语义；Select 是折叠的单选；Checkbox 是多选。

## 2. 边界

- Radio 不能脱离 RadioGroup 独立使用；脱离时开发环境警告，生产行为不保证。
- RadioGroup 不提供选项数据数组；选项通过 children 组合，保留富文本标签能力。
- 不内置异步加载或远程选项；需要时由调用方渲染。
- 不提供“可取消选中”行为；原生单选一旦选择不能通过再次点击清空，清空由调用方重设 value。

## 3. Props

### RadioGroup

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `name` | `string` | **必填** | 原生单选分组名 |
| `value` | `string` | — | 受控值 |
| `defaultValue` | `string` | — | 非受控初值 |
| `onValueChange` | `(value: string) => void` | — | 选中值变化 |
| `legend` | `ReactNode` | — | 组标题；也可用 aria-label/labelledby |
| `disabled` | `boolean` | `false` | 整组禁用 |
| `required` | `boolean` | `false` | 整组必填 |
| `invalid` | `boolean` | `false` | 组级错误状态 |
| `size` | `Size` | `'md'` | 选项尺寸 |
| `orientation` | `Orientation` | `'vertical'` | 布局方向 |

### Radio

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | **必填** | 选项值，组内唯一 |
| `children` | `ReactNode` | — | 可见选项标签 |
| `disabled` | `boolean` | `false` | 单项禁用 |
| `id` | `string` | 自动 | 原生 input 的 id |

`name`、`checked`、`onChange`、`size`、`required`、`invalid` 由 Group context 提供，不在 Radio 上重复声明。

### RadioGroupLegend

继承 `HTMLAttributes<HTMLLegendElement>`，`children` 为组标题。必须作为 `RadioGroup` 的直接子元素；组件渲染 `<legend>`。未提供时，调用方必须给 RadioGroup 提供 `aria-label` 或 `aria-labelledby`。

```tsx
import type { HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import type { Orientation, Size } from '../api-conventions';

export interface RadioGroupProps
  extends Omit<HTMLAttributes<HTMLFieldSetElement>, 'onChange'> {
  name: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  legend?: ReactNode;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  size?: Size;
  orientation?: Orientation;
  children: ReactNode;
}

export interface RadioProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'size' | 'checked' | 'defaultChecked' | 'onChange' | 'name' | 'value'
  > {
  value: string;
  children?: ReactNode;
}
```

## 4. DOM 映射

- RadioGroup 根：`<fieldset class="au-radio-group">`；`legend` 渲染 `<legend>`；`className` / `style` 作用于 fieldset。
- Radio 根：`<label class="au-radio">`；内部 `<input type="radio">`。
- `id`、`disabled`、`value`、`aria-*` 与原生属性落到 input；`className` / `style` 落到 label；`ref` 指向 input。
- Group 的 `aria-invalid`、`aria-describedby` 落到 fieldset；FormField 可关联到组。
- 组内所有 radio 共享同一个 `name`。

## 5. 事件与状态

- `onValueChange`：用户选择某个 Radio 时触发一次，参数为选中值。
- 原生 change 事件由内部 input 处理，不暴露在 Radio 上。
- 状态：Unchecked、Checked、Hover、Focus-visible、Disabled（组/项）、Invalid。
- 键盘：原生 radio 组行为——方向键在同组选项间移动并选中；Space 选中当前项。
- 受控模式不自行更新；非受控模式内部维护选中值。

## 6. 视觉

- 圆形选择标记，选中显示内点/刻线，不使用纯色填充作为唯一信号。
- 尺寸随 group 的 `size`：建议 16/18/20 的标记尺寸，行高与 Checkbox 对齐。
- 组布局由 `orientation` 决定；垂直默认，水平时自动换行由调用方容器控制。
- 禁用项降低对比度，标签仍可读。
- 错误态由组级边框/文本表达，不能只给某一项加红。

## 7. 组合与扩展

- 与 FormField 组合时，FormField.Label 可关联到 fieldset；RadioGroup 也可自带 `legend`。二选一，避免重复组名。
- 选项标签支持 ReactNode，但不建议塞入按钮/链接等交互元素。
- 不提供 `options` 数据数组；需要数据驱动时由调用方 map 出 Radio。
- 不新增 CheckboxGroup，多选组使用 fieldset + Checkbox。

## 8. 无障碍

- 使用 `<fieldset>` + `<legend>`（或 aria-label/labelledby）提供组名。
- 原生 radio 语义；隐藏原生控件时保留可聚焦性。
- 组级 `required`、`invalid` 通过 fieldset 的 `aria-required` / `aria-invalid` 表达；错误文本通过 `aria-describedby` 关联。
- 每个 Radio 必须有可见标签；`children` 为空时必须 `aria-label`。
- 方向键行为由原生实现；不要自定义 roving tabindex 破坏原生语义。
- 组内选项顺序即阅读顺序。

## 9. 示例

```tsx
<RadioGroup name="priority" defaultValue="normal" onValueChange={setPriority}>
  <RadioGroupLegend>档案优先级</RadioGroupLegend>
  <Radio value="low">低</Radio>
  <Radio value="normal">普通</Radio>
  <Radio value="high" disabled>高（需授权）</Radio>
</RadioGroup>

<FormField id="visibility" invalid={!!error}>
  <FormField.Label>可见范围</FormField.Label>
  <FormField.Control>
    <RadioGroup name="visibility" defaultValue="team">
      <Radio value="private">仅自己</Radio>
      <Radio value="team">本部门</Radio>
      <Radio value="public">全馆</Radio>
    </RadioGroup>
  </FormField.Control>
  <FormField.Error>{error}</FormField.Error>
</FormField>
```

> 注：`RadioGroupLegend` 必须按具名导出使用，不使用 `RadioGroup.Legend` 静态属性形式（见 api-conventions §3.1）。

## 10. 边界情况

- 无 Radio 子项：组为空；开发环境警告。
- value 不在任何 Radio 值中：无选项选中；受控模式保持空，开发环境警告。
- 重复 value：开发环境警告；行为以第一个匹配为准。
- 组 disabled + 单项 disabled：都禁用；单项 disabled 不解除组禁用。
- 受控模式下用户点击：只触发 `onValueChange`，界面不更新，直到父级更新 value。
- 选项标签超长：允许换行；不截断为不可访问文本。
- 快速切换：原生 change 每次触发；不防抖。

## 11. 依赖与实现注意

- RadioGroup → Radio（context）；不依赖 Select/Checkbox。
- 根 fieldset 需要重置默认 border/margin，但不得影响宿主全局。
- 隐藏原生 radio 时不得 `display:none`；保留焦点与表单提交。
- `name` 必填；缺失时开发环境警告并生成临时名，但不保证提交语义。
- `RadioGroup` 新增需维护者批准；否则本组件无法成立。
