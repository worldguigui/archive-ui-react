# Empty

> 状态：草案（阶段一）· 需人工审核。M3 数据展示。

## 1. 职责

在数据为空时提供明确的空状态：标题、说明、插图/装饰与操作。它解决的是“空白页面让用户不知道发生了什么”的问题。

**使用场景**：列表为空、检索无结果、首次使用、权限导致的空数据。
**不适用**：加载中（用 Skeleton）；错误（用 Alert/Error 状态）；短暂操作反馈（用 Toast）。
**区别**：Empty 是稳定的无数据状态；Skeleton 是加载占位；Alert 是提示/警告。

## 2. 边界

- 不负责请求、重试逻辑；`action` 由调用方提供。
- 不内置插图资产；`image` 插槽由调用方/未来图形系统提供。
- 不做错误页/404；错误使用 Alert 或页面级方案。
- 不自动播报；需要时调用方在容器上设置 live region。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `title` | `ReactNode` | `'暂无内容'` | 主文案 |
| `description` | `ReactNode` | — | 辅助说明 |
| `image` | `ReactNode` | — | 插图/装饰槽 |
| `action` | `ReactNode` | — | 操作（按钮/链接） |
| `size` | `Size` | `'md'` | 尺寸/间距等级 |
| `variant` | `'default' \| 'compact'` | `'default'` | 大空状态/紧凑行内空状态 |

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import type { Size } from '../api-conventions';

export interface EmptyProps extends HTMLAttributes<HTMLDivElement> {
  title?: ReactNode;
  description?: ReactNode;
  image?: ReactNode;
  action?: ReactNode;
  size?: Size;
  variant?: 'default' | 'compact';
}
```

## 4. 事件与状态

- 无自身事件；action 的按钮/链接事件由调用方提供。
- 无 open/loading；Empty 只在确认无数据时渲染。
- 状态：Default、Compact、WithAction、WithImage。
- 不自动隐藏或自动重试。

## 5. 视觉

- 以留白与排版为主，不用大面积插画抢夺注意力；`image` 默认使用低对比装饰（未来图形资源）。
- 标题使用 title/heading 字体；描述 secondary；操作按钮为 primary/outline。
- 居中布局；`compact` 减少上下留白，适合表格/列表内。
- 不使用 paper/film 强纹理；Empty 是内容区，不是展示海报。
- 不显示“无数据”英文占位或技术错误码。

## 6. 组合与扩展

- 列表：`<List items={[]} empty={<Empty ... />} />` 或外层条件渲染。
- 表格：`empty` 插槽传入 Empty（注意紧凑变体）。
- 检索无结果：区分“没有数据”和“没有匹配”；文案由调用方提供。
- 权限不足：使用 Alert 或 Empty + 说明，不要伪装成“没有数据”。
- 不内置重试按钮；由 action 提供。

## 7. 无障碍

- 标题是主要信息；不要只放插图。
- 插图 `aria-hidden`，除非它承载唯一信息。
- 操作必须是真实按钮/链接；键盘可达。
- 若空状态由异步检索结果产生，调用方可用 live region 播报“没有匹配结果”；组件不自动播报。
- 不自动聚焦操作按钮。

## 8. 示例

```tsx
<Empty
  title="暂无档案"
  description="调整筛选条件，或新建一份卷宗。"
  action={<Button>新建档案</Button>}
/>

<Empty variant="compact" size="sm" title="没有匹配项" />

<Empty
  image={<ArchiveGlyph aria-hidden />}
  title="此卷宗尚未数字化"
  description="请联系档案管理员申请扫描。"
/>
```

## 9. 边界情况

- `title` 为空且无 description/action：渲染空占位；开发环境警告。
- 超长标题/描述：居中换行，最大宽度限制；不横向溢出。
- `image` 过大：由调用方控制尺寸；组件限制最大宽度。
- 多个操作：`action` 中放按钮组；Empty 不定义多个 action 槽。
- 在紧凑表格中：使用 `variant="compact"`，避免撑高表体。
- 空数据与加载状态同时：不得同时渲染；调用方按请求状态切换。

## 10. 依赖与实现注意

- 无组件依赖；不依赖 Empty 自身以外任何展示组件。
- 插图使用插槽，不内置新资产；若未来加入默认图形，需走资产规范。
- 不硬编码颜色；描述/标题使用语义文本色。
- 不把 Empty 用作 Alert；语义不同。
