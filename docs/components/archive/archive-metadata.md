# ArchiveMetadata

> 状态：草案（阶段一）· 需人工审核。M4 档案特色组件。
> **建议**：保留公开组件与档案语义，但内部作为 Descriptions 的预设实现（待确认）。若维护者认为差异不足，可降级为 `Descriptions variant="archive"`。

## 1. 职责

以档案字段的视觉语言展示“标签—值”对：编号使用等宽、字段用细线分隔、密级/来源等元数据保持紧凑。它解决的是“档案详情需要一致的元数据排版”的问题。

**使用场景**：ArchiveCard/ArchivePanel 的元数据区、档案详情、移交记录。
**不适用**：通用键值对（用 Descriptions）；表格数据（用 Table）；长正文（用 Typography）。
**区别**：ArchiveMetadata 是 Descriptions 的档案视觉预设，语义仍是 `<dl>`。

## 2. 边界

- 不提供编辑/校验；只展示。
- 不自动格式化值；日期/编号由调用方提供 ReactNode。
- 不解析字段含义；没有固定 schema，`items` 决定顺序。
- 不做分组/折叠；需要分组时用多个 ArchiveMetadata 或标题。
- 不新增材质；由父容器提供表面。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `items` | `ArchiveMetadataItem[]` | **必填** | 字段列表 |
| `columns` | `1 \| 2 \| 3 \| 4` | `2` | 视觉列数 |
| `layout` | `'horizontal' \| 'vertical'` | `'horizontal'` | 标签位置 |
| `separated` | `boolean` | `true` | 字段间是否显示结构线 |
| `size` | `'sm' \| 'md'` | `'md'` | 紧凑/常规 |
| `labelWidth` | `string \| number` | — | 标签列宽；数字按 px |

```tsx
import type { HTMLAttributes, ReactNode } from 'react';

export interface ArchiveMetadataItem {
  id?: string;
  label: ReactNode;
  value: ReactNode;
}

export interface ArchiveMetadataProps extends Omit<HTMLAttributes<HTMLDListElement>, 'children'> {
  items: readonly ArchiveMetadataItem[];
  columns?: 1 | 2 | 3 | 4;
  layout?: 'horizontal' | 'vertical';
  separated?: boolean;
  size?: 'sm' | 'md';
  labelWidth?: string | number;
}
```

## 4. 结构

- 根 `<dl>`；每项 `<div>` 包裹 `<dt>` / `<dd>`。
- 字段顺序由 items 数组决定；不要依赖对象键顺序。
- `columns` 只影响视觉网格，不改变阅读顺序。
- `separated` 使用 hairline 结构线；`layout="vertical"` 时标签在上。
- 值可以是文本、链接、Tag、编号；复杂值由调用方保证可读。
- 空 items：不渲染；开发环境提示。

## 5. 事件与状态

- 无交互事件；值内链接/按钮保留自身语义。
- 状态：Default、Compact、Vertical、Separated。
- 无受控状态、无 loading；加载用 Skeleton 占位。

## 6. 视觉

- 标签使用 UI/caption 字体与次级色；值使用主文本；编号/日期使用 numeric 字体（由值内容决定）。
- 字段间结构线要克制；`separated=false` 时依靠留白与对齐。
- 默认 2 列，适合卡片/侧栏；长值可跨列（V1 不提供 span，避免与 Descriptions 的 API 分叉）。
- 不使用 paper/film 纹理；元数据区域保持等级 0–1。
- 值中的 Tag 不重复太多，避免视觉噪声。

## 7. 组合与扩展

- 在 ArchiveCard 中通过 `metadata` 数组内部渲染。
- 在 ArchivePanel 中可直接使用，与 ArchiveIndex/Descriptions 组合。
- 需要 span/分组/边框等 Descriptions 能力时，使用 Descriptions 并接受通用视觉。
- 不添加 `span`：若需要跨列，使用 Descriptions 或外层布局；避免两个近似组件 API 分叉。

## 8. 无障碍

- `<dl>` / `<dt>` / `<dd>` 语义；不要用表格伪装。
- 标签与值的 DOM 顺序成对；视觉列数不改变阅读顺序。
- 值中的链接/按钮有名称；不要只靠图标。
- 空值仍渲染 `<dd>`，可显示占位符；不要省略导致标签悬空。
- 超长值换行，不截断为不可访问文本。
- 字段顺序即阅读顺序；编号/日期不依赖背景图。

## 9. 示例

```tsx
<ArchiveMetadata
  items={[
    { label: '档案编号', value: <span className="numeric">AR-1972-031</span> },
    { label: '密级', value: <Tag tone="gold">机密</Tag> },
    { label: '入藏日期', value: '1972-11-03' },
    { label: '来源', value: '伦敦私人捐赠' },
  ]}
  columns={2}
/>
```

## 10. 边界情况

- `columns` 非法：回退 2 并警告。
- 空 items：不渲染；警告。
- 重复 id：key 冲突；调用方保证唯一。
- 超长标签/值：换行；`labelWidth` 可固定列宽。
- 值包含多个交互元素：确保焦点顺序。
- 嵌套在 paper 表面中：不重复纹理；组件本身不绘制材质。
- 字段很多：由调用方分组或分页；组件不折叠。

## 11. 依赖与实现注意

- 建议依赖 Descriptions 实现，但保持独立导出与数据契约；若直接复用，禁止两套 DOM 结构。
- 不依赖 ArchiveCard/ArchivePanel（避免反向依赖）。
- 不硬编码字段名；不内置 schema。
- 不把 ArchiveMetadata 做成表单；它是只读展示。
