# Descriptions

> 状态：草案（阶段一）· 需人工审核。M3 数据展示。

## 1. 职责

以“标签—值”对展示一组属性。它解决的是“实体详情需要结构化阅读，但不适合表格”的问题。

**使用场景**：档案元数据、对象详情、设置摘要、规格说明。
**不适用**：行列比较（用 Table）；层级数据（用 Tree）；长正文（用 Typography/Panel）。
**区别**：Descriptions 是一组键值对；Table 是多行多列数据；List 是一维内容。

## 2. 边界

- 不提供编辑能力；只展示。
- 不做排序/筛选。
- 不自动推断值类型或格式化日期/数字；值由调用方提供 ReactNode。
- V1 不支持响应式列数对象；由调用方在布局层控制。
- ArchiveMetadata 是档案语义预设，内部可复用本组件。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `items` | `DescriptionItem[]` | **必填** | 标签值对 |
| `columns` | `1 \| 2 \| 3 \| 4` | `3` | 视觉列数 |
| `layout` | `'horizontal' \| 'vertical'` | `'horizontal'` | 标签在值旁/上方 |
| `bordered` | `boolean` | `false` | 网格边框 |
| `size` | `Size` | `'md'` | 间距/字号 |
| `labelWidth` | `string \| number` | — | 标签列宽；数字按 px |
| `colon` | `boolean` | `true` | 标签后是否显示冒号 |

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import type { Size } from '../api-conventions';

export interface DescriptionItem {
  id?: string;
  label: ReactNode;
  children: ReactNode;
  span?: number;  // 占几列，默认 1
}

export interface DescriptionsProps extends Omit<HTMLAttributes<HTMLDListElement>, 'children'> {
  items: readonly DescriptionItem[];
  columns?: 1 | 2 | 3 | 4;
  layout?: 'horizontal' | 'vertical';
  bordered?: boolean;
  size?: Size;
  labelWidth?: string | number;
  colon?: boolean;
}
```

## 4. 结构

- 根 `<dl>`；每个 item 用 `<div class="au-descriptions__item">` 包裹 `<dt>` 与 `<dd>`（HTML5 允许 div 作为 dl 的子元素）。
- `span` 控制在网格中占的列数；超过 `columns` 时钳制到 `columns` 并警告。
- `layout="horizontal"`：标签与值同一行；`vertical`：标签在上，值在下。
- `bordered` 时使用结构线网格；不使用表格语义。
- `items` 为空时不渲染内容；开发环境提示。

## 5. 事件与状态

- 无交互事件。
- 状态：Default、Bordered、Vertical；无 hover/focus。
- 值中的链接/按钮保留自身交互语义，Descriptions 不拦截。
- 无受控状态。

## 6. 视觉

- 标签使用 UI/caption 字体与次级色；值使用主文本；数字/编号可由调用方使用 numeric 字体。
- 水平布局的标签列可设固定宽度；垂直布局不设。
- `colon` 只影响视觉，不参与可访问文本（可由 CSS `::after` 实现，避免读屏重复）。
- 边框使用 hairline 结构线；不要每项都加阴影。
- 不使用 paper/film 纹理；适合密集信息区。
- 值与标签的间距一致；长值换行。

## 7. 组合与扩展

- 值中可放 Tag、链接、日期、Statistic 等。
- 需要分组时用多个 Descriptions，每组上方放标题；不提供分组 props。
- ArchiveMetadata 作为档案视觉预设复用实现，但保留独立数据契约。
- 不使用 Descriptions 做表单布局；表单用 FormField + CSS Grid。

## 8. 无障碍

- `<dl>` / `<dt>` / `<dd>` 语义清晰；不要用 div 冒充。
- 标签与值的 DOM 顺序必须成对；视觉列数不改变阅读顺序。
- `colon` 不通过文本节点输出，避免读屏听到“冒号”。
- 值中的交互元素必须有自身名称。
- 空值渲染为空白，不要让 `<dd>` 缺失；可显示占位符（如“—”）由调用方决定。
- 超长值换行，不截断为不可访问文本。

## 9. 示例

```tsx
<Descriptions
  columns={2}
  items={[
    { label: '档案编号', children: <span className="numeric">AR-1972-031</span> },
    { label: '密级', children: <Tag tone="gold">机密</Tag> },
    { label: '入藏日期', children: '1972-11-03' },
    { label: '来源', children: '伦敦私人捐赠' },
    { label: '摘要', children: '一封带有水渍的未署名信件。', span: 2 },
  ]}
/>
```

## 10. 边界情况

- `columns` 非法（0/5）：回退 3 并警告。
- `span` ≤0：按 1 处理；>columns：钳制。
- 空 items：不渲染；警告。
- 重复 id：key 冲突；调用方保证唯一。
- 标签/值为空：允许，但仍渲染成对结构；空值建议显示占位。
- 超长标签导致列宽挤压：使用 `labelWidth` 或垂直布局。
- 值中包含多个交互元素：确保焦点顺序符合阅读顺序。
- 在窄容器中：列数不自动响应；由调用方调整 `columns`。

## 11. 依赖与实现注意

- 无组件依赖。
- 网格使用 CSS Grid；border 模式需保证 dt/dd 边框对齐。
- 不硬编码列宽；`labelWidth` 接受字符串（如 `8rem`）。
- 不把 colon 写成真实文本节点，避免屏幕阅读器重复。
