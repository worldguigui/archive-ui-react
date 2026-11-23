import { Panel } from 'archive-ui-react';

export function MaterialsPage() {
  return (
    <div className="pg-page">
      <h2 className="pg-heading">Materials</h2>
      <p className="pg-note">材质、纹理与装饰效果的调试区域，用于观察视觉图层叠加。</p>
      <div className="pg-grid">
        <Panel title="plain 表面">
          <p>纯色表面，无纹理叠加。</p>
        </Panel>
        <Panel title="paper 材质" material="paper" corners>
          <p>表面叠加纸张纹理（SVG noise），并带四角装饰与印章式标题色。</p>
        </Panel>
      </div>
    </div>
  );
}
