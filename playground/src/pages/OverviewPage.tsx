import { Panel } from 'archive-ui-react';

export function OverviewPage() {
  return (
    <div className="pg-page">
      <Panel title="Overview" corners material="paper">
        <p>
          archive-ui-react 是一套面向复古档案、古典出版物与神秘学视觉气质的 React 组件库，
          目标是提供统一设计语言的可组合组件与视觉系统，而不是一层简单的配色皮肤。
        </p>
        <p>
          本 Playground 直接引用组件库源码与真实样式入口
          （<code>archive-ui-react/style.css</code>），
          用于开发期验证组件、材质、装饰与主题变量的实际效果。
        </p>
      </Panel>
      <Panel title="设计原则">
        <ul>
          <li>Design Tokens 优先：颜色、字体、间距、边框、阴影统一由 Token 管理。</li>
          <li>主题由纯 CSS Variables 驱动，通过 data-theme 属性切换。</li>
          <li>组件样式使用 au- 前缀命名，不污染宿主项目。</li>
          <li>纹理、装饰等静态资源随 npm 包发布，不依赖开发环境路径。</li>
        </ul>
      </Panel>
    </div>
  );
}
