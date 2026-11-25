# Tabs

> 状态：草案（阶段一）· 需人工审核。M3 导航组件。

## 1. 职责

在同一页面内切换互斥的内容视图。它解决的是“多组同级内容共享空间，用户按需查看一组”的问题。

**使用场景**：设置分组、档案概览/详情/附件、数据视图切换。
**不适用**：跨页面导航（用链接/NavigationMenu）；可同时展开的内容（用 Accordion）；流程进度（用 Steps）。
**区别**：Tabs 互斥切换、不改变 URL；Accordion 可多开；NavigationMenu 是站点导航。

## 2. 边界

- 不处理路由；URL 同步由调用方根据 `value` 完成。
- 不内置懒加载/异步内容；面板内容由调用方渲染。
- 不自动折叠溢出项；窄屏由调用方决定滚动或换用 Select。
- 不支持嵌套 Tabs 的自动 id 冲突；使用 useId 保证唯一，但视觉层级由调用方控制。
- 不提供“可关闭标签页”；需要时另立 EditableTabs。

## 3. Props

### Tabs

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `value` / `defaultValue` | `string` | — | 受控/非受控当前值 |
| `onValueChange` | `(value: string) => void` | — | 切换回调 |
| `orientation` | `Orientation` | `'horizontal'` | 方向 |
| `activationMode` | `'automatic' \| 'manual'` | `'automatic'` | 方向键是否立即切换 |
| `variant` | `'line' \| 'enclosed'` | `'line'` | 视觉样式 |
| `size` | `Size` | `'md'` | 触发器尺寸 |
| `children` | `ReactNode` | — | List + Content |

### TabsList / TabsTrigger / TabsContent

- `TabsList`：`HTMLAttributes<HTMLDivElement>`；应提供 `aria-label` 或 `aria-labelledby`。
- `TabsTrigger`：`Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'>` + `value: string` + `disabled?: boolean`。
- `TabsContent`：`HTMLAttributes<HTMLDivElement>` + `value: string`；非活动时不渲染。

```tsx
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import type { Orientation, Size } from '../api-conventions';

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: Orientation;
  activationMode?: 'automatic' | 'manual';
  variant?: 'line' | 'enclosed';
  size?: Size;
  children: ReactNode;
}

export interface TabsTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  value: string;
  disabled?: boolean;
}
```

## 4. 受控与非受控

- 受控 `value` 不自行更新；只发 `onValueChange`。
- 非受控使用 `defaultValue`；未提供时无选中项，开发环境警告。
- `value` 不匹配任何 Trigger：不渲染 Content，开发环境警告。
- 切换模式（受控↔非受控）不支持。

## 5. 事件与状态

- 点击 Trigger：切换并回调。
- 键盘：←/→（水平）或 ↑/↓（垂直）移动；Home/End 首尾；`activationMode="automatic"` 时移动即切换，manual 时需 Enter/Space。
- 状态：Active、Inactive、Hover、Focus-visible、Disabled。
- 禁用 Trigger 跳过键盘与点击。
- 受控模式只通知。

## 6. 视觉

- `line`：活动项下方/侧方有蚀刻渐变线，文字古金；非活动项次级文本。
- `enclosed`：活动项有表面色与 hairline 边框，像档案标签页；不使用彩色填充。
- 活动态不能只靠颜色；需线条/背景/字重共同表达。
- TabsList 可横向滚动，滚动条克制；不换行挤压。
- 内容区顶部与 List 有结构线分隔；内容继承页面正文排版。

## 7. 组合与扩展

- 面板内容自由，可包含 FormField、Table、ArchiveCard 等。
- 不提供 `items` 数据数组；需要数据驱动时由调用方 map 出 Trigger/Content。
- 与 Accordion 的转换由调用方决定，不自动根据断点切换。
- 不提供 Tab 关闭/新增；等待独立组件。

## 8. 无障碍

- `TabsList role="tablist"`（由组件内部设置）；`TabsTrigger role="tab"`、`aria-selected`、`aria-controls`；`TabsContent role="tabpanel"`、`aria-labelledby`。
- List 必须有可访问名称（aria-label/labelledby）。
- roving tabindex：只有活动/首个可用 Trigger 可 Tab；方向键移动焦点。
- 非活动面板不渲染或 `hidden`，不可聚焦。
- 活动面板若没有可聚焦内容，Tab 应能进入面板；建议给面板 `tabIndex={0}`（实现需统一）。
- 不使用 `<a>` 假装 Tab；Tabs 不导航。

## 9. 示例

```tsx
<Tabs defaultValue="overview" onValueChange={setTab}>
  <TabsList aria-label="档案视图">
    <TabsTrigger value="overview">概览</TabsTrigger>
    <TabsTrigger value="details">细节</TabsTrigger>
    <TabsTrigger value="files" disabled>附件</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">...</TabsContent>
  <TabsContent value="details">...</TabsContent>
</Tabs>
```

## 10. 边界情况

- 无 Trigger：空 tablist；开发环境警告。
- 重复 value：开发环境警告；第一个生效。
- 默认值与 Trigger 不匹配：无活动项；警告。
- 所有 Trigger disabled：tablist 仍存在但不可操作；建议避免。
- 面板内容超长：页面滚动，不内部滚动。
- 快速方向键：automatic 模式以最后一次焦点为准；不丢焦点。
- 受控 value 不更新：界面不切换。
- SSR：初始活动项由 value/defaultValue 决定，避免水合不一致。

## 11. 依赖与实现注意

- 依赖 RovingFocus；不依赖 Menu/Accordion。
- ID 使用 useId + value 生成；value 可包含特殊字符，需编码或使用索引。
- 不把 Tabs 内容全部挂载再用 CSS 隐藏；非活动面板默认卸载，避免重复 id/表单提交。
- 不硬编码字体；Tab 标签使用 UI 字体。
