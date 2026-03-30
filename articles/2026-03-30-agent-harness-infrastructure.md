# Agent Harness：让 AI Agent 真正能用的操作系统层

## 核心问题

大多数人对 AI Agent 的体验是：短任务惊艳，长任务翻车。跑着跑着忘了初衷，卡死在某个步骤反复重试，或者交出来的结果根本不可用。

这不是模型的问题——是缺了一层叫 **Agent Harness** 的基础设施。

## 一句话定义

Agent Harness 是包裹在 AI 模型外层的软件基础设施。用计算机架构类比：

- **AI 模型 = CPU**：提供原始推理算力
- **上下文窗口 = RAM**：有限且易失的工作记忆
- **Agent Harness = 操作系统**：调度资源、管理进程、保证安全边界

没有操作系统，CPU 再强也跑不起来任何程序。Agent 也是如此。

## 裸跑 Agent 的四个必死场景

### ① 上下文腐烂（Context Rot）

上下文窗口有限，跑到第 50 步，早期的指令和背景已被挤出窗口，模型用"我以为"填补缺失的记忆，任务目标悄悄漂移。

### ② 失控循环（Runaway Loop）

没有迭代次数限制，遇到障碍时反复重试同一动作，token 消耗和时间无限累积。

### ③ 幻觉累积（Compounding Hallucination）

单步幻觉可控，但多步骤中第一步的小错被第二步当事实推进，到第十步已是完全错误的结论。每层都在放大上一层的偏差。

### ④ 零安全边界（No Safety Rails）

没有确认机制，AI 可能直接删文件、发重要邮件、调付费 API——不可撤销。

ICML 2025 论文的对照实验证明：即使是最先进的模型，裸跑长任务完成率也大幅下降。

## Harness 的六大模块

### 1. 提示管理（Prompt Management）

每次启动注入系统提示：角色、可用工具、操作边界、任务目标。相当于员工的入职手册。

### 2. 记忆管理（Memory Management）

最被低估的模块，也是长任务成败的核心。

Anthropic 团队明确指出：**最佳方案不是"压缩摘要"，而是将关键信息保存为结构化数据，然后重置上下文。** Agent 在每个新阶段从结构化数据里提取所需信息，而不是依赖越来越失真的"压缩版记忆"。

压缩摘要会损失信息、引入偏差；结构化数据是精确的、可查询的、可验证的。

### 3. 工具调度（Tool Orchestration）

文件读写、网络搜索、代码执行、API 调用等能力统一封装成工具。Agent 只决定"调什么"，Harness 负责执行和错误处理。

### 4. 生命周期控制（Lifecycle Control）

监控运行步数、token 消耗、是否进入循环、时间是否超限。触发阈值时优雅退出并汇报状态。

### 5. 安全守卫（Safety Guard）

高风险操作标记暂停，等待人工确认（Human-in-the-Loop）。

### 6. 监控日志（Observability）

全程记录每步操作、工具调用、返回结果、token 消耗。用于调试、审计和持续优化。

## Framework vs Runtime vs Harness

三个常被混用的概念：

- **Framework**（如 LangChain）：给你材料——库和组件
- **Runtime**（如 Docker）：给你工地——执行环境
- **Harness**（如 Claude Code）：给你装修好的房子——完整的运行基础设施

Harness 相比 Framework 的核心差异：**内置安全机制**和**内置评估测试能力**，而不是让开发者自己从零搭建。

## 真实案例

### Stripe：Minions 系统

让小型自主 Agent 各自处理一个明确定义的工程任务，每周产出 1300 个代码 PR。关键在于每个 Agent 任务边界明确，Harness 让"小而专注的 Agent"可靠运行。

### Claude Code

业界公认最接近完整 Harness 定义的产品——内置工具调用、安全确认、上下文管理、系统提示体系。LangChain 的 DeepAgents 明确参照其架构。

### ICML 2025 论文

同一个 LLM，一组裸跑，一组装备 Harness（含感知、记忆、推理模块）。加了 Harness 的组在所有测试场景的胜率全面高于裸跑组。**没换模型，只加了 Harness。**

## 关键结论

> 模型决定"做什么"，Harness 决定"能不能真的做到"。

2026 年，行业重心正从"哪个模型更强"转向"基础设施怎么设计"。评估 AI Agent 方案时，核心问题不是"用什么模型"，而是：

1. 上下文怎么管理？
2. 记忆怎么持久化？
3. 高风险操作有没有拦截？
4. 失败了怎么恢复？

---

*原文：[@jingwangtalk](https://x.com/jingwangtalk/status/2037871440926834987) | [Substack 原文](https://open.substack.com/pub/zerofuturetech/p/why-does-your-ai-agent-always-break)*
