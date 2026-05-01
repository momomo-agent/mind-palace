# Karpathy Sequoia Ascent 2026：Software 3.0 和 Agent-Native Economy

## 背景

Andrej Karpathy 在 Sequoia AI Ascent 2026 与 Stephanie Zhan 的 fireside chat。去年他造了"vibe coding"这个词，今年他说自己从未感到如此落后。

核心论点：vibe coding 抬高了地板，agentic engineering 抬高了天花板。

## 三个新地平线

Karpathy 强调 LLM 不只是加速已有的事，而是创造了三类全新可能：

### 1. MenuGen：不该存在的 App

拍一张餐厅菜单照片，生成菜品图片。传统做法需要 OCR pipeline + UI + 复杂工作流。Software 3.0 做法：把照片丢给模型，让它直接在菜单上叠加食物图片。没有 App，没有 OCR，没有 UI。

启示：很多 AI App 只是模型能力不足时的临时包装。模型变强后，整个产品品类会坍缩成一个 prompt。

### 2. install .md 替代 install .sh

为什么要写复杂的 bash 脚本处理每种环境？写一段自然语言安装说明，让 LLM 读懂、检查你的环境、执行命令、遇到错误自动调试。LLM 是高级英语解释器。

这跟 OpenClaw 的 SKILL.md 理念完全一致——用自然语言描述流程，agent 解释执行。

### 3. LLM 知识库

经典代码根本做不了的事：对非结构化数据（任意来源、任意格式的知识）做计算。这是 LLM 独有的能力，不是加速已有功能。

## LLM Jaggedness 的经济学解释

为什么同一个模型能连贯重构 10 万行代码，却会告诉你走路去洗车店洗车？

Karpathy 之前用 verifiability（可验证性）解释：容易验证的领域进步快。这次他加了经济学维度：**revenue/TAM 决定 frontier lab 在 RL 训练数据分布里放什么**。

你要么在 RL 轨道上飞（coding、math 这些高 TAM 领域），要么在丛林里拿砍刀开路（日常常识、空间推理这些没人专门训的领域）。

这个框架很实用：评估 LLM 在某个领域的能力时，先问两个问题——这个领域的输出容易验证吗？这个领域有足够大的商业价值让 lab 专门训吗？两个都是 yes 才能期待高质量输出。

## Agent-Native Economy

产品和服务可以分解为三个组件：
- **Sensors**（感知）：获取信息
- **Actuators**（执行）：采取行动  
- **Logic**（逻辑）：决策

这三者分布在 Software 1.0（经典代码）、2.0（神经网络）、3.0（prompt/context/agent）三个范式中。

关键转变：下一波基础设施是 agent-native 的，不是 user-native 的。Agent 需要的不是漂亮的 UI，而是清晰的指令、结构化上下文、机器可读文档、直接权限、为 agent 执行设计的 API 和工作流。

## 品味和判断力升值

当智能变便宜，理解力（understanding）反而变稀缺。Karpathy 的观点和 kenefe 一直强调的一致：品味无法自动化，判断力是最后的护城河。

招聘也要变——传统的小型编码题测试的是 Software 1.0 技能。如果工作变成了 agentic engineering，测试应该是给候选人一个复杂的真实任务，看他们怎么拆解、怎么指挥 agent、怎么验收。
