# NavigationMenu

> 状态：草案（阶段一）· 需人工审核。M3 导航组件。

## 1. 职责

站点级横向导航，支持顶层入口与悬停/聚焦打开的浮层面板。它解决的是“主导航需要分层入口，但不想把二级内容常驻页面”的问题。

**使用场景**：站点顶栏、档案分区入口、产品模块导航。
**不适用**：命令操作（用 Menu/DropdownMenu）；表单选择（用 Select）；页面内视图切换（用 Tabs）；Breadcrumb（层级路径）。
**区别**：NavigationMenu 是 `<nav>` 地标，非 role=menu；Menu 是常驻命令列表；DropdownMenu 是浮层命令菜单。

## 2. 边界

- 数据驱动 `items`；浮层内容通过 `content` 提供。
- 不处理路由；链接使用原生 `<a>`，调用方可用 `onClick` 接管 SPA 路由。
- 不自动折叠溢出项；窄屏由调用方切换为抽屉/Select。
- V1 不做多列 mega menu、子级浮层嵌套、拖拽。
- 浮层默认渲染在导航项附近的本地定位容器，不使用 Portal，以保持 Tab 顺序；如页面 `overflow` 裁切，需调用方调整容器结构。
- 不把顶层项做成 role=menu；这是导航，不是命令菜单。

## 3. 数据模型与 Props

```ts
import type { HTMLAttributes, MouseEvent, ReactNode } from 'react';
import type { Orientation } from '../api-conventions';

export interface NavigationMenuItem {
  id: string;
  label: ReactNode;
  href?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  active?: boolean;
  disabled?: boolean;
  /** 提供时该项成为浮层触发器。 */
  content?: ReactNode;
}

export interface NavigationMenuProps extends Omit<HTMLAttributes<HTMLElement>, 'onSelect'> {
  items: NavigationMenuItem[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  orientation?: Orientation;
  align?: 'start' | 'center' | 'end';
  delayDuration?: number;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  onSelect?: (item: NavigationMenuItem) => void;
}
```

| 属性 | 默认 | 说明 |
| --- | --- | --- |
| `value` | — | 当前打开的 item id（受控） |
| `defaultValue` | `null` | 非受控初始打开项 |
| `onValueChange` | — | 打开项变化 |
| `orientation` | `'horizontal'` | 水平为主 |
| `align` | `'start'` | 浮层对齐 |
| `delayDuration` | `100` | hover 打开延迟 ms |
| `closeOnEscape` | `true` | Escape 关闭 |
| `closeOnOutsideClick` | `true` | 外部点击关闭 |
| `onSelect` | — | 无 content 且无 href 的项被激活 |

## 4. 行为

- 渲染规则：
  - 有 `content`：顶层渲染按钮触发器（`aria-expanded` / `aria-controls`），不直接导航；`href` 放在浮层内容中。
  - 无 `content` 且有 `href`：渲染 `<a>`。
  - 无 `content` 且无 `href`：渲染 `<button>`，点击触发 `onSelect`。
- 打开：hover 延时、聚焦、点击/Enter/Space、↓；触摸点击。
- 关闭：Escape、外部点击、移出触发项与浮层（hover 模式）、受控状态。
- 同一时间最多一个浮层打开。
- 受控模式不自行关闭。
- 键盘：←/→ 顶层移动；Home/End；Enter/Space/↓ 打开并聚焦浮层第一个可聚焦项；↑/↓ 在浮层内移动（由内容自行处理或提供统一焦点管理）；Escape 关闭并回到顶层触发器；Tab 按 DOM 顺序离开。
- 浮层内容非模态；不锁滚动、不陷阱焦点。

## 5. 状态与视觉

- 状态：Default、Hover、Focus-visible、Active（当前页面）、Open、Disabled。
- 顶层导航为 UI 字体、字距略增；当前项使用古金文字 + 结构线/编号，不只靠颜色。
- 浮层 plain 轻表面、hairline 边框、`--au-shadow-deep`；最大宽度由内容与视口决定。
- 触发器带 chevron，打开时旋转；chevron 装饰。
- 不将整站做成常驻多列 mega menu；保持克制。
- 浮层进入/退出淡入，尊重 reduced motion。

## 6. 组合与扩展

- 浮层内可放 NavigationMenu 子链接列表、ArchiveCard、Button；内容自由。
- 需要命令操作时用 DropdownMenu，不在导航浮层里混入 role=menu。
- 与 Breadcrumb 分工：NavigationMenu 是入口，Breadcrumb 是当前位置。
- 移动端不自动切换；调用方使用独立抽屉或 Select。
- 不提供 `asChild`/renderLink；路由接入通过 `href` + `onClick`。

## 7. 无障碍

- 根 `<nav aria-label>`；必须有名称。
- 顶层列表使用 `<ul>/<li>`；链接用 `<a>`，按钮用 `<button>`。
- 触发器 `aria-expanded`、`aria-controls`；浮层有可访问名称（由 content 标题或 aria-label 提供）。
- 当前页链接 `aria-current="page"`；`active` 映射到该属性。
- 键盘可打开/关闭；Escape 返回触发器焦点。
- hover 打开必须有键盘等价物；触摸不依赖 hover。
- 不把顶层项声明为 `role="menuitem"`；这不是 menu。
- 浮层不抢焦点除非用户通过 Enter/↓/点击主动进入。

## 8. 示例

```tsx
<NavigationMenu
  aria-label="档案馆导航"
  items={[
    { id: 'home', label: '首页', href: '/' },
    {
      id: 'collections',
      label: '馆藏',
      content: (
        <ul>
          <li><a href="/collections/manuscripts">手稿</a></li>
          <li><a href="/collections/photographs">影像</a></li>
        </ul>
      ),
    },
    { id: 'about', label: '关于', href: '/about' },
  ]}
/>
```

## 9. 边界情况

- 所有项都有 content：没有可导航链接；允许，但需确保浮层内提供链接。
- `content` 与 `href` 同时存在：顶层不导航，href 需移入 content；开发环境提示。
- 空 items：不渲染 nav，警告。
- 超长标签：不换行挤压；由调用方控制截断，保留可访问全文。
- 浮层超出视口：flip/shift；仍不可用时内部滚动。
- 导航容器 `overflow: hidden`：浮层会被裁切；调用方需调整或未来支持 Portal。
- 触屏：点击打开；外部触摸关闭。
- 快速悬停切换：延时防抖，避免闪烁；受控状态以最后一次为准。
- 路由变化：组件不监听；调用方更新 active 或关闭浮层。

## 10. 依赖与实现注意

- 依赖内部 Positioner、DismissableLayer、RovingFocus（顶层）、Icons；V1 不用 Portal。
- 浮层与 Popover 共享定位计算，但语义和键盘模型独立。
- 不硬编码导航宽度/断点；溢出由调用方处理。
- `delayDuration` 在测试中应可设为 0。
