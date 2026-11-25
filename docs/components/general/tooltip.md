# Tooltip

> 状态：草案（阶段一）· 需人工审核。M1 基础组件 / 浮层。

## 1. 职责

在 hover 或 focus 时显示一小段补充说明的浮层。它解决的是“图标或缩写需要解释，但不值得占用版面”的问题。

**使用场景**：图标按钮说明、缩写全称、截断文本的完整内容、快捷键提示。
**不适用**：可交互内容（用 Popover）；必须阅读的信息（直接显示）；复杂菜单（用 DropdownMenu）；触摸设备的主要提示。
**区别**：Tooltip 只显示文本/简单内容且不可交互；Popover 可承载任意内容；DropdownMenu 是命令菜单。

## 2. 边界

- Tooltip 内容不可包含链接、按钮、表单等交互元素。
- 不替代可访问名称；IconButton 仍需 `aria-label`。
- 不在触摸设备依赖 hover 展示；通过 focus 可达，但不实现长按。
- 不提供 arrow 之外的装饰；不使用材质纹理。
- 与 Popover 共享定位基础设施，但不依赖 Popover 组件。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `trigger` | `ReactElement` | **必填** | 唯一触发元素，必须能接收 ref 与 aria 属性 |
| `children` | `ReactNode` | **必填** | Tooltip 内容 |
| `open` / `defaultOpen` | `boolean` | — / `false` | 受控/非受控打开 |
| `onOpenChange` | `(open: boolean) => void` | — | 打开状态回调 |
| `delay` | `number` | `300` | 打开延迟 ms |
| `closeDelay` | `number` | `100` | 关闭延迟 ms |
| `placement` | `Placement` | `'top'` | 12 方位 |
| `offset` | `number` | `6` | 与触发元素距离 px |
| `arrow` | `boolean` | `true` | 是否显示箭头（装饰） |
| `disabled` | `boolean` | `false` | 禁用显示 |
| `portalContainer` | `HTMLElement \| null` | `document.body` | Portal 容器 |

```tsx
import type { ReactElement, ReactNode } from 'react';
import type { Placement } from '../api-conventions';

export interface TooltipProps {
  trigger: ReactElement;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  delay?: number;
  closeDelay?: number;
  placement?: Placement;
  offset?: number;
  arrow?: boolean;
  disabled?: boolean;
  portalContainer?: HTMLElement | null;
}
```

## 4. 事件与状态

- 打开：鼠标进入触发元素后延时；键盘 focus 立即（或同 delay）打开。
- 关闭：鼠标离开、失焦、Escape；`closeDelay` 用于避免移动过程中的闪烁。
- 受控模式：组件不自行关闭，只调用 `onOpenChange`。
- 不做异步加载；内容必须同步可用。
- 状态：Closed、Opening（延时中）、Open、Closing（退出延时/动画）、Disabled。

## 5. 视觉

- 小尺寸深色表面，hairline 边框，caption/UI 字体；最大宽度建议 240px。
- 多行文本左对齐；不使用 paper/film 纹理。
- 箭头为装饰性小三角，`aria-hidden`。
- 进入/退出使用淡入淡出，尊重 reduced motion。

## 6. 组合与扩展

- 触发元素通过 `cloneElement` 注入 ref、`aria-describedby`、事件处理器；必须是单个可接收 ref 的元素。
- 与 IconButton/Button 组合是主要用法；不内置到 IconButton。
- 需要富内容或交互时改用 Popover，不要扩展 Tooltip。

## 7. 无障碍

- 内容容器 `role="tooltip"`，由触发元素 `aria-describedby` 关联。
- Trigger 自身必须有可访问名称；Tooltip 文本是补充描述，不是名称。
- Escape 关闭；关闭后不移动焦点。
- 触发元素获得焦点时展示，使键盘用户可达。
- 不自动播报 Tooltip；它不是 live region。
- `disabled` 的原生按钮不触发鼠标事件：若需要提示禁用原因，应由外层包装触发或直接显示说明，不依赖 Tooltip。

## 8. 示例

```tsx
<Tooltip trigger={<IconButton aria-label="关闭档案"><CloseIcon /></IconButton>}>
  关闭档案
</Tooltip>

<Tooltip trigger={<abbr tabIndex={0}>AR</abbr>} placement="right">
  Archive Record
</Tooltip>

<Tooltip
  trigger={<Button variant="ghost">快捷操作</Button>}
  open={open}
  onOpenChange={setOpen}
>
  ⌘ K
</Tooltip>
```

## 9. 边界情况

- Trigger 是 Fragment/多根节点：不支持，开发环境警告。
- Trigger 不允许转发 ref：Tooltip 无法定位，需调用方改为可转发元素。
- 内容为空：不展示，开发环境警告。
- 超长内容：最大宽度 + 换行；不横向溢出视口，定位需 flip/shift。
- 快速移入移出：`closeDelay` 防抖；受控模式不自行取消父级状态。
- 触发元素卸载：关闭并清理计时器。
- 触摸设备：focus 可达；不展示“点击即出现”的 Tooltip。

## 10. 依赖与实现注意

- 依赖内部 OverlayPositioner / Portal / Presence；不依赖 Popover 组件。
- 使用 `useId` 生成 tooltip id；SSR 阶段 id 稳定。
- 定位失败时退化为 `top`，不得渲染到视口外。
- 状态变化不改变触发元素布局；Tooltip 必须在 Portal 中。
- `delay` / `closeDelay` 在开发环境应可配置为 0 便于测试。
