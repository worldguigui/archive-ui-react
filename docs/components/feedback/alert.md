# Alert

> 状态：草案（阶段一）· 需人工审核。M3 反馈与浮层。

## 1. 职责

在页面内持续展示提示、警告或错误，可带标题、图标、操作与关闭。它解决的是“用户需要看到并可能回看的上下文反馈”问题。

**使用场景**：表单顶部错误摘要、页面级警告、权限提示、成功/失败结果、需要持续显示的安全提示。
**不适用**：瞬时操作结果（用 Toast）；必须确认的操作（用 AlertDialog）；字段级错误（用 FormField）；纯状态标记（用 Badge）。
**区别**：Alert 内联、持久；Toast 浮动、短暂；AlertDialog 模态、必须选择。

## 2. 边界

- 不控制自身显隐；是否渲染由调用方决定。
- 不自动消失；`dismissible` 只提供关闭按钮与回调。
- 不内置图标集；`icon` 由调用方或内部预设提供。
- 不承担表单校验；只展示结果。
- 不提供折叠/展开；长内容由调用方组织。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `tone` | `FeedbackTone` | `'neutral'` | 语义色；status 色缺 Token |
| `title` | `ReactNode` | — | 标题/摘要 |
| `children` | `ReactNode` | — | 说明内容 |
| `icon` | `ReactNode` | — | 前置图标；装饰性 |
| `action` | `ReactNode` | — | 操作区（按钮/链接） |
| `dismissible` | `boolean` | `false` | 显示关闭按钮 |
| `onDismiss` | `(event: MouseEvent<HTMLButtonElement>) => void` | — | 关闭回调 |
| `dismissLabel` | `string` | `'关闭提示'` | 关闭按钮名称 |
| `role` | `'status' \| 'alert'` | `'status'` | 播报语义 |

```tsx
import type { HTMLAttributes, MouseEvent, ReactNode } from 'react';
import type { FeedbackTone } from '../api-conventions';

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'role'> {
  tone?: FeedbackTone;
  title?: ReactNode;
  children?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  dismissible?: boolean;
  onDismiss?: (event: MouseEvent<HTMLButtonElement>) => void;
  dismissLabel?: string;
  role?: 'status' | 'alert';
}
```

## 4. 事件与状态

- `onDismiss`：关闭按钮点击；组件不移除自身，调用方更新渲染。
- 无 open 状态；Alert 是结构性元素。
- `role="status"` 时通过 live region 礼貌播报；`role="alert"` 时立即播报。静态页面初始化就存在的 Alert 可能被重复播报，需调用方谨慎使用 `alert`。
- 状态：Default、Dismissible、WithAction；tone 变体。
- 无 hover/focus 整体状态；交互仅在 action/关闭按钮。

## 5. 视觉

- 表面 plain 等级 0–1，hairline 边框，左侧 tone 标记/图标；不使用强纹理。
- 标题使用 UI 字体加粗；正文 editorial/UI 按内容密度；操作区右对齐或底部。
- 关闭按钮为 IconButton ghost；不与操作按钮挤在一起。
- 成功/警告/危险/信息需要状态 Token；当前只有 accent/gold 可用。
- 不使用彩色渐变背景；颜色只作辅助，文字必须说明状态。

## 6. 组合与扩展

- 表单错误摘要：Alert + 链接到字段；字段自身仍用 FormField.Error。
- 可撤销结果：Alert + action 按钮；但瞬时结果更适合 Toast。
- 页面级警告：Alert 放在内容顶部，不浮动。
- 不嵌套 Alert；需要多层信息时用多个区块。

## 7. 无障碍

- 默认 `role="status"`；紧急错误可 `role="alert"`；不要同时设 `aria-live` 造成双重播报。
- 标题/正文的阅读顺序自然；图标 `aria-hidden`。
- 关闭按钮有名称；action 是真实按钮/链接。
- `tone` 不能是唯一信息；标题或正文必须说明“错误/警告/成功”。
- 不自动聚焦 Alert；除非表单提交后需要聚焦错误摘要（由调用方实现）。
- 持久错误不应被自动移除。

## 8. 示例

```tsx
<Alert tone="danger" title="无法保存档案" role="alert">
  网络连接中断，修改尚未提交。
  <Button variant="ghost" size="sm">重试</Button>
</Alert>

<Alert tone="warning" title="权限受限" dismissible onDismiss={hide}>
  当前账号只能查看公开档案。
</Alert>

<Alert tone="success" title="已完成归档" action={<Button size="sm">查看</Button>} />
```

## 9. 边界情况

- `title` 与 children 都为空：不渲染有意义内容，开发环境警告。
- `dismissible` 但无 `onDismiss`：显示按钮但点击无效果；警告。
- 超长正文：允许换行；不内部滚动，避免嵌套滚动。
- 多个 Alert 同时出现：调用方控制数量；组件不合并。
- `role="alert"` 在初始渲染：可能被屏幕阅读器立即播报；仅用于确实紧急的内容。
- 嵌套交互元素：action 中可放按钮/链接，但 Alert 根不是按钮。
- 关闭后立即重新渲染相同内容：会再次播报；由调用方避免。

## 10. 依赖与实现注意

- 依赖 IconButton（关闭）与内部图标；不依赖 Toast/Dialog。
- 图标与 tone 的映射由组件内置，但可被 `icon` 覆盖。
- 状态色 Token 缺口：success/warning/danger/info 在补齐前不得用场景色硬编码。
- 不把 Alert 做成“可关闭且自动消失”；那是 Toast。
