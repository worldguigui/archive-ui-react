import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Panel } from 'archive-ui-react';

const MATERIALS = [
  { value: 'plain', label: 'plain · 平面' },
  { value: 'paper', label: 'paper · 纸张' },
  { value: 'film', label: 'film · 胶片' },
] as const;

type StudioMaterial = (typeof MATERIALS)[number]['value'];

/**
 * Materials：材质与光影校准实验台。
 * 滑杆只写两个语义响应系数（--au-texture-scale / --au-lighting-scale），
 * 各材质类负责"档位 × 系数 → 入口变量"的曲线计算，
 * 实验台不覆盖任何材质专属配置 —— 验证"改参数即改质感，无需改组件实现"。
 */
export function MaterialsPage() {
  const [material, setMaterial] = useState<StudioMaterial>('paper');
  const [texture, setTexture] = useState(50);
  const [lighting, setLighting] = useState(50);
  const previewRef = useRef<HTMLDivElement>(null);
  const [effective, setEffective] = useState({ grain: '—', vignette: '—' });

  const studioStyle = {
    '--au-texture-scale': (texture / 100).toFixed(2),
    '--au-lighting-scale': (lighting / 100).toFixed(2),
  } as CSSProperties;

  // 校准反馈：读取预览面板图层槽位实际解析出的不透明度
  useEffect(() => {
    const panel = previewRef.current?.querySelector('.au-panel');
    if (!panel) return;
    setEffective({
      grain: getComputedStyle(panel, '::before').opacity,
      vignette: getComputedStyle(panel, '::after').opacity,
    });
  }, [material, texture, lighting]);

  return (
    <div className="pg-page">
      <h2 className="pg-heading">Materials</h2>
      <p className="pg-note">
        材质校准台：滑杆是统一语义参数（纹理 / 光影），各材质对同一参数有各自的
        响应曲线与专属纹理资产 —— plain 为平面，paper 为纤维纸张，film 为感光胶片。
      </p>

      <section className="pg-studio">
        <Panel title="材质实验台" corners material="plain" footer="MATERIAL STUDIO · LIVE CALIBRATION">
          <div className="pg-studio__controls">
            <div className="pg-studio__row pg-studio__row--materials" role="group" aria-label="材质选择">
              <span className="pg-studio__label">材质</span>
              {MATERIALS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  className={value === material ? 'pg-btn pg-btn--active' : 'pg-btn'}
                  onClick={() => setMaterial(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="pg-studio__row">
              <span className="pg-studio__label">纹理强度</span>
              <input
                type="range"
                min={0}
                max={100}
                value={texture}
                onChange={(e) => setTexture(Number(e.target.value))}
              />
              <code className="pg-studio__value">{(texture / 100).toFixed(2)}</code>
            </label>
            <label className="pg-studio__row">
              <span className="pg-studio__label">光影强度</span>
              <input
                type="range"
                min={0}
                max={100}
                value={lighting}
                onChange={(e) => setLighting(Number(e.target.value))}
              />
              <code className="pg-studio__value">{(lighting / 100).toFixed(2)}</code>
            </label>
          </div>
        </Panel>

        <div ref={previewRef} className="pg-studio__preview">
          <Panel
            title="实时预览"
            corners
            material={material}
            style={studioStyle}
            footer={`SPECIMEN · ${material.toUpperCase()}`}
          >
            <p>
              降雨持续至午夜。观测员在第七次巡检中记录到钟楼的指针出现逆行现象，
              随后在档案编号 1999-07 的页边留下了无法辨认的批注。
            </p>
            <p>
              纸张的纤维与斑驳、胶片的银盐颗粒与镜头暗角 —— 材质的"物理缺陷"
              是复古质感的来源。切换材质，观察同一参数下的不同响应。
            </p>
          </Panel>
          <p className="pg-note pg-studio__readout">
            实际解析值：颗粒层 opacity = {effective.grain} · 暗角层 opacity = {effective.vignette}
          </p>
        </div>
      </section>

      <h3 className="pg-subheading">三级信息密度对照</h3>
      <p className="pg-note">
        同一视觉语言下的三个强度等级：功能面板克制、编辑面板有质感、展示面板有戏剧性。
        层级差异体现在材质、光影与装饰线上。
      </p>
      <div className="pg-grid pg-grid--tiers">
        <Panel title="运行日志" material="plain">
          <p>19:42 · 档案室湿度 61%，一切正常。</p>
          <p>20:15 · 第七排书架的灯管闪烁两次。</p>
        </Panel>
        <Panel title="档案摘录" material="paper" corners footer="ARCHIVE / 002 · EDITORIAL">
          <p>
            风暴过境后的清晨，城市把雨衣遗忘在栏杆上。
            修补匠说，钟表停摆不是因为零件，而是因为没有人记得上一个整点。
          </p>
        </Panel>
        <Panel
          title="绝密档案"
          material="film"
          corners
          className="pg-tier-showcase"
          footer="ARCHIVE / 000 · CLASSIFIED"
        >
          <p>
            编号 1999：回收对象为一只停摆的怀表。表盖内侧刻有至今无人认领的姓名。
            处理意见：封存，禁止上弦。
          </p>
        </Panel>
      </div>
    </div>
  );
}
