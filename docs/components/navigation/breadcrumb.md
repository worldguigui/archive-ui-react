# Breadcrumb

> 状态：草案（阶段一）· 需人工审核。M3 导航组件。

## 1. 职责

显示当前页面在信息层级中的位置，并提供回到上级的链接。它解决的是“深层结构中用户迷路”的问题。

**使用场景**：档案目录 → 卷宗 → 条目；多级设置页；文档层级。
**不适用**：流程进度（用 Steps）；同级视图切换（用 Tabs）；站点主导航（用 NavigationMenu）。
**区别**：Breadcrumb 表达空间层级；Steps 表达流程阶段。

## 2. 边界

- 数据驱动 `items`；不提供 children 写法。
- V1 不做折叠/省略号菜单；超长路径由调用方控制样式或减少层级。
- 不自动从路由生成；调用方提供数据。
- 不处理导航本身；`href` / `onClick` 由调用方接入路由。
- 当前项不可点击（默认）；需要可点击时显式提供 href 并取消 current。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `items` | `BreadcrumbItem[]` | **必填** | 层级项 |
| `separator` | `ReactNode` | `'/'` | 分隔符，装饰性 |
| `aria-label` | `string` | `'面包屑'` | 导航地标名称；可由原生属性覆盖 |

```tsx
import type { HTMLAttributes, MouseEventHandler, ReactNode } from 'react';

export interface BreadcrumbItem {
  id?: string;
  label: ReactNode;
  href?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  current?: boolean;
  icon?: ReactNode;
}

export interface BreadcrumbProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  items: BreadcrumbItem[];
  separator?: ReactNode;
}
```

## 4. 结构与优先级

- 根：`<nav aria-label>` + `<ol>`。
- 每项 `<li>`；有 `href` 且非 current 时渲染 `<a>`；无 href 时渲染 `<span>`。
- 当前项：显式 `current` 优先；否则最后一项为 current。
- `separator` 渲染在项之间，`aria-hidden="true"`，不可聚焦。
- `icon` 是装饰性，`aria-hidden`；标签仍是主要名称。

## 5. 事件与状态

- 链接 `onClick` 原生；组件不阻止默认，由调用方决定是否 `preventDefault` 接入路由。
- 无受控状态。
- 视觉状态：Link hover、Focus-visible、Current、Disabled（不提供禁用项；需要时用文本替代）。
- 空 items：不渲染 nav，开发环境警告。

## 6. 视觉

- 使用 caption/label 字体，字距略增；当前项使用主文本/古金，非当前链接使用次级文本。
- 分隔符使用定位线/次级色，不与文字抢注意力。
- 每一项不换行截断到不可读；超长标签由调用方提供截断策略。
- 不使用背景材质；Breadcrumb 是轻量导航。
- 移动端不自动折叠；调用方减少层级或隐藏中间项。

## 7. 组合与扩展

- 与页面标题组合时，Breadcrumb 放在标题上方，不替代标题。
- `onClick` 用于 SPA 路由；不要同时依赖 href 与 preventDefault 造成新窗口行为异常。
- 需要下拉的“更多层级”时另立折叠方案，不向 Breadcrumb 增加浮层逻辑。
- 不把 Breadcrumb 用作 Tab 或步骤条。

## 8. 无障碍

- `<nav>` 必须有名称；默认中文，调用方可覆盖。
- 当前项 `aria-current="page"`；不要给当前项加链接语义。
- 分隔符 `aria-hidden`；屏幕阅读器不应朗读斜杠。
- 链接文本必须表达目标；不能只有图标。
- 键盘使用原生链接 Tab 顺序；不实现方向键。
- 焦点环可见；不要移除 outline。

## 9. 示例

```tsx
<Breadcrumb
  items={[
    { label: '档案馆', href: '/' },
    { label: '1972 年卷宗', href: '/year/1972', onClick: linkTo },
    { label: 'AR-1972-031', current: true },
  ]}
/>
```

## 10. 边界情况

- 单项：仍渲染 nav + 当前项；可接受。
- 空 items：不渲染；警告。
- 多项 `current`：开发环境警告；以最后一个为准。
- 当前项有 href：如果 `current` 为真，忽略 href，避免自链接；文档明确。
- 超长标签：允许换行；分隔符不孤立在行首。
- 分隔符为空：仍保留间距；不显示文字。
- RTL：V1 不处理方向镜像。

## 11. 依赖与实现注意

- 无组件依赖。
- 不使用 `role="navigation"` 重复声明；原生 nav 足够。
- 当前项判定在渲染时完成；不要在 effect 中修改 items。
- 不内置路由；不读取 window.location。
