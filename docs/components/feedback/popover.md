# Popover

> 状态：草案（阶段一）· 需人工审核。M3 反馈与浮层。

## 1. 职责

在触发元素旁显示任意内容的非模态浮层。它解决的是“需要比 Tooltip 更丰富的内容，但不值得打开对话框”的问题。

**使用场景**：筛选面板、颜色/选项面板、用户卡片、轻量设置、说明详情。
**不适用**：纯文本提示（用 Tooltip）；命令菜单（用 DropdownMenu）；必须阻断背景的操作（用 Dialog）；表单完整流程（用 Dialog）。
**区别**：Popover 可交互、可聚焦；Tooltip 不可交互且不移动焦点；DropdownMenu 有菜单键盘语义。

## 2. 边界

- 不提供预设标题/页脚/操作区；内容由 children 自由组合。
- 不内置表单或关闭按钮；需要时在内容中放 Button。
- 非模态默认不锁滚动、不移动焦点；`modal=true` 时才启用陷阱与滚动锁。
- 不提供子菜单；命令菜单使用 DropdownMenu。
- 不使用 `aria-haspopup="menu"`；那不是 Popover 的语义。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `trigger` | `ReactElement` | **必填** | 唯一触发元素，可接收 ref |
| `children` | `ReactNode` | **必填** | 浮层内容 |
| `open` / `defaultOpen` | `boolean` | — / `false` | 受控/非受控 |
| `onOpenChange` | `(open: boolean) => void` | — | 打开状态 |
| `placement` | `Placement` | `'bottom-start'` | 12 方位 |
| `offset` | `number` | `8` | 与触发器距离 px |
| `modal` | `boolean` | `false` | 是否模态（焦点陷阱 + 滚动锁） |
| `closeOnEscape` | `boolean` | `true` | Escape 关闭 |
| `closeOnOutsideClick` | `boolean` | `true` | 外部点击关闭 |
| `arrow` | `boolean` | `true` | 箭头（装饰） |
| `matchTriggerWidth` | `boolean` | `false` | 内容宽度匹配触发器 |
| `initialFocusRef` | `RefObject<HTMLElement>` | — | 打开后聚焦元素 |
| `portalContainer` | `HTMLElement \| null` | body | Portal 容器 |
| `aria-label` / `aria-labelledby` | `string` | — | 模态内容的可访问名称；`modal` 时建议必填 |
| `className` | `string` | — | 内容容器 class |

```tsx
import type { ReactElement, ReactNode, RefObject } from 'react';
import type { Placement } from '../api-conventions';

export interface PopoverProps {
  trigger: ReactElement;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: Placement;
  offset?: number;
  modal?: boolean;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  arrow?: boolean;
  matchTriggerWidth?: boolean;
  initialFocusRef?: RefObject<HTMLElement>;
  portalContainer?: HTMLElement | null;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  className?: string;
}
```

## 4. 事件与状态

- 触发：点击、Enter、Space 切换；不使用 hover（hover 是 Tooltip 的行为）。
- 关闭：Escape、外部点击、受控状态；`modal` 时外部点击是否关闭仍由 `closeOnOutsideClick` 决定。
- 状态：Closed、Open、Modal、Closing。
- 打开后焦点默认留在触发器；`initialFocusRef` 可移入内容。非模态时 Tab 正常离开。
- 受控模式不自行关闭。

## 5. 视觉

- 内容表面 plain、hairline 边框、`--au-shadow-deep`；最大宽度由内容与视口决定，不设统一最小宽度。
- 箭头为装饰；内容内边距由 Popover 提供统一值，不暴露 padding prop。
- 不使用 paper/film 强纹理；背景不得抢夺内容。
- 进入/退出淡入 + 轻微位移，尊重 reduced motion。
- 定位 flip/shift，保持在视口内。

## 6. 组合与扩展

- 筛选面板：FormField + Checkbox/Select 组合。
- 用户菜单：不要用 Popover 假装菜单；用 DropdownMenu。
- 与 Dialog 嵌套：Popover 在 Dialog 内允许，层级由 LayerStack 管理。
- 不提供 `asChild`；trigger 是唯一元素，内部 clone 注入 ref/aria/事件。

## 7. 无障碍

- 非模态：不强制 `role`；内容语义由 children 决定。`aria-label` 在无 role 的容器上不产生可访问名称；V1 建议非模态不加 role，也不依赖 `aria-label` 作为唯一名称。
- 模态：`role="dialog"`、`aria-modal="true"`，必须有可访问名称（`aria-label` / `aria-labelledby` 或内容中的标题关联）。
- 触发器注入 `aria-expanded`、`aria-controls`；是否 `aria-haspopup="dialog"` 仅在模态时使用。
- Escape 关闭；关闭后焦点回到触发器（若焦点曾在内容内）。
- 外部点击关闭不抢焦点；点击目标自然获得焦点。
- 内容中第一个可聚焦元素不应强制自动聚焦，除非 `initialFocusRef` 指定。

## 8. 示例

```tsx
<Popover trigger={<Button variant="outline">筛选</Button>}>
  <Stack gap="sm">
    <Checkbox defaultChecked>仅看未归档</Checkbox>
    <Checkbox>仅看机密</Checkbox>
  </Stack>
</Popover>

<Popover
  trigger={<IconButton aria-label="详细信息"><InfoIcon /></IconButton>}
  placement="right"
  matchTriggerWidth={false}
>
  <Typography variant="body">...</Typography>
</Popover>
```

## 9. 边界情况

- Trigger 是 Fragment/多根：不支持，开发环境警告。
- 内容为空：不展示浮层，警告。
- 超长内容：内容内部滚动，最大高度由实现限制；不撑出视口。
- 外部点击落在另一个浮层：由 LayerStack 判定；不误关父层。
- 受控 open 不更新：保持打开。
- 快速切换：取消未完成定位/动画。
- 触摸：点击触发；外部触摸关闭；不使用 hover。
- 触发器卸载：关闭并清理。

## 10. 依赖与实现注意

- 依赖 OverlayPortal、OverlayPositioner、DismissableLayer、FocusScope（modal）、Presence。
- 与 Tooltip 共享定位，不共享语义；不要用一个 `mode` prop 合并两者。
- 不暴露 zIndex / 定位计算 / 箭头尺寸。
- 若引入 Floating UI，本组件优先使用其定位与 dismiss，不改变公共 API。
