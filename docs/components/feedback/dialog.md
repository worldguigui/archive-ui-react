# Dialog

> 状态：草案（阶段一）· 需人工审核。M3 反馈与浮层。

## 1. 职责

模态对话框：在遮罩之上呈现需要集中注意力的内容，阻止背景交互，管理焦点与关闭。适合表单、详情、确认之外的通用弹层。

**使用场景**：档案详情、编辑表单、设置面板、嵌入的复杂内容。
**不适用**：必须二选一的危险确认（用 AlertDialog）；轻量提示（用 Tooltip/Popover）；短消息（用 Toast/Alert）；整页导航（用路由页面）。
**区别**：Dialog 通用且可关闭；AlertDialog 有明确动作且默认不随意关闭。

## 2. 边界

- 不提供触发器组件；打开/关闭由外部 Button 与 `open` 控制。
- 不内置表单、滚动区域或底部按钮布局；`footer` 只提供插槽。
- 不提供嵌套 Dialog 的自动关闭链；嵌套是允许的，由 LayerStack 管理层级。
- V1 不开放 `material`；浮层表面等待专用视觉立项，不使用 paper/film 强纹理。
- 不提供全屏/抽屉模式；需要时另立组件或组合。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `open` / `defaultOpen` | `boolean` | — / `false` | 受控/非受控打开 |
| `onOpenChange` | `(open: boolean) => void` | — | 打开状态 |
| `title` | `ReactNode` | **必填** | 可访问标题 |
| `description` | `ReactNode` | — | 辅助说明；关联 aria-describedby |
| `children` | `ReactNode` | — | 正文 |
| `footer` | `ReactNode` | — | 操作区插槽 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 最大宽度 400/560/720 |
| `closeOnEscape` | `boolean` | `true` | Escape 关闭 |
| `closeOnOutsideClick` | `boolean` | `true` | 遮罩点击关闭 |
| `showCloseButton` | `boolean` | `true` | 右上角关闭按钮 |
| `closeLabel` | `string` | `'关闭'` | 关闭按钮名称 |
| `initialFocusRef` | `RefObject<HTMLElement>` | — | 初始焦点 |
| `lockScroll` | `boolean` | `true` | 锁定 body 滚动 |
| `portalContainer` | `HTMLElement \| null` | body | Portal 容器 |

```tsx
import type { HTMLAttributes, ReactNode, RefObject } from 'react';

export interface DialogProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  showCloseButton?: boolean;
  closeLabel?: string;
  initialFocusRef?: RefObject<HTMLElement>;
  lockScroll?: boolean;
  portalContainer?: HTMLElement | null;
}
```

`className` / `style` / `id` 作用于内容容器；标题与描述的关联 ID 由内部 `useId` 生成，不使用调用方的 `id` 拼装。

## 4. 事件与状态

- `onOpenChange(false)`：Escape、遮罩点击、关闭按钮触发；受控模式不自行关闭。
- 状态：Closed、Opening、Open、Closing、ScrollLocked。
- 打开时焦点进入内容；Tab/Shift+Tab 陷阱；关闭后焦点回到打开前元素。
- 关闭动画期间内容保持挂载但不可交互；动画结束卸载。
- 快速开关：取消未完成的动画与焦点任务，避免焦点跳到错误位置。

## 5. 视觉

- 遮罩使用 `--au-color-overlay`；内容为 plain 轻表面、hairline 边框、`--au-shadow-deep`。
- 标题使用 title/heading 字体；描述使用 secondary 文本；正文 editorial/UI 按内容。
- 关闭按钮为 IconButton ghost，位于右上角；不得遮挡标题。
- 内容最大高度 `min(90vh, ...)`，内部滚动；页脚固定或随内容，由实现固定一套。
- 不使用彩色渐变、强纹理、发光边框。

## 6. 组合与扩展

- 表单 Dialog：`title` + FormField 组合 + `footer` 放提交/取消按钮。
- 详情 Dialog：`title` + `description` + 自定义内容；不提供预设布局。
- 嵌套 Dialog 允许，但应避免；嵌套时只有最顶层响应 Escape/外部点击。
- 与 AlertDialog 的区别：需要用户明确确认/取消时用 AlertDialog，不在这里加 `role` 或 `danger` 开关。

## 7. 无障碍

- `role="dialog"`、`aria-modal="true"`、`aria-labelledby` 指向标题、`aria-describedby` 指向描述（若存在）。
- 必须有可访问名称；`title` 必填，不可只用图标。
- 焦点陷阱与初始焦点；至少一个可聚焦元素；关闭后恢复焦点。
- 背景内容 `aria-hidden` 由内部管理（inert/aria-hidden），不得让屏幕阅读器读到背景。
- Escape 可关闭是默认；若业务要求不可关闭，需明确提供替代关闭路径。
- 遮罩点击关闭对触摸用户可用；拖拽选中文本不应误关。
- 滚动锁使用引用计数；嵌套模态正确恢复滚动。

## 8. 示例

```tsx
<Dialog
  open={open}
  onOpenChange={setOpen}
  title="档案详情"
  description="编号 AR-1972-031"
  footer={<><Button variant="ghost" onClick={() => setOpen(false)}>关闭</Button><Button>编辑</Button></>}
>
  <ArchiveMetadata items={metadata} />
</Dialog>
```

## 9. 边界情况

- `title` 为空：开发环境报错；无障碍不合格。
- `footer` 为空：不渲染页脚区域。
- 内容超长：内部滚动，页脚保持可达；不把整页滚动锁死。
- 只有静态文本：仍允许，但关闭按钮必须可用。
- 受控 `open` 不更新：不关闭；不能绕过父级。
- 触发元素在打开期间被移除：焦点退回 body。
- 快速连续开关：以最后一次受控状态为准；动画可中断。
- SSR：首次渲染不挂载 Portal；服务端不输出模态。

## 10. 依赖与实现注意

- 依赖 OverlayPortal、FocusScope、DismissableLayer、LayerStack、Presence、IconButton。
- 背景 inert/aria-hidden 需要与 LayerStack 协调，避免多个模态互相取消。
- 标题 ID / 描述 ID 用 `useId`；不要依赖 DOM 顺序。
- 不把 `title` 当作原生 tooltip 属性；已 Omit。
- 浮层依赖若采用第三方 Headless Primitive，需先完成依赖决策。
