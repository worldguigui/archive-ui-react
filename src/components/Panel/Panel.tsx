import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

export type PanelMaterial = 'plain' | 'paper' | 'film';

export interface PanelProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** 面板标题，显示在头部区域。 */
  title?: ReactNode;
  /** 面板底部区域内容。 */
  footer?: ReactNode;
  /**
   * 表面材质。plain 为纯色表面（轻微颗粒、无暗角）；
   * paper 叠加纸张纹理（纤维/颗粒/斑驳）与轻暗角；
   * film 叠加胶片颗粒簇与镜头暗角（展示型卡片用）。
   */
  material?: PanelMaterial;
  /** 是否显示四角装饰。 */
  corners?: boolean;
}

/**
 * Panel：复古档案风格的面板容器，本组件主要用于验证
 * 组件库的完整工程链路（Props 类型、CSS 加载、材质、资源打包），
 * 不代表最终确定的组件 API 与视觉规范。
 */
export function Panel({
  title,
  footer,
  material = 'plain',
  corners = false,
  className,
  children,
  ...rest
}: PanelProps) {
  return (
    <section
      className={cn(
        'au-panel',
        `au-material--${material}`,
        corners && 'au-panel--corners',
        className,
      )}
      {...rest}
    >
      {corners && (
        <>
          <span className="au-panel__corner au-panel__corner--top-left" aria-hidden="true" />
          <span className="au-panel__corner au-panel__corner--top-right" aria-hidden="true" />
          <span className="au-panel__corner au-panel__corner--bottom-left" aria-hidden="true" />
          <span className="au-panel__corner au-panel__corner--bottom-right" aria-hidden="true" />
        </>
      )}
      {title !== undefined && (
        <header className="au-panel__header">
          <h3 className="au-panel__title">{title}</h3>
        </header>
      )}
      <div className="au-panel__content">{children}</div>
      {footer !== undefined && <footer className="au-panel__footer">{footer}</footer>}
    </section>
  );
}
