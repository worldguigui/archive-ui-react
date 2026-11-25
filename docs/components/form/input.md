# Input

> 状态：草案（阶段一）· 需人工审核。M2 表单组件。

## 1. 职责

单行文本输入，支持前后装饰槽、尺寸、错误状态与原生表单能力。它是表单系统的基本输入面。

**使用场景**：文本、邮箱、密码、搜索、电话、URL 输入。
**不适用**：多行文本（用 Textarea）；数值（用 NumberInput）；日期（用 DatePicker）；选择（用 Select）。
**区别**：Input 是原生 `<input>` 的增强，保留原生受控与表单提交语义。

## 2. 边界

- 不做业务校验、不生成错误文案；只消费 `invalid`。
- 不内置清除按钮；需要清除时由调用方在 `endAdornment` 中放 IconButton，并自行更新值。
- 不内置密码显隐切换；可由调用方用 adornment 组合。
- 不做富文本、掩码、自动完成逻辑；原生 `autoComplete` 等属性透传。
- 不允许 `type="number"`：数值输入使用 NumberInput，避免两套数值语义。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `type` | `'text' \| 'email' \| 'password' \| 'search' \| 'tel' \| 'url'` | `'text'` | 收窄原生类型 |
| `size` | `Size` | `'md'` | 控件高度 32/40/48 |
| `invalid` | `boolean` | `false` | 映射 `aria-invalid`；不执行校验 |
| `fullWidth` | `boolean` | `false` | 占满容器 |
| `startAdornment` | `ReactNode` | — | 前置装饰（图标、前缀） |
| `endAdornment` | `ReactNode` | — | 后置装饰（图标、单位、操作） |
| `value` / `defaultValue` | `string` | — | 原生受控/非受控 |
| `onChange` | `ChangeEventHandler<HTMLInputElement>` | — | 原生 change |

其余原生属性（`name`、`placeholder`、`required`、`disabled`、`readOnly`、`autoComplete`、`onFocus`、`onBlur` 等）透传给内部 `<input>`。

```tsx
import type { ChangeEventHandler, InputHTMLAttributes, ReactNode } from 'react';
import type { Size } from '../api-conventions';

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix' | 'type'> {
  type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url';
  size?: Size;
  invalid?: boolean;
  fullWidth?: boolean;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  value?: string;
  defaultValue?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}
```

## 4. DOM 映射（必须明确）

- 根节点：`<div class="au-input">` 包装层；`className` / `style` 作用于根。
- 内部：`<input class="au-input__control">`；`id`、`name`、`aria-*`、`required`、`disabled`、原生事件与其余 input 属性作用于 input。
- `ref` 指向内部 `<input>`。
- FormField.Control 注入的 `id`、`aria-describedby`、`aria-invalid`、`required`、`aria-labelledby` 必须落到 input，不得落到包装层。
- 该映射是本组件唯一的根/输入分离例外，测试必须覆盖。

## 5. 事件与状态

- `onChange` 为原生事件；受控/非受控遵循 React 原生规则。
- 适用状态：Default、Hover、Focus-visible、Disabled、ReadOnly、Invalid、Filled。
- `invalid` 只添加视觉与 `aria-invalid`；不显示错误文本。
- 快速输入：不内置防抖或格式化；输入值原样传递。
- 异步校验：由调用方控制；Input 不显示 loading。

## 6. 视觉

- 高度按 size；表面等级 0–1，无 paper/film 纹理；边框 hairline。
- 文字使用 UI 字体；等宽编号可由调用方使用 className/numeric 字体。
- 装饰槽不改变输入区域最小宽度；图标 `aria-hidden`；可点击装饰必须是真实的按钮并自行处理焦点。
- 错误态使用 danger 色（Token 缺口）；焦点环使用 border-lit + glow。
- `fullWidth` 只影响宽度，不改变高度。

## 7. 组合与扩展

- 与 FormField 组合获得标签、描述与错误关联；单独使用时调用方负责 `<label>`。
- `startAdornment` / `endAdornment` 适合图标与短单位；复杂操作建议外置。
- 不提供 `prefix` / `suffix` 字符串 prop（与原生 RDFa 冲突且表达力弱）。

## 8. 无障碍

- 内部是原生 `<input>`；必须有可访问名称（FormField、`<label>` 或 `aria-label`）。
- `invalid` 映射 `aria-invalid="true"`；错误文本必须通过 `aria-describedby` 关联。
- 禁用与只读使用原生语义；不要用 `aria-disabled` 替代原生 disabled。
- 装饰图标不参与 Tab 顺序；可交互装饰必须有按钮语义与名称。
- placeholder 不能替代标签。
- 密码输入不提供显隐切换时，不得阻止密码管理器。

## 9. 示例

```tsx
<Input placeholder="档案编号" />
<Input startAdornment={<SearchIcon aria-hidden />} placeholder="检索卷宗" />
<Input size="sm" invalid aria-describedby="id-error" />
<FormField id="email" invalid={!!error}>
  <FormField.Label>联系邮箱</FormField.Label>
  <FormField.Control><Input type="email" autoComplete="email" /></FormField.Control>
  <FormField.Error>{error}</FormField.Error>
</FormField>
```

## 10. 边界情况

- `type="password"` + 自动填充：保留原生 `autoComplete`。
- 前后装饰均为长文本：输入区域可能被挤窄；由调用方控制装饰尺寸，组件不限制。
- `invalid` 与原生 `aria-invalid` 同时提供：显式 `aria-invalid` 优先，开发环境警告。
- 受控值变为 `undefined`：按 React 原生非受控/受控警告处理；组件不吞掉警告。
- 禁用装饰按钮：装饰槽内按钮自行处理；Input 不传播 disabled。
- 超长内容：横向滚动由原生 input 处理，不换行。

## 11. 依赖与实现注意

- 无组件依赖；可能复用内部 control 样式变量。
- 包装层需要 `:focus-within` 支持焦点环，但实际焦点状态以 input 的 `:focus-visible` 为准。
- 不硬编码高度/颜色；尺寸映射使用组件局部变量或未来控件 Token。
- 不把 `onChange` 改成值回调；表单库依赖原生事件。
