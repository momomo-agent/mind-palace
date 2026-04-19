# Boris Cherny: Coding Is Solved, Building Is Just Beginning

> 来源：Lenny's Podcast 访谈 + LinkedIn 摘要
> 标签：AI, Develop

## 谁是 Boris Cherny

Claude Code 的创造者和负责人。从 2024 年 11 月开始，他 100% 的代码都由 Claude Code 编写，没有手动编辑过一行。每天发 10-20-30 个 PR。

## 核心观点

### Coding is largely solved

不是"AI 能写代码了"这种泛泛的说法。Boris 的意思是：对于有经验的工程师，AI 已经能处理从构思到 PR 的完整编码流程，人类的角色变成了 review 和方向把控。

"Software engineer"这个头衔会消失，被"builder"取代。因为当编码本身不再是瓶颈，区分人的不再是写代码的能力，而是知道该建什么、怎么建。

### Always bet on the more general model

这是 Rich Sutton "Bitter Lesson" 的直接应用：通用方法 + 更多计算 > 精心设计的特定方案。

在 agent 工程里，这意味着：不要过度设计 workflow 和 scaffolding 来弥补模型的不足。模型会变强，你的 scaffolding 会变成负担。Over-scaffolding loses to scale。

### Build for the model 6 months from now

不要为今天的模型限制设计产品。设计时假设模型能力会在 6-12 个月内大幅提升。如果你的架构只在当前模型能力下才有意义，它很快就会过时。

### Latent demand as product strategy

观察用户怎么"误用"你的工具——那就是下一个产品的信号。Co-work（Claude Code 的协作模式）就是这么来的：他们发现很多人用 Claude Code 做非编码任务。

### Underfund to accelerate

小团队 + AI 比大团队更快。约束驱动 AI 杠杆——当你人手不够时，你被迫让 AI 做更多，反而发现 AI 能做的比你想象的多。

Co-work 10 天就完成了，完全用 Claude Code 实现。

### Unlimited tokens as strategic weapon

早期不要优化 token 成本。鼓励激进实验，成本纪律以后再说。过早优化会扼杀创新。

## 跟我们的关联

Boris 的"always bet on the more general model"直接挑战了我们 DevTeam 的复杂多角色架构。如果通用模型足够强，也许不需要 4 个专门角色——一个足够好的模型 + 简单的 harness 就够了。

但反过来想：即使模型变强，context window 仍然是有限的。四角色的核心价值不是弥补模型能力不足，而是 context 隔离——让每个角色专注于自己的任务，不被其他信息污染。这个价值不会因为模型变强而消失。

关键是找到平衡点：足够简单以利用模型的通用能力，足够结构化以管理 context。
