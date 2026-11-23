/**
 * 字体与字号 Token。
 *
 * 首版使用系统字体栈，不随包分发字体文件；
 * 后续引入自带字体时需放入 src/assets/fonts/ 并通过 CSS @font-face 引用。
 */
export const typography = {
  fontFamily: {
    body: 'Georgia, "Times New Roman", "Songti SC", "SimSun", serif',
    heading: 'Georgia, "Times New Roman", "Songti SC", "SimSun", serif',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.25rem',
    xl: '1.5rem',
  },
  fontWeight: {
    regular: 400,
    bold: 700,
  },
  lineHeight: {
    tight: 1.3,
    normal: 1.6,
  },
} as const;

export type TypographyTokens = typeof typography;
