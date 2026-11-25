# Checkbox

> 状态：草案（阶段一）· 需人工审核。M2 表单组件。

## 1. 职责

布尔多选控件，支持受控/非受控、半选（indeterminate）与内联标签。它解决的是“从多个独立选项中选择任意个”的问题。

**使用场景**：多选条件、同意条款、全选/半选、设置开关（非即时生效场景）。
**不适用**：互斥单选（用 Radio/RadioGroup）；即时生效的开关（用 Switch）；提交表单的选择列表（用 Select）。
**区别**：Checkbox 是原生表单多选；Switch 是即时生效的状态切换，语义不同。

## 2. 边界

- 不提供 CheckboxGroup；多选组由调用方使用 `<fieldset>` 或自身状态管理（见 form-system §4.2）。
- 不管理“全选/半选”的联动逻辑；只负责展示 `indeterminate`。
- 不做异步提交；`onChange` 原生事件。
- 根是 `<label>`，可包含内联标签；`children` 是标签文本，不是任意布局容器。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `checked` / `defaultChecked` | `boolean` | — / `false` | 原生受控/非受控 |
| `onChange` | `ChangeEventHandler<HTMLInputElement>` | — | 原生 change |
| `indeterminate` | `boolean` | `false` | 半选视觉与混合状态；通过 ref 设置 DOM 属性 |
| `size` | `Size` | `'md'` | 勾选框尺寸 16/18/20（建议） |
| `invalid` | `boolean` | `false` | 映射 `aria-invalid` |
| `name` / `value` | 原生 | — | 表单提交 |
| `disabled` | `boolean` | `false` | 原生禁用 |
| `required` | `boolean` | `false` | 原生必填 |
| `children` | `ReactNode` | — | 内联标签 |

```tsx
import type { ChangeEventHandler, InputHTMLAttributes, ReactNode } from 'react';
import type { Size } from '../api-conventions';

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  size?: Size;
  indeterminate?: boolean;
  invalid?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  children?: ReactNode;
}
```

## 4. DOM 映射

- 根：`<label class="au-checkbox">`；`className` / `style` 作用于根。
- 内部：`<input type="checkbox">`；`id`、`name`、`value`、`required`、`disabled`、`checked`、`onChange`、`aria-*` 与其余 input 属性作用于 input。
- `ref` 指向内部 `<input>`。
- `children` 渲染在 input 后，作为可见标签。
- FormField.Control 注入的属性必须落到 input；`aria-labelledby` 可同时指向外部标签。

## 5. 事件与状态

- 原生 `onChange`；`event.target.checked` 是选中值。
- 状态：Unchecked、Checked、Indeterminate、Hover、Focus-visible、Disabled、Invalid。
- `indeterminate=true` 时视觉显示横线；点击后浏览器行为会清除 indeterminate，React 需在受控/回调后重新同步。
- 不自动切换“全选”子项；由调用方处理。

## 6. 视觉

- 勾选框使用自定义绘制（隐藏原生控件但保留语义），尺寸随 `size`；选中态使用 accent/gold 标记，不只靠颜色。
- 标签文字使用 UI 字体，允许换行；点击标签任意位置切换。
- 半选使用横线，不使用问号或第三种颜色。
- 错误态在勾选框边框与标签旁提示；错误文本由 FormField 提供。
- 禁用态降低对比度，但标签必须可读。

## 7. 组合与扩展

- 与 FormField 组合时，FormField 的外部标签与 Checkbox 的内联标签可能重复；二选一，推荐多选组用 fieldset legend，单项用内联标签。
- 全选：调用方根据子项状态设置 `checked` / `indeterminate`，Checkbox 不做联动。
- 不提供 CheckboxGroup；见 form-system。

## 8. 无障碍

- 原生 `<input type="checkbox">` 保留语义；隐藏原生控件时必须保留可聚焦性。
- `indeterminate` 通过 DOM 属性让辅助技术报告 mixed 状态。
- 必须有可访问名称：内联 children 或外部 label / aria-label。
- `invalid` 映射 `aria-invalid`；错误文本通过 `aria-describedby` 关联。
- `required` 用于原生约束；不要用视觉星号代替。
- 点击标签切换；键盘 Space 切换。

## 9. 示例

```tsx
<Checkbox defaultChecked>接受档案使用条款</Checkbox>
<Checkbox checked={all} indeterminate={some} onChange={toggleAll}>全选</Checkbox>
<Checkbox disabled>不可用选项</Checkbox>
<Checkbox invalid aria-describedby="agree-error">我已阅读并同意</Checkbox>
```

## 10. 边界情况

- `children` 为空：仍渲染控件；必须提供 aria-label，否则不可访问。
- `indeterminate` 与 `checked` 同时为真：视觉显示半选，语义 mixed；调用方负责一致性。
- 点击 disabled 标签：不触发；原生行为。
- 受控模式未更新 checked：界面不变化（原生受控行为）。
- 在表单中：`value` 默认 `on`；多选组用相同 `name`。
- 快速切换：不防抖；每次原生 change 都触发。

## 11. 依赖与实现注意

- 无组件依赖；使用内部 check/minus 图标或 CSS 绘制。
- 隐藏原生 input 时使用 `clip`/`opacity` 方案，不得 `display:none`（会失去键盘与表单能力）。
- `indeterminate` 必须用 ref 在 mount/update 时设置；仅 JSX 属性无效。
- 不把根 label 当作 FormField.Control 的注入目标；注入属性必须路由到 input。
