# Steps

> 状态：草案（阶段一）· 需人工审核。M3 导航组件。

## 1. 职责

展示流程的阶段与当前进度。它解决的是“多步骤流程中用户需要知道自己在哪、还剩几步”的问题。

**使用场景**：归档审批、导入向导、结案流程、多步表单。
**不适用**：同级视图切换（用 Tabs）；时间事件序列（用 Timeline）；数据分页（用 Pagination）。
**区别**：Steps 是流程进度；Timeline 是事件历史；Tabs 是互斥内容。

## 2. 边界

- 不管理流程状态；`current` 由调用方驱动。
- 不渲染步骤内容；只渲染步骤指示器。内容区由调用方根据 current 渲染。
- 不自动跳转；`clickable` 仅表示允许点击并回调，是否改变 current 由调用方决定。
- 不支持分支流程/并行步骤；复杂流程图另立组件。
- 不提供动画过场；进度变化可平滑过渡图标/线条。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `items` | `StepItem[]` | **必填** | 步骤数据 |
| `current` | `number` | **必填** | 当前步骤索引，0 起 |
| `onStepClick` | `(index, item) => void` | — | 点击步骤；仅 clickable |
| `clickable` | `boolean` | `false` | 步骤是否可点击 |
| `orientation` | `Orientation` | `'horizontal'` | 方向 |
| `size` | `Size` | `'md'` | 标记/字号 |
| `statusLabels` | `Partial<Record<StepStatus, string>>` | 中文默认 | 屏幕阅读器状态文本 |

```tsx
import type { HTMLAttributes, ReactNode } from 'react';
import type { Orientation, Size } from '../api-conventions';

export type StepStatus = 'pending' | 'active' | 'complete' | 'error';

export interface StepItem {
  id?: string;
  title: ReactNode;
  description?: ReactNode;
  status?: StepStatus;   // 覆盖派生状态（主要用于 error）
  disabled?: boolean;
  icon?: ReactNode;
}

export interface StepsProps extends Omit<HTMLAttributes<HTMLOListElement>, 'onChange'> {
  items: StepItem[];
  current: number;
  onStepClick?: (index: number, item: StepItem) => void;
  clickable?: boolean;
  orientation?: Orientation;
  size?: Size;
  statusLabels?: Partial<Record<StepStatus, string>>;
}
```

## 4. 状态派生

- 默认：`index < current` → complete；`index === current` → active；`index > current` → pending。
- `item.status` 显式提供时覆盖派生值；`current` 索引项可被覆盖为 error（表示当前步失败）。
- `current` 超出范围：视觉钳制到最近合法索引并警告；不自动回调。
- 完成步骤显示 check/编号；当前步骤高亮；错误步骤使用 danger（Token 缺口）。
- 步骤状态变化不自动播报；需要时由调用方在内容区提供 live 文本。

## 5. 事件与状态

- `clickable` 且 `onStepClick` 提供时，步骤渲染为按钮；点击/Enter/Space 触发 `onStepClick(index, item)`。
- 非 clickable 时步骤不可聚焦、不可点击。
- 禁用步骤不可点击；`disabled` 不改变状态派生。
- 不自动改变 current；受控流程由调用方决定。
- 状态：Pending、Active、Complete、Error、Disabled。

## 6. 视觉

- 水平：编号/图标 + 标题/描述，步骤间连接线；连接线按完成状态分段着色。
- 垂直：左侧轨道 + 右侧内容；适合较长描述。
- 编号使用 numeric 字体；完成使用内部 check 图标；错误使用感叹号/断裂标记，不只靠颜色。
- 当前步骤使用 gold/oxide 标记；完成步骤使用金属线；未开始降低对比度。
- 点击态有 hover/focus；非 clickable 无 hover 假象。
- 不使用 paper/film 材质；流程区属于信息密度较高区域。

## 7. 组合与扩展

- 与表单组合：Steps 在上，当前步骤内容在下；切换由表单状态驱动。
- 与 Alert 组合：错误步骤旁显示错误摘要。
- 不把 Steps 内容塞进 items；内容由调用方根据 current 渲染。
- 分支流程、并行流程、可折叠步骤均不在 V1 范围。
- 不提供 `percent`；进度百分比用 Progress。

## 8. 无障碍

- 根 `<ol>`；每个步骤 `<li>`。
- 当前步骤 `aria-current="step"`；完成/错误等状态通过视觉隐藏文本或 `statusLabels` 提供，不能只靠图标。
- clickable 时使用原生 `<button>`；非 clickable 不使用按钮语义。
- 禁用步骤原生 disabled，保留在列表中。
- 连接线纯装饰 `aria-hidden`。
- 步骤标题是主要可读文本；描述可选。
- 水平顺序即 DOM 顺序；不要用 CSS 改变阅读顺序。

## 9. 示例

```tsx
<Steps
  current={1}
  items={[
    { title: '登记' },
    { title: '鉴定' },
    { title: '归档' },
    { title: '复核', status: 'error' },
  ]}
/>

<Steps
  clickable
  current={step}
  onStepClick={(index) => setStep(index)}
  items={[
    { title: '基本信息', description: '填写编号与标题' },
    { title: '来源', description: '记录移交方' },
    { title: '确认', description: '核对并提交' },
  ]}
/>
```

## 10. 边界情况

- `items` 为空：不渲染，开发环境警告。
- `current` 越界（负数/超过长度）：钳制显示并警告；不回调。
- 所有步骤 disabled：仍显示，无点击。
- `clickable` 但无 `onStepClick`：点击无效果；警告，建议不可点击。
- 当前步骤被点击：不重复回调（目标索引等于 current 时可选择不触发；实现需固定并测试）。
- 超长标题/描述：允许换行；水平布局在窄屏可能拥挤，由调用方切换 vertical。
- 步骤 id 重复：用于 key 时需调用方保证唯一；组件优先用 id，缺失时用索引。
- 状态覆盖与 current 冲突：以 item.status 为准，文档说明。

## 11. 依赖与实现注意

- 依赖内部图标（check/error）；不依赖 Tabs/Pagination。
- 连接线状态按相邻步骤状态计算；实现需处理 error 与 complete 的边界。
- 不硬编码字号；编号使用 numeric Token。
- 不把 Steps 做成路由；不读取 URL。
