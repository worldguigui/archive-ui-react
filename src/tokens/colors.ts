/**
 * 颜色 Token。
 *
 * 与 src/styles/themes/default.css 中的 CSS Variables 保持一一对应。
 * TS 侧用于需要在脚本中读取设计值的场景（如 Playground 主题编辑器）。
 * 组件样式一律通过 CSS Variables 引用，不直接使用此处数值。
 */
export const colors = {
  background: '#f1eadb',
  surface: '#f7f1e3',
  surfacePaper: '#efe6cf',
  text: '#352d25',
  textMuted: '#7a6f5d',
  border: '#a99b82',
  accent: '#8c3b2e',
  shadow: 'rgba(53, 45, 37, 0.18)',
} as const;

export type ColorTokens = typeof colors;

export const darkColors = {
  background: '#29251f',
  surface: '#322d26',
  surfacePaper: '#2e2922',
  text: '#e5dccb',
  textMuted: '#a3967f',
  border: '#766b59',
  accent: '#b5533f',
  shadow: 'rgba(0, 0, 0, 0.4)',
} as const;
