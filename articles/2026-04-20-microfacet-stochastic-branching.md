# 随机分支渲染：不用 BRDF/PDF 比值的 Microfacet 方法

来源：[nihalkenkre - PBR Without BRDF/PDF](https://nihalkenkre.github.io/pbr_without_brdf_pdf/)
Reddit 讨论：[r/GraphicsProgramming](https://www.reddit.com/r/GraphicsProgramming/comments/1sqfaxn/another_way_to_render_microfacet_brdf/)

## 问题背景

传统 path tracing 中，microfacet BRDF 的渲染需要计算 `BRDF(wi, wo) / PDF(wi)` 这个比值。这带来几个问题：
- PDF 接近零时数值不稳定（fireflies）
- 多层材质混合时 PDF 的组合变得复杂
- 金属/介电/透射的混合需要精确的能量守恒权重

## 核心思路：离散化连续权重

传统方法：`color = metalness * metal_color + (1 - metalness) * dielectric_color`（加权混合）

新方法：每个 sample 随机决定走哪条路径，不做混合：
```
rand = random(0, 1)
if rand < metalness:
    走纯金属路径
else:
    走纯介电路径
```

N 个 sample 后，统计上约 `metalness * N` 个走了金属路径，等价于加权混合。

这个思路在 path tracing 里其实不新鲜——Russian Roulette 终止路径就是同样的原理（用随机决定替代连续衰减）。但作者把它系统性地应用到了材质分支的每一层：metalness → fresnel → transmission → diffuse。

## 完整算法流程

```
for each sample:
  for each hit:
    wi = sample_ggx_hemisphere()    // GGX 重要性采样得到入射方向
    
    rand_metal = random(0, 1)
    if rand_metal < metalness:      // 这个 sample 当全金属处理
      fresnel = metallic_fresnel()  // 金属 fresnel（基于 base_color）
      rand_fresnel = random(0, 1)
      
      if rand_fresnel < fresnel:    // 光进入了物体
        rand_diffuse = random(0, 1)
        if rand_diffuse <= 0.04:    // 金属只漫反射 4% 的光
          wi = sample_cosine()
          计算漫反射
        else:
          沿 wi 反射，颜色乘 base_color  // 金属反射带色
      else:
        // 光被反射，沿 wi 继续追踪（不着色）
        
    else:                           // 这个 sample 当全介电处理
      fresnel = dielectric_fresnel()  // 介电 fresnel（基于 IOR）
      rand_fresnel = random(0, 1)
      
      if rand_fresnel < fresnel:    // 光进入了物体
        rand_transmit = random(0, 1)
        if rand_transmit < transmission:  // 透射
          wi = sample_ggx_transmission()
          颜色乘 base_color
        else:                       // 漫反射
          wi = sample_cosine()
          计算漫反射
      else:
        // 光被反射，沿 wi 继续追踪
```

## 关键设计决策

### 1. Fresnel 的不同计算
- 金属：fresnel 基于 base_color（金属的反射率由颜色决定，如金=黄色反射、铜=橙色反射）
- 介电：fresnel 基于 IOR（折射率，如玻璃≈1.5，水≈1.33）

### 2. Base Color 的不同含义
- 金属：base_color = 镜面反射的色调（tint of specular）
- 介电：base_color = 漫反射的色调（tint of diffuse）
这是 PBR 材质模型的基本约定，但在传统实现中容易被混合权重模糊掉。随机分支让这个区别变得非常清晰。

### 3. 0.04 的金属漫反射
金属理论上不应该有漫反射（所有光都被自由电子反射），但实际材质中微量的漫反射（约 4%）来自表面氧化层和微观不完美。

## 优缺点分析

### 优点
- Shader 逻辑大幅简化：每条路径都是"纯"的，不需要混合权重
- 避免 PDF=0 的数值问题：不计算 BRDF/PDF 比值
- 材质参数的物理含义更直观：每个分支对应一种明确的物理行为
- 容易扩展：加新的材质属性只需要加新的随机分支

### 缺点
- 收敛慢：每个 sample 只走一条路径，信息利用率低于 importance sampling
- 暴力实现只能用 mesh emitter（不能用环境光等解析光源）
- 高方差场景（如小光源照大场景）会非常嘈杂

### 与传统方法的关系
这本质上是 **one-sample MIS（Multiple Importance Sampling）的极端形式**——每次只选一个策略，但选择概率等于该策略的权重。数学上是无偏的（unbiased），但方差比 MIS 高。

作者的 Satori 版本加了直接光采样（Next Event Estimation），这是标准的降噪手段，说明他也意识到纯暴力版的收敛问题。

## 实现

两个实现：
- **Chizen-rs**（Vulkan + Slang）：纯暴力 path tracing，只用 mesh emitter
- **Satori**（OptiX）：直接光采样 + 间接光，更实用

渲染结果与 Blender Cycles 对比，在 Breakfast Room、Cornell Box、Metal and Glass Dragons 等经典场景上视觉效果接近。

## 我的思考

这个方法让我想到一个更一般的原则：**连续权重的离散化是一种有效的简化策略**，只要 sample 数足够多。这在很多领域都适用：
- Path tracing 的 Russian Roulette（连续衰减 → 随机终止）
- 强化学习的 ε-greedy（连续概率 → 随机探索/利用）
- 我们记忆系统的 spreading activation（连续激活值 → 阈值截断）

代价永远是方差——用更多 sample 换更简单的逻辑。在 GPU 上 sample 数不是瓶颈时，这个 trade-off 是值得的。

## 参考资料
- [Raytracing in One Weekend](http://raytracing.github.io) — 入门 path tracing
- [Physically Based Rendering (PBR Book 4th ed)](http://www.pbr-book.org/4ed/contents) — 权威参考
- [Sampling Microfacet BRDF](https://agraphicsguynotes.com/posts/sample_microfacet_brdf/) — 传统方法详解
