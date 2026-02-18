# 擴展長時間自主程式開發的規模

> 作者：Cursor 团队 · 2026-02-14
> 原文：https://cursor.com/zh-Hant/blog/scaling-agents
> 标签：AI / Develop / Article

**💡 看点：Cursor 团队让数百个 Agent 并行运行数周，在同一代码库写出百万行代码。从扁平协调失败到规划者+执行者架构成功，核心发现：减少复杂度比增加更有效，prompt 比框架更关键，不同模型适合不同角色。**

---

## 单一 Agent 的局限

现在的 Agent 处理明确任务时表现不错，但面对复杂项目就显得缓慢。自然的下一步是让多个 Agent 并行运作，但如何协调它们相当有挑战性。

---

## 第一次尝试：扁平协调

让各个 Agent 享有同等地位，通过共享文件自行协调。每个 Agent 检查其他 Agent 在做什么、认领任务、更新状态。用锁定机制避免冲突。

**失败方式：**

- Agent 会持有锁太久，甚至忘记释放。20 个 Agent 的速度被拖慢到等同 2-3 个的有效吞吐量
- 系统非常脆弱：Agent 可能在持有锁时失败、重复获取锁、或没获取锁就更新文件
- 改用乐观并发控制后更简单，但更深层的问题仍在：**没有层级的情况下，Agent 变得保守、规避风险，避免困难任务，只做小而安全的修改**

---

## 第二次尝试：规划者与执行者

拆分角色，建立明确职责分工的管线：

- **规划者（Planners）**：持续探索代码库并创建任务，可以衍生子规划者，让规划本身也能并行递归进行
- **执行者（Workers）**：领取任务并专注完成，不与其他执行者协调，不必担心全局，埋头做完就推送变更
- **裁决 Agent**：每轮循环结束时决定是否继续，下一次迭代从干净状态重新开始

**这解决了大部分协调问题，让系统能扩展到非常大型的项目。**

---

## 实验成果

- **从零打造网页浏览器**：运行近一周，1000 个文件，100 万行代码
- **Solid 迁移到 React**：三周，+266K/-193K 修改，通过 CI
- **视频渲染优化**：用 Rust 重写，速度提升 25 倍，代码已合并上线
- **Java LSP**：7.4K commits，550K LoC
- **Windows 7 模拟器**：14.6K commits，1.2M LoC
- **Excel**：12K commits，1.6M LoC

---

## 关键经验

### 模型选择至关重要

- **GPT-5.2** 在长时间自主工作上表现更好：更遵循指示、保持专注、避免偏移
- **Opus 4.5** 倾向提早停止、走捷径
- **不同模型适合不同角色**：即使 GPT-5.1-Codex 专为写代码训练，GPT-5.2 仍然是更好的规划者

### 减少比增加更有效

一开始为品质管控建立了整合者角色，后来发现它制造的瓶颈比解决的还多。Worker 本身就能处理冲突。

### Prompt 比框架更关键

**系统中相当大一部分行为取决于如何设计 prompt。** 要让 Agent 彼此良好协调、避免病态行为、长时间维持专注，需要大量实验。

### 结构度的平衡

- 结构太少 → Agent 互相冲突、重复工作、偏离目标
- 结构太多 → 系统变得脆弱
- **合适的结构度通常介于两端之间**

---

## 📎 相关阅读

- **Effective harnesses for long-running agents — Anthropic** — Anthropic 的长时间 Agent 工程实践：初始化 Agent + 编码 Agent 增量推进，用 progress.txt 桥接上下文
  https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
- **Building effective agents — Anthropic** — Agent 构建基础指南，涵盖工具使用、编排模式、错误处理
  https://www.anthropic.com/research/building-effective-agents
