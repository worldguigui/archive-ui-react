# AlertDialog

> 状态：草案（阶段一）· 需人工审核。M3 反馈与浮层。

## 1. 职责

要求用户明确确认或取消的模态对话框，用于删除、作废、不可逆操作等场景。与 Dialog 的核心差别是：**没有随手关闭路径**，用户必须做出选择。

**使用场景**：删除档案、作废记录、放弃未保存修改、权限提升确认。
**不适用**：普通信息展示（用 Dialog）；短消息（用 Toast/Alert）；可撤销操作（可考虑 Alert + 撤销）。
**区别**：AlertDialog 默认不响应 Escape/外部点击，无右上角关闭按钮；必须确认或取消。

## 2. 边界

- 不内置异步提交；`onConfirm` 是同步通知，异步流程由调用方用 `loading` + 受控 `open` 管理。
- 不自动根据 Promise 关闭；不吞掉异常。
- 不提供任意多按钮；固定确认 + 取消。需要第三种操作时使用 Dialog 自定义页脚。
- 不提供输入框；需要输入确认（如输入名称）时使用 Dialog + FormField。
- `tone` 只影响视觉；不改变动作语义。

## 3. Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `open` / `defaultOpen` | `boolean` | — / `false` | 受控/非受控 |
| `onOpenChange` | `(open: boolean) => void` | — | 关闭请求 |
| `title` | `ReactNode` | **必填** | 可访问标题 |
| `description` | `ReactNode` | — | 说明 |
| `children` | `ReactNode` | — | 额外内容（可选） |
| `tone` | `'neutral' \| 'warning' \| 'danger'` | `'neutral'` | 视觉语义；warning/danger 缺 Token |
| `confirmText` | `string` | **必填** | 确认按钮文本 |
| `cancelText` | `string` | `'取消'` | 取消按钮文本 |
| `onConfirm` | `() => void` | **必填** | 确认回调 |
| `onCancel` | `() => void` | — | 取消回调 |
| `loading` | `boolean` | `false` | 确认中；两个按钮禁用、显示 Spinner |
| `confirmDisabled` | `boolean` | `false` | 仅确认禁用 |
| `cancelDisabled` | `boolean` | `false` | 仅取消禁用 |
| `initialFocus` | `'confirm' \| 'cancel'` | `'cancel'` | 初始焦点 |
| `closeOnEscape` | `boolean` | `false` | 默认不可 Escape |
| `closeOnOutsideClick` | `boolean` | `false` | 默认不可外部关闭 |
| `portalContainer` | `HTMLElement \| null` | body | Portal 容器 |

```tsx
import type { HTMLAttributes, ReactNode } from 'react';

export interface AlertDialogProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  tone?: 'neutral' | 'warning' | 'danger';
  confirmText: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  loading?: boolean;
  confirmDisabled?: boolean;
  cancelDisabled?: boolean;
  initialFocus?: 'confirm' | 'cancel';
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  portalContainer?: HTMLElement | null;
}
```

## 4. 事件与状态

- `onConfirm`：点击确认时触发；随后组件请求关闭（发出 `onOpenChange(false)`），除非 `loading=true` 或 `confirmDisabled=true`。
- `onCancel`：点击取消或按 Escape/外部点击（若允许）时触发；随后请求关闭。
- 受控模式：所有关闭只是请求，父级必须更新 `open`。
- 异步确认：建议受控 `open` + `loading`；调用方在成功后设置 `open=false`，失败则保持打开并展示错误。组件不 await。
- 状态：Closed、Open、Confirming（loading）、Disabled。
- 快速双击确认：loading 或内部一次性守卫；不得重复触发 `onConfirm`。

## 5. 视觉

- 结构与 Dialog 相同；`tone="danger"` 的确认按钮使用 danger 语义色；取消为 ghost/outline。
- 危险动作的确认文本必须是动词（“删除”“作废”），不使用“确定”。
- 不默认聚焦确认；危险操作默认聚焦取消。
- 警告图标可使用内部图标，但必须有文本标题；不能仅靠颜色/图标。
- 不提供右上角关闭按钮。

## 6. 组合与扩展

- 删除确认：`tone="danger"` + `confirmText="删除"` + 说明影响范围。
- 可撤销操作：优先 Toast + 撤销，不要用 AlertDialog 强迫确认。
- 需要输入验证：使用 Dialog + FormField，不在此组件内嵌输入。
- 需要更多操作：使用 Dialog 自定义 footer，不扩展 AlertDialog 为多按钮。

## 7. 无障碍

- `role="alertdialog"`、`aria-modal`、`aria-labelledby`、`aria-describedby`。
- 焦点陷阱；初始焦点默认取消；关闭后焦点返回触发元素。
- 默认不响应 Escape/外部点击；用户必须明确选择。若业务要求可 Escape，显式开启并确保有取消路径。
- 两个按钮都是原生 button；loading 时 `aria-busy`，确认按钮名称保持可读。
- 说明文本应描述后果；不要只写“确定吗？”。
- 背景 inert/aria-hidden；滚动锁。

## 8. 示例

```tsx
<AlertDialog
  open={open}
  onOpenChange={setOpen}
  tone="danger"
  title="作废此档案？"
  description="作废后编号将保留，但内容不再对外提供。此操作不可撤销。"
  confirmText="作废"
  onConfirm={archive.delete}
  onCancel={() => setOpen(false)}
/>

<AlertDialog
  open={open}
  onOpenChange={setOpen}
  loading={saving}
  title="确认移交？"
  confirmText="移交"
  onConfirm={() => {
    setSaving(true);
    transfer().then(() => setOpen(false)).finally(() => setSaving(false));
  }}
/>
```

## 9. 边界情况

- `loading=true`：两个按钮禁用，焦点留在对话框内；仍可读说明。
- `onConfirm` 抛错：组件不捕获；调用方负责错误展示。
- 非受控 + 异步确认：确认后会立即关闭；若请求失败需重新打开。文档明确不推荐，使用受控。
- 确认文本为空：开发环境报错；动作不可无名称。
- 取消文本为空：允许，但按钮仍必须有可访问名称。
- 快速双击：确认回调只触发一次；loading 状态应尽快反映。
- 受控 open 不更新：保持打开；即使发出关闭请求。
- 同时 cancelDisabled 与 closeOnEscape=true：Escape 仍可关闭，需调用方保证有退出路径。

## 10. 依赖与实现注意

- 依赖 Dialog 的内部结构或共享模态基础设施；不重复实现焦点陷阱。
- 使用 Button 与 Spinner；图标为内部资源。
- `tone="danger"` 依赖缺失状态 Token；在 Token 补齐前不得用 accent 冒充“危险”并标记完成。
- 不把确认逻辑放进组件；组件不执行删除/请求。
