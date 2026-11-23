import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Panel } from '../../src/components/Panel';

describe('Panel', () => {
  it('渲染标题与内容', () => {
    render(<Panel title="卷宗">内容文本</Panel>);
    expect(screen.getByText('卷宗')).toBeInTheDocument();
    expect(screen.getByText('内容文本')).toBeInTheDocument();
  });

  it('根节点使用 au- 前缀 class', () => {
    const { container } = render(<Panel>内容</Panel>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.classList.contains('au-panel')).toBe(true);
  });

  it('paper 材质叠加材质 class 与纹理层', () => {
    const { container } = render(<Panel material="paper">内容</Panel>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.classList.contains('au-material--paper')).toBe(true);
  });

  it('corners 开启时渲染四个角饰元素', () => {
    const { container } = render(<Panel corners>内容</Panel>);
    expect(container.querySelectorAll('.au-panel__corner')).toHaveLength(4);
  });

  it('合并外部传入的 className 并透传 HTML 属性', () => {
    const { container } = render(
      <Panel className="custom-panel" data-testid="panel">
        内容
      </Panel>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.classList.contains('custom-panel')).toBe(true);
    expect(root.dataset.testid).toBe('panel');
  });

  it('渲染 footer 区域', () => {
    render(<Panel footer="档案编号 001">内容</Panel>);
    expect(screen.getByText('档案编号 001')).toBeInTheDocument();
  });
});
