# Tag

> 状态：草案（阶段一）· 需人工审核。M1 基础组件。

## 1. 职责

承载分类、状态或筛选条件的短标签；可选带移除按钮。它是内容标签，不是计数角标。

**使用场景**：分类、关键词、筛选条件、档案分类（未来 archive variant）。
**不适用**：未读计数（用 Badge）；可点击的导航（用链接/Button）；长段说明（用 Alert/Typography）。
**区别**：Tag 可承载文本与移除行为；Badge 表达数量/圆点状态。

## 2. 边界

- Tag 本身不是按钮；需要点击筛选时，调用方应使用 Button 或带 `onClick` 的专用筛选组件，而不是让 Tag 变成按钮。
- 移除按钮是 Tag 内部唯一的交互元素；没有 `onRemove` 时不渲染移除按钮。
- V1 不支持拖拽排序、内嵌表单控件、任意复杂子组件。
- ArchiveLabel 建议并入 Tag 的 `variant="archive"`；该扩展待确认，当前不实现。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `variant` | `'outline' \| 'solid' \| 'ghost'` | `'outline'` | 视觉强调 |
| `tone` | `AccentTone` | `'neutral'` | 颜色语义 |
| `size` | `'sm' \| 'md'` | `'md'` | 标签尺寸 |
| `icon` | `ReactNode` | — | 前置图标，装饰性 |
| `onRemove` | `(event: MouseEvent<HTMLButtonElement>) => void` | — | 提供时渲染移除按钮 |
| `removeLabel` | `string` | `'移除'` | 移除按钮可访问名称 |
| `disabled` | `boolean` | `false` | 禁用移除按钮（不影响 Tag 展示） |
| `children` | `ReactNode` | — | 标签内容 |

```tsx
import type { HTMLAttributes, MouseEvent, ReactNode } from 'react';
import type { AccentTone } from '../api-conventions';

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'outline' | 'solid' | 'ghost';
  tone?: AccentTone;
  size?: 'sm' | 'md';
  icon?: ReactNode;
  onRemove?: (event: MouseEvent<HTMLButtonElement>) => void;
  removeLabel?: string;
  disabled?: boolean;
  children?: ReactNode;
}
```

## 4. 事件与状态

- `onRemove`：移除按钮点击时触发；按钮为原生 `<button type="button">`，支持 Enter/Space。
- 无 `onClick` 语义；Tag 本体不接收点击行为承诺。
- 状态：Default、Hover（仅移除按钮）、Focus-visible（仅移除按钮）、Disabled（仅移除按钮）。
- 不上报“已移除”状态；是否从列表移除由调用方决定。

## 5. 视觉

- `outline`：透明底 + hairline 边框；`solid`：表面色 + 文字；`ghost`：无边框，仅文字与图标。
- 标签文本使用 UI 字体与 label 字距；档案分类如果需要等宽编号，等待 `archive` variant 结论。
- 移除按钮为小尺寸图标按钮，命中区至少 24×24px；不得仅用 12px 图标响应点击。
- 不使用渐变；强调通过边框/文字颜色，不通过大面积色块。

## 6. 组合与扩展

- 与图标组合时，图标 `aria-hidden`；不提供图标点击行为。
- 多个 Tag 的容器布局由调用方负责（wrap、gap），Tag 不提供 group 组件。
- 需要筛选集合时，建议 Button + 选中状态或未来的 FilterTag；不要给 Tag 增加 `selected` / `onClick` 双重语义。

## 7. 无障碍

- Tag 文本是内容；移除按钮必须有名称。默认名称应包含标签内容（如“移除：机密”），若 children 非纯文本，调用方必须传 `removeLabel`。
- 移除按钮的 `type="button"`，避免在表单中提交。
- 标签不因颜色而丧失语义；分类文字必须可读。
- 触摸目标：移除按钮通过 padding 扩展。

## 8. 示例

```tsx
<Tag tone="gold">机密</Tag>
<Tag variant="solid" tone="accent">待归档</Tag>
<Tag icon={<StarIcon aria-hidden />}>重点</Tag>
<Tag onRemove={() => remove(id)}>可移除分类</Tag>
<Tag onRemove={() => remove(id)} removeLabel="移除分类：雨夜">雨夜</Tag>
```

## 9. 边界情况

- 空 children 且有 onRemove：仍渲染空标签；建议开发环境警告。
- 超长文本：默认不换行，最大宽度由调用方控制；截断时必须保留完整可访问文本。
- `disabled` 且无 `onRemove`：无效果，警告。
- 在表单内部：移除按钮必须不提交表单（type=button）。
- 快速重复点击移除：不内置防抖；调用方控制。

## 10. 依赖与实现注意

- 依赖内部 close 图标；不依赖 IconButton（避免为一个小按钮引入完整按钮 API）。
- Tag 根为 `<span>`；移除按钮是内部 `<button>`，不得嵌套交互元素。
- `variant="archive"` 与 ArchiveLabel 的合并需确认后再加入联合类型；当前不预留无效值。
- 状态色 `danger` 不用于 Tag；Tag 的语义是分类，不是错误。
