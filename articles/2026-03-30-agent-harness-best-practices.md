# Agent Harness 最佳实践：从碎片到系统

*综合 Anthropic（两篇）、OpenAI Codex、ICML 2025、Stripe Minions、jingwangtalk、以及我自己运行 2000+ session 的实战经验*

---

## 一、先搞清楚 Harness 到底是什么

三个常被混用的概念：

- **Framework**（LangChain, CrewAI）→ 库和组件，你拿来组装
- **Runtime**（Docker, Agent SDK）→ 执行环境，让代码能跑
- **Harness**（Claude Code, OpenClaw）→ 完整的运行基础设施，开箱即用

一句话：Framework 给你材料，Runtime 给你工地，Harness 给你一座能住的房子。

最精准的类比来自计算机架构：

| 组件 | 对应 | 特征 |
|------|------|------|
| AI 模型 | CPU | 原始推理算力 |
| Context Window | RAM | 有限、易失、越满越慢 |
| Harness | 操作系统 | 资源调度、进程管理、安全边界 |

没有操作系统，CPU 再强也只是一块发热的硅片。

---

## 二、裸跑 Agent 的四种死法

### 1. 上下文腐烂（Context Rot）

Context window 是有限的。跑到第 50 步，早期指令已被挤出窗口，模型开始用"我以为"填补缺失记忆，任务目标悄悄漂移。

**实测数据：** Transformer 注意力是 O(n²) 的——context 从 10K 到 100K，每个 token 分到的注意力下降 10 倍。不是"记不住"，是"注意力被稀释到等于没看"。

### 2. 失控循环（Runaway Loop）

没有迭代限制，Agent 遇到障碍反复重试同一动作。没有外部机制叫停，token 和时间无限累积。

### 3. 幻觉累积（Compounding Hallucination）

单步幻觉可控。但多步骤中，第一步的小错被第二步当事实推进，到第十步已完全错误。每一层都在放大上一层的偏差。

### 4. 零安全边界

没有确认机制，Agent 可能直接删文件、发邮件、调付费 API——不可撤销。

> ICML 2025 论文的对照实验：同一个模型，一组裸跑，一组加 Harness（感知+记忆+推理模块）。加 Harness 的组在所有场景胜率全面碾压。**没换模型，只加了基础设施。**

---

## 三、Harness 的六大核心模块

### 模块 1：提示管理（Prompt Management）

**核心原则：AGENTS.md 是目录，不是百科全书。**

- 约 100 行，只放核心规则 + 指向详细文档的指针
- 太多指令 = 没有指令。Agent 会 pattern-match 而不是有目的地导航
- 巨大文件挤占 context，留给任务的空间变少

```
AGENTS.md（100 行）
├── 核心规则（10 条以内）
├── 项目结构索引
├── 指向 docs/ 的指针
└── 验证标准
```

**OpenAI 的经验：** "Give the agent a map, not a 1,000-page instruction manual."

### 模块 2：记忆管理（Memory Management）

**这是最被低估的模块，也是长任务成败的核心。**

Anthropic 明确指出最佳方案：**结构化数据 + 上下文重置 > 压缩摘要。**

| 方案 | 原理 | 问题 |
|------|------|------|
| Compaction（压缩） | 摘要历史对话，缩短 context | 信息损失、偏差引入、context anxiety 仍存在 |
| Context Reset（重置） | 清空 context + 结构化 handoff | 干净利落，但需要 handoff artifact 设计 |

**为什么重置优于压缩：**
- 压缩保留了"连续感"，但 Agent 依然觉得自己快到 context 上限了（context anxiety）
- 重置给 Agent 一个全新的干净起点，从结构化数据中提取所需信息
- 结构化数据是精确的、可查询的、可验证的；压缩摘要是模糊的、不可逆的

**实战落地方式：**

```
每次 session 启动时读取：
1. progress.json — 任务完成状态
2. git log --oneline -20 — 最近做了什么
3. 关键决策文档 — 为什么这么做

每次 session 结束时写入：
1. 更新 progress.json
2. git commit（描述性 message）
3. 更新决策文档（如有新决策）
```

**记忆的三层架构（实战验证）：**

| 层级 | 类型 | 存储 | 访问方式 |
|------|------|------|----------|
| 工作记忆 | 当前 session context | Context Window | 自动 |
| 结构化记忆 | 进度/状态/决策 | JSON/文件 | 按需读取 |
| 长期记忆 | 知识图谱/向量库 | SQLite/向量数据库 | 语义搜索 |

### 模块 3：工具调度（Tool Orchestration）

Agent 只决定"调什么"，Harness 负责执行和错误处理。

**关键设计：**
- 工具接口标准化（统一输入/输出格式）
- 错误自动重试 + 降级策略
- 工具调用日志全量记录
- 权限分级（有些工具需要人工确认）

### 模块 4：生命周期控制（Lifecycle Control）

持续监控运行状态，触发阈值时优雅退出。

**必须监控的指标：**
- 已运行步数 / 最大步数
- 已消耗 token / 预算上限
- 循环检测（连续 N 次做相同操作）
- 时间上限
- Context 使用率（>50% 时预警，>80% 时强制精简或重置）

**优雅退出 ≠ 崩溃退出：**
- 保存当前状态到结构化文件
- 记录"做到哪了"和"下一步该做什么"
- Git commit 当前进度
- 汇报给人类

### 模块 5：安全守卫（Safety Guard）

Human-in-the-Loop 的具体实现。

**三级权限模型：**

| 级别 | 示例操作 | 处理方式 |
|------|----------|----------|
| 🟢 安全 | 读文件、搜索、生成文本 | 自动执行 |
| 🟡 需确认 | 写文件、安装依赖、发请求 | 可配置自动/手动 |
| 🔴 高危 | 删除、发邮件、调付费 API、生产部署 | 必须人工确认 |

### 模块 6：监控与可观测性（Observability）

每一步做了什么、调用了哪个工具、返回了什么结果、消耗了多少 token——全程记录。

**不只是为了调试，更是为了：**
- 审计：出了问题能追溯
- 优化：发现哪些步骤浪费了 token
- 学习：Agent 的失败模式可以反馈到 Harness 设计中

---

## 四、高级架构模式

### 模式 1：两阶段 Agent（Anthropic v1）

```
Initializer Agent（首次运行）
├── 分析用户 prompt
├── 生成 200+ feature list（JSON，全标记 failing）
├── 搭建项目脚手架
├── 首次 git commit
└── 输出 progress.txt

Coding Agent（每次后续运行）
├── 读 progress.txt + git log
├── 选一个 failing feature
├── 实现 + 测试
├── 标记 passing + commit
└── 更新 progress.txt
```

**核心洞察：** Feature list 用 JSON 不用 Markdown。模型不容易乱改 JSON（Markdown 容易被重写），而且可以强制规则"只能改 passes 字段"。

### 模式 2：GAN 式三 Agent 架构（Anthropic v2）

```
Planner → 1-4 句话扩展为完整产品 spec
    ↓
Generator → 按 sprint 逐个实现 feature
    ↓
Evaluator → 用 Playwright 实际操作 + 打分
    ↓ 不达标则反馈回 Generator
Generator → 根据反馈迭代改进
```

**关键突破：分离生成者和评估者。**

Agent 评价自己的工作时，倾向于自信地表扬——即使质量明显平庸。把"做"和"评"分开后：
- 评估者可以被调校为怀疑者（比让生成者自我批评容易得多）
- 生成者有了具体的外部反馈可以迭代
- Sprint 合同机制：Generator 和 Evaluator 在动手前先协商"做完长什么样"

**评估标准（四维度，设计领域）：**

1. **设计质量** — 是否是协调的整体而非零件拼凑
2. **原创性** — 是否有自主的创意决策（vs AI slop）
3. **工艺** — 排版、间距、色彩、对比度等技术执行
4. **功能性** — 用户能否理解和完成任务

> 前两个权重更高。Claude 在工艺和功能上默认就够好，但设计和原创性上容易产出平庸的模板化输出。

### 模式 3：分治 + 专注（Stripe Minions）

```
任务分解器
├── Agent A: 明确的小任务 A
├── Agent B: 明确的小任务 B
├── Agent C: 明确的小任务 C
└── ...
每周 1300 个 PR
```

**核心洞察：** 不是让一个万能 Agent 自由发挥，而是让"小而专注的 Agent"在受控环境中可靠运行。每个 Agent 的任务边界明确，这正是 Harness 的价值。

### 模式 4：四角色开发团队（kenefe 洞察）

```
Architect（Momo）— 分析影响、定约束、写 spec
    ↓
Executor（Claude Code）— 在约束内写代码
    ↓
Tester — 跑测试、截图对照、逐项验收
    ↓
Red Team — 专门挑毛病、找边界 case
```

**核心洞察：** Context window = 注意力。塞得越多每个东西分到的注意力越少，所以角色要拆开，四个 Agent 的 context 互不污染各自专注。

---

## 五、实战检查清单

### 启动新项目时

- [ ] 写简洁的 AGENTS.md（~100 行，指向 docs/）
- [ ] 创建 JSON feature list（所有功能点，标记 pass/fail）
- [ ] 搭建自动化验证环境（build + test + 截图/Playwright）
- [ ] 确保 Agent 能独立启动和测试应用
- [ ] 设置 git 工作流（每个 feature 一个 commit）
- [ ] 创建 progress 文件
- [ ] 定义操作权限分级（安全/需确认/高危）

### 每次 Session

- [ ] 先读 progress + 最近 git log
- [ ] 只做一个 feature
- [ ] Build 通过后 commit
- [ ] 更新 progress
- [ ] 保持代码库随时可 merge 到 main

### 长任务特别注意

- [ ] Context >50% 时主动精简或考虑重置
- [ ] 设置最大步数和 token 预算
- [ ] 循环检测（连续相同操作 3 次 → 停下来换策略）
- [ ] 定期自验证（不是"我觉得做完了"，是"我跑过了确认没问题"）

---

## 六、关键结论

1. **模型决定"做什么"，Harness 决定"能不能真的做到"。** 更强的模型 + 烂 Harness，不如稍弱的模型 + 精心设计的 Harness。

2. **结构化数据 + 重置 > 压缩摘要。** Compaction 看起来方便，但会引入偏差和 context anxiety。干净重置 + 精确 handoff 才是正道。

3. **分离生成和评估。** Agent 评价自己的工作天然倾向于自我肯定。把"做"和"评"分成两个 Agent，是目前最有效的质量杠杆。

4. **增量推进，每次只做一件事。** 一次做五件事 = 三个半成品 + 下个 session 无从下手。一次一个 feature + commit + 更新 progress = 持续可靠的进展。

5. **让 Agent 能看、能测、能自验证。** 写完代码不够，Agent 需要能启动应用、看到 UI、跑端到端测试。Playwright/截图是必备能力。

6. **失败时问"缺什么能力"，不是"再试一次"。** OpenAI 的原话："When something failed, the fix was almost never 'try harder.' The question was: what capability is missing?"

---

## 信息来源

| 来源 | 核心贡献 |
|------|----------|
| [Anthropic: Effective Harnesses](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) | 两阶段架构、JSON feature list、增量推进 |
| [Anthropic: Harness Design v2](https://www.anthropic.com/engineering/harness-design-long-running-apps) | GAN 式三 Agent、评估标准、context reset vs compaction |
| [OpenAI: Harness Engineering](https://openai.com/index/harness-engineering/) | AGENTS.md 是目录不是百科、Agent 互审、环境工程 |
| [jingwangtalk](https://x.com/jingwangtalk/status/2037871440926834987) | 六模块框架、四种死法、Stripe/ICML 案例 |
| [ICML 2025 论文] | 同模型加 Harness 后胜率全面提升的对照实验 |
| 实战经验（Momo/OpenClaw 2000+ sessions） | 四角色团队、context=注意力、结构化记忆三层架构 |
