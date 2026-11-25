# ArchiveLabel

> 状态：**待确认**（阶段一）。M4 档案特色组件。
> **建议：并入 Tag**。当前文档保留其“若保留”接口草案，供审核对照。

## 1. 建议

ArchiveLabel 与 Tag 的职责高度重叠：两者都是短文本分类标记，差异主要是“档案编号/分类”的视觉预设（等宽、细线、不可移除）。独立公开会形成两套竞争 API。

建议二选一：

| 方案 | 内容 | 影响 |
| --- | --- | --- |
| A（推荐） | 移除独立组件，Tag 增加 `variant="archive"` 或 `monospace` 预设 | 减少一个公开组件；Tag API 增一个视觉值 |
| B | 保留 ArchiveLabel，但严格限定为非交互、不可移除、仅档案编号/分类 | 多一个组件，需明确与 Tag 的边界 |

本文件按方案 B 给出草案；若确认方案 A，应删除正式组件并同步 Tag 文档。

## 2. 职责（若保留）

档案分类/编号标签：等宽编号、hairline 边框、低装饰，不提供移除或点击。它解决的是“档案编号需要与普通分类标签区分”的问题。

**使用场景**：档案编号、索书号、分类号、密级标记（非交互）。
**不适用**：可移除标签（用 Tag）；状态印章（用 ArchiveStamp）；通用分类（用 Tag）。
**区别**：ArchiveLabel 不可交互；Tag 可带移除按钮。

## 3. Props（若保留）

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `children` | `ReactNode` | **必填** | 标签文本 |
| `code` | `string` | — | 可选编号前缀/代码，numeric 字体 |
| `tone` | `AccentTone` | `'neutral'` | 颜色语义 |
| `size` | `'sm' \| 'md'` | `'md'` | 尺寸 |

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import type { AccentTone } from '../api-conventions';

export interface ArchiveLabelProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  code?: string;
  tone?: AccentTone;
  size?: 'sm' | 'md';
}
```

## 4. 事件与状态

无事件、无交互状态。不可移除、不可点击、不可聚焦。

## 5. 视觉

- 根 `<span>`；hairline 边框或仅下划线；`code` 使用 numeric 字体并与文本分列。
- tone 使用 accent/gold；不使用状态色。
- 不使用纸张纹理；标签本身是构成元素。
- 不可移除，因此没有关闭按钮/命中区。

## 6. 组合与扩展

- 放在 ArchiveCard/ArchivePanel 的 classification 槽。
- 需要移除时改用 Tag。
- 需要状态语义时用 ArchiveStamp，不用 ArchiveLabel。

## 7. 无障碍

- 纯文本内容；无额外 ARIA。
- 不可聚焦；不要添加 tabIndex。
- `code` 与 children 的阅读顺序需自然；不要只靠等宽字体区分含义。
- 颜色不是唯一信息；文本必须完整。

## 8. 示例（若保留）

```tsx
<ArchiveLabel code="AR">1972-031</ArchiveLabel>
<ArchiveLabel tone="gold">特藏</ArchiveLabel>
```

## 9. 边界情况

- 空 children：渲染空标签；开发环境警告。
- 超长文本：换行或由调用方截断；不撑破卡片。
- code 与 children 同时为空：无内容；警告。
- 在表单/可交互容器中：仍不可聚焦；不要把标签塞进按钮内造成语义混乱。

## 10. 依赖与实现注意

- 若采用方案 A：Tag 增加 `variant="archive"`，本文件删除，不保留兼容别名。
- 若采用方案 B：不得再给 ArchiveLabel 增加 `onRemove`/`onClick`；否则违背边界。
- 不建议把 ArchiveLabel 作为 Tag 的内部实现细节公开导出两次。
