import { Panel } from 'archive-ui-react';

export function ComponentsPage() {
  return (
    <div className="pg-page">
      <h2 className="pg-heading">Components</h2>
      <div className="pg-grid">
        <Panel title="基础 Panel">
          <p>最小验证组件：标题 + 内容 + 底部区域。</p>
        </Panel>
        <Panel title="带 Footer" footer="archive-ui-react v0.1.0">
          <p>通过 footer 属性渲染底部说明区域。</p>
        </Panel>
        <Panel title="纸面材质" material="paper" corners>
          <p>material="paper" 叠加纸张纹理，corners 显示四角装饰。</p>
        </Panel>
        <Panel>
          <p>无标题的纯内容面板。</p>
        </Panel>
      </div>
    </div>
  );
}
