# Boris Cherny：Claude Code 创造者的完整职业故事

> 来源：Ryan Peterman 的 Developing Dev 播客，1.5 小时深度访谈
> 原文：https://www.developing.dev/p/boris-cherny-creator-of-claude-code
> 视频：https://youtu.be/AmdLVWMdjOk

## 从自学到 Meta

Boris Cherny 没有 CS 学位。他从小在以色列长大，高中开始自学编程，做了很多小项目——从 PHP 论坛到 Flash 游戏。大学读的是经济学，但一直在做 side projects 和创业。

他认为 CS 学位不是必需的："我从来没觉得缺少 CS 学位阻碍了我。学编程最好的方式是实践，理论可以之后再补。"

进 Meta（当时的 Facebook）时，他被 under-leveled 到 mid-level（IC4），尽管已经有丰富的工作经验。但他认为这反而是好事——"来低了给你空间去探索，去做 cool stuff，而不是一进来就被项目影响力和 checkbox 绑住。"

## Side Quests 哲学

Boris 最核心的职业理念之一是 **side quests**——在主线工作之外做的探索性项目。

他在 Meta 做了大量 side quests：
- 写了 Facebook Groups 的 lint rules（后来成为全公司标准）
- 建了大数据集单元测试框架（解决了 10M 成员群组的 SEV 问题）
- 推动了 Comet（Facebook 新 web 架构）在 Groups 的落地

他招人时也看这个："我看有没有 side projects。哪怕是做康普茶的人——说明他有好奇心，会深入钻研。"

关键洞察：side quests 不是浪费时间，是建立技术判断力和影响力的最佳路径。

## IC4 → IC8 的晋升路径

### IC6（Staff）：Facebook Groups Chat + Comet 迁移

Groups 要上聊天功能，Boris 主动请缨写 JavaScript（之前在 FB 一直写 PHP）。当时 Groups 的 web 端是静态 PHP 页面，他推动了向 Comet（React SPA）的迁移。

关键决策：他说服团队让他先做一个 prototype，证明新架构的可行性。"不要等别人给你许可，先做出来让人看到。"

### IC7（Senior Staff）：推翻高级工程师的决策

一个叫 Bob 的资深工程师推动了一个大规模数据模型迁移（区分 group member 和 follower）。Boris 执行了这个迁移，但在过程中发现这个决策是错的。他推动 Bob 自己来撤销这个迁移。

"你必须先赢得信任。先 disagree and commit，执行别人的决策，展示你愿意这么做。然后当你有了足够的技术判断力，再推回去。"

Bob 后来成了他晋升 IC7 的 champion。

### IC8（Principal）：Instagram 跨组协作

转到 Instagram 后，Boris 负责一个跨多个团队的大项目。最大的挑战不是技术，是文化差异——不同团队有不同的工作方式和优先级。

"跨组协作的核心是找到 shared goal。如果你找不到一个所有人都认同的目标，文化差异会杀死项目。"

## 产品工程的核心原则：Latent Demand

Boris 认为产品工程最重要的原则是 **latent demand**（潜在需求）：

"你永远不能让用户做他们还没在做的事。你只能找到他们已经有的意图，然后让它更容易实现。"

这个原则贯穿了他在 Facebook Groups 的所有产品决策——从公开群组到聊天功能，都是发现用户已经在做的事情，然后降低门槛。

## 加入 Anthropic 与 Claude Code

Boris 离开 Meta 后加入 Anthropic，创建了 Claude Code。

关于 Claude Code 为什么成功，他没有在采访中详细展开技术细节，但从他的工作方式可以看出核心理念：

**现在的工作方式完全变了：**
- 每天早上用手机开几个 Claude Code agent 开始写代码
- 到电脑前检查状态，代码好就直接 merge
- 有时 pull 到本地微调一下
- "6 个月前你问我会不会这样写代码，我会说你疯了"

**对工程未来的判断：**
- 20-30 个工程师两年的 Facebook Groups 迁移，现在大概 5 个工程师 6 个月
- 再过半年可能 1 个人就够
- 工程师从 maker schedule 转向 manager schedule——orchestrating 而非 manually coding
- 非工程师（比如 EM Fiona）现在也能每周写好几次代码

**Plugins 的故事：** 同事 Daisy 用 Claude Code 设了一个 Asana board，然后开了 20 个 Claude 在 Docker dangerous mode 里并行构建 plugins，周末就做完了。"这就是工程的未来。"

## 给年轻自己的建议

"Just use common sense."

"大公司里有很多东西会把你拉离常识——组织惯性、错位的激励、'一直是这样做的'。创业也一样。用常识去判断市场要什么、用户要什么，然后去做。相信自己，培养你的常识。"

## 其他值得记住的点

- **推荐书**：Functional Programming in Scala——"你可能永远不会日常用 Scala，但它会彻底改变你思考编程问题的方式。最重要的是学会 thinking in types。"
- **Imposter syndrome**："每个级别都应该有一点 imposter syndrome，如果没有说明你没在 push 自己。它不会突然消失，只是慢慢淡去。"
- **VP review 技巧**（半开玩笑）："永远给三个选项，80% 的时候他们会选中间那个。"
- **关于 competition**：没有详细展开，但态度是专注做好自己的产品。
- **工作时间**：9 to 6，只用两根手指打字，但产出惊人。秘诀就是 Claude Code + 好奇心。
