import { describe, expect, it } from 'vitest';
import { colors, darkColors, spacing, typography } from '../../src/tokens';

describe('color tokens', () => {
  it('亮色与暗色颜色 token 是合法的颜色值', () => {
    for (const value of [...Object.values(colors), ...Object.values(darkColors)]) {
      expect(value).toMatch(/^#[0-9a-fA-F]{6}$|^rgba?\(/);
    }
  });
});

describe('spacing tokens', () => {
  it('间距 token 使用 rem 单位', () => {
    for (const value of Object.values(spacing.space)) {
      expect(value.endsWith('rem')).toBe(true);
    }
  });

  it('圆角 token 使用 px 单位', () => {
    for (const value of Object.values(spacing.radius)) {
      expect(value.endsWith('px')).toBe(true);
    }
  });
});

describe('typography tokens', () => {
  it('字号 token 使用 rem 单位', () => {
    for (const value of Object.values(typography.fontSize)) {
      expect(value.endsWith('rem')).toBe(true);
    }
  });
});
