# plain 材质规范

> 哑光底材 · 强度等级 0–1 · 功能面板、密集信息区用。
> 类定义：`src/styles/materials/plain.css`

## 视觉目标

近中性深暖灰的哑光表面：各向同性微颗粒 + 低频纵深，无方向性条纹。
区别于 paper / film 的锚点：无身份色温、无结构叙事、无光照响应——
"看不见的材质"，克制即其身份。

## 参数总表

| 参数 | 值 | 权威来源 |
| --- | --- | --- |
| 基色 | `--au-color-bg-elevated`（暗 `#29221e` / 亮 `#f8f3e7`） | 语义层（主题） |
| 氛围层（L1 子层） | `linear-gradient(175deg, rgba(255,244,214,.045), rgba(0,0,0,0) 42%, rgba(0,0,0,.22))`（顶部微亮、底部压暗） | 材质类 |
| 纹理资产 | `plain-matte.svg`（512 可平铺，双层：纵深斑驳 + gamma 压制微颗粒） | tokens 登记 |
| 显示形态 | 固有尺寸 · `repeat` | 入口默认 |
| 纹理档位 | `0.4 × --au-texture-scale` | tokens 档位 |
| 混合模式 | `normal`（alpha 调制层） | 入口默认 |
| 暗角 | `0`（无光照响应） | 材质类 |

## 消费入口

```
--au-material-base              ← 语义层 bg-elevated
--au-material-atmosphere-image  ← 纵深渐变
--au-material-grain-image       ← --au-texture-plain-grain-image
--au-texture-grain-opacity      ← 0.4 × scale
--au-material-vignette-opacity  ← 0
```

## 组合与边界

- 密集信息区（表格、表单）默认材质；配装饰趋零（维度 07 高密度区规范）；
- 作为"构成先行"的中性画布：构成稿与维度归因实验均以 plain 为基座。
