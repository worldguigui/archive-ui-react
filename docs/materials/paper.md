# paper 材质规范

> 旧纸（深棕档案调）· 强度等级 2 · 档案卡、编辑卡、信件用。
> 类定义：`src/styles/materials/paper.css`

## 视觉目标

暗色灯光下的旧纸张：深棕底 + 左上暖光/右下暗部的进深 + 暖象牙纤维颗粒、
氧化斑驳、明暗尘粒 + 均匀椭圆轻暗角。色调多层承载——身份色调由
基色与氛围层共同承担，稀疏纹理层只负责质感细节。

## 参数总表

| 参数 | 值 | 权威来源 |
| --- | --- | --- |
| 基色 | 暗 `#332a23` / 亮 `#ece1c6`（羊皮纸亮调） | 主题层 |
| 氛围层（L1 子层） | 三层渐变：`radial-gradient(120% 90% at 18% 8%, rgba(245,234,216,.3), …0 55%)`（左上暖光）+ `radial-gradient(140% 110% at 82% 100%, rgba(43,28,14,.42), …0 60%)`（右下暗部）+ `linear-gradient(180deg, rgba(255,244,214,.1), rgba(31,20,10,.16))`（冷暖过渡） | 材质类 |
| 纹理资产 | `paper-grain.svg`（512 可平铺：age 渐变氧化斑含环绕副本 + 双极色纤维丝 + 明暗尘粒） | tokens 登记 |
| 显示形态 | 固有尺寸 · `repeat` | 入口默认 |
| 纹理档位 | `0.55 × --au-texture-scale`（低频软特征，需高于高频材质） | tokens 档位 |
| 混合模式 | `normal`（稀疏 alpha 调制层） | 入口默认 |
| 暗角 | `--au-gradient-vignette`（均匀椭圆）· `0.38 × --au-lighting-scale` | 材质类 |

## 消费入口

```
--au-material-base              ← --au-material-paper-base（主题层）
--au-material-atmosphere-image  ← 三层灯光氛围渐变
--au-texture-grain-opacity      ← 0.55 × scale
--au-material-vignette-image    ← --au-gradient-vignette
--au-material-vignette-opacity  ← 0.38 × lighting-scale
```

## 组合与边界

- 编辑类内容（档案摘录、故事文本）默认材质；适合配角饰、纹章、蚀刻线；
- 亮主题下氛围层保持同构（暖光/暗部），底色切换为羊皮纸亮调；
- 中调羊皮纸 `#6e5a3c` 为落选对照线（决策 005 · C3），仅存于样品区陈列。
