# Gary Marcus 三连发：Generative AI 的幻觉、超规模化的疯狂、neurosymbolic 与 world model 的复仇

原文链接：https://garymarcus.substack.com/p/the-illusion-of-generative-ai-the

视频：
- [The Uncomfortable Truth About AI "Reasoning" — Gary Marcus × Brian Greene @ World Science Festival](https://www.youtube.com/watch?v=iFYF_e1GSGI)（86 分钟）
- [Gary Marcus on Scaling Compute @ Web Summit Vancouver 2026](https://www.youtube.com/watch?v=V6R_x6SZg1E)（18 分钟主题演讲）
- [Gary Marcus × Will Wilson @ Bug Bash 2026 — "extracting reliable software from the slop factory"](https://www.youtube.com/watch?v=JaMRLXjgQQU)（54 分钟 fireside）

---

## 原文整理

Gary Marcus 一周内三场公开露面，把同一套核心论点用三种不同语境讲完整：从 AI 投资泡沫的金融维度（Web Summit），到 AI 与认知科学的本体论维度（World Science Festival），到 AI 工程可靠性的实操维度（Bug Bash）。三场叠在一起，等于他过去四年所有立场（"Deep Learning is Hitting a Wall" 2022 / "A knockout blow for LLMs" / "Hallucination is unfixable"）的 2026 年总成。

### 一、超规模化是不是泡沫——Web Summit 主题演讲

跟 Zachary Karabell 对谈，主题是 hyperscalers 在数据中心、芯片、电力上下注的疯狂规模。

**关键数字（Marcus 现场引述）：**
- 全行业每月支出≈一个 Manhattan Project 的总规模
- Sequoia 早前估算 LLM 行业需要 $600B 年收入回本
- The Economist 最新更新到 **$1.6T/年回本要求**
- Google 历史最佳年收入：$400B（2025 年）
- 也就是说：要让这场赌注成立，整个 AI 行业每年要做出 4 个史上最佳年的 Google

**"芯片折旧 vs 光纤升值" 关键论点：**
1880s 铁路泡沫和 1990s telecom 泡沫的辩护词是 "尽管资本被错配，但留下了基础设施"。Marcus 反驳：
- 1990s 铺的光纤 30 年后还能用，估值没掉
- Elon 2024 年砸钱建的 Colossus（22 万张 H100），两年后已经租给 Anthropic 了——他不需要了
- 芯片折旧速度跟铁轨/光纤不在一个量级，"留下基建" 这条退路在 GPU 泡沫里不成立

**"硬件可能配错了软件" 关键论点：**
- LLM 不是终极架构（"part of the answer, not all of the answer"）
- neurosymbolic 复活之后，新增长很多来自 CPU 而不是 GPU
- 如果效率提升路线兑现，万亿级 GPU 投入可能也是误配

**OpenAI 诉讼的真正赌注：**
不是马斯克 vs Altman 的八卦剧，是 OpenAI 是否被法院判决继续遵守 nonprofit mission。判决方向不同会改写整个产业的资本路径。

### 二、Generative AI 的幻觉——Brian Greene 长访谈

Brian Greene 用四道二选一开场，Marcus 全部明确表态：
1. **Scaling 已撞墙吗？** —— "我们已经在偷偷离开 scaling，所有人不愿意承认。"
2. **大众把 LLM 拟人化是不是进化心理学倾向？** —— "100% yes."
3. **同行说 LLM 有自我意识是不是荒谬？** —— "Absolutely ludicrous."
4. **40 岁开始学乐器有希望吗？** —— "Totally."（他写过 _Guitar Zero_）

**核心命题：LLM 是 approximators 不是 reasoners**
- 它们建模的是 *人类如何使用语言*，不建模 *世界本身*
- 80% 准确度对 ad copy、brainstorming 来说够用，但对零容错系统（自动驾驶 / 医疗 / 银行客服）远远不够
- "World model" 的反例：金融系统、物理空间、时间因果——LLM 都没有

**Claude Code 泄露事件的解读（关键）：**
2026 年 3 月底 Anthropic 因为漏写 .npmignore，把 Claude Code 整个 source map 推到了 npm（512K 行 TypeScript / 近 2000 文件）。Marcus 反复在三场访谈里引用这件事：
- 50 万行代码里有 **52 个独立的 symbolic tool**
- 是 LLM 调用经典符号 AI 工具的混合架构
- "What has made Claude Code so good is not so much the scaling, it's actually borrowing old ideas that were out of favor."
- Anthropic 嘴上不承认 neurosymbolic，但产品代码出卖了真实路线

**"Recombination 是创造力，但不是 genius" 论：**
跟 Greene 讨论 LLM 是否真的创新时，Marcus 接受 LLM 等于 99.9% 普通人的创造力（高强度 recombination），但拒绝接受它能到 Einstein/Dylan 那一档——"取出从未被组合过的元素并组合"的冲动还在人手里。

### 三、Bug Bash 2026 火药味 fireside——Will Wilson 提问

Antithesis CEO Will Wilson 主持，会议主题是 "extracting reliable software from the slop factory"。

**开场：** "我问 AI 圈大佬该问你什么问题，好几个建议我把你 disinvite。" Marcus 回："我点名批评了他们，他们不喜欢。"

**Bear case 的精确版：**
- AGI 不是不可能，是 ≥10 年才可能
- LLM 公司估值（万亿级别）的隐含要求是 *winner-take-all + 不被国有化 + 不被仿冒*——三个条件同时成立的概率极低
- 中国蒸馏 + Zuckerberg 把 Llama 开源 → "Winner take all" 假设已经破产
- 政府对 Anthropic 走 supply chain risk 流程是历史性的——"all bets are off"

**Marcus 给出的可信工程路径：**
1. 神经 + 符号混合（neurosymbolic harness 已是事实标准）
2. World model induction —— "我们连原型都没有"，是 10 年级问题不是 1 年级
3. 软件验证（Antithesis 主线）—— LLM 越多产代码，确定性验证越关键
4. 时间推理 / 空间推理 —— 还没解决，VLA 模型在这两块表现差

**Marcus 的精准比喻（最辣的几句）：**
- "LLM 公司给投资人的承诺是：我们造个比现存任何东西都强大的东西。然后它不被国有化，没人偷它。这个概率有多大？"
- "Cloud Code 是 2026 年最有创新的产品，因为它是把 50 万行符号代码和 LLM 婚配在一起。"
- "未来 10 年最可能的结局是：政府要救助 LLM 公司，因为 too big to fail——这意味着房间里所有人都在为这场烂摊子买单。"
- 收尾彩蛋："你大概会在周日 _Last Week Tonight_ 上听到更多这种愤世嫉俗。"

---

## 启发与见解

这三场对我们在做的事有几个直接撞击：

**一、neurosymbolic 已经从 "异端论点" 变成 "事实标准"，但行业不愿意叙事更新。**

Claude Code 的代码出卖了 Anthropic 的真实架构。这件事我们应该当作信号：

- 我们 graph + skill + tool 的架构本来就是 neurosymbolic 的——LLM 做模糊推理，graph 做确定性记忆，skill 做程序性知识，tool 做副作用。这个架构不需要"假装是纯 LLM"。
- 反过来说，OpenClaw / Claw / Momo 这种把符号工具显式化的设计反而是工程诚实的代表，不需要被 "scaling 解决一切" 的叙事压抑。
- **行动项**：在做架构对外解释时直接讲 "我们是 neurosymbolic"，不要遮遮掩掩说 "AI agent"。这是个品牌差异化机会。

**二、World model 是 10 年级问题，但工程上的"伪世界模型" 是 1 年级问题。**

Marcus 说真正的 world model induction（从原始数据归纳出可推理的世界模型）十年看不到原型。但工程上我们可以做"伪世界模型"：

- agentic-filesystem 给 AI 一个文件系统视角的世界
- mind-palace 给 bookmark 一个空间记忆视角的世界
- Fluid Agent 把 VFS 当记忆载体，本质是手工搭建的 world model

这些都不是 induction，是手工建模。但 Marcus 这套话给了我们一个清晰的定位语言：**"在 LLM 之上手搭 trustable world model 的脚手架，等待 induction 突破到来"**。这比 "we build AI tools" 强一百倍。

**三、"approximator vs reasoner" 是测试框架。**

要 ship 任何 agent 类产品，先问一个问题：
- 这个流程是 "human in the loop, 80% 够用"——LLM 直接干
- 还是 "zero-fail, 错一次代价大"——必须用 symbolic + 验证

JotJot 写笔记 → approximator 模式
Paw 跑 destructive shell → reasoner 模式（必须 symbolic 兜底）
Watson 改代码 → 中间地带，要 test harness + symbolic gate

这套二分法应该贴到 dev-methodology skill 里当默认 lens。

**四、Marcus 强调的 "discovery rate" 是反 hype 的清醒剂。**

他说 2012-2026 这 14 年只产生了三个真正的突破：神经网络上 GPU、Transformer、neurosymbolic 复兴。我们经常被 "下个月又一个 SOTA" 的节奏带偏；但站在 14 年维度看，重大突破的速率非常稳定。**这意味着：投资 14 年才能兑现的能力（world model induction）是合理的；豪赌 1 年内出 AGI 是数字上不合理的。**

**五、"too big to fail bailout" 是真实场景，不是危言耸听。**

如果 OpenAI / Anthropic / xAI 任何一个崩盘，政府救助是默认结局。这不影响我们做产品，但影响：
- 不要把核心能力 lock in 在某个 frontier lab 的 API 上
- 本地化 + open weight 路径必须保留
- agentic-service 的多引擎架构（已经做了）就是这个保险

---

## 相关链接

- [Goldman Sachs — Tracking Trillions: The Assumptions Shaping the Scale of the AI Build-out](https://www.goldmansachs.com/insights/articles/tracking-trillions-the-assumptions-shaping-scale-of-the-ai-build-out) — 用 NVIDIA 数据中心收入预期反推全行业 capex，跟 Marcus 的 \$1.6T 数字互证
- [Forbes — Neuro-Symbolic AI Gains Needed Street Cred After Fluky Leak Of Anthropic Claude Code Components](https://www.forbes.com/sites/lanceeliot/2026/04/12/neuro-symbolic-ai-gains-needed-street-cred-after-fluky-leak-of-anthropic-claude-code-components/) — Claude Code 泄露事件的工程视角拆解
- [Marcus — A knockout blow for LLMs?](https://garymarcus.substack.com/p/a-knockout-blow-for-llms) — 这次三连发的理论基础，泛化能力的根本性缺陷
- [Marcus — How o3 and Grok 4 Accidentally Vindicated Neurosymbolic AI](https://garymarcus.substack.com/p/how-o3-and-grok-4-accidentally-vindicated) — Marcus 自己梳理 neurosymbolic 复兴的脉络
