# Tree

> 状态：草案（阶段一）· 需人工审核。M3 数据展示。

## 1. 职责

展示层级数据，支持展开/收起与单选。它解决的是“目录、分类或嵌套档案需要逐级浏览”的问题。

**使用场景**：档案目录、分类树、组织/收藏结构、权限树（只读）。
**不适用**：扁平列表（用 List）；二维数据（用 Table）；菜单命令（用 Menu）；导航链接（用 NavigationMenu）。
**区别**：Tree 有层级与 treeview 键盘模型；List 无层级；Menu 有菜单语义。

## 2. 边界

- V1 只支持单选、展开/收起、禁用节点；不做复选/半选、异步加载、拖拽、虚拟滚动。
- 不渲染节点内容面板；`label` 是节点显示内容，复杂内容需谨慎。
- 不负责数据获取/懒加载；树数据必须完整传入。
- 不做节点右键菜单；需要时与 ContextMenu 组合。
- 大数据量（建议 >500 节点）不承诺性能，需另立项虚拟化。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `nodes` | `TreeNode[]` | **必填** | 树数据 |
| `expandedIds` | `string[]` | — | 受控展开集合 |
| `defaultExpandedIds` | `string[]` | `[]` | 非受控展开初值 |
| `onExpandedChange` | `(ids: string[]) => void` | — | 展开集合变化 |
| `selectedId` | `string \| null` | — | 受控选中 |
| `defaultSelectedId` | `string \| null` | — | 非受控初值 |
| `onSelect` | `(id: string, node: TreeNode) => void` | — | 选中回调 |
| `disabled` | `boolean` | `false` | 整体禁用 |
| `empty` | `ReactNode` | — | 空数据插槽 |
| `aria-label` | `string` | — | 树名称 |

```tsx
import type { HTMLAttributes, ReactNode } from 'react';

export interface TreeNode {
  id: string;
  label: ReactNode;
  textValue?: string;      // label 非文本时用于 typeahead
  children?: TreeNode[];
  disabled?: boolean;
  icon?: ReactNode;
}

export interface TreeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect' | 'children'> {
  nodes: readonly TreeNode[];
  expandedIds?: readonly string[];
  defaultExpandedIds?: readonly string[];
  onExpandedChange?: (ids: string[]) => void;
  selectedId?: string | null;
  defaultSelectedId?: string | null;
  onSelect?: (id: string, node: TreeNode) => void;
  disabled?: boolean;
  empty?: ReactNode;
}
```

## 4. 受控与非受控

- 展开：`expandedIds` 受控 / `defaultExpandedIds` 非受控；回调 `onExpandedChange`。
- 选中：`selectedId` 受控 / `defaultSelectedId` 非受控；`onSelect` 只通知，非受控时内部更新。
- 受控优先；不可运行时切换；默认值只读一次。
- 选中节点被收起后仍保持 selectedId，但视觉不可见；展开后恢复高亮。文档明确。

## 5. 事件与状态

- 点击节点行：选中并聚焦；点击展开图标：只展开/收起（不改变选中）。
- 键盘（treeview）：
  - ↑/↓ 可见节点间移动；
  - → 展开当前节点或进入第一个子节点；
  - ← 收起当前节点或回到父节点；
  - Home/End 首/末可见节点；
  - Enter/Space 选中；
  - 字符跳转（typeahead）按 textValue/label。
- 状态：Expanded、Collapsed、Selected、Focus、Disabled、Leaf、Branch。
- 不自动展开选中祖先；调用方可通过受控 expandedIds 完成。

## 6. 视觉

- 缩进按层级；连接引导线使用定位线 Token，保持轻。
- chevron 表示展开状态；叶子节点不显示 chevron（保留等宽占位）。
- 选中项使用古金/锈橙标记 + 背景/边框，不只靠颜色。
- 节点图标可选，`aria-hidden`；标签使用 UI 字体。
- 禁用节点降低对比度但仍可读；不可聚焦。
- 不使用 paper/film 纹理；树属于密集信息区。
- 展开/收起可平滑高度；尊重 reduced motion。

## 7. 组合与扩展

- 与 ContextMenu 组合：在节点行上挂右键菜单，需要可聚焦区域。
- 与 Search/Input 组合做过滤：调用方过滤节点数据后传入；组件不内置搜索。
- 复选/半选、异步加载、拖拽排序均为后续扩展，不预埋模糊 props。
- 节点内容保持短文本；复杂卡片不适合放进树行。

## 8. 无障碍

- 根 `role="tree"`；节点容器/项 `role="treeitem"`；子级容器 `role="group"`。
- `aria-expanded`（仅分支）、`aria-selected`、`aria-level`、`aria-setsize`、`aria-posinset`。
- roving tabindex：同一时刻只有当前节点可 Tab；方向键移动。
- 树必须有名称（aria-label/labelledby）。
- 禁用节点 `aria-disabled`，保留在顺序中。
- 展开图标是视觉按钮的一部分，不作为单独的 Tab 停靠点；键盘操作由 treeitem 处理。
- 选中变化不自动播报；需要时由调用方提供状态文本。

## 9. 示例

```tsx
<Tree
  aria-label="档案目录"
  defaultExpandedIds={['1972']}
  defaultSelectedId="1972-031"
  nodes={[
    {
      id: '1972',
      label: '1972 年卷宗',
      children: [
        { id: '1972-031', label: 'AR-1972-031 雨夜来信' },
        { id: '1972-044', label: 'AR-1972-044 潮汐记录' },
      ],
    },
    { id: '1973', label: '1973 年卷宗', children: [] },
  ]}
  onSelect={(id) => openRecord(id)}
/>
```

## 10. 边界情况

- 空 nodes：渲染 empty 或空容器；建议 empty。
- 重复 id：开发环境警告；展开/选中状态可能错位。
- `expandedIds` 指向不存在的节点：忽略并警告。
- 选中节点隐藏于收起祖先：保持值，视觉不显示；展开后可见。
- 深层树（>6 层）：缩进可能压缩内容；由调用方限制或横向滚动。
- 超长标签：截断时必须保留可访问全文；V1 建议换行。
- 所有节点 disabled：树可聚焦但无选择；建议避免。
- 快速展开/收起：动画可中断，最终状态准确。
- 受控 expanded/selected 不更新：界面不变；回调已发。

## 11. 依赖与实现注意

- 依赖 RovingFocus、Typeahead、内部 chevron 图标。
- 树结构扁平化时需保留父子关系与层级；不要依赖 DOM 嵌套计算 setsize。
- 不实现复选/懒加载；不要添加未实现的 `checkable` prop。
- 不硬编码缩进宽度；使用间距 Token 与层级计算。
