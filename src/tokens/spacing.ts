/** 间距、圆角、边框宽度 Token。 */
export const spacing = {
  space: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  radius: {
    small: '2px',
    medium: '4px',
    large: '8px',
  },
  borderWidth: {
    thin: '1px',
    medium: '2px',
  },
} as const;

export type SpacingTokens = typeof spacing;
