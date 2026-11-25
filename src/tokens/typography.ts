/**
 * 字体 Token —— 四类字体角色，与 src/styles/tokens/typography.css 对应。
 * 首版使用系统字体栈，自带字体文件为后续计划。
 */
export const typography = {
  fontFamily: {
    /** 展示衬线：大标题、章节名称 */
    display:
      "'Palatino Linotype', 'Book Antiqua', Georgia, 'Times New Roman', 'Songti SC', 'SimSun', serif",
    /** 编辑衬线：正文、故事性内容 */
    editorial: "Georgia, 'Times New Roman', 'Songti SC', 'SimSun', serif",
    /** UI 无衬线：表单、按钮、密集信息 */
    ui: "system-ui, -apple-system, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    /** 等宽数字：编号、时间、统计 */
    numeric: "ui-monospace, 'Cascadia Mono', Consolas, 'Courier New', monospace",
  },
  fontSize: {
    display: '3rem',
    heading: '1.75rem',
    title: '1.25rem',
    body: '0.9375rem',
    caption: '0.75rem',
  },
  fontWeight: {
    regular: 400,
    bold: 700,
  },
  letterSpacing: {
    display: '0.12em',
    heading: '0.08em',
    label: '0.16em',
  },
  lineHeight: {
    tight: 1.35,
    normal: 1.6,
    editorial: 1.85,
  },
} as const;

export type TypographyTokens = typeof typography;
