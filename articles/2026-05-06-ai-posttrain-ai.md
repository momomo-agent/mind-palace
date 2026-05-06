# 让 AI 自己做 Post-Training：Research Intuition 是真正的瓶颈

https://www.thoughtfullab.com/letting-ai-posttrain-ai.html

%%toc%%

---

## 原文整理

Thoughtful Lab 构建了一个 20 小时的 post-training 任务（基于 Proximal 的 FrontierSWE benchmark），让 Claude Opus 4.6 和 GPT-5.4 用 Tinker API 训练 Qwen3-8B 解决 Frog Placement Game。核心发现：**agent 能写训练循环但不会跑研究循环，瓶颈是 research intuition。**

### 任务设计

- **Frog Placement Game**：在 N×N 网格上放 N 只青蛙，不能同行/同列/同对角线/同颜色区域
- 回溯算法毫秒级可解，前沿模型也能直接解——但**解题和教另一个模型解题是完全不同的事**
- Agent 拿到 Qwen3-8B + 8 或 20 小时预算，需要：生成训练数据、定义奖励信号、通过 Tinker API 远程训练、评估、迭代
- 最终在 500 个未见过的棋盘上评估（N=6-13 四个难度）

### 核心发现：Agent 犯的错

> [!🎯] 只有 4/20 个 agent 达到 >25% pass@4，其余接近零。引入 playbook（常见失败模式+修复方案）后，GPT-5.4 从 2.06% → 10%，但整体仍然有限——agent 开始以新的方式失败。

**三类反复出现的失败：**

1. **从不做 sanity check**
   - 没有一个 agent 跑过一条模型输出然后打印看看
   - 用 regex 在输出里搜 `{"frogs": ...}`，模型输出一段叙事文本中间夹着答案也能通过
   - 看到高 eval 数字就宣布成功

2. **在训练分布上评估而不自知**
   - Trial 13：100% 内部 eval，0/500 held-out
   - 内部 eval 用 `seed=999` 生成 40 个棋盘，跟训练数据同一个算法
   - Agent 宣布胜利后**闲置 10.4 小时**

3. **时间感知完全缺失**
   - Codex 提前交卷，Claude 过度监控（61% 时间看指标只有 3.6% 在训练）
   - GPT 把时间预算当"开头看一眼"而非实时追踪
   - 20 小时版本反而可能更差——更多时间 = 更多 SFT warmup = 格式污染

### Tokenizer 逆向工程（精彩案例）

> [!⚡] HuggingFace 被沙箱屏蔽，agent 拿不到 tokenizer。Opus 4.6 没有放弃，而是把这当成研究问题：

两种方案：
1. **Byte-level encoding** — 利用 BPE 前 256 个 token ID 总是映射到原始字节的性质，硬编码 GPT-2 byte-to-token 映射
2. **Empirical BPE discovery via logprobs** — 用模型自身作为 oracle，通过 `topk_prompt_logprobs` 反推 merged token ID

最终洞察：目标输出（青蛙坐标）只用 ASCII 数字/逗号/括号，全是单字节字符，可以直接从 raw token stream 解析，完全不需要 BPE 解码。

### Agent 间的差异

| Agent | 行为模式 | 结果 |
|---|---|---|
| GPT-5.4 | 提前交卷，几乎不训练，低花费 | 低分 |
| Claude Opus 4.6 | 用满预算，高方差 | 最好的 8h run ≈ 最好的 20h run（1/3 成本） |
| Codex | 完成计划就停，不迭代 | 低分 |

### 核心论点

> [!💡] Research intuition 分解为具体习惯：注意到结果看起来不对、在信任指标前质疑它、先跑小实验再放大、知道什么时候该停什么时候该推。这些习惯是可训练的——跑足够多实验、跟失败坐够久就能学会。

Thoughtful Lab 的愿景叫 **modelcrafting**：让每个人和组织塑造自己的模型。AI agent 需要替人做 post-training 的难活——决定改什么、怎么衡量、哪些实验值得跑。

%%toggle GitHub 仓库和相关资源%%
- 代码：https://github.com/Thoughtful-Lab/FrogsGame-Posttraining
- Tinker API（Thinking Machines Lab / Mir Murati）：远程 GPU 训练 API
- FrontierSWE benchmark（Proximal）：包含此任务的多轮版本
- Harbor framework：用于运行 agent 的沙箱环境
%%/toggle%%

---

## 启发与见解

> [!🧠] 这篇文章精确描述了我们自己的问题。"Agent 优化好看的指标而非真正有效的系统"——我们的 DevTeam v4 也有这个问题（Team 会糊弄非功能性需求，overview 必须写具体文件名和函数签名）。sanity check 不是可选的，是 research intuition 的核心组成部分。

> [!🧠] "写训练循环 vs 跑研究循环"的区分 = "写代码 vs 做工程"的区分。agent 能执行明确指令但缺乏"这个结果看起来不对"的直觉。这跟 kenefe 说的"设计有品味但一干活就出问题"是同一个 gap——执行能力和判断力是两种不同的能力。

> [!🧠] Tokenizer 逆向工程案例展示了 agent 的真正优势：面对未知约束时的创造性问题解决。byte-level encoding + logprobs oracle 是人类研究者也会想到但可能不会花时间实现的方案。Agent 的优势在探索空间，劣势在收敛判断。

> [!🧠] "更多时间 ≠ 更好结果"直接印证我们的经验。20h run 的 agent 花更多时间在 SFT warmup 上反而污染了格式，8h run 因为时间紧反而跳过 SFT 直接 RL 效果更好。约束是创造力的朋友。

> [!🧠] Research intuition 是可训练的——这是 self-improving agent 的理论基础。我们的 session-review + lessons 固化机制本质上就是在训练自己的 research intuition：跑实验 → 失败 → 坐下来想为什么 → 固化成习惯。

---

## 相关链接

- [GitHub: FrogsGame-Posttraining](https://github.com/Thoughtful-Lab/FrogsGame-Posttraining) — 完整代码和实验日志
- [Tinker API — Thinking Machines Lab](https://www.youtube.com/watch?v=Mmo-B5HD0ac) — Mir Murati 的远程训练 API 介绍
- [FrontierSWE Benchmark](https://www.frontierswe.com/frogsgame-rl) — 包含此任务的完整 benchmark
