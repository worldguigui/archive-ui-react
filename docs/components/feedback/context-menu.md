# ContextMenu

> 状态：草案（阶段一）· 需人工审核。M3 反馈与浮层。

## 1. 职责

在用户右键（或键盘菜单键 / 长按）位置打开的菜单，提供与当前区域相关的命令。它解决的是“不占用常驻界面、按对象上下文提供操作”的问题。

**使用场景**：档案条目右键操作、画布/列表区域操作、行内快捷命令。
**不适用**：主要操作入口（用按钮/菜单）；站点导航（用 NavigationMenu）；表单选择（用 Select）。
**区别**：ContextMenu 由指针位置触发，无固定 trigger；DropdownMenu 由触发元素打开。

## 2. 边界

- 与 DropdownMenu 共享 `MenuEntry` 数据模型与键盘逻辑，但触发器不同。
- 菜单项不携带位置数据；`onSelect` 由调用方结合当前上下文处理。
- V1 不支持子菜单、异步加载、虚拟滚动。
- 不负责“右键区域”的选中状态；调用方需在 `onContextMenu` 前设置当前对象。
- 触摸长按依赖浏览器 `contextmenu` 事件，行为不一致；V1 不承诺长按。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `entries` | `MenuEntry[]` | **必填** | 菜单项（同 DropdownMenu） |
| `children` | `ReactElement` | **必填** | 右键区域；必须可接收事件处理器 |
| `open` | `boolean` | — | 受控打开；需配合 `anchorPoint` |
| `onOpenChange` | `(open: boolean) => void` | — | 打开状态 |
| `anchorPoint` | `{ x: number; y: number }` | — | 受控打开时的视口坐标 |
| `disabled` | `boolean` | `false` | 禁用菜单 |
| `closeOnEscape` | `boolean` | `true` | Escape 关闭 |
| `closeOnOutsideClick` | `boolean` | `true` | 外部点击关闭 |
| `aria-label` | `string` | — | 菜单名称 |
| `className` | `string` | — | 菜单内容 class |
| `portalContainer` | `HTMLElement \| null` | body | Portal 容器 |

```tsx
import type { ReactElement } from 'react';

export interface ContextMenuProps {
  entries: MenuEntry[];
  children: ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  anchorPoint?: { x: number; y: number };
  disabled?: boolean;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  'aria-label'?: string;
  className?: string;
  portalContainer?: HTMLElement | null;
}
```

## 4. 触发与 DOM

- 组件通过 cloneElement 向 `children` 注入 `onContextMenu` 与 `onKeyDown`（Shift+F10 / ContextMenu 键），不额外包裹布局层。
- `children` 必须是单个元素；不具备事件处理能力的组件（如 Fragment）不支持。
- 键盘可达性：区域本身或其中元素必须可聚焦；仅在可聚焦区域内按 Shift+F10 才应打开。组件不自动添加 tabIndex。
- 非受控位置：使用 `contextmenu` 事件的 `clientX/clientY`，并钳制到视口内。
- 受控打开：必须提供 `anchorPoint`；缺少时开发环境警告并退化为视口中心（不建议）。
- 隐藏/受控关闭时不保留 DOM。

## 5. 事件与状态

- `onOpenChange`：打开/关闭；受控模式不自行关闭。
- 普通 item 选择后关闭；复选/单选项保持打开（同 DropdownMenu）。
- 状态：Closed、Open、Hover、Focus、Disabled。
- 键盘：打开后聚焦第一项；↑/↓/Home/End；Enter/Space；Escape；typeahead；Tab 关闭。
- 阻止浏览器原生右键菜单：组件在处理的区域调用 `preventDefault`；如果 `disabled`，不拦截。

## 6. 视觉

- 与 DropdownMenu 完全一致的菜单表面、项样式、分隔符与危险项。
- 定位在指针位置，不显示箭头；避免覆盖指针所在对象的关键信息。
- 视口边缘自动翻转/位移；菜单最大高度限制并内部滚动。
- 不显示“右键菜单”特有的装饰；保持与 DropdownMenu 同一视觉语言。

## 7. 组合与扩展

- 表格/列表：在行容器上使用 ContextMenu，`entries` 根据当前行生成；在 `onOpenChange(true)` 时记录当前行。
- 与 DropdownMenu 共享 entries 生成函数，减少两套菜单定义。
- 需要从按钮打开同样的命令时用 DropdownMenu，不要用 ContextMenu 模拟。
- 危险操作：菜单项关闭后打开 AlertDialog；不要在菜单内直接二次确认。

## 8. 无障碍

- `role="menu"` + `aria-label`；菜单项 role 同 DropdownMenu。
- 键盘入口 Shift+F10 / ContextMenu 键；区域必须可聚焦，否则键盘用户无法打开。
- 打开后焦点进入菜单；关闭后焦点回到触发区域（若仍存在）。
- 外部点击关闭；Escape 关闭。
- 触摸长按不作为唯一入口；必须提供可见按钮或键盘替代。
- 菜单项名称完整；不依赖图标。

## 9. 示例

```tsx
<ContextMenu
  aria-label="档案操作"
  entries={[
    { id: 'open', label: '打开', onSelect: () => open(record.id) },
    { id: 'rename', label: '重命名', onSelect: () => rename(record.id) },
    { type: 'separator' },
    { id: 'delete', label: '删除', tone: 'danger', onSelect: () => confirmDelete(record.id) },
  ]}
>
  <div tabIndex={0} className="record-row">...</div>
</ContextMenu>
```

## 10. 边界情况

- `children` 不可接收事件：开发环境警告；不支持。
- 受控 open 无 anchorPoint：退化为中心定位并警告；不视为最终行为。
- 右键位置靠近视口边缘：自动翻转，不超出视口。
- 菜单打开时右键另一处：关闭旧菜单并以新坐标打开（非受控）；受控模式只发 onOpenChange。
- 浏览器原生菜单：仅在组件处理区域阻止；其他区域不拦截。
- 触摸长按：浏览器支持则触发；不保证；必须提供按钮/键盘替代。
- 快速右键：以最后一次坐标为准。
- 区域卸载：关闭并清理。

## 11. 依赖与实现注意

- 依赖与 DropdownMenu 相同的菜单核心、OverlayPortal、Positioner、DismissableLayer。
- 不复用 DropdownMenu 的 trigger 逻辑；共享 entries 渲染与键盘。
- 坐标使用 `position: fixed` 的视口坐标；滚动时关闭或重新定位（建议：关闭）。
- 不硬编码菜单位置/尺寸；不得覆盖宿主原生右键菜单的其他区域。
