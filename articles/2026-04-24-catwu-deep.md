# Cat Wu × Lenny 完整播客深度笔记：Anthropic 产品团队的运作方式

> 来源：Lenny's Podcast × Cat Wu（Anthropic Claude Code/Cowork 产品负责人）
> 日期：2026-04-23
> 时长：85 分钟

## Cat Wu 的角色

Cat Wu 和 Boris Cherny 的分工：Boris 是 tech lead 和产品 visionary，负责"3-6 个月后产品应该是什么样"的 AGI-pilled 版本。Cat 负责从当前状态到那个愿景的路径规划，以及跨职能协调（marketing/sales/finance/capacity）。两人 80% mind meld，各自驱动剩下 20% 自己更关心的部分。

## Anthropic 为什么快

不是因为模型强（虽然这是优势），而是流程设计：

1. 极低流程摩擦——团队预期是任何人一周内把 idea 推到用户手里，有时一天
2. Research Preview 机制——几乎所有功能先以 research preview 发布，明确标注"这是早期产品，可能不会永久支持"。降低发布承诺，一两周就能出东西
3. Evergreen Launch Room——工程师觉得功能 ready 且内部 dogfood 过后，发到 launch room，docs/PMM/DevRel 第二天就能出 marketing announcement
4. PM 的角色是搭建这个流程框架，让工程师知道什么时候拉跨职能伙伴、期望是什么

## PM 角色的重写

Cat Wu 面试数百 PM，发现大多数人还在用旧范式思考：

旧范式：6-12 个月规划周期，多季度 roadmap 对齐，代码昂贵所以重协调
新范式：功能周期从 6 个月→1 个月→1 周→1 天，PM 的核心是缩短 idea→上线时间

最强 PM 能力三件事：
1. 设定清晰目标——LLM 太通用导致歧义大，PM 要能说清"我们的用户是谁、解决什么问题、什么是成功"
2. 建立可重复的发布流程
3. 搭建跨职能框架让团队自主决策

PRD 没有死——对特别模糊的功能或需要重基础设施的项目，还是会写 one-pager。但大多数功能不需要。

## 团队结构

Anthropic 约 30-40 个 PM，分几个团队：
- Research PM（Diane 领导）：收集模型反馈→喂给研究团队，管理模型发布
- Developer Platform：维护 API，发布 managed agents
- Claude Code：Claude Code + Cowork 核心产品
- Enterprise：成本控制、RBAC、安全控制
- Growth：跨产品增长

## 角色融合与 Product Taste

PM/工程师/设计师三类角色在融合。Claude Code 团队优先招有 product taste 的工程师——这样一个工程师能端到端从看到 Twitter 反馈到周末发布产品，几乎不需要 PM 参与。

几乎所有 PM 都有工程背景或在 Claude Code 上写过代码。设计师也是前端工程师出身。

Product taste 是最稀缺的能力——代码越便宜，决定写什么就越值钱。

工程背景的价值（至少未来几个月）：知道一件事有多难，影响优先级判断。但 Cat Wu 说"至少未来几个月"——因为每几个月模型能力就有大跳跃，改变什么技能有价值。

## 与模型对话的技巧

Cat Wu 最推荐的 AI PM 技能：让模型反省自己的行为。

当模型做了意外的事（比如改了前端但没用 UI 验证），直接问它"为什么你这样做"。模型会说：
- "系统 prompt 里有个地方让我困惑"
- "我没意识到前端验证是任务的一部分"
- "我把验证委托给了 sub-agent，sub-agent 没做，我没检查它的工作"

这能暴露 harness 的问题，然后修复。

## 新模型来了怎么办

每次新模型发布，团队做两件事：
1. 移除不再需要的功能——很多功能是给模型的"拐杖"。经典例子：to-do list。早期模型改 20 个 call site 会改 5 个就停，加了 to-do list 强制它记住。后来的模型自然会用 to-do list，再后来连 to-do list 都不需要了
2. 启用之前不够好的功能——Code Review 试了好几次，直到 Opus 4.5/4.6 才达到"团队依赖它来 merge PR"的质量

核心策略：提前构建"还不完全能用"的产品原型，等新模型出来直接换进去测试是否 close gap。

## Claude Code vs Desktop vs Cowork 的定位

- Claude Code CLI：最强大，功能最先落地，适合一次性编码任务
- Desktop：前端开发（preview pane 实时看 web app）、非技术用户（terminal 不友好）、全局控制面板（看所有 session）
- Web/Mobile：移动端启动任务，不用带笔记本
- Cowork：输出不是代码的任务——slide deck、inbox zero、文档、launch plan

## Cowork 实战案例

Cat Wu 的例子：为 Code with Cloud 大会做 slide deck。
1. 连接 Google Calendar/Slack/Gmail/Google Drive
2. 告诉 Cowork 叙事方向 + PMM 的草稿 + 自己不满意的手动版本
3. Cowork 先出 proposed outline（遍历 Twitter/launch room/announce channel）
4. Cat Wu 做最终决策：选哪些内容、哪些 demo
5. Cowork 跑了一个小时，产出 20 页 deck，用了 Anthropic 设计系统（颜色/字体/slide format）
6. 早上醒来看到 deck，"pretty good"，给了一轮反馈（太啰嗦），比自己做快很多

Applied AI 团队（技术 GTM）的用法：每天 5-10 个客户会议，前一晚让 Cowork 准备 dossier——客户历史、action items、最新 ETA（从 Slack 搜索）。

## 别停在 95% 自动化

原话："If an automation doesn't work 100% of the time, it's not really an automation. And that last 5 to 10% does take more time."

Cat Wu 自己也承认 guilty——她的 Gmail 自动分类 spammy 邮件做到 95% 但偶尔漏重要邮件。

Anthropic 也在改进这个流程——目前用户要知道太多概念（定义 skill、使用 skill、给反馈、更新 skill、检查反馈是否被正确整合）。

## 产品愿景：从单任务到百任务

进化路径：
1. 单任务成功率 → 2. 多任务并行（multi-coding，2025 末开始） → 3. 50-100 个任务同时跑 → 4. 远程执行（本地 RAM 不够） → 5. 自动验证（agent 自己确认完成） → 6. 自我改进（从反馈中学习，永不重复同样错误）

## 角色融合的代价

Cat Wu 坦诚承认牺牲了产品一致性——功能有时重叠（两个 form factor 都喜欢，让用户告诉我们哪个更好），新用户不知道最佳路径，用户觉得跟不上更新节奏。

## Anthropic 成功的两个核心因素

1. 统一使命——"bring safe AGI to all of humanity"不是口号，是决策框架。两个优先级冲突时，问哪个对 Anthropic 使命更重要，所有人 stand behind 决定。团队愿意牺牲自己的 KR
2. 聚焦——使命让团队不会去做社交网络、信息流等不相关的事

## 源码泄漏事件

Cat Wu 确认是人为错误——一个人用 Claude 写 PR（更新包发布方式），经过两层人工 review 仍然漏了。已加固流程。那个人还在 Anthropic，"It's a process failure"。

## OpenClaw 限制订阅使用

Cat Wu 的解释：Claude 订阅不是为第三方产品设计的，使用模式不同。需要优先保障第一方产品和 API。给了每个订阅用户一些 credits 作为过渡。

## 个人推荐

书：How Asia Works（经济发展政策）、The Technology Trap（历史技术革命对工人的影响）、Paper Menagerie（短篇小说集）
影视：Drive to Survive（F1）、Free Solo（攀岩）
产品：Waymo（每天两次，比 Uber 贵 2x 也愿意付）
座右铭："Just do things"——理解约束，推导行动，快速执行，从错误中学习
AGI 后：攀岩 + 读书（目标每周 1-2 本，现在 0.5）+ 学物理/机器人/航空航天
