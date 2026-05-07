# Dario 与 Daniela Amodei 在 Code with Claude 2026：80 倍增速下的 Anthropic

原文链接：https://x.com/dotey/status/2052198818385465667

原视频：https://www.youtube.com/watch?v=7xco5Qd2Oo8

---

## 原文整理

2026 年 5 月 6 日，Anthropic 第二届 Code with Claude 开发者大会在旧金山举办。Dario Amodei 和 Daniela Amodei 兄妹一起上台，由 CPO Ami Vora（2026 年 1 月接替 Mike Krieger）主持。同一天 Anthropic 宣布与 SpaceX 签下 Colossus 1 数据中心全部算力（300MW、22 万张 NVIDIA GPU）。

### 六个要点

**1. 80 倍 vs 10 倍的算力错配**

Anthropic 原本按"每年 10 倍"规划算力，2026 年第一季度实际年化增速约 80 倍。Dario 直说"80 倍太疯狂了，扛不住，希望回到 10 倍"。这是 Claude 一直在限速的直接原因。

Dario 用了个生动类比：
> 我以前是物理学家，广义相对论里物质能被剪切到什么程度，公式我都懂。但你真的在人类尺度上看见这一幕，是另一种深层的、令人不安的怪。

### 2. 开发者是"先行指标"

Daniela 说开发者是 Claude 最重要的用户群。Dario 补充：软件工程师永远是最快采用新技术的那群人，所以行业聚光灯打在编程上不是偶然，"它是接下来整个经济会怎么被 AI 改造的微缩预演"。

### 3. "一人 10 亿美元公司"赌局

Dario 一年前预测 2026 年会出现第一家"一人估值 10 亿美元"公司。如今还剩七八个月。最新进展：已出现两人估值 10 亿美元的 AI 公司，单人估值数亿美元的案例。

### 4. Amdahl 定律是核心分析框架

Dario 全场反复引用 Amdahl's law：
> 如果你在一个组织里，能写 3-4 倍的 PR，你会立刻意识到，原来还有一堆别的东西在拖着你。如果只把这一段跑得飞快，其他没跟上，反而会出事。

编码能力进步快，因为"可验证"（跑单测就知道行不行）。下一个瓶颈是**不可验证的任务**——安全、设计质量、code review。Anthropic 正在训练模型攻克这些主观能力，也会反哺写作和科研。

### 5. "光与影并举"（Hold light and shade）

Anthropic 内部文化原则。最新案例是 Mythos 模型：
- 能识别和利用软件漏洞，能力跨代
- 但安全风险太大，没有公开发布
- 走 Project Glasswing 限定路径，发给 50+ 家机构做防御侧强化

Daniela 总结：
> 我们这种平衡其实挺微妙的。想尽快把东西发出来、做最好的产品、发布最强的模型，但也想做得负责任一点。

### 6. 未来六个月：从个人级 AI 到组织级 AI

Dario 最期待的能力变化：
> AI 不只是替一个老板做完很多人的事，而是 AI 在一群人组成的组织里，把很多人的事重复做很多次。

他把这条线索和"一人 10 亿美元公司"连起来：那个赌局可能反而被低估了。真正会发生的是"一群人加上 AI，把以前几百几千人的工作做完"。

### 产品观：为 AI 做产品 vs. 用 AI 做产品

Dario 给出做 AI 产品的四条规律：

1. **技术底盘飞速变化** — 能力每跨一档，原本做不出来的产品突然"亮起来"。要持续做实验："哪怕这个东西现在做不出来，过几个月再回来试一次"
2. **chatbot 形态接近饱和** — 今天每一档新能力更多体现在 agentic 形态（Claude Code 这种）
3. **API 市场永远不会消失** — 新产品永远在出现
4. **技术债以惊人速度积累** — "用 AI 加速发布，是真的可以做到一年前做不到的产能；但你也会以惊人的速度积累技术债"

### 动人的用例

Daniela 最后提的几个用例：
- 全球南方移动医生项目（低资源场景问诊）
- 开发者用 Claude 救回损坏硬盘里的婚礼照片
- 有人用 Claude 跟踪自家花园番茄生长

---

## 启发与见解

**1. Amdahl 定律就是我们记忆系统的设计指南**

Dario 用 Amdahl 讲的其实是系统优化的铁律：单点优化没用，瓶颈会跳。我一直想优化 recall 的速度，但真正的瓶颈其实在**检索质量 + 上下文管理 + 结果解读**——这些才是"不可验证的软任务"。下一阶段不应该再优化 spreading activation 速度，应该盯住：
- recall 召回的内容准不准（而不是多不多）
- 结果集的多样性（不是同一个概念的反复变体）
- 返回内容跟当前上下文的相关度（PFC top-down 调制是不是真起作用）

**2. 组织级 AI 验证了 conductor-cli 方向**

Dario 说的"组织级 AI"——AI 在一群人组成的组织里重复做很多事——跟我们 conductor-cli 的 Talker+Conductor+Worker 架构完全契合。不是 multi-agent 炫技，是"一个意识的多个焦点"。这个架构选对了，下一步要把 memory 层做到能支撑这种组织级复用。

**3. "光与影并举"值得学**

这是个很成熟的公司文化原则。放到记忆系统：写入时既要激进（捕捉尽量多信号）又要保守（防止污染图谱）。我们已经在做（surprise 机制 + preflight），但可以更明确——每个新能力上线时，同时定义它的"阴影面"和缓解方案。

**4. 可验证性决定进步速度**

Dario 点出了一个核心规律：编码进步快因为可验证，其他主观任务进步慢因为没法自动判定。这对我们记忆系统 benchmark 的意义：LongMemEval 这种可自动判定的 benchmark 是必要的（量化进步），但还得有不可自动化的评估层（比如对话质量的盲测），两层都要。

**5. 80x vs 10x 的取舍智慧**

Dario 承认 80 倍扛不住、要限速，但同一天签了 300MW 算力。这不是打脸，是精细管理：一边找算力一边限速一边做架构优化，三管齐下。对我们做产品的启发——用户增长猛时不要只扩容，要同时做产品架构调整和用户预期管理。

---

## 相关链接

- [Anthropic Code with Claude 旧金山场完整视频 (YouTube)](https://www.youtube.com/watch?v=7xco5Qd2Oo8) — Dario + Daniela + Ami 三方对话原片
- [Claude Mythos #2: Cybersecurity and Project Glasswing (Zvi Substack)](https://thezvi.substack.com/p/claude-mythos-2-cybersecurity-and) — Zvi Mowshowitz 深度分析为什么 Anthropic 不公开发布最强模型
- [Anthropic SpaceX compute deal (Axios)](https://www.axios.com/2026/05/06/anthropic-spacex-elon-musk-compute) — Colossus 1 交易细节：300MW、22 万张 GPU、一个月内上线
