# Button

> 状态：草案（阶段一）· 需人工审核。M1 基础组件。

## 1. 职责

触发操作或提交表单的按钮。视觉上遵循档案编辑语气：实色不渐变、结构线与金属高光承担强调，不使用现代 SaaS 彩色渐变按钮。

**使用场景**：主/次操作、表单提交、工具栏动作、对话框操作区。
**不适用**：只有图标的按钮（用 IconButton）；页面导航（用链接或 NavigationMenu）；切换状态（用 Switch / Tabs）。
**设计依据**：design-system 维度 01/03/09；交互状态基线；`--au-*` 语义 Token。

## 2. 边界

- Button 不内置图标库；图标通过 `startIcon` / `endIcon` 由调用方提供。
- Button 不管理异步请求；`loading` 只表达状态并阻止重复点击。
- Button 不负责跳转；需要链接时使用 `<a>` 或由调用方组合，不提供 `href`。
- 与 IconButton 的区别是可见文本标签；IconButton 是纯图标且必须提供可访问名称。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `variant` | `'solid' \| 'outline' \| 'ghost' \| 'link'` | `'solid'` | 视觉强调层级 |
| `tone` | `AccentTone \| 'danger'` | `'neutral'` | 颜色语义；`danger` 依赖缺失 Token |
| `size` | `Size` | `'md'` | 32 / 40 / 48 高 |
| `disabled` | `boolean` | `false` | 原生 disabled |
| `loading` | `boolean` | `false` | 进行中；阻止激活，保留焦点与 `aria-busy` |
| `loadingText` | `string` | — | 有值时替换可见文本；无值时保留原文并显示 Spinner |
| `startIcon` / `endIcon` | `ReactNode` | — | 图标槽，装饰性 |
| `fullWidth` | `boolean` | `false` | 占满父容器 |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | 防止误提交表单 |

其余原生属性（`onClick`、`form`、`aria-*`、`name`、`value` 等）透传到 `<button>`。

```tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { AccentTone, Size } from '../api-conventions';

export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'link';
export type ButtonTone = AccentTone | 'danger';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
}
```

## 4. 事件与状态

- `onClick`：原生事件；在 `disabled` 或 `loading` 时不触发（组件内部守卫）。
- 无自定义事件；不提供 `onLoadingChange`。
- 适用状态：Default、Hover、Focus-visible、Active、Disabled、Loading。
- Loading 与 Disabled 不同：Loading 保持焦点与可发现性，`aria-busy="true"`、`aria-disabled="true"`，不设置原生 `disabled`。
- 快速重复点击：Loading 由调用方控制；组件在 `loading` 为真时忽略点击。

## 5. 视觉

- `solid`：`bg-elevated` 底 + hairline 边框；hover 边框提亮至 metal 并叠加克制暖光。
- `outline`：透明底 + 边框；`ghost`：无边框，hover 显示表面色；`link`：无背景，以下划线/字重表达。
- tone 只改变文字、边框与焦点色，不使用大面积填充渐变；`danger` 需要状态 Token。
- 字号使用 UI 字体；标签字距略增（label 角色），数字/编号用 numeric 由内容决定。
- 尺寸为建议值：sm 32 / md 40 / lg 48；触屏场景通过外层内边距补足命中区。

## 6. 组合与扩展

- 图标与文字自由组合；不提供 `iconOnly` 模式。
- 外观定制通过 `className` / `data-*`；不提供内部 CSS 变量契约。
- 不提供 `asChild`；需要链接外观时用 `<a className="au-button ...">` 不可靠，建议等待官方 `ButtonLink` 或使用容器组合（待确认）。

## 7. 无障碍

- 原生 `<button>`；`type` 默认 `button`，避免在表单中意外提交。
- 纯文本标签即名称；图标必须 `aria-hidden`。
- focus-visible 必须可见；禁用态不得仅靠降低透明度导致不可读。
- Loading 状态通过 `aria-busy` 与可见 Spinner 共同表达；`loadingText` 改变可见文本时不得丢失原按钮含义（调用方负责）。
- 图标与文字之间的间距不通过空格字符实现。

## 8. 示例

```tsx
<Button onClick={openArchive}>开启档案</Button>
<Button variant="outline" tone="gold" startIcon={<ArchiveGlyph />}>导出</Button>
<Button variant="ghost" size="sm">取消</Button>
<Button loading loadingText="归档中">提交</Button>
<Button fullWidth type="submit">保存卷宗</Button>
```

## 9. 边界情况

- 空 children 且无图标：允许但应配套 `aria-label`；开发环境建议警告。
- 超长文本：不换行挤压布局，默认单行省略并保留 `title` 由调用方提供；`fullWidth` 时允许换行由调用方覆盖。
- `loading` 与 `disabled` 同时为真：以 disabled 为准，不显示 Spinner 动画的交互承诺。
- 快速连点：loading 守卫；非 loading 的原生按钮不自动防抖。
- 图标改变尺寸时不得改变按钮高度。

## 10. 依赖与实现注意

- 依赖 Spinner（loading）与内部 `cn`；不依赖 Tooltip / IconButton。
- Spinner 必须 `aria-hidden` 或由 Button 统一声明 `aria-busy`，避免重复播报。
- 不硬编码颜色；hover 光效使用 `--au-glow-gold`，禁止彩色渐变。
- 视觉数值待 Playground 校准；`danger` tone 在 Token 补齐前不得实现为“看起来像错误”。
