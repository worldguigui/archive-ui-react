/**
 * 颜色 Token —— 与 src/styles/tokens/primitives.css、themes/default.css 保持一一对应。
 *
 * 两层结构：
 * - primitives：原始色板（组件不得直接使用）；
 * - semanticDark / semanticLight：语义映射，组件样式一律引用对应的 CSS Variables。
 * TS 侧仅用于脚本场景（如 Playground 主题编辑器）。
 */
export const primitives = {
  inkBlack: '#11100f',
  charcoal: '#1b1917',
  darkUmber: '#29221e',
  walnut: '#49372d',
  oxide: '#a65332',
  antiqueGold: '#b18a55',
  ember: '#fd9258',
  metalHi: '#c2a06b',
  metalLo: '#6d5237',
  metalMid: '#806744',
  parchment: '#d5c6a7',
  ivory: '#e8e0d1',
  fogBlue: '#667b89',
  moss: '#58604b',
  wine: '#542d2c',
  ash: '#89847a',
} as const;

export type ColorPrimitives = typeof primitives;

/** 暗色档案主题（默认）的语义色。 */
export const semanticDark = {
  bgCanvas: '#11100f',
  bgSurface: '#1b1917',
  bgElevated: '#29221e',
  textPrimary: '#e8e0d1',
  textSecondary: '#a99e8d',
  borderSubtle: '#49372d',
  borderMetal: '#806744',
  borderLit: '#fd9258',
  accentPrimary: '#a65332',
  accentGold: '#b18a55',
  overlay: 'rgba(17, 16, 15, 0.82)',
  shadow: 'rgba(0, 0, 0, 0.45)',
} as const;

/** 亮色羊皮纸主题（data-theme="light"）的语义色。 */
export const semanticLight = {
  bgCanvas: '#e9e2d2',
  bgSurface: '#f1ebdd',
  bgElevated: '#f8f3e7',
  textPrimary: '#29221e',
  textSecondary: '#6e6455',
  borderSubtle: '#c2b394',
  borderMetal: '#8a734f',
  borderLit: '#c25522',
  accentPrimary: '#a65332',
  accentGold: '#8a6b3e',
  overlay: 'rgba(41, 34, 30, 0.55)',
  shadow: 'rgba(53, 45, 37, 0.2)',
} as const;

export type SemanticColors = typeof semanticDark;
