# Accordion

> 状态：草案（阶段一）· 需人工审核。M3 反馈与浮层。

## 1. 职责

把内容分成可展开/收起的区块，减少页面纵向长度。它解决的是“多项内容共享空间，用户按需阅读”的问题。

**使用场景**：FAQ、档案章节、筛选面板、设置分组、长表单分区。
**不适用**：同级视图切换（用 Tabs）；流程进度（用 Steps）；导航菜单（用 Menu/NavigationMenu）。
**区别**：Accordion 可多个同时展开（multiple），内容在同一页面纵向展开；Tabs 互斥且横向切换。

## 2. 边界

- 采用 Compound 组件：`Accordion`、`AccordionItem`、`AccordionTrigger`、`AccordionContent`。
- V1 只支持纵向；不支持横向手风琴。
- 不内置异步加载内容；内容在打开时已存在（可由调用方条件渲染）。
- 不提供拖拽排序、搜索过滤。
- 不把 Accordion 用作导航；菜单语义不同。

## 3. Props

### Accordion（判别联合）

```tsx
import type { HTMLAttributes, ReactNode } from 'react';

interface AccordionBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  disabled?: boolean;
  headingLevel?: 2 | 3 | 4 | 5 | 6;   // 默认 3
  children: ReactNode;
}

export interface AccordionSingleProps extends AccordionBaseProps {
  type?: 'single';
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  collapsible?: boolean;              // 默认 false
}

export interface AccordionMultipleProps extends AccordionBaseProps {
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  collapsible?: never;
}

export type AccordionProps = AccordionSingleProps | AccordionMultipleProps;
```

### AccordionItem

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | **必填** | 项标识，组内唯一 |
| `disabled` | `boolean` | `false` | 禁用该项 |

### AccordionTrigger

继承 `ButtonHTMLAttributes<HTMLButtonElement>`，`children` 为标题文本；组件管理 `aria-expanded` / `aria-controls` 与点击切换。

### AccordionContent

继承 `HTMLAttributes<HTMLDivElement>`，`children` 为展开内容；关闭时不渲染或 `hidden`，必须不可聚焦。

## 4. 受控与非受控

| 模式 | value | defaultValue | 回调 |
| --- | --- | --- | --- |
| single | `string \| null` | `string \| null` | `onValueChange(string \| null)` |
| multiple | `string[]` | `string[]` | `onValueChange(string[])` |

- 受控模式不自行更新；非受控模式内部维护。
- `type` 不可在运行时从 single 切换到 multiple；开发环境警告。
- `collapsible=false` 时，single 模式不能关闭当前展开项（再次点击保持打开）；`collapsible=true` 允许关闭。
- multiple 默认允许全部关闭。

## 5. 事件与状态

- 点击 Trigger 切换；Enter/Space 原生按钮触发。
- 键盘：↑/↓ 在 Trigger 间移动焦点；Home/End 首尾；可选展开由 Enter/Space。
- 状态：Expanded、Collapsed、Disabled、Focus-visible。
- 内容展开/收起有动画；关闭后内容不可聚焦、不可读。
- 受控模式下 `onValueChange` 只通知。

## 6. 视觉

- 每个 Item 之间用结构线分隔；Trigger 使用 UI 字体，标题可带编号。
- 展开指示使用 chevron 旋转；旋转方向与状态一致。
- Trigger 整行可点击，命中区不小于 44px 高。
- 内容使用 editorial 正文；内边距与 Trigger 对齐。
- 不使用 paper/film 强纹理；Accordion 属于中高密度内容区。
- 动画使用高度/透明度，尊重 reduced motion。

## 7. 组合与扩展

- 与 FormField、Checkbox、Table 等内容自由组合；Accordion 不限制内容类型。
- 与 Tabs 的选择：需要互斥且切换成本低时用 Tabs；需要同时阅读多个区块时用 Accordion。
- 不提供 `AccordionPanel` 等别名；统一 Trigger/Content。
- 不提供受控“打开多个中的某一个”的额外状态；multiple 用数组表达。

## 8. 无障碍

- Trigger 是原生 `<button>`，`aria-expanded`、`aria-controls`；Content `role="region"`、`aria-labelledby` 指向 Trigger。
- 每个 Trigger 包在 `headingLevel` 对应的标题元素中，提供页面大纲。
- 关闭的 Content 必须 `hidden` 或卸载；不能只靠高度 0 导致内容仍可 Tab。
- 禁用项原生 disabled；不可聚焦。
- 方向键移动焦点，不改变展开状态（避免误操作）；Enter/Space 才切换。
- 内容中的标题层级由调用方负责，避免与 Accordion 标题冲突。

## 9. 示例

```tsx
<Accordion type="single" collapsible defaultValue="origin">
  <AccordionItem value="origin">
    <AccordionTrigger>来源</AccordionTrigger>
    <AccordionContent>于 1972 年由档案馆购入。</AccordionContent>
  </AccordionItem>
  <AccordionItem value="condition">
    <AccordionTrigger>保存状况</AccordionTrigger>
    <AccordionContent>纸张轻微酸化，边缘磨损。</AccordionContent>
  </AccordionItem>
</Accordion>

<Accordion type="multiple" defaultValue={['a']} onValueChange={setOpen}>
  ...
</Accordion>
```

## 10. 边界情况

- 重复 `value`：开发环境警告；第一个匹配生效。
- `defaultValue` 指向不存在的项：不展开；警告。
- 受控 value 指向不存在项：全部收起；警告。
- 所有项 disabled：仍渲染，无展开；Trigger 不可聚焦。
- 内容为空：允许展开但无内容；建议调用方避免。
- 超长内容：正常撑开，不内部滚动；由页面滚动。
- 快速连续点击：以最新状态为准；动画可中断。
- 受控模式 value 不变：内容不展开。
- SSR：展开项必须由 defaultValue/value 决定，避免水合不一致。

## 11. 依赖与实现注意

- 依赖内部 Presence（退出动画）、RovingFocus 或 DOM 查询键盘；不依赖 Tabs。
- Trigger/Content 的 ID 用 `useId` 生成；不要依赖 index（可重排）。
- 高度动画需要测量内容；reduced motion 时直接切换。
- 不把 Accordion 做成受控表单控件；它不承载表单值。
