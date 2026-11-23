import { useEffect, useState } from 'react';
import { Panel, colors, darkColors } from 'archive-ui-react';

interface ThemeVar {
  cssVar: string;
  label: string;
}

const EDITABLE_VARS: ThemeVar[] = [
  { cssVar: '--au-color-background', label: 'background' },
  { cssVar: '--au-color-surface', label: 'surface' },
  { cssVar: '--au-color-surface-paper', label: 'surface (paper)' },
  { cssVar: '--au-color-text', label: 'text' },
  { cssVar: '--au-color-border', label: 'border' },
  { cssVar: '--au-color-accent', label: 'accent' },
];

type ThemeMode = 'light' | 'dark';

function toHexString(value: string | null, fallback: string): string {
  return value && /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
}

/**
 * Theme Editor：验证纯 CSS Variables 主题机制。
 * 直接把颜色写入 document root 的内联变量，实时影响所有组件；
 * 不引入 React Theme Context，与组件库首版主题策略一致。
 */
export function ThemeEditorPage() {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [vars, setVars] = useState<Record<string, string>>(() =>
    Object.fromEntries(EDITABLE_VARS.map(({ cssVar }) => [cssVar, colors.background])),
  );

  // 切换明暗模式：重置内联变量并切换 data-theme 属性。
  useEffect(() => {
    const rootEl = document.documentElement;
    const source = mode === 'light' ? colors : darkColors;
    Object.keys(vars).forEach((cssVar) => rootEl.style.removeProperty(cssVar));
    rootEl.dataset.theme = mode;
    const defaults: Record<string, string> = {
      '--au-color-background': source.background,
      '--au-color-surface': source.surface,
      '--au-color-surface-paper': source.surfacePaper,
      '--au-color-text': source.text,
      '--au-color-border': source.border,
      '--au-color-accent': source.accent,
    };
    setVars(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleChange = (cssVar: string, value: string) => {
    document.documentElement.style.setProperty(cssVar, value);
    setVars((prev) => ({ ...prev, [cssVar]: value }));
  };

  const resetVars = () => {
    const rootEl = document.documentElement;
    EDITABLE_VARS.forEach(({ cssVar }) => rootEl.style.removeProperty(cssVar));
    const source = mode === 'light' ? colors : darkColors;
    setVars({
      '--au-color-background': source.background,
      '--au-color-surface': source.surface,
      '--au-color-surface-paper': source.surfacePaper,
      '--au-color-text': source.text,
      '--au-color-border': source.border,
      '--au-color-accent': source.accent,
    });
  };

  return (
    <div className="pg-page">
      <h2 className="pg-heading">Theme Editor</h2>
      <div className="pg-toolbar">
        <button type="button" className="pg-btn" onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}>
          切换到 {mode === 'light' ? 'dark' : 'light'} 模式
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
                value={toHexString(vars[cssVar], mode === 'light' ? '#f1eadb' : '#29251f')}
                onChange={(e) => handleChange(cssVar, e.target.value)}
              />
            </label>
          ))}
        </div>
        <div className="pg-preview">
          <Panel title="实时预览" material="paper" corners footer="颜色修改立即生效，无需刷新">
            <p>当前主题模式：{mode}</p>
            <p>组件颜色全部来自 CSS Variables，编辑左侧变量即可实时预览。</p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
