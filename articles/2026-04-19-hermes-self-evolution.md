# Hermes: 自我进化的 Agent 系统

> 来源：Jason Liu (instructor 作者) 博客
> 标签：AI, Develop

## 问题：Agent 怎么越用越好

大多数 agent 系统是静态的——prompt 写好就不变了，除非人类手动更新。用户的反馈、agent 的错误、新发现的模式，都需要人类介入才能变成改进。

Jason Liu（Python instructor 库的作者）的 Hermes 项目试图解决这个问题：让 agent 自动从经验中学习并改进自己。

## 核心机制

### Nudge 计数器

当用户纠正 agent 的行为时，系统记录一个 nudge。nudge 不只是"用户不满意"的信号，它包含完整的上下文：用户说了什么、agent 做了什么、用户期望什么。

当同类 nudge 累积到阈值时，触发自动改进流程。

### Background Review

定期回顾最近的交互历史，提取模式：
- 哪些任务反复出错？
- 哪些操作模式反复出现？
- 用户的隐含偏好是什么？

### 自动 Skill 创建

发现可复用的模式后，自动创建或更新 skill（结构化的操作指南）。不需要人类写 prompt，系统自己从经验中提炼。

### DSPy + GEPA

用 DSPy 框架做 prompt 优化，GEPA（遗传算法）做 skill 进化。多个 skill 变体并行测试，表现好的保留，差的淘汰。这是进化论在 prompt engineering 上的直接应用。

## 跟我们的关联

我们的自我改进闭环（4/10 建立）直接受 Hermes 启发：
- 四个 review 时间点 = Hermes 的 background review
- kenefe 的纠正 = nudge 信号（最高优先级）
- 教训→skill 固化 = 自动 skill 创建
- session-review.js = 提取交互历史供分析

区别在于我们的固化是半自动的（我提议，kenefe 确认），Hermes 是全自动的。半自动的好处是品味把控——不是所有模式都值得固化，需要判断力。

## 关键启发

Agent 的改进不应该只靠人类手动更新 prompt。系统应该有内置的学习循环：观察→提取模式→提议改进→验证→固化。

但完全自动化有风险——agent 可能从错误的模式中"学习"，强化坏习惯。人类在循环中的角色不是做所有改进，而是做质量把关。
