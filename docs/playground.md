# Playground 说明

Playground 是组件库的开发预览应用（独立 Vite 应用，`pnpm dev` 启动），
通过 alias 直接引用组件库源码，导入路径与 npm 安装后的真实用法一致，
不维护第二套组件实现。

## 命名隔离

- 组件库样式：`au-` 前缀（BEM）；
- Playground 专属样式：`pg-` 前缀（`playground/src/playground.css`），
  与组件库样式严格分离，互不污染。

## 页面职责

| 页面 | 性质 | 职责 |
| --- | --- | --- |
| Overview | 正式展示 | 组件库能力总览 |
| Components | 正式展示 | 组件用法示例（与发布版一致的导入路径） |
| Materials | 校准台 | 材质/光影参数校准：滑杆只写两个语义响应系数（`--au-texture-scale` / `--au-lighting-scale`），不覆盖材质专属配置 |
| Theme Editor | 校准台 | 主题变量验证：直接编辑语义层 CSS Variables + 明暗切换 |
| Render Lab | 实验区 | 美术资源研发与渲染验证（允许写入口变量与内联图层） |

## Render Lab 八区

与 Materials 的分工：**RenderLab 造资产、验渲染；Materials 校参数。**

| 区块 | 用途 |
| --- | --- |
| 一、资产目录 | 纹理资产总览（图源/规格/形态/状态） |
| 二、槽位解构 | Base/Texture/Lighting 逐层隔离观察；裸元素复刻验证材质类可移植性 |
| 三、图层堆叠沙盘 | 每层可换图源/混合模式/透明度/平铺方式，实时合成（隔离层叠上下文） |
| 四、混合模式对照矩阵 | 同一图源 × 各 blend mode × 统一底色 |
| 五、材质样品区 | 三材质无干扰色块陈列（paper 含 C3 对照线） |
| 六、跨组件复用检查 | 同一贴图跨组件复用对照（待 Card/Dialog 落地启用） |
| 七、维度隔离归因 | 五层模型逐层启停（L2/L3 经响应系数、L4 经实验区规则、色彩经主题/灰度），定位"不好看"所属维度 |
| 八、构成变体库 | 边框/角饰/分隔线/纹章/纹样草案陈列，装饰 API 立项时的选型池 |

## 实验资产

- `playground/src/assets/trial/`：L4 展示位路线的试验资产（如带齿孔整幅 `film-strip.webp`）；
- `src/assets/textures/Signature-*.webp`：纹章素材（致敬性复用，见 decisions/005 · C1）；
- 本地工具（不入库，`.gitignore` 已覆盖）：`tmp-shot.mjs` 截图脚本、
  `tmp-py-env/` 图像处理环境（uv 项目）。
