# Slider

> 状态：草案（阶段一）· 需人工审核。M2 表单组件。

## 1. 职责

通过拖动或键盘在连续/离散区间内选择一个数值。它解决的是“用户需要在范围内快速比较并调整”的问题。

**使用场景**：敏感度、阈值、评分、音量、数量范围（单值）。
**不适用**：精确数值输入（用 NumberInput）；区间筛选（V1 不做区间）；离散多选（用 Radio/Select）。
**区别**：Slider 是相对位置选择；NumberInput 是精确键入；Progress 只读进度。

## 2. 边界

- V1 只支持单值；区间模式（双 thumb）没有确认的业务需求，暂不提供。
- V1 只支持水平方向；垂直/横向排列由布局决定，不提供 `orientation`。
- 不内置区间筛选、直方图、缩放。
- 不隐藏原生表单值：提供隐藏 input 供提交。
- 不负责格式化业务单位；`formatValue` 只用于显示与 `aria-valuetext`。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `value` | `number` | — | 受控值 |
| `defaultValue` | `number` | `min` | 非受控初值 |
| `onValueChange` | `(value: number) => void` | — | 拖动/键盘中每次变化 |
| `onValueCommit` | `(value: number) => void` | — | 指针释放/键盘提交后一次 |
| `min` / `max` | `number` | `0` / `100` | 范围 |
| `step` | `number` | `1` | 步进；> 0 |
| `disabled` | `boolean` | `false` | 禁用 |
| `invalid` | `boolean` | `false` | 错误状态 |
| `size` | `Size` | `'md'` | 轨道/滑块尺寸 |
| `showValue` | `boolean` | `false` | 显示当前值 |
| `formatValue` | `(value: number) => string` | `String` | 显示与 aria-valuetext |
| `marks` | `SliderMark[]` | — | 刻度标记 |
| `name` | `string` | — | 隐藏 input 的提交名 |

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import type { Size } from '../api-conventions';

export interface SliderMark {
  value: number;
  label?: ReactNode;
}

export interface SliderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  onValueCommit?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  invalid?: boolean;
  size?: Size;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  marks?: SliderMark[];
  name?: string;
}
```

## 4. DOM 与表单

- 根：`<div class="au-slider" role="slider" tabIndex={0}>`；`className` / `style` / `ref` 作用于根。
- `aria-valuemin` / `aria-valuemax` / `aria-valuenow` / `aria-valuetext` 由组件维护。
- 隐藏 `<input type="hidden" name value>` 参与表单提交；没有 name 时不提交。
- 轨道、填充、thumb、marks 都是视觉子元素，`aria-hidden`。
- 根元素需要可访问名称：`aria-label` / `aria-labelledby`（FormField 注入）。
- 原生 `<label htmlFor>` 对 div 无效；必须使用 FormField 的 `aria-labelledby` 或显式 `aria-label`。

## 5. 事件与状态

- `onValueChange`：拖动、点击轨道、键盘调整时触发；受控模式不自行更新。
- `onValueCommit`：指针释放、键盘操作结束、失焦时触发一次；用于提交/请求。
- 状态：Default、Hover、Focus-visible、Dragging、Disabled、Invalid、AtMin、AtMax。
- 键盘：←/→ 按 step；↑/↓ 同；Home/End 到 min/max；PageUp/PageDown 按 10×step（建议）。
- 触摸：使用 pointer events；拖动时阻止页面滚动（仅水平方向）。

## 6. 视觉

- 轨道为 hairline 结构线，填充为 accent/gold；thumb 为金属/羊皮纸质感，焦点时外环发光。
- 不使用彩色渐变填充；不使用发光脉冲。
- 刻度标记为定位线，标签为 caption；密度过高时由调用方减少 marks。
- `showValue` 的值使用 numeric 字体，跟随 thumb 或固定在右侧；不遮挡轨道。
- 禁用态降低对比度但 thumb 位置可辨；错误态等待状态 Token。

## 7. 组合与扩展

- 与 FormField 组合时，必须使用 aria-labelledby（FormField.Control 已注入）。
- 区间模式、垂直模式、双 thumb 均不通过本组件的未来 prop 偷偷扩展；需要时另立 `RangeSlider`。
- 不需要自定义刻度渲染；marks 只支持文本标签，复杂渲染由外部叠加。
- 与 NumberInput 组合可形成“滑块 + 精确输入”，由调用方同步两个值。

## 8. 无障碍

- `role="slider"` 与 `aria-valuenow` / `min` / `max` / `valuetext`。
- 键盘完整可操作；焦点环清晰。
- 当前值必须可读；`formatValue` 提供业务语义（如“5 级”）。
- 刻度标签不参与焦点；不要依赖刻度文本传达唯一信息。
- 隐藏 input 不参与焦点，但提交值必须与当前值一致。
- 触摸目标 thumb 至少 44×44px（视觉可 20px，通过透明命中区扩大）。
- 颜色不是唯一状态信号：thumb 位置、填充长度、焦点环共同表达。

## 9. 示例

```tsx
<Slider aria-label="敏感度" min={0} max={10} defaultValue={5} />
<Slider
  value={volume}
  onValueChange={setVolume}
  onValueCommit={saveVolume}
  showValue
  formatValue={(v) => `${v}%`}
  marks={[{ value: 0, label: '静音' }, { value: 50 }, { value: 100, label: '最大' }]}
/>
<FormField id="threshold">
  <FormField.Label>阈值</FormField.Label>
  <FormField.Control><Slider min={0} max={100} defaultValue={30} /></FormField.Control>
</FormField>
```

## 10. 边界情况

- `min >= max`：开发环境警告，max 设为 min + step；不渲染负范围。
- `step <= 0` / `NaN`：按 1 处理并警告。
- `value` 超出范围：视觉钳制到边界；受控值不自动改写，`onValueCommit` 报告钳制值。
- `value` 非 step 倍数：显示时按最近 step 取整；受控模式由父级决定。
- 拖动到容器外：按指针位置钳制；pointer capture 保证不丢失。
- 快速拖动：`onValueChange` 高频；`onValueCommit` 只一次。
- 键盘长按：每次 keydown 变化；不防抖。
- RTL：V1 不支持镜像；需要时另立项。
- 无 marks 时轨道仍可点击；marks 值重复时去重或警告。

## 11. 依赖与实现注意

- 无组件依赖；thumb 可使用内部视觉 span。
- 使用 pointer events + pointer capture；同时支持鼠标、触摸、笔。
- 计算百分比时处理 padding/thumb 半径，避免值域端点不可达。
- 不在拖动过程中触发 `onValueCommit`；失焦是否提交需固定（建议：键盘失焦不额外提交）。
- 不硬编码颜色；invalid 颜色等待状态 Token。
