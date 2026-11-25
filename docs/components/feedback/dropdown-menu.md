# DropdownMenu

> 状态：草案（阶段一）· 需人工审核。M3 反馈与浮层。

## 1. 职责

由触发元素打开的浮层命令菜单，提供菜单项、分隔符、分组标签、复选项与单选项。它解决的是“在一组动作中快速选择”的问题。

**使用场景**：行操作菜单、更多操作、筛选/排序、上下文动作。
**不适用**：站点导航（用 NavigationMenu）；常驻命令列表（用 Menu）；选择表单值（用 Select）；纯说明（用 Tooltip/Popover）。
**区别**：DropdownMenu 是 role=menu 的浮层；Select 是表单 listbox；Popover 没有菜单语义。

## 2. 边界

- 数据驱动 `entries`，不提供 children 菜单项；需要完全自定义浮层时用 Popover。
- V1 不支持子菜单、虚拟滚动、异步加载；子菜单另立项。
- 不内置搜索；长菜单等待 Combobox。
- 不负责路由；菜单项只发 `onSelect`，由调用方导航。
- 不使用 `onChange`；复选/单选使用 `onCheckedChange` / `onValueChange`。

## 3. 共享菜单数据模型

```ts
import type { ReactNode } from 'react';

export type MenuEntry =
  | {
      type?: 'item';
      id: string;
      label: ReactNode;
      textValue?: string;            // label 非文本时用于 typeahead/可访问名称
      icon?: ReactNode;
      shortcut?: ReactNode;
      tone?: 'default' | 'danger';
      disabled?: boolean;
      onSelect?: () => void;
    }
  | { type: 'separator'; id?: string }
  | { type: 'label'; id?: string; label: ReactNode }
  | {
      type: 'checkbox';
      id: string;
      label: ReactNode;
      textValue?: string;
      checked: boolean;
      onCheckedChange: (checked: boolean) => void;
      disabled?: boolean;
    }
  | {
      type: 'radio-group';
      id: string;
      label?: ReactNode;
      value: string;
      onValueChange: (value: string) => void;
      entries: Array<{ value: string; label: ReactNode; textValue?: string; disabled?: boolean }>;
    };
```

- `id` 在菜单内唯一，用于高亮、typeahead 与 `aria-activedescendant`。
- 分隔符无交互；标签项不参与键盘导航。
- 没有 `submenu`：V1 明确不做；嵌套浮层的能力留给 Popover/Dialog。

## 4. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `trigger` | `ReactElement` | **必填** | 唯一触发元素，可接收 ref |
| `entries` | `MenuEntry[]` | **必填** | 菜单项 |
| `open` / `defaultOpen` | `boolean` | — / `false` | 受控/非受控 |
| `onOpenChange` | `(open: boolean) => void` | — | 打开状态 |
| `placement` | `Placement` | `'bottom-start'` | 方位 |
| `offset` | `number` | `4` | 距离 |
| `disabled` | `boolean` | `false` | 禁用打开 |
| `closeOnEscape` | `boolean` | `true` | Escape 关闭 |
| `closeOnOutsideClick` | `boolean` | `true` | 外部点击关闭 |
| `closeOnSelect` | `boolean` | `true` | 普通 item 选择后关闭；复选/单选项不自动关闭 |
| `loop` | `boolean` | `true` | 首尾循环 |
| `aria-label` | `string` | — | 菜单可访问名称；建议提供 |
| `className` | `string` | — | 菜单内容 class |
| `portalContainer` | `HTMLElement \| null` | body | Portal 容器 |

```tsx
import type { ReactElement } from 'react';
import type { Placement } from '../api-conventions';

export interface DropdownMenuProps {
  trigger: ReactElement;
  entries: MenuEntry[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: Placement;
  offset?: number;
  disabled?: boolean;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnSelect?: boolean;
  loop?: boolean;
  'aria-label'?: string;
  className?: string;
  portalContainer?: HTMLElement | null;
}
```

## 5. 事件与状态

- 触发：点击、Enter、Space、↓/↑ 打开；打开后聚焦第一项或选中项。
- `onSelect`：普通 item 激活时触发；随后按 `closeOnSelect` 请求关闭。
- `onCheckedChange` / `onValueChange`：复选/单选项变化时触发；菜单保持打开（允许连续调整）。
- 状态：Closed、Open、Hover、Focus、Disabled、Checked、Active。
- 键盘：↑/↓、Home/End、Enter/Space、Escape、typeahead、Tab 关闭并离开；禁用项跳过。
- 受控模式不自行关闭。
- 异步 `onSelect`：菜单会按 `closeOnSelect` 立即关闭；需要等待时设 `closeOnSelect={false}` 并自行控制。

## 6. 视觉

- 菜单表面 plain、hairline 边框、`--au-shadow-deep`；最小宽度建议 180px，最大高度 320px 滚动。
- 菜单项单行，图标前置、快捷键后置；文字使用 UI 字体。
- 选中/复选使用勾选标记；危险项使用 danger 色（Token 缺口）。
- 分隔符使用结构线；分组标签使用 caption + 字距，不可点击。
- 高亮项使用背景 + 边框/文字变化，不能只靠颜色。
- 不使用 paper/film 纹理。

## 7. 组合与扩展

- 行操作：表格行尾 IconButton 作为 trigger，entries 提供操作。
- 触发器的可访问名称由自身提供；菜单名称用 `aria-label`。
- 与 Dialog 嵌套时，Escape 只关闭最顶层；菜单关闭后焦点回到 trigger。
- 需要子菜单/搜索/虚拟滚动时另立组件，不向 MenuEntry 添加模糊的 `children`。

## 8. 无障碍

- 菜单容器 `role="menu"`，`aria-label` 建议必填；菜单项 `role="menuitem"`。
- 复选项 `role="menuitemcheckbox"` + `aria-checked`；单选项 `role="menuitemradio"` + `aria-checked`，外部分组 `role="group"` + 标签。
- 触发元素注入 `aria-haspopup="menu"`、`aria-expanded`、`aria-controls`。
- 焦点使用 roving tabindex 或 `aria-activedescendant`；全库统一一种；推荐焦点在菜单项上（roving）。
- Escape 关闭并返回 trigger；Tab 关闭。
- 禁用项 `aria-disabled="true"`，仍可被读屏发现但不可激活；不要移除出 DOM 导致顺序变化。
- typeahead 使用 `textValue` 或字符串 label；label 非文本时必须提供 textValue。
- 菜单项的操作文本必须描述结果，不使用“更多”。

## 9. 示例

```tsx
<DropdownMenu
  trigger={<IconButton aria-label="档案操作"><MoreIcon /></IconButton>}
  aria-label="档案操作"
  entries={[
    { id: 'open', label: '打开', onSelect: open },
    { id: 'duplicate', label: '复制编号', shortcut: '⌘D', onSelect: duplicate },
    { type: 'separator' },
    { type: 'checkbox', id: 'pinned', label: '置顶', checked: pinned, onCheckedChange: setPinned },
    { type: 'separator' },
    { id: 'delete', label: '删除', tone: 'danger', onSelect: remove },
  ]}
/>
```

## 10. 边界情况

- 空 entries：打开后显示空菜单；建议不渲染 trigger 或显示禁用，开发环境警告。
- 全部禁用：仍可打开，焦点停在容器；Escape 可关闭。
- 重复 id：开发环境警告；第一个生效。
- label 非文本且无 textValue：显示正常，typeahead 不完整；警告。
- 菜单超出视口：flip/shift + 内部滚动。
- 外部点击落在另一个浮层：由 LayerStack 决定，不误关父层。
- 受控 open 不更新：保持打开；选择项也不关闭。
- 触发器卸载：关闭并清理。
- 快速重复打开：以最后一次状态为准。
- 危险项不自动二次确认；需要确认时在 onSelect 中打开 AlertDialog。

## 11. 依赖与实现注意

- 依赖 OverlayPortal、Positioner、DismissableLayer、RovingFocus、Typeahead、Icons。
- 与 ContextMenu、Menu 共享菜单条目类型与键盘核心；不共享触发器语义。
- 子菜单 V1 不做；如果未来加入，需要递归层级与独立焦点模型，不能直接塞进当前 DOM。
- 不硬编码颜色；danger/warning 依赖状态 Token。
