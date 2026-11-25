# Timeline

> 状态：草案（阶段一）· 需人工审核。M3 数据展示。

## 1. 职责

按时间顺序展示事件序列。它解决的是“历史记录、变更轨迹、叙事节点需要按时间阅读”的问题。

**使用场景**：档案流转记录、审计日志、项目里程碑、人物生平。
**不适用**：流程当前进度（用 Steps）；表格数据（用 Table）；纯列表（用 List）。
**区别**：Timeline 是已发生/计划事件的序列；Steps 是流程阶段；List 无时间语义。

## 2. 边界

- 不排序数据；按传入顺序渲染，调用方负责时间顺序。
- 不做虚拟滚动；超长日志由调用方分页。
- 不提供左右交替布局；V1 只做左侧时间轴。
- 不自动计算相对时间（“3 天前”）；`timestamp` 由调用方格式化。
- 不内置筛选/搜索。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `items` | `TimelineItem[]` | **必填** | 事件项 |
| `variant` | `'solid' \| 'dashed' \| 'dotted' \| 'etch'` | `'solid'` | 连接线样式 |
| `size` | `Size` | `'md'` | 间距/标记尺寸 |
| `aria-label` | `string` | — | 列表名称 |

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import type { Size } from '../api-conventions';

export type TimelineStatus = 'default' | 'complete' | 'current' | 'error' | 'pending';

export interface TimelineItem {
  id?: string;
  title: ReactNode;
  description?: ReactNode;
  timestamp?: ReactNode;
  dateTime?: string;       // ISO 8601，用于 <time>
  icon?: ReactNode;
  status?: TimelineStatus; // 默认 default
}

export interface TimelineProps extends Omit<HTMLAttributes<HTMLOListElement>, 'children'> {
  items: readonly TimelineItem[];
  variant?: 'solid' | 'dashed' | 'dotted' | 'etch';
  size?: Size;
}
```

## 4. 结构与状态

- 根 `<ol>`；每项 `<li>`；时间轴连接线、标记为装饰（`aria-hidden`）。
- 状态：Default、Complete、Current、Error、Pending。
  - `current` 使用 gold/oxide 标记；
  - `complete` 可使用 check；
  - `error` 使用 danger 色（Token 缺口）；
  - `pending` 降低对比度。
- 状态不是交互，用户不能点击切换。
- `dateTime` 存在且 `timestamp` 为文本时，用 `<time dateTime>` 包装。

## 5. 视觉

- 左侧垂直轨道 + 标记 + 内容；最后一项的线不继续向下。
- `variant` 控制线型；蚀刻渐变线只用于重要节点序列，不滥用。
- 时间戳使用 numeric 字体，可放在标题上方或右侧；布局固定一致。
- 标记可被 `icon` 覆盖；图标 `aria-hidden`。
- 内容标题 UI/editorial；描述 body；不使用 paper/film 纹理。
- 连接线不能与步骤条混淆：Timeline 的节点是事件点，Steps 是阶段。

## 6. 组合与扩展

- 内容可放 Alert、Tag、Button；但不要嵌套另一个 Timeline。
- 与 Empty 组合：无事件时在外层条件渲染。
- 需要“加载更多”时在列表外组合 Button/分页。
- 不提供筛选/分组；调用方预处理 items。

## 7. 无障碍

- 根 `<ol>`；事件顺序即阅读顺序。
- 每项标题为可读文本；时间使用 `<time dateTime>`（若可提供）。
- 状态必须通过文本或视觉隐藏文本表达（完成/错误/待处理），不能只靠颜色；V1 不内置状态文本，调用方在 title/description 中体现，或等待统一 labels。
- 图标 `aria-hidden`。
- 连接线 `aria-hidden`。
- 不自动播报新条目；需要时由调用方在 live region 中通知。

## 8. 示例

```tsx
<Timeline
  aria-label="档案流转记录"
  items={[
    { title: '入库登记', timestamp: '1972-11-03', dateTime: '1972-11-03', status: 'complete' },
    { title: '移交至特藏室', timestamp: '1984-06-17', dateTime: '1984-06-17', status: 'complete' },
    { title: '数字化扫描', timestamp: '2024-02-29', dateTime: '2024-02-29', status: 'current' },
    { title: '待复核', status: 'pending' },
  ]}
/>
```

## 9. 边界情况

- 空 items：不渲染或空列表；建议外层显示 Empty；组件不警告。
- 缺少 timestamp：仅标题/描述，时间轴仍对齐。
- `dateTime` 非法：仍渲染 timestamp 文本，`<time>` 的 dateTime 属性按传入值输出（调用方负责合法性）。
- 超长描述：换行，连接线拉伸。
- 单项：不渲染尾部延伸线；标记仍显示。
- 状态值未知：回退 default，开发环境类型层已阻止。
- 快速追加大量事件：正常渲染；性能不在承诺范围。
- 时间顺序错误：不自动排序，按数组顺序显示。

## 10. 依赖与实现注意

- 依赖内部图标（check/error）但不强制；无组件依赖。
- 连接线用 CSS 伪元素或装饰 span；不得占用材质槽（Timeline 无材质）。
- 不硬编码颜色；error/complete 色等待状态 Token。
- 不自动格式化时间；不引入日期库。
