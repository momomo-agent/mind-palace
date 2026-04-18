# State of the Claw — Peter Steinberger 演讲全文解读

🎤 OpenClaw 创始人 Peter Steinberger 在项目 5 个月时的全面复盘。从安全噩梦到架构重构，从 dreaming 到 taste，这是一个开源维护者的真实战场报告。

## 规模与速度

OpenClaw 5 个月：GitHub 历史上增长最快的软件项目。30000 commits，接近 2000 贡献者，近 30000 PRs。速度没有放缓。

Steinberger 同时在 OpenAI 工作和运营 OpenClaw 基金会——"running the foundation is like running the company on hard mode"。志愿者不能像员工一样指挥，所以他一直在改善 bus factor（关键人物依赖度）。

现在有 NVIDIA、Microsoft（帮做 MS Teams 和 Windows app）、Red Hat（安全和 Docker 化）、腾讯、字节跳动的人参与。中国公司是比其他大洲更大的用户群。

## 安全：1142 个 Advisory

这是演讲的重头戏。5 个月收到 1142 个安全报告，平均每天 16.6 个。99 个是 critical。已发布 469 个，关闭了 60%。

对比：Linux 内核每天 8-9 个，curl 总共 600 个。OpenClaw 是 curl 的两倍。

Steinberger 的经验法则：**报告者喊得越凶说越 critical，越可能是 AI slop。** 安全报告领域正在被 AI 工具淹没——它们能找到最诡异的多链漏洞，但也产生大量噪音。

### NVIDIA NemoClaw 的故事

NVIDIA 发布 NemoClaw 作为 OpenClaw 的安全沙箱层。Steinberger 在发布前一天用 Codex Security 测试，半小时内找到 5 种沙箱逃逸方法。原因：Codex Security 用的是比公开版本更强的网络安全模型。

### Supply Chain Attack

有人提交了一个看起来完美的 PR——代码质量好、测试通过、文档完整。但藏了一个 supply chain attack。Steinberger 的反应：**"The code was too good. That's what made me suspicious."** 在 AI 时代，完美的代码反而是红旗。

他们现在的策略：所有新贡献者的 PR 都要人工审查，不管 CI 是否通过。

### Agents of Chaos 论文

一篇关于 AI agent 安全的论文，描述了 agent 如何被利用来攻击系统。Steinberger 说这篇论文改变了他对 agent 安全的思考方式——不只是防止 agent 被黑，还要防止 agent 被社会工程学操纵。

## 架构演进：从 Spaghetti 到 Plugin

最初 OpenClaw 是一坨意大利面代码。过去几个月的核心工作是把一切变成 extension/plugin 架构。

现在的理念：**"More like Linux where you just can install your own parts."** 你可以加 memory、加 wiki、加 dreaming、加任何疯狂的想法，不需要提 PR（因为 PR 队列已经严重过载）。

### Dreaming

OpenClaw 新增了 dreaming 功能——agent 在空闲时进行自由联想和记忆整合。Steinberger 说这是"第一小步"，方向是让 agent 有更深层的认知能力。

### Wiki

Andre（另一个核心贡献者）做的 wiki 功能——收集所有信息到一个知识库。Steinberger 说 wiki 更偏 memory，但"everything kind of blends a little bit together"。

## Taste、System Design 和 Saying No

Q&A 环节最精彩的部分。被问到"AI 时代工程师应该培养什么技能"：

1. **Taste（品味）**：最重要的。决定了产出是 slop 还是好东西。

2. **System Design（系统设计）**：如果不思考系统设计，最终会把自己刷进死角。"Everything is in the Clenker, but you still need to ask the right questions."——同样的工具，问对问题出好代码，问错问题出垃圾。

3. **Saying No（说不）**：这是他自己学到的。任何疯狂的想法都只是一个 prompt 的距离。单个想法从来不是问题，但这个想法加那个想法加那个想法加那个想法，它们如何组合在一起——那才是问题。

### Agent 的视角问题

Steinberger 描述了 agent 的根本困境：**"Imagine the world from your Clenker. You're being thrown into a codebase, you might have an outdated agent store in default, but you basically don't know what this is."** 你让它加用户档案，它会连接到它能看到的两个东西，但它没看到整个系统。

这就是为什么局部解决方案会产生 warts（疣）。**我们的工作是帮 agent 做到最好——提供 hints：你要考虑这个，你要看那里，这跟那个怎么交互。** 最终得到的是一个真正可维护的系统。

## 关键洞察

- AI 安全报告正在被 AI 工具淹没，"完美的代码"反而是供应链攻击的红旗
- Plugin 架构是开源项目规模化的必经之路——不能让所有人都走 PR 流程
- Agent 的根本问题是缺乏全局视角，人的价值在于提供系统级的 context 和约束
- Taste + System Design + Saying No 是 AI 时代工程师的三大核心技能
- Dreaming/Wiki/Memory 正在融合，方向是更深层的 agent 认知能力
