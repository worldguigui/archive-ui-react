# ArchiveStamp

> 状态：草案（阶段一）· 需人工审核。M4 档案特色组件。

## 1. 职责

档案状态印章：以印章/戳记的视觉语言表达“已归档 / 机密 / 作废 / 收讫”等状态。它解决的是“档案状态需要一眼可辨、具有仪式感”的问题。

**使用场景**：ArchiveCard/ArchivePanel 的角标、档案封面状态、审批结果、封存标记。
**不适用**：通用标签（用 Tag）；错误提示（用 Alert）；可点击操作（用 Button）；纯装饰纹样（属于装饰资产，不是组件）。
**区别**：ArchiveStamp 有状态语义与印章视觉；Tag 是通用标签；ArchiveLabel 是编号标签。

## 2. 边界

- 不内置业务状态枚举；状态文本由 `label` 提供，避免中英文/业务绑定。
- 不可点击、不可移除、不可编辑。
- `decorative` 为真时纯装饰，屏幕阅读器忽略；默认不这样做。
- 旋转只允许小角度；不做动画/盖章特效（未来 interaction-effects 另立项）。
- 不承载长文本/复杂内容；一行短标签 + 可选日期。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `label` | `ReactNode` | **必填** | 印章状态文本 |
| `date` | `ReactNode` | — | 可选日期行 |
| `tone` | `'neutral' \| 'accent' \| 'gold' \| 'danger'` | `'accent'` | 印泥颜色语义；danger 缺 Token |
| `variant` | `'ring' \| 'block'` | `'ring'` | 圆形印章/方形戳记 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 直径/字号 |
| `rotate` | `number` | `0` | 小角度旋转，建议 -8..8；超出钳制 |
| `decorative` | `boolean` | `false` | 纯装饰，`aria-hidden` |

```tsx
import type { HTMLAttributes, ReactNode } from 'react';

export interface ArchiveStampProps extends HTMLAttributes<HTMLSpanElement> {
  label: ReactNode;
  date?: ReactNode;
  tone?: 'neutral' | 'accent' | 'gold' | 'danger';
  variant?: 'ring' | 'block';
  size?: 'sm' | 'md' | 'lg';
  rotate?: number;
  decorative?: boolean;
}
```

## 4. 事件与状态

- 无交互事件、无 hover/focus/disabled。
- 状态由 label/tone 表达：已归档、机密、作废等。
- `decorative` 不改变视觉，只改变可访问性。
- 不自动播报状态变化；需要时由父容器提供文本或 live region。

## 5. 视觉

- 印章使用 accent（锈橙印泥）或 gold；danger 需要状态 Token。
- `ring`：圆/椭圆印章轮廓，可用内部 SVG mask 或边框；`block`：方形戳记边框。
- 文字使用 label 字距/大写风格；日期使用 numeric 小字。
- 不继承面板材质纹理；印章是 L4 构成，不叠加纸纹。
- 允许小角度旋转；不得旋转到难以阅读。
- 同一视图/卡片不要堆叠多个印章；一个状态主角。
- 不使用发光/渐变填充；印泥边缘可以有轻微不均匀（资产化）。

## 6. 组合与扩展

- ArchiveCard/ArchivePanel 通过 `stamp` 槽注入；ArchiveCover 也可放印章。
- 纯装饰的印章（如背景纹章）用 `decorative`，但不应传播状态信息。
- 不做“可点击盖章”交互；需要时另立交互组件。
- 不把 ArchiveStamp 用作 Tag；可移除分类用 Tag。

## 7. 无障碍

- 默认不加 `role="img"`：印章文本本身是可读状态，直接朗读 label/date。
- `decorative=true` 时 `aria-hidden="true"`，且不得承载唯一信息。
- 旋转不影响 DOM 阅读顺序。
- 颜色不是唯一信息：label 必须明确写出状态。
- 不自动聚焦/播报；状态变化由页面内容表达。
- 触摸不适用（不可交互）。

## 8. 示例

```tsx
<ArchiveStamp label="已归档" tone="gold" rotate={-4} date="1972-11-03" />
<ArchiveStamp label="机密" tone="accent" variant="block" size="sm" />
<ArchiveStamp label="作废" tone="danger" rotate={3} />
<ArchiveStamp label="馆藏" decorative />
```

## 9. 边界情况

- `label` 为空：开发环境报错；印章必须有状态文本。
- 长 label：环形成员可能溢出；建议短词，超出时换行/缩小由实现固定，不静默截断。
- `rotate` 超过 ±8：钳制并警告；避免视觉混乱。
- `decorative` 且无其他文字说明：状态信息丢失；文档禁止。
- 多个印章同时出现：组件不限制，视觉规范限制。
- 在密集表格中：印章可能过大；使用 `size="sm"` 或改用 Tag。
- 日期格式：不解析/格式化，由调用方统一。
- 亮色主题：印泥对比度需验证，不能直接复用暗色数值。

## 10. 依赖与实现注意

- 无组件依赖；可使用内部印章/边框资产与 mask 着色。
- 不占用材质伪元素槽；印章自身是装饰 DOM，不继承面板纹理。
- danger 状态 Token 未建立前，不得用 accent 冒充“作废/拒绝”并标记完成。
- 不做旋转动画；未来 ritual interaction 不应改变本组件静态语义。
