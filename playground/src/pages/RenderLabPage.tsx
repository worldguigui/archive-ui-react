import { useState, type CSSProperties } from 'react';
import { Panel } from 'archive-ui-react';
import paperGrain from '../../../src/assets/textures/paper-grain.svg';
import filmEmulsion from '../../../src/assets/textures/film-emulsion.webp';

/*
 * Render Lab —— 渲染实验室（docs/rendering-system.md · P0 骨架）。
 *
 * 与 Materials 校准台的分工：RenderLab 造资产、验渲染，Materials 校参数。
 * 因此本页允许直接写入口变量与内联图层（解剖与试制用途），
 * 不适用 Materials"实验台只写语义响应系数"的约束。
 *
 * 两种多图层技术在页内各验证一处：
 * - 图层沙盘：独立子元素 + mix-blend-mode + 单层 opacity（槽位架构的等价物）；
 * - 混合矩阵：多背景列表 + background-blend-mode（同槽多层的等价物）。
 */

const SOURCES = {
  paper: {
    short: 'paper-grain.svg',
    label: 'paper-grain.svg · 旧纸（v2，维护者重绘）',
    url: paperGrain,
    meta: '512 可平铺 · 氧化斑（age 渐变椭圆，含环绕副本）+ 明暗尘粒 · 消费槽位：Texture',
    status: '状态：v2 已入库 · paper 材质正式纹理',
    /** false = 可平铺（repeat + 宽定高随）；true = 整幅构图（cover 单幅居中，禁平铺） */
    integral: false,
  },
  filmEmulsion: {
    short: 'film-emulsion.webp',
    label: 'film-emulsion.webp · 底片乳剂亮度图（正式，暗版）',
    url: filmEmulsion,
    meta:
      '1285×565 裁自真实底片乳剂带 · 29KB WebP 灰度亮度图 · 均匀明度、无烘焙暗角（宏观光影归 L3）· ' +
      'multiply 混合 = 暗场 + 底色划痕 · 亮主题由主题层换用反转亮度图 film-emulsion-light.webp · cover 单幅，禁平铺',
    status: '状态：正式（C2 决议转正）· 消费槽位：Texture（film 材质）',
    integral: true,
  },
} as const;

type SourceId = keyof typeof SOURCES;
type LayerSource = SourceId | 'none';

const BLEND_MODES = ['normal', 'multiply', 'screen', 'overlay', 'soft-light', 'luminosity'] as const;
type BlendMode = (typeof BLEND_MODES)[number];

const BASES = [
  { label: '深底', value: 'var(--au-color-bg-elevated)' },
  { label: '纸底', value: 'var(--au-material-paper-base)' },
  { label: '胶片底', value: 'var(--au-material-film-base)' },
] as const;

const TILE_SIZES = ['128', '256', '512', 'cover'] as const;

interface LabLayer {
  source: LayerSource;
  blend: BlendMode;
  /** 0-100 的整数，渲染时除以 100 */
  opacity: number;
  tile: (typeof TILE_SIZES)[number];
}

const SLOT_MODES = [
  { id: 'all', label: '全部图层', texture: '1', lighting: '1' },
  { id: 'base', label: '仅 Base', texture: '0', lighting: '0' },
  { id: 'texture', label: '仅 Texture', texture: '1', lighting: '0' },
  { id: 'lighting', label: '仅 Lighting', texture: '0', lighting: '1' },
] as const;

type SlotMode = (typeof SLOT_MODES)[number]['id'];

/** 七、维度隔离归因 —— 五层渲染模型中可启停的维度。
 *  L1 Base（底色/氛围）是基底不可关闭；色彩与排版是贯穿性规范（用主题/灰度归因）；
 *  L5 交互态按需出现，均不设开关。 */
const DIM_CONTROLS = [
  { id: 'structure', label: 'L4 构成装饰', note: '边框 / 角饰 / 蚀刻线 / 烫金 / 页脚分隔' },
  { id: 'material', label: 'L2 材质纹理', note: '::before 颗粒层（底色保留）' },
  { id: 'lighting', label: 'L3 光影', note: '暗角 / 阴影 / 悬停辉光' },
] as const;

type DimControlId = (typeof DIM_CONTROLS)[number]['id'];

const DIM_MATERIALS = [
  { value: 'plain', label: 'plain' },
  { value: 'paper', label: 'paper' },
  { value: 'film', label: 'film' },
] as const;

/** 八、构成变体库（L4 草案）——边框 / 角饰 / 分隔线 / 印章的多样性试验。
 *  依据维度 04：一级母题（几何装饰、档案标记、编辑排版）与线条四级规范；
 *  pg-frame 草案类与装饰 span 即转正后的 DOM / class 形态样本。 */
const FRAME_VARIANTS = [
  { id: 'broken', name: '局部断开边界', note: '边线在四角断开，断口带定位刻度（结构线 + 定位线）' },
  { id: 'open', name: '不完整矩形轮廓', note: '对角完整 L，另两角短刻度暗示轮廓（编辑式留白）' },
  { id: 'symbol', name: '细线 + 边缘符号', note: '发丝线框 + 四边中点金属色菱形（装饰线分级）' },
  { id: 'caption', name: '文字融入边框', note: '上边线在编号牌位断开（档案标记母题 · numeric 字体）' },
  { id: 'emblem', name: '纹章落款', note: '右下签名纹章（Signature 素材，致敬性复用）' },
] as const;

const PATTERN_SPECS = [
  { id: 'stepped', name: '阶梯折线' },
  { id: 'nodes', name: '节点竖线' },
  { id: 'resonance', name: '谐振徽版' },
] as const;

/** 纹章样式：印章 / 徽记 / 签名同为纹章的样式分支（签名不单列）。
 *  kind: mask = 草案资产随语义色着色；image = Signature 素材保留笔迹原色。 */
const EMBLEM_SPECS = [
  { id: 'ring', name: '环形印章 · 自绘草案', kind: 'mask', cls: 'pg-seal pg-seal--lg' },
  { id: 'hex', name: '徽记 · 六边编结', kind: 'image', cls: 'pg-sig pg-sig--hex' },
  { id: 'star', name: '徽记 · 三角星芒', kind: 'image', cls: 'pg-sig pg-sig--star' },
  { id: 'sonetto', name: '纹章 · 签名 Sonetto', kind: 'image', cls: 'pg-sig pg-sig--sonetto' },
  { id: 'narkissos', name: '纹章 · 签名 Narkissos', kind: 'image', cls: 'pg-sig pg-sig--narkissos' },
] as const;

const CORNER_DESIGNS = [
  { id: 'base', name: '现状 · 基线' },
  { id: 'notched', name: '双线倒角 · 草案' },
  { id: 'arc', name: '圆弧刻度 · 草案' },
  { id: 'registration', name: '制图刻度 · 草案' },
] as const;

const DIVIDER_VARIANTS = [
  { id: 'etch', name: '蚀刻渐变线', note: '现状基线' },
  { id: 'double', name: '细双线', note: '主线 subtle + 副线 metal' },
  { id: 'dotted', name: '点线', note: '3px 点 / 9px 距' },
  { id: 'asymmetric', name: '长短错位线', note: '编辑式长线 + 右侧短线' },
] as const;

const CORNER_POSITIONS = ['tl', 'tr', 'bl', 'br'] as const;

/** 构成变体样品：基座 = au-panel + plain（构成先行），装饰 span 为转正后的 DOM 形态。 */
function FrameSpecimen({ spec }: { spec: (typeof FRAME_VARIANTS)[number] }) {
  return (
    <figure className="pg-lab__specimen">
      <section className={`au-panel au-material--plain pg-frame--${spec.id}`}>
        {spec.id === 'broken' && <span className="pg-orn pg-orn--lines-broken" aria-hidden="true" />}
        {spec.id === 'open' && <span className="pg-orn pg-orn--lines-open" aria-hidden="true" />}
        {spec.id === 'symbol' && (
          <>
            <span className="pg-orn pg-orn--sym pg-orn--sym-t" aria-hidden="true" />
            <span className="pg-orn pg-orn--sym pg-orn--sym-b" aria-hidden="true" />
            <span className="pg-orn pg-orn--sym pg-orn--sym-l" aria-hidden="true" />
            <span className="pg-orn pg-orn--sym pg-orn--sym-r" aria-hidden="true" />
          </>
        )}
        {spec.id === 'caption' && (
          <>
            <span className="pg-orn pg-orn--caption-lines" aria-hidden="true" />
            <span className="pg-orn pg-orn--caption">N°1999 / CLASSIFIED</span>
          </>
        )}
        {spec.id === 'emblem' && <span className="pg-orn pg-orn--sig-emblem" aria-hidden="true" />}
        <header className="au-panel__header">
          <h3 className="au-panel__title">{spec.name}</h3>
        </header>
        <div className="au-panel__content">
          <p>构成先行：在 plain 中性材质上检验边框语言本身的表现力。</p>
        </div>
        <footer className="au-panel__footer">FRAME DRAFT / {spec.id.toUpperCase()}</footer>
      </section>
      <figcaption className="pg-lab__caption">
        <strong>{spec.name}</strong>
        <span>{spec.note}</span>
      </figcaption>
    </figure>
  );
}

/** 材质样品陈列（正式材质的展示色块；paper 保留中调底色作 C3 对照线） */
const DRAFT_SPECIMENS = [
  {
    id: 'plain',
    name: 'plain · 哑光底材',
    asset: 'plain-matte.svg',
    intent: '各向同性微颗粒 + 低频纵深，无方向条纹；底色近中性深暖灰',
    confirm: '状态：已验收转正（决策 005 · C4）',
  },
  {
    id: 'paper',
    name: 'paper · 旧纸（对照线为中调羊皮纸）',
    asset: 'paper-grain.svg',
    intent: '色调多层承载：底色 + 灯光氛围 + 氧化斑纹理 + 轻暗角',
    confirm: '状态：已验收转正；正式底色为深棕 #332a23（决策 005 · C3），此处保留中调对照',
  },
  {
    id: 'film',
    name: 'film · 底片',
    asset: 'film-emulsion.webp（真实乳剂亮度图，明暗成对）',
    intent: 'multiply 混合：黑场压暗、划痕透出底色；镜头暗角归光影槽',
    confirm: '状态：已验收转正（决策 003 / 005 · C2）',
  },
] as const;

/** 沙盘图层列表 → 合成样式（独立子元素方案，逐层在 JSX 中渲染）。
 *  平铺尺寸按宽度定、高度随固有比例（横版资产不被压扁）；
 *  cover 单幅时居中锚定 —— 默认左上锚点会把溢出方向（构图底部）裁掉。 */
function layerStyle(layer: LabLayer): CSSProperties {
  if (layer.source === 'none') return { display: 'none' };
  const size = layer.tile === 'cover' ? 'cover' : `${layer.tile}px auto`;
  return {
    backgroundImage: `url("${SOURCES[layer.source].url}")`,
    backgroundSize: size,
    backgroundPosition: layer.tile === 'cover' ? 'center' : undefined,
    opacity: layer.opacity / 100,
    mixBlendMode: layer.blend,
  };
}

export function RenderLabPage() {
  const [slotMode, setSlotMode] = useState<SlotMode>('all');
  const [base, setBase] = useState<string>(BASES[1].value);
  const [layers, setLayers] = useState<LabLayer[]>([
    { source: 'filmEmulsion', blend: 'multiply', opacity: 100, tile: 'cover' },
    { source: 'paper', blend: 'soft-light', opacity: 35, tile: '512' },
  ]);

  const active = slotMode === 'all' || slotMode === 'texture';
  const lighting = slotMode === 'all' || slotMode === 'lighting';
  const slotStyle = {
    '--au-texture-scale': active ? '1' : '0',
    '--au-lighting-scale': lighting ? '1' : '0',
  } as CSSProperties;

  const updateLayer = (index: number, patch: Partial<LabLayer>) => {
    setLayers(layers.map((layer, i) => (i === index ? { ...layer, ...patch } : layer)));
  };

  // —— 七、维度隔离归因 ——
  // L2/L3 经响应系数置零（与槽位解构同一通道）；L4 走实验区 CSS 规则；
  // 色彩维度走主题切换与灰度对照，直接作用在样品容器上（custom properties 随子树继承）。
  const [dimsOn, setDimsOn] = useState<Record<DimControlId, boolean>>({
    structure: true,
    material: true,
    lighting: true,
  });
  const [dimMaterial, setDimMaterial] = useState<'plain' | 'paper' | 'film'>('paper');
  const [dimTheme, setDimTheme] = useState<'dark' | 'light'>('dark');
  const [dimGrayscale, setDimGrayscale] = useState(false);

  const dimStageClass = [
    'pg-dim__stage',
    !dimsOn.structure && 'pg-dim--no-structure',
    !dimsOn.lighting && 'pg-dim--no-lighting',
  ]
    .filter(Boolean)
    .join(' ');

  const dimStageStyle = {
    '--au-texture-scale': dimsOn.material ? '1' : '0',
    '--au-lighting-scale': dimsOn.lighting ? '1' : '0',
    filter: dimGrayscale ? 'grayscale(1)' : undefined,
  } as CSSProperties;

  return (
    <div className="pg-page">
      <h2 className="pg-heading">Render Lab</h2>
      <p className="pg-note">
        渲染实验室：美术资源研发与渲染验证的长期工具（见 docs/rendering-system.md）。
        分工 —— RenderLab 造资产、验渲染；Materials 校参数。
        当前阶段：background 基础美术风格的样品在本页试制，经确认后进入正式组件实现。
      </p>

      <section className="pg-lab">
        <h3 className="pg-subheading">一、资产目录</h3>
        <p className="pg-note">
          现有程序化纹理资产（美术资源层 · textures）。目录规划中尚有
          lighting / masks / ornaments / effects 四类，随 P3–P5 逐批建立。
        </p>
        <div className="pg-lab__assets">
          {(Object.keys(SOURCES) as SourceId[]).map((id) => (
            <div key={id} className="pg-lab__asset">
              <div
                className="pg-lab__asset-swatch"
                style={{ backgroundImage: `url("${SOURCES[id].url}")` }}
              />
              <code className="pg-lab__asset-name">{SOURCES[id].label}</code>
              <span className="pg-lab__asset-meta">{SOURCES[id].meta}</span>
              <span className="pg-lab__asset-meta pg-lab__asset-meta--status">{SOURCES[id].status}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="pg-lab">
        <h3 className="pg-subheading">二、槽位解构</h3>
        <p className="pg-note">
          Base / Texture / Lighting 三槽位逐层隔离观察。两个消费者并排：
          Panel 组件（正式槽位实现）与裸元素复刻（pg-lab__swatch，逐字复刻槽位消费规则）——
          验证"材质类只写变量，任何元素都能成为绘制方"的可移植性。
          切换通过语义响应系数（缩放置 0）实现，与 Materials 校准台同一通道。
        </p>
        <div className="pg-lab__controls-row">
          {SLOT_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              className={slotMode === mode.id ? 'pg-btn pg-btn--active' : 'pg-btn'}
              onClick={() => setSlotMode(mode.id)}
            >
              {mode.label}
            </button>
          ))}
        </div>
        <div className="pg-lab__anatomy" style={slotStyle}>
          <Panel material="paper" footer="SLOT ANATOMY · PANEL COMPONENT">
            <p>Panel 组件：底色（Base）+ 颗粒（::before 纹理槽）+ 暗角（::after 光影槽）。</p>
          </Panel>
          <figure className="pg-lab__specimen">
            <div className="pg-lab__swatch au-material--paper" />
            <figcaption className="pg-lab__caption">
              裸元素复刻：仅 material 类 + 槽位消费规则，无边框与文字干扰
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="pg-lab">
        <h3 className="pg-subheading">三、图层堆叠沙盘</h3>
        <p className="pg-note">
          P1"CSS 多图层叠加"的验证沙盘：每层可换图源 / 混合模式 / 透明度 / 平铺尺寸，
          独立子元素 + mix-blend-mode 实时合成（容器已建立隔离层叠上下文，混合不外泄）。
        </p>
        <div className="pg-lab__controls-row">
          <span className="pg-lab__label">底色</span>
          {BASES.map((item) => (
            <button
              key={item.label}
              type="button"
              className={base === item.value ? 'pg-btn pg-btn--active' : 'pg-btn'}
              onClick={() => setBase(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="pg-lab__sandbox">
          <div className="pg-lab__canvas" style={{ backgroundColor: base }}>
            {layers.map((layer, i) => (
              <div key={i} className="pg-lab__layer" style={layerStyle(layer)} />
            ))}
          </div>
          <div className="pg-lab__layer-controls">
            {layers.map((layer, i) => (
              <div key={i} className="pg-lab__layer-card">
                <code className="pg-lab__layer-title">图层 {i + 1}</code>
                <label className="pg-lab__control">
                  <span>图源</span>
                  <select
                    className="pg-lab__select"
                    value={layer.source}
                    onChange={(e) => updateLayer(i, { source: e.target.value as LayerSource })}
                  >
                    <option value="none">无</option>
                    {(Object.keys(SOURCES) as SourceId[]).map((id) => (
                      <option key={id} value={id}>
                        {SOURCES[id].short}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="pg-lab__control">
                  <span>混合</span>
                  <select
                    className="pg-lab__select"
                    value={layer.blend}
                    onChange={(e) => updateLayer(i, { blend: e.target.value as BlendMode })}
                  >
                    {BLEND_MODES.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="pg-lab__control">
                  <span>不透明度 {layer.opacity}%</span>
                  <input
                    className="pg-lab__range"
                    type="range"
                    min={0}
                    max={100}
                    value={layer.opacity}
                    onChange={(e) => updateLayer(i, { opacity: Number(e.target.value) })}
                  />
                </label>
                <label className="pg-lab__control">
                  <span>平铺</span>
                  <select
                    className="pg-lab__select"
                    value={layer.tile}
                    onChange={(e) => updateLayer(i, { tile: e.target.value as LabLayer['tile'] })}
                  >
                    {TILE_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size === 'cover' ? 'cover 覆盖（保持比例）' : `${size}px 宽 · 高随比例`}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pg-lab">
        <h3 className="pg-subheading">四、混合模式对照矩阵</h3>
        <p className="pg-note">
          同槽多层的等价技术：多背景列表 + background-blend-mode（纹理直接与元素底色混合，
          统一纸底、原生强度）。对照沙盘的 mix-blend-mode 结果，决定各槽位正式实现选型。
        </p>
        <div className="pg-lab__matrix">
          {(Object.keys(SOURCES) as SourceId[]).map((id) =>
            BLEND_MODES.map((mode) => (
              <figure key={`${id}-${mode}`} className="pg-lab__cell">
                <div
                  className="pg-lab__cell-canvas"
                  style={{
                    backgroundColor: 'var(--au-material-paper-base)',
                    backgroundImage: `url("${SOURCES[id].url}")`,
                    backgroundBlendMode: mode,
                    // 整幅构图资产（film SVG / 真实底片照片）不可平铺（见资产文件头约束），
                    // cover 单幅居中；paper 为可平铺纹理，保持类上的平铺形态
                    ...(SOURCES[id].integral
                      ? {
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                        }
                      : {}),
                  }}
                />
                <figcaption className="pg-lab__caption">
                  {id} · {mode}
                </figcaption>
              </figure>
            )),
          )}
        </div>
      </section>

      <section className="pg-lab">
        <h3 className="pg-subheading">五、材质样品区（正式材质 · 陈列）</h3>
        <p className="pg-note">
          三材质无干扰色块陈列（参数明细见 docs/materials/）。
          paper 色块保留中调羊皮纸底色，作为正式深棕底（决策 005 · C3）的对照线；
          其余色块值与正式材质类一致。
        </p>
        <div className="pg-lab__specimens">
          {DRAFT_SPECIMENS.map((specimen) => (
            <figure key={specimen.id} className="pg-lab__specimen">
              <div className={`pg-draft__swatch pg-draft--${specimen.id}`} />
              <figcaption className="pg-lab__caption">
                <strong>{specimen.name}</strong>
                <span>{specimen.asset}</span>
                <span>{specimen.intent}</span>
                <span className="pg-lab__caption-target">{specimen.confirm}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="pg-lab">
        <h3 className="pg-subheading">六、跨组件复用检查</h3>
        <p className="pg-note">
          验收同一贴图跨组件复用（Panel / Card / Dialog 同光照贴图对照）。
          Card、Dialog 组件落地后启用本区。
        </p>
      </section>

      <section className="pg-lab">
        <h3 className="pg-subheading">七、维度隔离归因</h3>
        <p className="pg-note">
          五层渲染模型逐层启停，回答"不好看是哪一维的问题"：
          L1 Base（底色 / 氛围）是基底，不可关闭；L2 材质纹理与 L3 光影经响应系数置零
          （与槽位解构同一通道）；L4 构成装饰由实验区 CSS 规则隐藏（header 表面色随构成
          一并关闭——它是封脊构图的一部分，且会遮住 L2 纹理顶部）；
          色彩与排版是贯穿性规范，不设独立开关，用主题切换与灰度对照归因；
          L5 交互态按需出现，不设开关。L4 / L3 的分组规则见 playground.css 实验区注释。
        </p>
        <div className="pg-lab__controls-row">
          {DIM_CONTROLS.map(({ id, label, note }) => (
            <button
              key={id}
              type="button"
              title={note}
              className={dimsOn[id] ? 'pg-btn pg-btn--active' : 'pg-btn'}
              onClick={() => setDimsOn((prev) => ({ ...prev, [id]: !prev[id] }))}
            >
              {label} · {dimsOn[id] ? '开' : '关'}
            </button>
          ))}
          <span className="pg-lab__label">样品材质</span>
          {DIM_MATERIALS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={dimMaterial === value ? 'pg-btn pg-btn--active' : 'pg-btn'}
              onClick={() => setDimMaterial(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="pg-lab__controls-row">
          <span className="pg-lab__label">色彩归因</span>
          {(['dark', 'light'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              className={dimTheme === mode ? 'pg-btn pg-btn--active' : 'pg-btn'}
              onClick={() => setDimTheme(mode)}
            >
              {mode === 'dark' ? '暗色主题' : '亮色主题'}
            </button>
          ))}
          <button
            type="button"
            className={dimGrayscale ? 'pg-btn pg-btn--active' : 'pg-btn'}
            onClick={() => setDimGrayscale((prev) => !prev)}
          >
            灰度 · {dimGrayscale ? '开' : '关'}
          </button>
        </div>
        <div className={dimStageClass} data-theme={dimTheme} style={dimStageStyle}>
          <Panel
            title="维度归因样品"
            corners
            material={dimMaterial}
            footer="DIMENSION ISOLATION · SPECIMEN"
          >
            <p>
              风暴过境后的清晨，城市把雨衣遗忘在栏杆上。修补匠说，钟表停摆
              不是因为零件，而是因为没有人记得上一个整点。
            </p>
            <p>
              逐层关闭后观察：构图是否仍然成立？材质是否仍然可辨？光影是否仍然有气氛？
              哪一维被关闭后崩塌最快，问题就出在哪一维。
            </p>
          </Panel>
        </div>
      </section>

      <section className="pg-lab">
        <h3 className="pg-subheading">八、构成变体库（L4 · 草案）</h3>
        <p className="pg-note">
          边框、角饰、分隔线、印章、纹样的多样性试验，回应"当前只有一种极细几何线框"的问题。
          依据维度 04 的一级母题（几何装饰、档案标记、编辑排版）与线条四级规范，
          颜色全部取语义 Token、不透明度取装饰分级 Token。
          基座统一为 plain 中性材质（构成先行）；au-panel 的两个伪元素已被纹理 / 光影槽占用，
          构成装饰走真实 span 子元素（与 corners 同一模式）——
          这里的 pg-frame 草案类与 span 结构即转正后的 DOM / class 形态。
          纹样母题参考谐振几何语言（阶梯折线 / 节点 / 不完整闭合框）自绘为草案资产；
          Signature 素材（角色签名与徽记）作为纹章样式之一并入纹章体系直引展示，授权待定。
        </p>
        <div className="pg-frame-gallery">
          {FRAME_VARIANTS.map((spec) => (
            <FrameSpecimen key={spec.id} spec={spec} />
          ))}
        </div>
        <p className="pg-lab__label">角饰设计对照（基线 + 三个草案 · 24px · metal 色）</p>
        <div className="pg-corner-gallery">
          {CORNER_DESIGNS.map((design) => (
            <div key={design.id} className="pg-corn-demo">
              {CORNER_POSITIONS.map((pos) => (
                <span
                  key={pos}
                  className={`pg-corn pg-corn--${design.id} pg-corn--${pos}`}
                  aria-hidden="true"
                />
              ))}
              <span className="pg-corn-demo__name">{design.name}</span>
            </div>
          ))}
        </div>
        <p className="pg-lab__label">分隔线对照（基线 + 四个草案）</p>
        <div className="pg-divider-gallery">
          {DIVIDER_VARIANTS.map((variant) => (
            <div key={variant.id} className="pg-divider-demo">
              <span className="pg-divider-demo__name">{variant.name}</span>
              <span className={`pg-divider pg-divider--${variant.id}`} aria-hidden="true" />
            </div>
          ))}
        </div>
        <p className="pg-lab__label">纹章样式对照（印章 / 徽记 / 签名 · 签名为纹章样式之一，不单列）</p>
        <div className="pg-seal-row">
          {EMBLEM_SPECS.map((emblem) => (
            <span key={emblem.id} className="pg-seal-chip" title={emblem.name}>
              <span className={emblem.cls} aria-hidden="true" />
            </span>
          ))}
        </div>
        <p className="pg-lab__label">纹章尺寸与不透明度分级（以自绘环形印章为例 · lg / md = normal · sm = subtle）</p>
        <div className="pg-seal-row">
          <span className="pg-seal-chip">
            <span className="pg-seal pg-seal--lg" aria-hidden="true" />
          </span>
          <span className="pg-seal-chip">
            <span className="pg-seal pg-seal--md" aria-hidden="true" />
          </span>
          <span className="pg-seal-chip">
            <span className="pg-seal pg-seal--sm" aria-hidden="true" />
          </span>
        </div>
        <p className="pg-lab__label">纹样母题草案（参考谐振几何语言 · mask 随古金着色）</p>
        <div className="pg-pattern-gallery">
          {PATTERN_SPECS.map((pattern) => (
            <div key={pattern.id} className="pg-pattern-card">
              <span className={`pg-pattern pg-pattern--${pattern.id}`} aria-hidden="true" />
              <span className="pg-pattern-card__name">{pattern.name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
