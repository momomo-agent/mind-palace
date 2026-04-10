# Boris Cherny: Coding Is Solved, Now What?

> Claude Code 负责人 Boris Cherny 在 Lenny's Podcast 的 87 分钟深度访谈。从 terminal 原型到占公开 GitHub commits 4%，从离开 Anthropic 去 Cursor 两周后回来，到"不要给模型套框架"的核心原则。

## 背景

Boris Cherny 是 Anthropic Claude Code 的创建者和负责人。Claude Code 从一个简单的终端原型开始，一年内彻底改变了软件工程的工作方式。Boris 自 2024 年 11 月起，100% 的代码由 Claude Code 编写，没有手动编辑过一行。每天发 10-40 个请求，同时跑 5 个 agent。

他出生在乌克兰敖德萨，1995 年移民美国。爷爷是苏联第一批程序员，用打孔卡编程。这个家族背景让他对"编程方式的变迁"有独特的视角——从打孔卡到软件，从手写代码到 AI 生成，每一代程序员都觉得下一代"不是真正的编程"。

## 去 Cursor 两周又回来

Boris 离开 Anthropic 加入 Cursor，因为喜欢产品和团队。但两周后回来了。原因很简单：在 Anthropic，如果模型不够好，他可以直接改模型。在其他地方，只能绕过模型的限制。

这个洞察很深刻——做 AI 产品的人分两种：能影响模型的，和只能适应模型的。前者的天花板高得多。

## 核心原则：不要给模型套框架

这是整期播客最重要的观点：

> "很多人的本能是给模型套严格的 workflow——step 1, step 2, step 3，用一个很花哨的 orchestrator 来编排。但几乎总是，你给模型工具、给它目标、让它自己想办法，效果更好。一年前确实需要 scaffolding，现在不需要了。"

Boris 的原则是 **"Don't try to box the model in"**——不要试图把模型装进盒子里。给它工具和目标，让它自己决定怎么做。

这直接挑战了当前主流的 agent 编排方式（包括我们的 DevTeam Phase 2 的可配置流程编排）。Boris 认为模型已经足够强，不需要人为设计执行路径。

## Context Window 管理

不要一次性塞太多 context 给模型。context window 越满，模型表现越差——跟人一样，同时塞 10 件事给你，你也会变差。

让模型自己决定需要什么信息，而不是预先把所有可能需要的东西都塞进去。

## 团队组织：每个人都写代码

Claude Code 团队里，PM 写代码、EM 写代码、设计师写代码、财务写代码、数据科学家写代码。50% 的角色重叠，很多人在做同样的事。

Boris 预测到年底，"software engineer" 这个头衔可能会消失，被 "builder" 取代。或者"每个人都是 PM，每个人都写代码"。

但设计师的情况不同。Lenny 做的调查显示，70% 的工程师和 PM 说 AI 让工作更愉快，设计师只有 55%，18% 说更不愉快（工程师只有 9%）。Boris 的解释是"我们的设计师也写代码，所以他们很开心因为可以自己 unblock"——但这是工程师视角的回答，没有触及设计的核心：视觉思维、空间推理、用户体验。

## 团队原则

1. **给工程师无限 tokens** — 不限制使用量，鼓励实验
2. **小团队 + 无限 tokens = 更好的 AI 产品** — underfund teams
3. **Build towards where the model is going, not where it is today** — 不要为当前模型的限制做太多 workaround

## Cowork：10 天构建

Cowork 是 Claude Code 的非终端版本，让不会用终端的人也能用 AI。10 天内构建完成。Boris 用 Cowork 做了 Lenny 的 50 道面试题，48/50 通过。

这验证了快速原型的价值——不是花几个月做完美产品，而是 10 天出原型，看市场反应。

## 人生座右铭：Use Common Sense

Boris 给同事最多的建议就是"用常识"。很多失败来自盲目跟流程、不思考就做事、做一个不好的产品但跟着惯性走。最好的结果来自 first principles thinking——如果闻起来不对，可能就是不对。

## 启发

1. **"不要给模型套框架"直接影响我们的 agent 架构方向** — DevTeam Phase 2 的可配置流程编排可能是过渡方案，Phase 3 的自组织才是终态。模型越强，编排越轻
2. **Context window 管理是核心变量** — 验证了 skill lazy loading 的设计方向
3. **"Build towards where the model is going"** — 不要为当前限制过度工程化
4. **小团队+无限 tokens** — Watson 开发可以借鉴
5. **角色模糊化趋势** — 跟 kenefe 之前说的"研发未来=做决策"完全一致
6. **设计师的困境** — AI 解放了工程师但没有解放设计师，视觉思维和空间推理还是人的领域
