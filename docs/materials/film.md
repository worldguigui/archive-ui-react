# film 材质规范

> 底片（真实乳剂质感）· 强度等级 3 · 展示型卡片、图片场景用。
> 类定义：`src/styles/materials/film.css`；来源决策见 decisions/003。

## 视觉目标

真实摄影底片的乳剂表面：multiply 混合下的黑场 + 底色划痕、尘点，
叠加镜头光学暗角。区别于 paper 的锚点：冷调底 + 真实划痕 vs 暖调纸 + 纤维斑驳。

## 参数总表

| 参数 | 值 | 权威来源 |
| --- | --- | --- |
| 基色 | 暗 `#2e2925` / 亮 `#ddd7c9` | 主题层 |
| 纹理资产 | 主题成对：`film-emulsion.webp`（暗版，黑场+亮划痕，1285×565，28.7KB）/ `film-emulsion-light.webp`（亮版反转图，浅场+深划痕，25.2KB），均为灰度、无烘焙暗角、已裁除齿孔 | 主题层图源 |
| 显示形态 | `cover` · `center` · `no-repeat`（裁切边缘划痕断开，不可平铺） | 材质类 |
| 纹理档位 | `1 × --au-texture-scale`（multiply 下强度语义 = 黑场压暗程度，非纹理淡出） | tokens 档位 |
| 混合模式 | `multiply`（不透明亮度图的必要混合） | 材质类 |
| 氛围层 | 无（宏观明暗归 L3） | 材质类 |
| 暗角 | `--au-gradient-vignette-lens`（双拐点镜头曲线）· `0.55 × --au-lighting-scale` | 材质类 |

## 消费入口

```
--au-material-base              ← --au-material-film-base（主题层）
--au-material-grain-image       ← --au-texture-film-grain-image（主题层，成对）
--au-material-grain-size        ← cover
--au-material-grain-position    ← center
--au-material-grain-repeat      ← no-repeat
--au-material-grain-blend       ← multiply
--au-texture-grain-opacity      ← 1 × scale
--au-material-vignette-image    ← --au-gradient-vignette-lens
--au-material-vignette-opacity  ← 0.55 × lighting-scale
```

## 组合与边界

- 展示型内容（绝密档案、海报位）用；纹理为唯一暗角承载于 L3，资产自身无暗角；
- 齿孔条等胶片结构叙事归 L4 构成资产（trial 目录的 `film-strip.webp` 为该路线试验品）；
- 亮主题反转图在 multiply 下呈照片印刷感（浅场不变、划痕压深），保证文字对比度。
