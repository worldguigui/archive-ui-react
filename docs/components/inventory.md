# 组件清单与职责定义

> 状态：阶段一草案。共 56 个候选组件。类型按 `api-conventions.md` §2 定义。
> “公开状态”为建议，最终以 `consistency-review.md` 与 `open-questions.md` 的裁决为准。

## M1 · 基础组件（10）

| 组件 | 类型 | 公开状态 | 核心职责 | 文档 |
| --- | --- | --- | --- | --- |
| Button | Primitive | 公开草案 | 有可见文本的操作/提交按钮 | [button.md](./general/button.md) |
| IconButton | Primitive | 公开草案 | 纯图标操作，必须有可访问名称 | [icon-button.md](./general/icon-button.md) |
| Typography | Foundation | 公开草案 | 四角色字体与有限排版变体 | [typography.md](./general/typography.md) |
| Badge | Primitive | 公开草案 | 计数/圆点状态标记 | [badge.md](./general/badge.md) |
| Tag | Primitive | 公开草案 | 分类/状态标签，可带移除 | [tag.md](./general/tag.md) |
| Divider | Primitive | 公开草案 | 结构线/装饰线分隔 | [divider.md](./general/divider.md) |
| Spinner | Primitive | 公开草案 | 不确定进度指示 | [spinner.md](./general/spinner.md) |
| Skeleton | Primitive | 公开草案 | 加载占位骨架 | [skeleton.md](./general/skeleton.md) |
| Avatar | Primitive | 公开草案 | 图片/首字母/错误回退的身份头像 | [avatar.md](./general/avatar.md) |
| Tooltip | Composite | 公开草案 | hover/focus 的补充文本浮层 | [tooltip.md](./general/tooltip.md) |

## M2 · 表单组件（10 + RadioGroup 建议新增）

| 组件 | 类型 | 公开状态 | 核心职责 | 文档 |
| --- | --- | --- | --- | --- |
| Input | Primitive | 公开草案 | 原生单行文本输入 + 装饰槽 | [input.md](./form/input.md) |
| Textarea | Primitive | 公开草案 | 原生多行文本输入 | [textarea.md](./form/textarea.md) |
| Checkbox | Primitive | 公开草案 | 布尔多选 + 半选 | [checkbox.md](./form/checkbox.md) |
| Radio | Primitive | 公开草案（需 Group） | 互斥选项；必须由 RadioGroup 管理 | [radio.md](./form/radio.md) |
| RadioGroup | Composite | **待确认新增** | 管理 name/value/键盘/状态 | [radio.md](./form/radio.md) |
| Switch | Primitive | 公开草案 | 即时生效的开/关状态 | [switch.md](./form/switch.md) |
| Select | Composite | 公开草案 | 自定义外观的单选 listbox + 隐藏 input | [select.md](./form/select.md) |
| NumberInput | Primitive | 公开草案 | 数值输入/步进/边界 | [number-input.md](./form/number-input.md) |
| Slider | Primitive | 公开草案 | 单值范围选择 | [slider.md](./form/slider.md) |
| DatePicker | Composite | 公开草案 | 本地日历日期选择（`YYYY-MM-DD`） | [date-picker.md](./form/date-picker.md) |
| FormField | Composite | 公开草案 | 标签/描述/错误与控件关联 | [form-field.md](./form/form-field.md) |

## M3 · 反馈与浮层（9）

| 组件 | 类型 | 公开状态 | 核心职责 | 文档 |
| --- | --- | --- | --- | --- |
| Dialog | Composite | 公开草案 | 通用模态对话框 | [dialog.md](./feedback/dialog.md) |
| AlertDialog | Composite | 公开草案 | 必须明确确认/取消的模态 | [alert-dialog.md](./feedback/alert-dialog.md) |
| Popover | Composite | 公开草案 | 非模态任意内容浮层 | [popover.md](./feedback/popover.md) |
| DropdownMenu | Composite | 公开草案 | trigger 打开的菜单浮层 | [dropdown-menu.md](./feedback/dropdown-menu.md) |
| ContextMenu | Composite | 公开草案 | 指针位置打开的菜单 | [context-menu.md](./feedback/context-menu.md) |
| Toast | Composite/System | **待确认新增 Provider** | 瞬时通知队列 + live region | [toast.md](./feedback/toast.md) |
| Alert | Composite | 公开草案 | 内联持久的提示/警告/错误 | [alert.md](./feedback/alert.md) |
| Progress | Primitive | 公开草案 | 确定/不确定进度 | [progress.md](./feedback/progress.md) |
| Accordion | Composite | 公开草案 | 可展开/收起的内容区块 | [accordion.md](./feedback/accordion.md) |

## M3 · 导航（6）

| 组件 | 类型 | 公开状态 | 核心职责 | 文档 |
| --- | --- | --- | --- | --- |
| Tabs | Composite | 公开草案 | 同页互斥视图切换 | [tabs.md](./navigation/tabs.md) |
| Breadcrumb | Composite | 公开草案 | 层级路径导航 | [breadcrumb.md](./navigation/breadcrumb.md) |
| Pagination | Composite | 公开草案 | 数据集分页 | [pagination.md](./navigation/pagination.md) |
| Menu | Composite | 公开草案 | 常驻命令菜单 | [menu.md](./navigation/menu.md) |
| NavigationMenu | Composite | 公开草案 | 站点级导航 + 浮层面板 | [navigation-menu.md](./navigation/navigation-menu.md) |
| Steps | Composite | 公开草案 | 流程阶段与当前进度 | [steps.md](./navigation/steps.md) |

## M3 · 数据展示（10）

| 组件 | 类型 | 公开状态 | 核心职责 | 文档 |
| --- | --- | --- | --- | --- |
| Card | Composite | 公开草案 | 媒体/标题/描述/操作的内容卡片 | [card.md](./data-display/card.md) |
| Panel | Composite | **现有验证组件正式化** | 带材质/标题/页脚的区域表面 | [panel.md](./data-display/panel.md) |
| List | Composite | 公开草案 | 一维同构内容/链接列表 | [list.md](./data-display/list.md) |
| Table | Composite | 公开草案 | 二维数据、列定义、选择/排序状态 | [table.md](./data-display/table.md) |
| Timeline | Composite | 公开草案 | 时间序列事件 | [timeline.md](./data-display/timeline.md) |
| Empty | Primitive | 公开草案 | 无数据状态 | [empty.md](./data-display/empty.md) |
| Descriptions | Composite | 公开草案 | 标签—值对 | [descriptions.md](./data-display/descriptions.md) |
| Image | Primitive | 公开草案 | 比例/处理/图注/回退图片 | [image.md](./data-display/image.md) |
| Statistic | Composite | 公开草案 | 单值指标 + 格式化/趋势 | [statistic.md](./data-display/statistic.md) |
| Tree | Composite | 公开草案 | 层级展开/单选 | [tree.md](./data-display/tree.md) |

## M4 · 档案特色（11）

| 组件 | 类型 | 公开状态 | 核心职责 | 文档 |
| --- | --- | --- | --- | --- |
| ArchiveCard | Archive | 公开草案 | 固定档案字段的记录卡 | [archive-card.md](./archive/archive-card.md) |
| ArchivePanel | Archive | 公开草案 | 卷宗/章节容器 | [archive-panel.md](./archive/archive-panel.md) |
| ArchiveHeader | Archive | 公开草案 | 可复用档案头部 | [archive-header.md](./archive/archive-header.md) |
| ArchiveMetadata | Archive | 公开草案（建议 Descriptions 预设） | 档案字段键值对 | [archive-metadata.md](./archive/archive-metadata.md) |
| ArchiveStamp | Archive | 公开草案 | 状态印章 | [archive-stamp.md](./archive/archive-stamp.md) |
| ArchiveLabel | Archive | **待确认：建议并入 Tag** | 非交互档案编号/分类标签 | [archive-label.md](./archive/archive-label.md) |
| ArchiveCover | Archive | 公开草案 | 封面图 + 标题/印章/遮罩 | [archive-cover.md](./archive/archive-cover.md) |
| ArchiveIndex | Archive | 公开草案 | 编目索引/目录 | [archive-index.md](./archive/archive-index.md) |
| ImageLayer | Archive（视觉能力） | **待确认：建议内部化** | 图片处理叠加层 | [image-layer.md](./archive/image-layer.md) |
| FilmFrame | Archive（视觉能力） | **待确认：建议内部化** | 胶片齿孔画框 | [film-frame.md](./archive/film-frame.md) |
| PaperSheet | Archive（视觉能力） | **待确认：建议内部化** | paper 纸张表面预设 | [paper-sheet.md](./archive/paper-sheet.md) |

## 统计

| 类别 | 数量 |
| --- | --- |
| 候选组件 | 56 |
| 建议公开草案 | 52（含 Panel 正式化与 ArchiveMetadata 预设） |
| 待确认新增 | 2（RadioGroup、ToastProvider/useToast） |
| 待确认合并/内部化 | 4（ArchiveLabel、ImageLayer、FilmFrame、PaperSheet） |
| 现有组件正式化 | 1（Panel） |
| 建议保留但降级实现 | 1（ArchiveMetadata） |

> 数量说明：RadioGroup 与 ToastProvider 不在原始 56 个候选名单中，但分别是 Radio 与 Toast 的必要依赖；ArchiveLabel/ImageLayer/FilmFrame/PaperSheet 仍计入候选清单，状态为待确认。
