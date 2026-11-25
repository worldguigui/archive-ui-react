# NumberInput

> 状态：草案（阶段一）· 需人工审核。M2 表单组件。

## 1. 职责

输入或步进一个数值，处理空值、精度、上下界与失焦钳制。它解决的是“用户需要精确数字，而原生 number input 的滚轮/本地化/非法值行为不可控”的问题。

**使用场景**：数量、年份、页码、评分、阈值、步进参数。
**不适用**：金额格式化（可用 formatter 组合）；滑块式选择（用 Slider）；日期（用 DatePicker）。
**区别**：NumberInput 是键盘可编辑的数值输入；Slider 是连续/离散拖拽；Input 不接受数值语义。

## 2. 边界

- 不使用 `input[type=number]`；使用 `text` + `inputMode="decimal"`。
- 不提供货币/千分位本地化格式；需要时在外部格式化显示，或等待 `formatOptions`（V1 不做）。
- 不做异步校验；不显示 loading。
- 不做科学计数法/表达式求值。
- 区间/复数不做。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `value` | `number \| null` | — | 受控值；`null` 为空 |
| `defaultValue` | `number \| null` | `null` | 非受控初值 |
| `onValueChange` | `(value: number \| null) => void` | — | 可解析值变化 |
| `min` / `max` | `number` | — | 边界；不设置则无界 |
| `step` | `number` | `1` | 步进；必须 > 0 |
| `precision` | `number` | — | 最大小数位；用于显示与舍入 |
| `allowEmpty` | `boolean` | `true` | 是否允许 `null` |
| `clampOnBlur` | `boolean` | `true` | 失焦时钳制到 min/max |
| `stepper` | `boolean` | `true` | 是否显示加减按钮 |
| `incrementLabel` | `string` | `'增加'` | 加按钮名称 |
| `decrementLabel` | `string` | `'减少'` | 减按钮名称 |
| `size` | `Size` | `'md'` | 控件高度 |
| `invalid` | `boolean` | `false` | 错误状态 |
| `fullWidth` | `boolean` | `false` | 占满容器 |
| `disabled` / `required` / `name` | 原生 | — | 表单属性 |

```tsx
import type { InputHTMLAttributes } from 'react';
import type { Size } from '../api-conventions';

export interface NumberInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'size' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'step'
  > {
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  allowEmpty?: boolean;
  clampOnBlur?: boolean;
  stepper?: boolean;
  incrementLabel?: string;
  decrementLabel?: string;
  size?: Size;
  invalid?: boolean;
  fullWidth?: boolean;
}
```

## 4. DOM 映射

- 根：`<div class="au-number-input">`；`className` / `style` 作用于根。
- 内部 `<input>`：`id`、`name`、`required`、`disabled`、`aria-*`、`onFocus` / `onBlur` / `onKeyDown` 与其余 input 属性落到 input。
- `ref` 指向 input。
- 加减按钮为 `<button type="button">`，不参与表单提交。
- FormField.Control 注入的属性落到 input；标签可正常 `htmlFor`。

## 5. 事件与状态

- `onValueChange`：解析出合法数字时触发；清空触发 `null`。
- `onChange` 被移除，避免字符串值与数字值双重语义；原生 `onInput` 仍可透传（若需要）。
- 内部保存编辑中的字符串；失焦时按 `clampOnBlur` 钳制并格式化显示。
- 状态：Default、Hover、Focus-visible、Disabled、Invalid、Empty、AtMin、AtMax。
- 键盘：↑/↓ 按 step 调整；Shift+↑/↓ 可按 10×step（建议行为，需视觉/实现确认）；Home/End 到 min/max（可选，不在 V1 承诺）。
- 加减按钮在到达边界时禁用。

## 6. 视觉

- 与 Input 共享高度、边框、字体、错误与焦点样式；数字使用 numeric 字体与等宽对齐。
- 步进按钮位于尾部，垂直排列或并列；按钮命中区不小于 24×24px。
- 按钮图标为装饰，名称由 `incrementLabel` / `decrementLabel` 提供。
- 空值与 0 必须视觉可区分（空显示 placeholder，0 显示 0）。
- 非法输入不立即变红，除非调用方设置 invalid；组件只阻止提交非法数字。

## 7. 组合与扩展

- 与 FormField 组合获得标签/描述/错误。
- 单位使用 `endAdornment`？NumberInput 没有 adornment 槽；V1 通过外部布局或 `suffix`（未提供）。若需要单位，建议在 FormField 描述中说明，或等待统一 adornment API。
- 不需要步进时设 `stepper={false}`；不要用 Input type=number 替代。
- 金额格式化由调用方在外部显示；组件值保持 number。

## 8. 无障碍

- input 使用 `inputMode="decimal"`、`autoComplete="off"`（建议）。
- `aria-valuemin` / `aria-valuemax` 适用于 slider，不适用于 input；不要错误添加。
- 加减按钮必须有名称，且 `type="button"`。
- `invalid` 映射 `aria-invalid`；错误通过 `aria-describedby` 关联。
- 不阻止键盘输入负号/小数点；非法字符被组件忽略，不静默改成 0。
- 屏幕阅读器应能听到当前值；不要用视觉格式化文本替代 input 的值。

## 9. 示例

```tsx
<NumberInput defaultValue={1} min={1} max={99} />
<NumberInput value={year} onValueChange={setYear} min={1900} max={2100} precision={0} />
<NumberInput stepper={false} placeholder="输入数量" allowEmpty />
<NumberInput invalid aria-describedby="count-error" />
```

## 10. 边界情况

- 输入 `1.2.3` / `abc`：不提交非法值；编辑中保留用户文本，失焦恢复最后一个合法值或清空（按 allowEmpty）。
- `min > max`：开发环境警告，钳制到 min；不静默交换。
- `step <= 0` 或 `NaN`：按 1 处理并警告。
- 浮点步进（0.1 + 0.2）：按 precision 舍入，避免 0.30000000000000004。
- 清空且 `allowEmpty=false`：失焦恢复上一个合法值；受控模式只通知，不自行恢复。
- 值超出边界：显示时钳制或保留用户值由 `clampOnBlur` 决定；受控模式由父级决定。
- 快速点击步进：每次基于当前值计算，不累计过期事件。
- 负数与小数点：允许按 locale 的常规 `-` / `.`；不实现逗号小数（V1）。

## 11. 依赖与实现注意

- 无组件依赖；可复用内部 control 样式变量与 plus/minus 图标。
- 不使用 `type=number`，避免滚轮误触与浏览器本地化差异。
- 内部同时维护“编辑字符串”和“已提交数值”；受控模式下以 value 为准，编辑字符串在失焦/更新时同步。
- 失焦时先执行内部钳制，再调用调用方的 `onBlur`；顺序需固定并测试。
- 不硬编码颜色；invalid 颜色等待状态 Token。
