# PaperSheet

> 状态：**待确认——建议内部化，不公开导出**。M4 档案特色组件。
> 建议以 `Panel` / `Card` 的 `material="paper"` + 未来装饰预设承载，而不是独立 React 组件。

## 1. 建议

PaperSheet 本质是“paper 材质 + 撕边/折痕/压印的表面预设”。它没有独立信息结构或行为；公开后会与：

- `Panel material="paper"`（已有正式材质）；
- `Card`/`ArchivePanel` 的表面；
- 未来 decoration 预设（撕边/折痕）重叠。

建议内部化为表面/装饰预设，不公开组件。

## 2. 若公开的职责

提供一张“纸”的表面容器：paper 材质、可选撕边/折痕、内边距与内容。它解决的是“页面需要一张纸的视觉”的问题——这是 Panel 已覆盖的视觉能力。

## 3. 若公开的 Props 草案

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | 内容 |
| `variant` | `'flat' \| 'torn' \| 'folded'` | `'flat'` | 纸面处理预设 |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | 内边距 |
| `as` | `'section' \| 'article' \| 'div'` | `'div'` | 根语义 |
| `textureIntensity` | `number` | `1` | 0–2 |
| `lightingIntensity` | `number` | `1` | 0–2 |

```tsx
import type { HTMLAttributes, ReactNode } from 'react';

export interface PaperSheetProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  variant?: 'flat' | 'torn' | 'folded';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: 'section' | 'article' | 'div';
  textureIntensity?: number;
  lightingIntensity?: number;
}
```

## 4. 语义与风险（若公开）

- 根是通用容器，无固有语义；`as` 需要调用方每次都做正确选择。
- 与 Panel 的区别只有“默认材质 paper + 撕边变体”，不足以支撑独立组件。
- 撕边需要资产/遮罩；在不同尺寸下边缘会拉伸，难以通用。
- `variant` 与未来 decoration API 重叠，容易形成第二套装饰体系。
- 嵌套 PaperSheet 会重复纹理/阴影，视觉失控。

## 5. 视觉约束

- 必须复用现有 paper 材质类与三槽位，不得另写一套纸张纹理。
- 撕边/折痕属于 L4 构成资产，不占用材质伪元素；不继承纸张纹理。
- 纹理强度通过 `--au-texture-scale` / `--au-lighting-scale` 局部写入。
- 亮色主题的纸面基色由主题层负责。
- 强撕边只用于展示型低密度区域；正文/表单区不得使用。
- 不烘焙暗角；暗角归 L3。

## 6. 内部契约（推荐）

- 不新增公开组件；`Panel`/`Card` 的 `material="paper"` 已提供纸面。
- 撕边/折痕等待 decoration API 统一立项，作为 `decoration` 预设或表面变体。
- 若某业务确实需要“纸张布局”，用 Panel + className/未来预设组合，不引入第三套容器。

## 7. 无障碍（若公开）

- `as` 必须正确选择；无标题的 section 不成为 landmark。
- 撕边/折痕纯装饰 `aria-hidden`；不影响阅读顺序。
- 不添加交互语义；内容中的链接/按钮自理。
- 高对比模式下装饰可关闭，内容保留。

## 8. 边界情况

- 内容为空：空纸面；建议调用方避免。
- 超长内容：纸张不无限拉伸；滚动/分页由调用方处理。
- 极小尺寸：撕边不可辨，隐藏装饰。
- 嵌套 PaperSheet：禁止。
- 打印：装饰/纹理可能丢失，不承诺。

## 9. 结论

- 默认：**内部化**，不进入公共导出。
- 对外能力：`Panel` / `Card` / `ArchivePanel` 的 `material="paper"` 与强度参数；撕边/折痕待 decoration API 决策后提供预设。
