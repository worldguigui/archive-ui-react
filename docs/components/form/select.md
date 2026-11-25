# Select

> 状态：草案（阶段一）· 需人工审核。M2 表单组件 / 浮层。

## 1. 职责

从一组互斥选项中选择一个值。它是自定义外观的单选控件，保留原生表单提交能力，但不使用原生 `<select>` 的弹层。

**使用场景**：选项较多、需要统一视觉、需要描述文本或清空操作的单选。
**不适用**：选项很少且可直接展示（用 RadioGroup）；多选（V1 不做）；可搜索的复杂命令（用 Popover + Menu）。
**区别**：Select 是表单值控件；DropdownMenu 是命令菜单；RadioGroup 是平铺单选。

## 2. 边界

- 数据驱动 `options`，不支持 children 选项；富选项面板请用 Popover + Menu。
- V1 不支持选项分组、异步加载、虚拟滚动、多选、创建新选项。
- 不内置搜索；选项很多时等待独立 Combobox 组件。
- 不使用原生 `<select>` 的视觉，但通过隐藏 input 参与表单提交。
- 不使用 `onChange`（值语义），统一 `onValueChange`。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `options` | `SelectOption[]` | **必填** | 选项数据 |
| `value` | `string \| null` | — | 受控值；`null` 为未选 |
| `defaultValue` | `string \| null` | `null` | 非受控初值 |
| `onValueChange` | `(value: string \| null) => void` | — | 值变化 |
| `placeholder` | `ReactNode` | `'请选择'` | 未选时显示 |
| `emptyText` | `ReactNode` | `'无可选项'` | 无选项时显示 |
| `size` | `Size` | `'md'` | 控件高度 |
| `disabled` | `boolean` | `false` | 整体禁用 |
| `invalid` | `boolean` | `false` | 错误状态 |
| `required` | `boolean` | `false` | 原生必填 |
| `name` | `string` | — | 隐藏 input 的提交名 |
| `fullWidth` | `boolean` | `false` | 占满容器 |
| `clearable` | `boolean` | `false` | 允许清空到 `null` |
| `clearLabel` | `string` | `'清除选择'` | 清空按钮名称 |
| `open` / `defaultOpen` | `boolean` | — / `false` | 受控/非受控打开 |
| `onOpenChange` | `(open: boolean) => void` | — | 打开状态 |
| `closeOnEscape` | `boolean` | `true` | Escape 关闭 |
| `closeOnOutsideClick` | `boolean` | `true` | 外部点击关闭 |
| `placement` | `Placement` | `'bottom-start'` | 弹层方位 |
| `portalContainer` | `HTMLElement \| null` | body | Portal 容器 |

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import type { Placement, Size } from '../api-conventions';

export interface SelectOption {
  value: string;
  label: ReactNode;
  /** label 不是纯文本时，为类型搜索与屏幕阅读器提供文本。 */
  textValue?: string;
  description?: ReactNode;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'children'> {
  options: SelectOption[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  placeholder?: ReactNode;
  emptyText?: ReactNode;
  size?: Size;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  name?: string;
  fullWidth?: boolean;
  clearable?: boolean;
  clearLabel?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  placement?: Placement;
  portalContainer?: HTMLElement | null;
}
```

## 4. DOM 映射

- 根：`<div class="au-select">`；`className` / `style` 作用于根。
- 触发：内部 `<button type="button" role="combobox">`；`id`、`aria-label`、`aria-labelledby`、`aria-describedby`、`aria-invalid`、`required` 作用于触发按钮。
- 隐藏 `<input type="hidden" name value>` 负责表单提交；不参与焦点。
- `ref` 指向触发按钮。
- 清空按钮与触发器是兄弟节点，不嵌套 `<button>`。

## 5. 事件与状态

- `onValueChange`：选择选项或清空时触发；受控模式不自行更新。
- `onOpenChange`：打开/关闭；受控模式不自行关闭。
- 状态：Closed、Open、Hover、Focus-visible、Disabled、Invalid、Empty、Selected。
- 键盘：↑/↓ 移动高亮；Home/End；Enter/Space 选择；Escape 关闭；Tab 关闭并离开；typeahead 按 `textValue`/字符串 label 匹配。
- 快速打开/关闭：取消未完成的定位/焦点任务；不保留过期高亮。

## 6. 视觉

- 触发按钮外观接近 Input，使用 UI 字体与同尺寸高度；chevron 图标旋转表示打开。
- 弹层使用 plain 轻表面、hairline 边框、`--au-shadow-deep`；最大高度约 320px，超出滚动。
- 选中项使用勾选标记 + 文字/边框变化，不只靠底色；禁用项降低对比度。
- 清空按钮为小尺寸图标按钮，出现在触发区域尾部；不覆盖文字。
- 无效态使用 danger 色（Token 缺口）；焦点环与 Input 一致。

## 7. 组合与扩展

- 与 FormField 组合获得标签、描述、错误；`FormFieldControl` 注入的 `id` / `aria-*` 必须落到触发按钮。
- 需要分组/搜索/多选时，不扩展 Select；另立 Combobox 或使用 Popover + Menu。
- `options` 必须唯一；调用方可用 `useMemo` 稳定数组，组件不要求。

## 8. 无障碍

- 触发按钮：`role="combobox"`、`aria-haspopup="listbox"`、`aria-expanded`、`aria-controls`、`aria-activedescendant`。
- 弹层：`role="listbox"`；选项 `role="option"`、`aria-selected`、`aria-disabled`。
- 焦点保持在触发按钮，高亮通过 `aria-activedescendant` 表达；不要把焦点移入 listbox（除非采用另一种一致的 combobox 模式并全库统一）。
- 隐藏 input 提交值；没有 name 时不提交。
- 必须有可访问名称；placeholder 不是标签。
- `required` 通过 `aria-required` 或隐藏 input 的 required 表达；空值校验由调用方决定。
- 触摸：选项高度至少 44px 的可点击区域（视觉可更紧凑）。

## 9. 示例

```tsx
<Select
  options={[
    { value: 'public', label: '公开' },
    { value: 'internal', label: '内部' },
    { value: 'secret', label: '机密', description: '仅馆长可阅' },
  ]}
  placeholder="选择密级"
  onValueChange={setLevel}
/>

<Select
  options={options}
  value={level}
  onValueChange={setLevel}
  clearable
  invalid={!!error}
  name="level"
/>
```

## 10. 边界情况

- 无选项：打开仍可，显示 `emptyText`；触发器可聚焦。
- `value` 不匹配任何选项：显示 placeholder，开发环境警告；不清空调用方值。
- 重复选项值：开发环境警告；第一个匹配生效。
- 选项 label 非文本且无 textValue：可显示，但 typeahead/可访问名称不完整；开发环境警告。
- 超长选项：弹层内换行或截断；必须保留可访问全文。
- 弹层超出视口：flip/shift；仍不可用时允许内部滚动。
- 受控 `open` 不更新：弹层不关闭；不在内部强制关闭。
- 表单 reset：自定义控件不自动响应原生 reset；需要时由调用方重置 value。V1 不提供 `onReset`。
- 清空在 disabled 时：清空按钮不渲染或禁用；不得触发 onValueChange。

## 11. 依赖与实现注意

- 依赖内部 OverlayPortal / OverlayPositioner / DismissableLayer / Typeahead；不依赖 DropdownMenu。
- 隐藏 input 的 value 用空字符串表示未选；不要提交字面量 `null`。
- 选项列表使用固定 DOM 顺序；高亮项滚动到可视区。
- 开发环境校验重复 value、缺失 textValue；生产环境不抛错。
- 定位/焦点依赖若采用第三方 Headless Primitive，需先完成依赖决策。
