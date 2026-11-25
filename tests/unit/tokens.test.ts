import { describe, expect, it } from 'vitest';
import { primitives, semanticDark, semanticLight, spacing, typography } from '../../src/tokens';

describe('color primitives', () => {
  it('原始色板是合法的十六进制颜色值', () => {
    for (const value of Object.values(primitives)) {
      expect(value).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

describe('semantic colors', () => {
  it('暗色与亮色主题的语义键结构一致', () => {
    expect(Object.keys(semanticDark).sort()).toEqual(Object.keys(semanticLight).sort());
  });

  it('语义色是合法的颜色值', () => {
    for (const value of [...Object.values(semanticDark), ...Object.values(semanticLight)]) {
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

  it('字距 token 使用 em 单位', () => {
    for (const value of Object.values(typography.letterSpacing)) {
      expect(value.endsWith('em')).toBe(true);
    }
  });
});
