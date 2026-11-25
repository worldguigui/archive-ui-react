# Panel

> 状态：草案（阶段一）· 需人工审核。M3 数据展示 / 表面容器。
> **现状**：`src/components/Panel/Panel.tsx` 是工程验证组件；本文件是正式 API 草案。与现状的差异需确认（见 `consistency-review.md`）。

## 1. 职责

通用表面容器：提供材质、标题栏、内容区与页脚，承担页面分区与档案表面视觉。它解决的是“内容需要一个有边界、有材质、有层级标题的容器”的问题。

**使用场景**：页面分区、侧栏、档案内容块、带标题的列表容器。
**不适用**：带媒体/操作的内容卡片（用 Card）；档案记录（用 ArchivePanel/ArchiveCard）；浮层（用 Dialog/Popover）；纯布局网格（用普通 div）。
**区别**：Panel 是区域容器；Card 是内容卡片；ArchivePanel 是档案卷宗容器。

## 2. 边界

- 不提供媒体槽、操作区、可点击行为；这些属于 Card。
- 不自动设置标题层级语义以外的布局；不负责页面网格。
- 不提供任意材质自定义；只能选择 `plain/paper/film` 预设与强度。
- `tier` 不在本草案中（文档与代码冲突，待确认）。
- `corners` 是装饰 API 前的过渡开关，不是完整装饰系统。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `title` | `ReactNode` | — | 标题；`Omit` 原生 title |
| `subtitle` | `ReactNode` | — | 标题旁/下方辅助文本 |
| `header` | `ReactNode` | — | 完全自定义头部；提供时忽略 title/subtitle |
| `footer` | `ReactNode` | — | 底部区域 |
| `children` | `ReactNode` | — | 内容 |
| `material` | `SurfaceMaterial` | `'plain'` | 材质预设 |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | 内容区留白 |
| `bordered` | `boolean` | `true` | hairline 边框 |
| `elevation` | `'none' \| 'soft' \| 'deep'` | `'soft'` | 阴影层级 |
| `corners` | `boolean` | `false` | 四角装饰（过渡 API） |
| `interactive` | `boolean` | `false` | 启用 hover 边框提亮/暖光；不添加交互语义 |
| `as` | `'section' \| 'article' \| 'div' \| 'aside'` | `'section'` | 根语义 |
| `headingLevel` | `HeadingLevel` | `3` | 标题标签级别 |
| `textureIntensity` | `number` | `1` | 0–2 纹理强度 |
| `lightingIntensity` | `number` | `1` | 0–2 光影强度 |

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import type { HeadingLevel, SurfaceMaterial } from '../api-conventions';

export interface PanelProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode;
  subtitle?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  material?: SurfaceMaterial;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  bordered?: boolean;
  elevation?: 'none' | 'soft' | 'deep';
  corners?: boolean;
  interactive?: boolean;
  as?: 'section' | 'article' | 'div' | 'aside';
  headingLevel?: HeadingLevel;
  textureIntensity?: number;
  lightingIntensity?: number;
}
```

## 4. 事件与状态

- 无自定义事件；原生事件透传到根。
- 状态：Default、Hover（仅 `interactive`）、Focus-within（仅 `interactive`）、Selected（无内置；由调用方样式）。
- 不提供 disabled/loading；内容加载用 Skeleton/Spinner。
- `interactive` 只是视觉提示，不添加 role/tabIndex/键盘行为；需要可点击时使用 Card + 链接/按钮或自行提供语义。

## 5. 视觉

- 三材质与强度规则见 `surface-system.md`；默认 plain。
- `paper` 适合档案内容、信件；`film` 只用于展示型表面，长正文禁用。
- 标题使用 display 字体/古金或主文本；subtitle 使用 caption/secondary。
- 头部与内容之间用结构线/蚀刻线分隔；页脚使用 UI/caption 字体。
- `elevation` 只映射 `--au-shadow-soft/deep`；`none` 不使用阴影。
- 嵌套 Panel 不得重复高强度材质；内层应降为 plain 或由视觉规范决定。
- 当前验证组件无条件 hover 发光；正式 API 改为 `interactive` 控制，这是待确认的视觉变更。

## 6. 组合与扩展

- 与 FormField、Table、List、Empty 自由组合；不内置内容布局。
- 需要媒体/操作/链接卡片时改用 Card；需要档案编号/分类/印章时改用 ArchivePanel。
- 不提供 `headerActions`；用 `header` 自定义或在内容中组合。
- 不提供任意装饰 props；等待 decoration API。

## 7. 无障碍

- 根默认 `<section>`；可作为 landmark，但必须有可访问名称（标题或 aria-label）。
- 标题渲染为 `h{headingLevel}`，不得跳级；调用方负责页面大纲。
- `title` 存在时生成 `aria-labelledby`；自定义 `header` 时由调用方负责。
- `footer` 是 `<footer>`；不要在一个页面重复使用过多 landmark（section 无名称时不会成为 landmark）。
- 装饰角饰 `aria-hidden`。
- `interactive` 不改变语义；不要让用户误以为可点击。

## 8. 示例

```tsx
<Panel title="馆藏摘要" footer="AR-1972-031">
  <Typography variant="body">...</Typography>
</Panel>

<Panel title="来源说明" material="paper" corners padding="lg" headingLevel={2}>
  ...
</Panel>

<Panel header={<CustomHeader />} bordered={false} elevation="none">
  ...
</Panel>
```

## 9. 边界情况

- `header` 与 `title` 同时提供：header 优先，开发环境警告。
- 空标题：不渲染 header 区域；不要渲染空 header。
- 内容为空：允许，但空容器没有提示；需要 Empty。
- 超长标题：换行；不挤压关闭/操作（Panel 无操作）。
- film + 长正文：可读性风险；文档禁止用于长正文，不强制运行时报错。
- 强度越界/NaN：钳制 0–2 并警告。
- 嵌套 Panel：内层材质默认降级由调用方负责；组件不自动改 material。
- 无边框 + corners：角饰仍可显示，但可能悬空；需视觉确认。

## 10. 依赖与实现注意

- 无组件依赖；共享内部 Surface 绘制机制（建议）。
- 必须复用现有槽位结构（Base/Texture/Lighting），不得为 Panel 重写一套材质。
- `title` 已 Omit 原生属性；不要同时暴露原生 title tooltip。
- `tier` 不实现；等待决策。
- `corners` 未来迁移到 decoration API，需保留兼容策略。
