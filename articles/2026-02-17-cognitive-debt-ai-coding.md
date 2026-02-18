# Cognitive Debt：AI 时代的认知债务

> **来源**: Simon Willison 引用 Margaret-Anne Storey
> **原文**: https://simonwillison.net/2026/Feb/15/cognitive-debt/
> **标签**: AI, Article

💡 **看点：技术债在代码里，认知债在人脑里。AI 帮你写得越快，你对系统的理解越浅，最终连简单改动都不敢做。**

---

## 核心概念

**Cognitive Debt（认知债务）**：用 AI 快速生成代码时，债务不是积累在代码质量上，而是积累在开发者的大脑里。

- 技术债：代码乱、架构差、实现仓促
- 认知债：没人能解释为什么做了某个设计决策，系统各部分如何协作

## 关键案例

Margaret-Anne Storey 带的一个学生团队：

- 前几周用 AI 飞速推进
- 第 7-8 周撞墙：连简单改动都会意外破坏其他东西
- 团队一开始怪技术债，但深挖后发现：**没人能解释系统为什么是这样的**
- 共享的系统理论（shared understanding）碎片化了
- 认知债比技术债积累得更快，最终瘫痪了整个团队

## Simon Willison 的亲身体验

他自己在 vibe coding 项目里也遇到了：

- 用 prompt 直接生成整个新功能，不审查实现
- 效果出奇地好，但逐渐迷失在自己的项目里
- 不再有清晰的心智模型：系统能做什么、怎么工作的
- 每加一个功能都更难推理，最终失去做决策的信心

## 启示

这和 Dylan Field 说的 tunnel vision 是一回事的两面：
- Field 说要 zoom out 看大局，避免第一版变最终版
- Storey 说要维护心智模型，否则快就变成了慢
