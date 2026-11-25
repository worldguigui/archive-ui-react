import { Panel } from 'archive-ui-react';

export function OverviewPage() {
  return (
    <div className="pg-page">
      <Panel title="ARCHIVE UI · V0.1" corners material="paper" footer="A WORLD OF VINTAGE MYSTERY">
        <p>
          archive-ui-react 的设计语言「ARCHIVE UI」定位于复古未来主义编辑设计（Retro-Futurist
          Editorial）：将 20 世纪复古印刷品、古典编辑设计、装饰艺术与电影摄影融合进数字界面。
          界面不应是凭空生成的平整色块，而应像来自某种实体档案、旧书或历史文献。
        </p>
        <p>
          本 Playground 直接引用组件库源码与真实样式入口
          （<code>archive-ui-react/style.css</code>），
          用于校准色彩、材质、字体、装饰、光影与主题变量的实际效果。
        </p>
      </Panel>
      <Panel title="设计原则">
        <ul>
          <li>
            三层 Token：Primitive（原始值）→ Semantic（用途映射）→ 组件引用语义变量，
            组件不得硬编码视觉数值。
          </li>
          <li>色彩逻辑：低饱和、暗部带色相、高光偏暖灰白、强调色（锈橙/古金）集中使用。</li>
          <li>材质是界面的第二层视觉信息：暗部可感知，正文与交互区域克制。</li>
          <li>主题由纯 CSS Variables 驱动，通过 data-theme 属性切换（默认暗色档案）。</li>
          <li>组件样式使用 au- 前缀命名，不污染宿主项目。</li>
        </ul>
      </Panel>
    </div>
  );
}
