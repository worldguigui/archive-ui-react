# 表单系统专项设计

> 状态：草案。适用于 M2 全部组件及 Select / DatePicker 等浮层型表单控件。

## 1. 两类表单控件

| 类别 | 组件 | 状态模型 | 事件 |
| --- | --- | --- | --- |
| 原生控件型 | Input、Textarea、Checkbox、Switch | 原生 `value` / `checked` | 原生 `onChange(event)` |
| 原生控件型（分组） | Radio（由 RadioGroup 管理） | `checked` 由 Group context 提供 | RadioGroup 内部处理原生 change，公开 `onValueChange` |
| 抽象控件型 | Select、NumberInput、Slider、DatePicker、RadioGroup | 受控值 + 非受控初值 | `onValueChange(next)` |

选择依据：直接包裹 `input`/`textarea` 的控件保留原生事件，保证 react-hook-form 等表单库、浏览器自动填充与原生校验可用；值类型与 DOM 不一致或没有单一原生宿主的控件使用 `onValueChange`。

不采用“所有组件统一 onChange(value)”方案，因为它会破坏原生表单生态；也不采用“所有组件统一 onValueChange”方案，因为它会让 Input/Textarea 失去原生能力。该取舍需在审查中确认。

## 2. 共同属性

所有可交互表单控件：

```ts
interface FormControlBase {
  size?: Size;          // sm | md | lg，默认 md
  disabled?: boolean;   // 默认 false
  required?: boolean;   // 默认 false，映射原生必填
  invalid?: boolean;    // 默认 false，映射 aria-invalid，不自行执行校验
  name?: string;        // 原生表单提交名，适用时
}
```

- `invalid` 是**展示状态**，不是校验器。组件不判断值是否合法，也不生成错误文案。
- `required` 只表达必填语义与原生属性；是否显示星号由 FormField / 调用方决定。
- `readOnly` 仅在原生支持且语义合理时出现：Input、Textarea。Checkbox/Radio/Switch 不提供。
- `size` 不适用于 Input 的原生数值 `size`；Input 必须 `Omit` 原生 `size`。
- 共用样式使用组件级 CSS 变量实现，不新增全局 Token；禁用/错误色依赖 §7 的 Token 缺口。

## 3. 标签、描述与错误的关联

采用 **FormField Compound + 上下文 ID** 方案：

```tsx
<FormField id="archive-no" invalid={!!error} required>
  <FormField.Label>档案编号</FormField.Label>
  <FormField.Control>
    <Input />
  </FormField.Control>
  <FormField.Description>格式：AR-YYYY-NNNN</FormField.Description>
  <FormField.Error>{error}</FormField.Error>
</FormField>
```

- FormField 生成 `controlId`、`labelId`、`descriptionId`、`errorId`，通过 context 共享。
- `FormField.Control` 使用内部 Slot（`cloneElement`）向唯一子元素注入 `id`、`aria-labelledby`、`aria-describedby`、`aria-invalid`、`required`；不覆盖调用方显式传入的同名值。`aria-labelledby` 是为了让 Slider 等非 labelable 控件也能获得名称。
- `FormField.Label` 的 `htmlFor` 指向 `controlId`，并带有 `labelId` 供 `aria-labelledby` 使用。
- `aria-describedby` 同时包含描述与错误（若存在），保证屏幕阅读器能听到辅助信息。
- `FormField.Error` 使用 `role="alert"`（或 `aria-live="polite"`）并在 `invalid` 为真时渲染；错误消失后不再播报。
- 没有 FormField 时，调用方必须自行提供 `<label>` 或 `aria-label`、`aria-describedby`、`aria-invalid`。

不采用 render prop 作为主 API：它会把关联责任推给每个调用点，且与 React 习惯不符。不采用“自动查找第一个 input”的 DOM 查询方案：它对复合控件与 SSR 不可靠。

### 3.1 Checkbox / Radio 的标签

Checkbox、Radio、Switch 的根是 `<label>`，`children` 作为可见标签；组件内部 `<input>` 接收 `id`、`name`、`value` 与原生事件。FormField 可用于整组说明，但单个选项必须有自己的可见文本。

RadioGroup 使用 `<fieldset>` + `legend`（或 `aria-label`）承担组标签；每个 Radio 的 `children` 承担选项标签。

## 4. 分组与选中

### 4.1 RadioGroup（建议新增公开子组件）

Radio 单独存在没有完整语义。RadioGroup 统一管理：

```ts
interface RadioGroupProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name: string;                 // 必填，保证原生单选分组
  required?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  size?: Size;
  orientation?: Orientation;
  legend?: ReactNode;           // 或由调用方传 aria-label
  children: ReactNode;          // Radio 子项
}
```

Radio 从 context 读取 `name`、`checked`、`disabled`、`size`、`invalid`，不重复接收 `checked` / `onChange`。该组件是“新增正式组件”，需确认；若不允许新增，则 Radio 必须要求调用方手写 `<input type="radio" name>`，不建议。

### 4.2 Checkbox 分组

V1 不新增 `CheckboxGroup`。多选组使用原生 `<fieldset>` + 多个 Checkbox，或由调用方管理值数组。若产品出现“全选/半选”高频需求，再单独立项；不在本阶段预设 API。

`indeterminate` 是 DOM 属性而非 HTML 属性，Checkbox 必须通过 ref 设置，并在 `checked` 变化时同步；它只影响视觉与 `aria-checked="mixed"`。

## 5. 各控件的数据模型

| 组件 | 值类型 | 空值 | 备注 |
| --- | --- | --- | --- |
| Input / Textarea | `string` | `''` | 原生受控 |
| Checkbox | `boolean` | `false` | 原生 `checked` |
| RadioGroup | `string` | `undefined` | 必填 `name` |
| Switch | `boolean` | `false` | 原生 checkbox + `role="switch"` |
| Select | `string \| null` | `null` | 选项值必须唯一；`null` 表示未选 |
| NumberInput | `number \| null` | `null` | 空输入合法；失焦按 `clampOnBlur` 处理 |
| Slider | `number` | 由 `value` 决定 | 单值；区间模式 V1 不做 |
| DatePicker | `string \| null` | `null` | 规范格式 `YYYY-MM-DD`，本地日历语义 |
| FormField | 不承载值 | — | 只负责布局与关联 |

### 5.1 Select 选项

```ts
interface SelectOption {
  value: string;
  label: ReactNode;
  textValue?: string;    // 类型搜索/屏幕阅读器用的纯文本；label 非文本时必填
  description?: ReactNode;
  disabled?: boolean;
}
```

- 选项值必须唯一；重复值在开发环境警告。
- V1 不支持选项分组、异步加载、虚拟滚动。出现需求再扩展，不让 API 先复杂化。
- `options` 数据驱动，不提供等价的 children 写法；需要复杂选项面板时使用 Popover + Menu 自行组合。

### 5.2 NumberInput

- 输入类型为 `text` + `inputMode="decimal"`，不使用 `input[type=number]`：避免滚轮误改、浏览器本地化与无效字符问题。
- 内部保留“编辑中字符串”，提交时解析为数字；无法解析时按 `allowEmpty` 处理，不写入 `NaN`。
- `min` / `max` / `step` / `precision` 是边界与步进定义；`clampOnBlur` 默认 `true`，失焦时钳制到合法范围。
- `onValueChange` 只在可解析的数值变化时触发；清空触发 `null`。

### 5.3 Slider

- V1 只支持单值；区间模式需要 `value: [number, number]` 与双 thumb 键盘模型，当前没有明确业务需求，标记为后续扩展。
- `onValueChange` 在拖动/键盘调整过程中高频触发；`onValueCommit` 在指针释放或键盘提交时触发一次。
- 必须提供可访问名称；`aria-valuemin` / `max` / `now` / `valuetext` 由组件维护。

### 5.4 DatePicker

- 公共值类型为 `YYYY-MM-DD` 字符串，表示**本地日历日期**，不携带时间与时区。
- 禁止用 `new Date('YYYY-MM-DD')` 解析（会按 UTC 解释）；内部按年/月/日分量构造本地日期。
- `min` / `max` / `disabledDate(date: string)` 均使用同一字符串格式，避免 Date 对象时区歧义。
- 显示格式由 `locale`（BCP 47）与 `weekStartsOn` 决定；默认 `zh-CN`、周一为首日。值格式不随 locale 改变。
- 范围选择 V1 不做。

## 6. 受控 / 非受控

| 组件 | 受控 | 非受控 | 回调 |
| --- | --- | --- | --- |
| Input / Textarea | `value` | `defaultValue` | 原生 `onChange` |
| Checkbox / Switch | `checked` | `defaultChecked` | 原生 `onChange` |
| RadioGroup | `value` | `defaultValue` | `onValueChange` |
| Select / NumberInput / Slider / DatePicker | `value` | `defaultValue` | `onValueChange` |

规则与 `api-conventions.md` §7 一致：受控优先、不可运行时切换、`defaultX` 只读一次。受控模式下组件不保存影子状态。

## 7. 校验与错误

- 校验策略由调用方决定（原生约束、表单库、服务端）；组件只消费 `invalid` 与错误文本。
- 异步校验：调用方维护 `validating`；组件不提供内置异步状态，避免把网络逻辑引入 UI 库。需要时可在外层显示 Spinner。
- 错误文案必须由 FormField.Error 或 `aria-describedby` 关联；仅改变边框颜色不合格。
- 错误出现时不应自动抢焦点，除非表单提交后的第一个错误；该焦点策略由调用方实现。
- `disabled` 控件不参与校验与提交；`readOnly` 控件参与表单提交。

## 8. 视觉映射

- 表单控件使用 **UI 无衬线字体**，不得继承 `base.css` 的 editorial 字体。
- 输入表面采用 `plain` 材质等级 0–1；不使用 paper/film 纹理，避免干扰输入。
- 高度：`sm` 32 / `md` 40 / `lg` 48（建议值）。
- 边框：默认 `--au-color-border-subtle`；hover `--au-color-border-metal`；focus-visible `--au-color-border-lit` + glow；invalid 需 danger Token（缺口见 §9）。
- 禁用态：降低对比度、去除 glow、光标 `not-allowed`；不得仅靠 `opacity` 导致文字不可读。
- 必填标记与可选标记的文案由 FormField 提供，组件不硬编码中英文。

## 9. Token 缺口

以下缺口会直接影响 M2：

1. `--au-color-feedback-danger`（及背景/边框派生）用于 invalid。
2. `--au-color-text-disabled` / `--au-color-bg-disabled` / `--au-color-border-disabled`。
3. `--au-color-focus-ring` 或明确的 focus ring 组合（当前只能用 border-lit + glow 组合）。
4. 控件高度/内边距 Token：可先使用组件局部变量，但需确认是否纳入全局 Token。
5. DatePicker 的日历网格尺寸、星期标题样式尚未在视觉规范中定义。

在缺口补齐前，M2 可以先实现视觉中性版本；`invalid` 的最终配色不得用 accent 代替并宣称完成。

## 10. 测试要求

- 原生控件：标签关联、`aria-invalid`、必填、禁用、受控/非受控、清除/重置。
- RadioGroup：方向键切换、roving tabindex、表单提交值。
- Select / DatePicker：打开/关闭、Escape、外部点击、焦点恢复、键盘选择、隐藏 input 提交值。
- NumberInput：非法输入、空值、边界钳制、步进按钮标签。
- Slider：方向键/Home/End、`aria-valuetext`、`onValueCommit` 时机。
- FormField：ID 唯一性、`aria-describedby` 同时包含描述与错误、错误播报。
