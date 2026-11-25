# DatePicker

> 状态：草案（阶段一）· 需人工审核。M2 表单组件 / 浮层。

## 1. 职责

选择一个日历日期（不含时间）。它解决的是“用户需要按日历浏览并选择日期，同时避免时区错位”的问题。

**使用场景**：档案日期、生效日、截止日、检索时间范围（单日）。
**不适用**：时间选择（V1 不做）；日期范围（V1 不做）；仅需年份/月份（用 Select）；自由文本日期（用 Input）。
**区别**：DatePicker 输出规范日期字符串；Input 不保证日期语义；Select 不适合日历浏览。

## 2. 边界

- 值类型固定为 `YYYY-MM-DD` 字符串，表示**本地日历日期**，不带时间与时区。
- V1 不支持日期范围、时间、秒级、农历、时区转换。
- 不引入日期库；内部只做日历计算（闰年、月长度、周首日）。
- 不做远程节假日/禁用日期数据；通过 `disabledDate` 回调由调用方提供。
- 显示格式随 `locale`，值格式不随 locale 改变。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `value` | `string \| null` | — | `YYYY-MM-DD` 或 `null` |
| `defaultValue` | `string \| null` | `null` | 非受控初值 |
| `onValueChange` | `(value: string \| null) => void` | — | 选择/清空 |
| `min` / `max` | `string` | — | 可选日期边界，格式同上 |
| `disabledDate` | `(date: string) => boolean` | — | 返回 true 禁用该日 |
| `locale` | `string` | `'zh-CN'` | BCP 47，用于月份/星期显示 |
| `weekStartsOn` | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6` | `1` | 0=周日，1=周一 |
| `placeholder` | `string` | `'选择日期'` | 未选显示 |
| `clearable` | `boolean` | `false` | 允许清空到 `null` |
| `clearLabel` | `string` | `'清除日期'` | 清空按钮名称 |
| `labels` | `DatePickerLabels` | 中文默认 | 导航/清空的可访问文本 |
| `size` | `Size` | `'md'` | 触发控件高度 |
| `disabled` / `required` / `name` | 原生 | — | 表单属性 |
| `invalid` | `boolean` | `false` | 错误状态 |
| `fullWidth` | `boolean` | `false` | 占满容器 |
| `open` / `defaultOpen` | `boolean` | — / `false` | 受控/非受控打开 |
| `onOpenChange` | `(open: boolean) => void` | — | 打开状态 |
| `closeOnEscape` | `boolean` | `true` | Escape 关闭 |
| `closeOnOutsideClick` | `boolean` | `true` | 外部点击关闭 |
| `portalContainer` | `HTMLElement \| null` | body | Portal 容器 |

```tsx
import type { HTMLAttributes } from 'react';
import type { Size } from '../api-conventions';

export interface DatePickerLabels {
  previousMonth: string;
  nextMonth: string;
  clear: string;
}

export interface DatePickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'children'> {
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  min?: string;
  max?: string;
  disabledDate?: (date: string) => boolean;
  locale?: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  placeholder?: string;
  clearable?: boolean;
  clearLabel?: string;
  labels?: DatePickerLabels;
  size?: Size;
  disabled?: boolean;
  invalid?: boolean;
  fullWidth?: boolean;
  required?: boolean;
  name?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  portalContainer?: HTMLElement | null;
}
```

## 4. DOM 映射与表单

- 根：`<div class="au-date-picker">`；`className` / `style` 作用于根。
- 触发：内部 `<button type="button">` 显示格式化日期；`id`、`aria-label`、`aria-labelledby`、`aria-describedby`、`aria-invalid`、`required` 落到触发按钮；`ref` 指向触发按钮。
- 弹层：`role="dialog"`，内部 `role="grid"` 日历；日期按钮 `role="gridcell"` 可通过按钮语义聚焦。
- 隐藏 `<input type="hidden" name value>` 提交 `YYYY-MM-DD`；无 name 不提交。
- 清空按钮为触发器的兄弟，不嵌套 button。

## 5. 日期语义

- 规范值：`YYYY-MM-DD`。`2024-02-29` 合法；`2023-02-29` 非法。
- 禁止用 `new Date('YYYY-MM-DD')` 解析；内部按年/月/日构造本地日期。
- `min` / `max` / `disabledDate` 均使用规范字符串；回调不会收到 Date 对象。
- 显示格式通过 `Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' })`；不改变值。
- 时区边界：组件只处理日历日期；如果业务需要某个时区的时间戳，由调用方在提交时转换，不能把时区塞进组件内部。
- 非法值字符串：按 `null` 处理并开发环境警告；不抛错。

## 6. 事件与状态

- `onValueChange`：选择日期或清空时触发；受控模式不自行更新。
- `onOpenChange`：打开/关闭；受控模式不自行关闭。
- 状态：Closed、Open、Hover、Focus-visible、Disabled、Invalid、Selected、Today、OutOfRange。
- 键盘：方向键移动日；PageUp/PageDown 换月；Shift+PageUp/PageDown 换年；Home/End 周首/周末；Enter/Space 选择；Escape 关闭并回到触发按钮。
- 打开：点击触发按钮或 Enter/Space；不在 focus 时自动打开，避免键盘浏览意外弹层。
- 关闭：选择日期（默认）、Escape、外部点击、清空（清空后是否关闭由实现固定：建议不关闭，留在日历）。

## 7. 视觉

- 触发控件外观与 Input 一致，使用 UI/numeric 字体显示日期。
- 日历为 plain 轻表面；今天、选中、禁用三种状态必须可区分。
- 星期标题使用 caption；月份标题使用 title/heading 角色。
- 选中日期使用古金/锈橙标记 + 边框/底色，不只靠颜色。
- 禁用日期降低对比度但保持可读；不显示为“删除线”（语义不明确）。
- 弹层阴影、边框、箭头遵守浮层视觉基线。

## 8. 无障碍

- 触发按钮：`aria-haspopup="dialog"`、`aria-expanded`、`aria-controls`。
- 弹层：`role="dialog"`，`aria-label` 为当前月份/年份；日历 `role="grid"`。
- 日期网格：`role="gridcell"`、`aria-selected`、`aria-disabled`；当前日期有可访问说明（“今天”）。
- 焦点：打开后移入日历当前日期/今日；关闭后回到触发按钮。
- 导航按钮必须有 `labels.previousMonth` / `labels.nextMonth`。
- 不能只靠颜色区分选中/今天/禁用；需要 `aria-selected`、`aria-current="date"`、`aria-disabled`。
- 触摸：日期单元格命中区至少 40×40px。

## 9. 示例

```tsx
<DatePicker defaultValue="1972-11-03" onValueChange={setDate} />
<DatePicker
  value={date}
  min="1900-01-01"
  max="2100-12-31"
  disabledDate={(d) => d.endsWith('-01-01')}
  locale="zh-CN"
  clearable
  name="archive-date"
/>
<FormField id="date" invalid={!!error}>
  <FormField.Label>归档日期</FormField.Label>
  <FormField.Control><DatePicker /></FormField.Control>
  <FormField.Error>{error}</FormField.Error>
</FormField>
```

## 10. 边界情况

- 值为非法格式/不存在日期：视为 `null`，警告；受控值不被改写。
- `min > max`：开发环境警告；禁用所有日期并显示说明，不静默交换。
- `weekStartsOn` 与 locale 默认不同：显式 prop 优先。
- 月份切换后焦点日期不存在（如 1/31 → 2 月）：移动到该月最后一天。
- 今天超出 min/max：仍可显示，但不可选；`aria-current` 不表示可选。
- 弹层被键盘遮挡：定位 flip/shift；不自动滚动页面（调用方处理）。
- 受控 `open` 不更新：弹层保持打开。
- 表单 reset：不自动响应；调用方重置 value。
- 快速切换月份：取消过期焦点任务，避免焦点跳到错误日期。

## 11. 依赖与实现注意

- 依赖内部 OverlayPortal / Positioner / FocusScope（有限）/ 日期工具 / IconButton。
- 日历计算必须用本地日期分量，避免 UTC 解析；闰年、月长度、周首日需单测。
- `Intl` 可用性：Node/浏览器支持；不引入日期库。若环境缺失 Intl，降级英文/数字格式。
- 触发按钮与隐藏 input 的值必须一致；表单提交不包含格式化显示文本。
- 不硬编码月份名；由 Intl 生成；`labels` 只覆盖操作按钮文本。
- 若引入日期库或第三方日历，需先完成依赖决策。
