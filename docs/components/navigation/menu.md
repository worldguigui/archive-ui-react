# Menu

> 状态：草案（阶段一）· 需人工审核。M3 导航组件。

## 1. 职责

常驻可见的命令菜单：一组可执行动作或可切换选项，使用菜单键盘模型。它解决的是“命令需要一直可见、不能藏在浮层里”的问题。

**使用场景**：侧栏操作、命令面板、工具栏分组、设置菜单。
**不适用**：站点导航链接（用 NavigationMenu）；弹出菜单（用 DropdownMenu）；表单选择（用 Select）；纯展示列表（用 List）。
**区别**：Menu 常驻；DropdownMenu 浮层；NavigationMenu 是站点导航地标，不是 role=menu。

## 2. 边界

- 数据驱动 `entries`，复用 DropdownMenu 的 `MenuEntry` 类型。
- 不提供打开/关闭状态；它始终可见。
- 不实现子菜单；V1 明确不做。
- 不负责选中值管理；复选/单选项通过 entry 自带回调表达。
- 不使用 `selectedId`：role=menu 没有标准的“当前项”语义；需要单选时使用 `radio-group` entry。
- 页面主链接导航使用 NavigationMenu，不把链接塞进 Menu 条目。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `entries` | `MenuEntry[]` | **必填** | 菜单项（同 DropdownMenu） |
| `orientation` | `Orientation` | `'vertical'` | 菜单方向 |
| `size` | `Size` | `'md'` | 行高/字号 |
| `disabled` | `boolean` | `false` | 整体禁用 |
| `loop` | `boolean` | `true` | 首尾循环 |
| `aria-label` | `string` | — | 菜单名称；建议必填 |

```tsx
import type { HTMLAttributes } from 'react';
import type { Orientation, Size } from '../api-conventions';

export interface MenuProps extends HTMLAttributes<HTMLDivElement> {
  entries: MenuEntry[];
  orientation?: Orientation;
  size?: Size;
  disabled?: boolean;
  loop?: boolean;
}
```

> `MenuEntry` 定义见 `feedback/dropdown-menu.md` §3，与 DropdownMenu / ContextMenu 共用。

## 4. DOM 与状态

- 根：`<div role="menu" aria-orientation>`；`className` / `style` 作用于根；`ref` 指向根。
- 菜单项 role 同 DropdownMenu：`menuitem` / `menuitemcheckbox` / `menuitemradio`。
- roving tabindex：整个 Menu 只有一个 Tab 停靠点；方向键移动焦点。
- 无 open/close 状态；无受控值。
- 复选/单选项自身携带 `checked` / `value`，Menu 只负责渲染与键盘。

## 5. 事件与状态

- 普通 item：点击/Enter/Space 触发 `onSelect`。
- checkbox：切换后调用 `onCheckedChange`，焦点留在该项。
- radio-group：选中后调用 `onValueChange`，焦点留在组内。
- 状态：Hover、Focus、Disabled、Checked、Active。
- 键盘：↑/↓（垂直）或 ←/→（水平）；Home/End；Enter/Space；typeahead；禁用项跳过。
- 菜单不自动关闭（它没有关闭状态）；动作是否导致页面变化由调用方决定。

## 6. 视觉

- 与 DropdownMenu 共享项样式，但无浮层阴影/边框包裹；可有一层轻表面或完全透明。
- 分组标签使用 caption；分隔符为结构线；危险项使用 danger 色（Token 缺口）。
- 常驻菜单应比浮层菜单更克制：hover 背景弱、无强阴影。
- 水平方向用于工具栏式命令，仍保持 role=menu 语义；不要同时混入链接列表。
- 字号使用 UI 字体；快捷键使用 numeric/UI 小字。

## 7. 组合与扩展

- 放在侧栏/工具栏中；不提供 `MenuGroup` 组件，分组用 `type: 'label'` 条目。
- 复选/单选用于筛选开关；不要用 item + 手动勾选图标冒充。
- 需要导航链接时使用 NavigationMenu 或普通 `<nav>` 列表。
- 不把 Menu 当作 Table 行操作浮层；那是 DropdownMenu。

## 8. 无障碍

- `role="menu"`；必须提供 `aria-label` 或 `aria-labelledby`。
- 菜单项使用正确 role；复选/单选 `aria-checked`。
- roving tabindex；方向键移动，不改变选中状态（复选/单选需 Enter/Space）。
- 禁用项 `aria-disabled`，保留在顺序中；不触发动作。
- typeahead 使用字符串 label 或 `textValue`。
- Menu 不是导航地标；页面主导航不要用 role=menu。
- 水平菜单的左右方向键与页面滚动冲突时，确保焦点在菜单内才拦截。

## 9. 示例

```tsx
<Menu
  aria-label="视图选项"
  entries={[
    { type: 'label', label: '显示' },
    { type: 'checkbox', id: 'grid', label: '网格视图', checked: grid, onCheckedChange: setGrid },
    { type: 'checkbox', id: 'dense', label: '紧凑模式', checked: dense, onCheckedChange: setDense },
    { type: 'separator' },
    { id: 'refresh', label: '刷新', shortcut: '⌘R', onSelect: refresh },
    { id: 'reset', label: '重置视图', disabled: true, onSelect: reset },
  ]}
/>
```

## 10. 边界情况

- 空 entries：渲染空 menu；建议不渲染或显示禁用容器，开发环境警告。
- 全部 disabled：仍可聚焦容器；Escape 无意义（无关闭状态）。
- 重复 id：开发环境警告。
- 标签项位于首项：焦点应跳过标签/分隔符，落到第一个可操作项。
- 水平菜单项过多：横向滚动由调用方容器负责；不自动折叠。
- 受控复选值不更新：界面不变；回调已发。
- 菜单项卸载后焦点丢失：由调用方避免在动作中同步卸载菜单；必要时重新定位焦点。
- 嵌套在 Dialog 中：Escape 优先关闭 Menu 无关闭态，因此应交给 Dialog；需定义事件传播边界。

## 11. 依赖与实现注意

- 依赖与 DropdownMenu 相同的菜单核心、RovingFocus、Typeahead、Icons。
- 不依赖 OverlayPortal；Menu 不是浮层。
- 不硬编码颜色；danger/warning 依赖状态 Token。
- 与 DropdownMenu 的类型共享必须在公共入口导出 `MenuEntry`，避免调用方从内部路径导入。
