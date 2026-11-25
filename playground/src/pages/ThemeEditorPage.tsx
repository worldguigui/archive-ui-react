import { useEffect, useState } from 'react';
import { Panel, semanticDark, semanticLight } from 'archive-ui-react';

interface ThemeVar {
  cssVar: string;
  label: string;
}

const EDITABLE_VARS: ThemeVar[] = [
  { cssVar: '--au-color-bg-canvas', label: 'bg-canvas' },
  { cssVar: '--au-color-bg-surface', label: 'bg-surface' },
  { cssVar: '--au-color-bg-elevated', label: 'bg-elevated' },
  { cssVar: '--au-color-text-primary', label: 'text-primary' },
  { cssVar: '--au-color-text-secondary', label: 'text-secondary' },
  { cssVar: '--au-color-border-subtle', label: 'border-subtle' },
  { cssVar: '--au-color-border-metal', label: 'border-metal' },
  { cssVar: '--au-color-border-lit', label: 'border-lit' },
  { cssVar: '--au-color-accent-primary', label: 'accent-primary' },
  { cssVar: '--au-color-accent-gold', label: 'accent-gold' },
];

type ThemeMode = 'dark' | 'light';

function toHexString(value: string | null, fallback: string): string {
  return value && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

function semanticOf(mode: ThemeMode) {
  return mode === 'light' ? semanticLight : semanticDark;
}

const SEMANTIC_VAR_MAP: Record<string, keyof typeof semanticDark> = {
  '--au-color-bg-canvas': 'bgCanvas',
  '--au-color-bg-surface': 'bgSurface',
  '--au-color-bg-elevated': 'bgElevated',
  '--au-color-text-primary': 'textPrimary',
  '--au-color-text-secondary': 'textSecondary',
  '--au-color-border-subtle': 'borderSubtle',
  '--au-color-border-metal': 'borderMetal',
  '--au-color-border-lit': 'borderLit',
  '--au-color-accent-primary': 'accentPrimary',
  '--au-color-accent-gold': 'accentGold',
};

function defaultsFor(mode: ThemeMode): Record<string, string> {
  const semantic = semanticOf(mode);
  return Object.fromEntries(
    EDITABLE_VARS.map(({ cssVar }) => [cssVar, semantic[SEMANTIC_VAR_MAP[cssVar]]]),
  );
}

/**
 * Theme Editor：验证纯 CSS Variables 主题机制。
 * 直接把颜色写入 document root 的内联变量，实时影响所有组件；
 * 不引入 React Theme Context，与组件库首版主题策略一致。
 */
export function ThemeEditorPage() {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [vars, setVars] = useState<Record<string, string>>(() => defaultsFor('dark'));

  // 切换明暗模式：重置内联变量并切换 data-theme 属性。
  useEffect(() => {
    const rootEl = document.documentElement;
    EDITABLE_VARS.forEach(({ cssVar }) => rootEl.style.removeProperty(cssVar));
    rootEl.dataset.theme = mode;
    setVars(defaultsFor(mode));
  }, [mode]);

  const handleChange = (cssVar: string, value: string) => {
    document.documentElement.style.setProperty(cssVar, value);
    setVars((prev) => ({ ...prev, [cssVar]: value }));
  };

  const resetVars = () => {
    const rootEl = document.documentElement;
    EDITABLE_VARS.forEach(({ cssVar }) => rootEl.style.removeProperty(cssVar));
    setVars(defaultsFor(mode));
  };

  return (
    <div className="pg-page">
      <h2 className="pg-heading">Theme Editor</h2>
      <div className="pg-toolbar">
        <button
          type="button"
          className="pg-btn"
          onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
        >
          切换到 {mode === 'dark' ? 'light（羊皮纸）' : 'dark（暗色档案）'} 模式
        </button>
        <button type="button" className="pg-btn" onClick={resetVars}>
          重置变量
        </button>
      </div>
      <div className="pg-grid pg-grid--editor">
        <div className="pg-editor">
          {EDITABLE_VARS.map(({ cssVar, label }) => (
            <label key={cssVar} className="pg-editor__row">
              <span className="pg-editor__name">{label}</span>
              <code className="pg-editor__var">{cssVar}</code>
              <input
                type="color"
                value={toHexString(vars[cssVar], semanticOf(mode)[SEMANTIC_VAR_MAP[cssVar]])}
                onChange={(e) => handleChange(cssVar, e.target.value)}
              />
            </label>
          ))}
        </div>
        <div className="pg-preview">
          <Panel title="实时预览" material="paper" corners footer="ARCHIVE / 001 · LIVE PREVIEW">
            <p>当前主题模式：{mode === 'dark' ? '暗色档案（默认）' : '亮色羊皮纸'}</p>
            <p>
              组件颜色全部来自语义层 CSS Variables，编辑左侧变量即可实时预览；
              语义层的修改不会影响 Primitive 层的原始色板。
            </p>
          </Panel>
          <Panel title="衬线与标注混排" corners>
            <p>
              正文使用编辑衬线角色（editorial），承担档案文本的文学气质；
              编号、时间与统计信息应使用等宽数字角色（numeric）。
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
