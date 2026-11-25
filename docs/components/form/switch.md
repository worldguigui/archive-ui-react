# Switch

> 状态：草案（阶段一）· 需人工审核。M2 表单组件。

## 1. 职责

表示一个即时生效的开/关状态。它与 Checkbox 的差别不是视觉，而是语义：Switch 通常立即应用设置，不等待表单提交。

**使用场景**：设置项、即时启用的功能、隐私开关、通知偏好。
**不适用**：需要随表单一起提交的多选项（用 Checkbox）；互斥选项（用 Radio）；操作按钮（用 Button）。
**区别**：Checkbox 是表单选择；Switch 是状态切换，切换后立即生效。

## 2. 边界

- 不管理异步保存；调用方可在切换后请求接口，并用受控值拒绝/回滚。
- 不提供 loading 态；异步保存时可用相邻 Spinner 或禁用开关，V1 不内置。
- 不提供确认对话框；危险开关由 AlertDialog 组合。
- 不提供三种以上状态（无半选）。
- 根是 `<label>`，`children` 是内联标签；不使用 Checkbox 的复选框外观。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `checked` / `defaultChecked` | `boolean` | — / `false` | 原生受控/非受控 |
| `onChange` | `ChangeEventHandler<HTMLInputElement>` | — | 原生 change，`event.target.checked` 为新状态 |
| `size` | `Size` | `'md'` | 轨道尺寸 32/40/48 高度派生 |
| `invalid` | `boolean` | `false` | 映射 `aria-invalid` |
| `disabled` | `boolean` | `false` | 原生禁用 |
| `required` | `boolean` | `false` | 原生必填 |
| `name` | `string` | — | 表单提交名 |
| `children` | `ReactNode` | — | 内联标签 |

```tsx
import type { ChangeEventHandler, InputHTMLAttributes, ReactNode } from 'react';
import type { Size } from '../api-conventions';

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'value'> {
  size?: Size;
  invalid?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  children?: ReactNode;
}
```

## 4. DOM 与语义

- 根 `<label class="au-switch">`；内部 `<input type="checkbox" role="switch">`。
- 原生 input 保留表单提交、焦点与键盘能力；视觉轨道/滑块由内部 span 绘制。
- `className` / `style` 作用于 label；其余 input 属性作用于 input；ref 指向 input。
- `role="switch"` 与 `checked` 共同表达开/关；不要同时使用 `aria-pressed`。

## 5. 事件与状态

- `onChange` 原生；用户切换时触发一次。
- 状态：Off、On、Hover、Focus-visible、Disabled、Invalid。
- 受控模式：只通知，不自行改变；父级不更新则界面弹回。
- 没有 indeterminate / loading 状态。
- 键盘：Space 切换；Enter 不切换（原生 checkbox 行为），不要改为按钮语义。

## 6. 视觉

- 轨道与滑块使用结构线与金属/强调色；开态不能只靠颜色，滑块位置必须不同。
- 尺寸与 Checkbox 行高协调；标签使用 UI 字体。
- 焦点环围绕轨道；不能只给隐藏 input 加 outline。
- 禁用态降低对比度；开/关位置仍可辨。
- 不使用彩色渐变；不使用发光脉冲。

## 7. 组合与扩展

- 与 FormField 组合获得外部标签；若使用内联 children，不再重复外部标签。
- 危险操作开关：外层先弹 AlertDialog，确认后再更新值；不要在 Switch 内内置确认。
- 异步保存：使用受控值；请求失败时回滚；不要依赖非受控内部状态。
- 不提供 `onCheckedChange`，统一用原生 onChange（见 api-conventions §6）。

## 8. 无障碍

- 原生 checkbox + `role="switch"`；可访问状态为 checked/unchecked。
- 必须有名称：children、FormField 或 aria-label。
- `invalid` 映射 `aria-invalid`；错误文本通过 `aria-describedby` 关联。
- 禁用使用原生 disabled；不要只加视觉灰。
- 标签点击切换；Space 可操作。
- 开/关的含义由标签文本表达（如“启用通知”），不要写“关闭/打开”作为状态标签造成歧义。

## 9. 示例

```tsx
<Switch defaultChecked>启用夜间模式</Switch>
<Switch checked={notify} onChange={(e) => setNotify(e.target.checked)}>
  接收档案更新通知
</Switch>
<Switch disabled>仅管理员可修改</Switch>
<FormField id="sync">
  <FormField.Label>自动同步</FormField.Label>
  <FormField.Control><Switch name="sync" /></FormField.Control>
  <FormField.Description>关闭后仍可手动同步</FormField.Description>
</FormField>
```

## 10. 边界情况

- 受控模式未更新 checked：界面不变化（原生行为）。
- 异步保存失败：调用方回滚值；组件不显示错误态，除非传 invalid。
- 快速切换：每次原生 change 触发；调用方负责防抖/取消过期请求。
- disabled 且 required：原生语义下不参与约束验证；调用方需说明。
- children 为空：必须 aria-label，否则不可访问。
- 在表单中提交：未命名时不提交；有 name 时按 checkbox 规则提交。

## 11. 依赖与实现注意

- 无组件依赖。
- 隐藏原生 input 时使用 opacity/clip，保留键盘与表单；不得 `display:none`。
- 轨道与滑块是纯视觉 span，`aria-hidden`。
- 不把状态只画在颜色上；滑块位移必须与焦点环共同表达。
