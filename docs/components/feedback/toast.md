# Toast

> 状态：草案（阶段一）· 需人工审核。M3 反馈与浮层。
> **公开入口**：`ToastProvider` + `useToast`（建议新增，待确认）。Toast 展示项本身不作为独立公开组件。

## 1. 职责

在不打断当前操作的情况下，短暂提示操作结果或状态。它解决的是“操作成功/失败需要反馈，但不值得对话框”的问题。

**使用场景**：保存成功、后台任务完成、可撤销操作、非阻塞错误。
**不适用**：必须确认的决策（用 AlertDialog）；需要持续展示的页面级警告（用 Alert）；表单字段错误（用 FormField）；不可错过的关键错误（需持久 Alert/页面提示）。
**区别**：Toast 是瞬时、叠加、可自动消失的；Alert 是内联持久的；Dialog 是模态的。

## 2. 边界

- 不提供全局单例；必须由 `ToastProvider` 作用域管理，避免 SSR/多根问题。
- 不内置撤销业务；`action` 只提供按钮，调用方实现撤销。
- 不阻塞交互、不抢焦点。
- 不做通知中心/历史记录；Toast 消失即丢失。
- 不自动把危险错误设为 `assertive`；由 `tone` 与调用方决定，避免过度播报。

## 3. API

```ts
import type { ReactNode } from 'react';
import type { FeedbackTone } from '../api-conventions';

export interface ToastOptions {
  id?: string;
  title: ReactNode;
  description?: ReactNode;
  tone?: FeedbackTone;          // 默认 neutral
  duration?: number;            // 默认 provider duration；0 = 持久
  dismissible?: boolean;        // 默认 true
  action?: { label: ReactNode; onClick: () => void };
  onClose?: () => void;
}

export interface ToastProviderProps {
  children: ReactNode;
  placement?: 'top-left' | 'top-right' | 'top-center'
    | 'bottom-left' | 'bottom-right' | 'bottom-center';
  max?: number;                 // 默认 5
  duration?: number;            // 默认 5000ms
  pauseOnHover?: boolean;       // 默认 true
  portalContainer?: HTMLElement | null;
}

export interface ToastApi {
  show(options: ToastOptions): string;
  dismiss(id: string): void;
  clear(): void;
}

export function useToast(): ToastApi;
```

- `show` 返回稳定 id；相同 id 再次 show 应更新原 Toast 而非重复堆叠（建议行为）。
- `dismiss` 立即移除并触发 `onClose`；`clear` 移除全部。
- Provider 外部调用 `useToast`：开发环境报错，生产环境抛错或 no-op（需统一，建议抛错）。

## 4. 行为与状态

- 自动消失：默认 5000ms；`duration=0` 持久；鼠标悬停/焦点在 Toast 内时暂停计时（`pauseOnHover`）。
- 超过 `max`：移除最旧的非持久 Toast；持久 Toast 不自动移除。
- 状态：Entering、Visible、Paused、Leaving、Removed。
- 快速连续 show：队列/堆叠受 `max` 限制；不抖动。
- 异步：不等待 Promise；调用方在操作结果后 show。
- 切换页面/Provider 卸载：清理计时器与 DOM。

## 5. 视觉

- 小尺寸 plain 表面、hairline 边框、`--au-shadow-deep`；宽度建议 320px。
- tone 通过左侧/顶部标记或图标表达，同时保留文本；不能只靠颜色。
- 标题使用 UI 字体加粗；描述使用 secondary；action 为文字按钮或小 Button。
- 关闭按钮为 IconButton ghost；不占用标题空间。
- 进入/退出淡入 + 轻微位移；尊重 reduced motion；自动消失前不闪烁。
- 多个 Toast 堆叠间距一致；不覆盖页面关键操作（固定角落）。

## 6. 组合与扩展

- 可撤销：`action={{ label: '撤销', onClick: undo }}`；同时 `duration` 可适当延长。
- 错误：使用 `tone="danger"`，但仍建议在页面内保留可追溯错误（Toast 会消失）。
- 不使用 Toast 承载唯一必要信息；关键状态需在页面内可见。
- 不提供 `Toast` 展示组件给调用方；如确需自定义渲染，需另立 render API（当前不做）。

## 7. 无障碍

- Provider 渲染固定 live region；普通消息 `role="status"` / `aria-live="polite"`；危险消息可选 `role="alert"` / `assertive`（需明确策略，避免同一消息双重播报）。
- 每个 Toast 的标题是主要播报内容；描述可一并播报。
- 不抢焦点；操作按钮可通过键盘到达，但不自动聚焦。
- 关闭按钮有名称（“关闭通知”）；action 有清晰动作文本。
- 暂停计时仅在 hover/focus 时；键盘用户不应因快速消失而无法操作。
- reduced motion：关闭位移动画；自动消失时间不缩短。

## 8. 示例

```tsx
// App 根部
<ToastProvider placement="bottom-right">
  <App />
</ToastProvider>

// 业务组件
const toast = useToast();

toast.show({ title: '档案已归档', tone: 'success' });

toast.show({
  title: '归档失败',
  description: '网络连接中断，请稍后重试。',
  tone: 'danger',
  duration: 0,
});

toast.show({
  title: '已移入回收站',
  action: { label: '撤销', onClick: undo },
});
```

## 9. 边界情况

- Provider 缺失：开发环境报错；不静默丢弃。
- id 重复：更新已有 Toast，重置计时（建议）；不堆叠两个同 id。
- duration 为负：按 0（持久）并警告。
- 标题为空：开发环境警告；Toast 不应无内容。
- 多条同时展示：max 限制；不覆盖关闭按钮。
- 页面失焦/后台标签：计时暂停或继续需统一；建议继续，但恢复时重新计算剩余时间。
- Provider 卸载：清理所有计时器，不调用已卸载组件。
- SSR：首次渲染不挂载 Portal/live region；水合后挂载。
- 多个 Provider：各自独立队列；不共享全局；调用方需避免重复。

## 10. 依赖与实现注意

- 依赖 OverlayPortal、LayerStack、IconButton、内部图标、Presence。
- live region 与 Toast 项分离：不要让每次 Toast 卸载都移除整个 region。
- 计时器使用可暂停的剩余时间，不使用简单 setTimeout 后无法恢复。
- 不把 Toast 队列放进模块级全局变量；使用 Provider context。
- 状态色 Token 缺口同样影响成功/警告/错误配色。
