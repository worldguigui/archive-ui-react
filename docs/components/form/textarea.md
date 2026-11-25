# Textarea

> 状态：草案（阶段一）· 需人工审核。M2 表单组件。

## 1. 职责

多行文本输入。它与 Input 共享尺寸、错误、禁用与原生受控语义，但允许换行与垂直调整大小。

**使用场景**：档案描述、备注、长文本、摘要。
**不适用**：单行输入（用 Input）；富文本编辑（不用本组件）；代码编辑器（需独立方案）。
**区别**：Textarea 保留用户换行；Input 不接受换行。

## 2. 边界

- 不内置自动增高（autoGrow）；V1 使用原生 `rows` 与 CSS resize。
- 不内置字数统计；使用原生 `maxLength`，显示由调用方负责。
- 不做 Markdown/富文本预览。
- 不改变 `Enter` 的默认换行行为；不拦截快捷键。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `size` | `Size` | `'md'` | 内边距与最小高度等级 |
| `invalid` | `boolean` | `false` | 映射 `aria-invalid` |
| `fullWidth` | `boolean` | `false` | 占满容器 |
| `resize` | `'none' \| 'vertical' \| 'horizontal' \| 'both'` | `'vertical'` | 用户调整方向 |
| `rows` | `number` | `3` | 原生行数；调用方可覆盖 |
| `value` / `defaultValue` | `string` | — | 原生受控/非受控 |
| `onChange` | `ChangeEventHandler<HTMLTextAreaElement>` | — | 原生 change |

其余原生属性透传给 `<textarea>`。

```tsx
import type { ChangeEventHandler, TextareaHTMLAttributes } from 'react';
import type { Size } from '../api-conventions';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: Size;
  invalid?: boolean;
  fullWidth?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  rows?: number;
  value?: string;
  defaultValue?: string;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
}
```

## 4. DOM 映射

- 根节点就是 `<textarea>`；`className` / `style` / `id` / `ref` 均作用于它。
- FormField.Control 注入的属性直接落到 textarea，无需额外映射。

## 5. 事件与状态

- 原生 `onChange`；受控/非受控遵循 React 规则。
- 状态：Default、Hover、Focus-visible、Disabled、ReadOnly、Invalid、Resized。
- 不内置 loading；异步保存由调用方控制。
- 不阻止 Enter；不把 Enter 当作提交（除非调用方在 onKeyDown 中处理）。

## 6. 视觉

- 与 Input 共享边框、字体、焦点环与错误态；字体使用 UI 字体。
- 默认 `resize: vertical`，避免横向拖拽破坏布局；`resize="none"` 时仍应保证内容可滚动。
- 最小高度由 rows 与 size 决定；不设置固定高度。
- `fullWidth=false` 时不设置宽度：由父布局或原生 `cols` 决定；`fullWidth=true` 时 `width: 100%`。表单内通常应使用 `fullWidth`，但组件不强制。

## 7. 组合与扩展

- 与 FormField 组合获得标签/描述/错误；单独使用需 `<label>`。
- 字数统计：调用方在外部渲染，与 `maxLength` 同步；组件不提供 `showCount`，避免引入受控长度追踪。
- 自动增高：等待独立需求；不要用 `resize` 冒充。

## 8. 无障碍

- 原生 textarea；必须有可访问名称。
- `invalid` 映射 `aria-invalid`；错误通过 `aria-describedby` 关联。
- 允许键盘换行；不要拦截 `Enter` 或 `Shift+Enter` 的默认行为。
- 只读与禁用使用原生语义。
- 可调整大小时，用户不应被强制固定；`resize` 是视觉/布局选择，不是安全边界。

## 9. 示例

```tsx
<Textarea placeholder="补充档案说明" />
<Textarea rows={6} maxLength={2000} resize="vertical" />
<Textarea invalid aria-describedby="notes-error" />
<FormField id="summary">
  <FormField.Label>摘要</FormField.Label>
  <FormField.Control><Textarea rows={5} /></FormField.Control>
  <FormField.Description>不超过 2000 字</FormField.Description>
</FormField>
```

## 10. 边界情况

- 空内容：合法；是否必填由 `required` 决定。
- 超长无空格文本：CSS `overflow-wrap: anywhere` 防止横向溢出。
- 用户拖拽至不可用尺寸：`resize` 仅允许指定方向；组件不监听尺寸变化。
- `rows` 小于 1：按 1 处理并警告。
- 受控值包含换行：原样显示；不做 HTML 渲染。
- 在受控模式下用户输入：调用方不更新值则界面不变（原生受控行为）。

## 11. 依赖与实现注意

- 无组件依赖。
- `resize` 是 CSS 属性，不是原生 HTML 属性；实现时设置 `resize`/`min-height`。
- 不硬编码字体；必须覆盖 base.css 的 editorial 字体为 UI 字体。
- 不在 textarea 上叠加材质纹理；保持等级 0–1。
