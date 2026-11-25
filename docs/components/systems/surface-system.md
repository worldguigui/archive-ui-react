# 表面、材质与 Panel/Card 边界

> 状态：草案。适用于 Panel、Card、ArchivePanel、ArchiveCard、ArchiveCover、Dialog（未来）等带表面的组件。

## 1. 既有事实

- 三材质已冻结：`plain`（哑光微颗粒 + 纵深）、`paper`（深棕纸 + 灯光氛围 + 纤维斑驳）、`film`（真实乳剂亮度图 × multiply + 镜头暗角）。
- 材质类 `.au-material--*` 只写 CSS 变量，不写外观属性；组件样式是唯一绘制方。
- 三槽位：Base（元素背景 + 氛围层）、Texture（`::before`）、Lighting（`::after`）；装饰走 L4 真实 DOM span。
- 材质基色与主题成对图源由主题层管理；组件不得直接引用 Primitive。
- `--au-texture-scale` / `--au-lighting-scale` 是语义响应系数；组件可通过 `textureIntensity` / `lightingIntensity` 写入局部根节点。

## 2. 哪些组件拥有材质

| 组件 | `material` | 默认 | 强度参数 | 说明 |
| --- | --- | --- | --- | --- |
| Panel | `plain / paper / film` | `plain` | 是 | 通用表面区域 |
| Card | `plain / paper / film` | `plain` | 是 | 内容卡片 |
| ArchivePanel | `plain / paper / film` | `paper` | 是 | 档案卷宗容器 |
| ArchiveCard | `plain / paper / film` | `paper` | 是 | 档案记录卡片 |
| ArchiveCover | 不直接使用 `material` | — | 否 | 使用 `treatment` 预设；图片表面不是面板材质 |
| Dialog | V1 不开放 | plain 外观 | 否 | 等待烟熏玻璃/浮层表面立项 |
| 表单控件 | 否 | 等级 0–1 的轻表面 | 否 | 纹理不得干扰输入 |

不把 `material` 加到 Button、Tabs、Table 等控件上。材质是表面身份，不是万能样式开关。

## 3. 强度参数

```ts
interface SurfaceScaleProps {
  /** 0–2，默认 1；只缩放已定义的纹理强度。 */
  textureIntensity?: number;
  /** 0–2，默认 1；只缩放已定义的光影强度。 */
  lightingIntensity?: number;
}
```

- 写入组件根节点的 `--au-texture-scale` / `--au-lighting-scale`；不写 `:root`，不影响其他组件。
- 0 表示关闭该维度（plain 的纹理也变平）；2 是上限，超出范围在开发环境警告并钳制。
- 不提供任意图源、混合模式、暗角形状、材质基色覆盖。调用方不能“自定义材质”，只能选择库内预设与强度。
- 视觉验收以材质样品区为准；强度参数不是新的视觉体系。

## 4. Panel 正式 API 原则

当前验证版 Panel：

```tsx
<Panel title="卷宗" material="paper" corners footer="档案编号 001">...</Panel>
```

正式草案保留核心形状，但需要明确：

1. `title` 是 ReactNode，必须 `Omit` 原生 `title`。
2. 标题渲染为标题元素，`headingLevel` 默认 3，可调；不能永远硬编码 `<h3>`。
3. `as` 允许 `section / article / div / aside`；默认 `section`。
4. `header` 插槽可替代 `title` 区域；`footer` 仍是独立区域；`subtitle` 是头部辅助文本。
5. `padding` 控制内容区留白（`none / sm / md / lg`），不引入 `size` 与 `padding` 两套重叠 API。
6. `bordered`、`elevation` 是视觉开关；默认 hairline 边框 + soft 阴影。
7. `corners` 是装饰 API 立项前的临时开关；未来由 `decoration` 预设替代，必须标注过渡状态。
8. `interactive` 控制是否启用 hover 边框提亮与暖光；默认 `false`。当前验证组件无条件 hover，属于待修正点。
9. `textureIntensity` / `lightingIntensity` 仅在表面组件启用。

### 4.1 `tier` 冲突（必须确认）

`docs/rendering-system.md` §六声称 `tier` 已实现，并在 §一使用 `<Panel material="paper" tier="editorial" />`，但 `src/components/Panel/Panel.tsx` 没有 `tier` prop，也没有对应样式。本阶段**不把 `tier` 纳入正式 API**，并登记为文档与代码冲突。是否引入 `tier`（如 compact / editorial / display）需要单独决策；在确认前，不以 `padding` 冒充 `tier`。

### 4.2 Panel 与 Card

| | Panel | Card |
| --- | --- | --- |
| 语义 | 页面区域 / 表面容器 | 内容卡片 |
| 默认标签 | `section` | `article` |
| 结构 | 标题栏 + 内容 + 页脚 | 媒体 + 标题/描述 + 内容 + 操作/页脚 |
| 是否带媒体 | 否 | 是 |
| 是否适合页面布局 | 是 | 否 |
| 交互提示 | `interactive`（可选） | `interactive`（可选，纯视觉） |
| 依赖 | 无 | 可组合 Panel 表面能力 |

Card 不得暴露 Panel 的全部 props；二者共享表面样式，不共享完整 API。

## 5. 表面组件的公共视觉规则

- 根节点必须建立隔离层叠上下文（`isolation: isolate`），防止 multiply 纹理泄漏到页面背景。
- 装饰不得占用 `::before` / `::after`；装饰是带 `aria-hidden` 的 span。
- 边框、圆角、阴影全部使用 Semantic Token；不得硬编码主题值。
- hover 只在组件可交互或显式 `interactive` 时出现；静态容器不因鼠标经过而发光。
- `film` 只用于展示型表面；表单、密集数据与长正文不得使用 film。
- 亮色主题的材质基色与 film 图源由主题层负责；组件不写主题分支。
- 表面内的文字对比度必须在两套主题下验证；不能以纹理“看起来对”代替可读性。

## 6. 装饰的过渡状态

- 当前只有 Panel `corners` 是已实现装饰开关；边框变体、角饰变体、分隔线、纹章、纹样仍处于草案/实验区。
- 本阶段不定义 `decoration` 公共 API；不在 M1–M4 组件中零散增加 `ornament` / `frame` / `border` 等属性。
- Archive 组件的印章、索引、标签是**内容语义**，不是装饰预设；不能与 `decoration` 混淆。
- 未来装饰 API 立项时，应统一 `decoration` 预设与 `corners` 的迁移策略，并单独出决策记录。

## 7. 性能与实现

- 不为每个表面组件各自复制一套槽位 CSS；应提取内部 `Surface` 机制（非公开组件）或共享 class 基础，避免漂移。
- 不引入运行时滤镜；图片处理优先资产化。
- 纹理与光影层 `pointer-events: none`；内容层级高于槽位。
- 嵌套表面（Card in Panel、ArchiveCard in ArchivePanel）不得重复叠加高强度纹理；内层默认降为 plain 或由视觉规范明确。

## 8. 待确认

1. `tier` 是否引入。
2. Panel 是否保留无条件 hover，还是改为 `interactive` 默认关闭。
3. `corners` 的正式去留与 `decoration` API 时间表。
4. `textureIntensity` / `lightingIntensity` 的公开范围（是否只在 Panel/Card/Archive 表面）。
5. 嵌套表面的材质降级规则。
6. 状态色和 disabled/focus Token 的补齐时间。
