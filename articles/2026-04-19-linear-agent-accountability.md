# Linear: Agent 不能被问责

> 来源：Linear 官方推文 + Julian Lehr
> 标签：AI, Design, Develop

## 一条设计原则改变了整个产品

Linear 的 AIG（AI Guidelines）第 6 条原则只有一句话："An agent cannot be held accountable."

这句话直接改变了 Linear 的 issue assignment 设计：当一个 issue 被委派给 agent 时，人类用户仍然是 primary assignee，agent 只是 contributor。

## 为什么这很重要

在传统项目管理里，assignee = 负责人。如果一个 bug 没修好，你找 assignee。如果一个 feature 延期，你问 assignee。

当 agent 成为 assignee 时，这个问责链断了。Agent 不会在 standup 里解释为什么延期，不会在 postmortem 里反思根因，不会因为连续失败而改变行为模式。

把 agent 设为 primary assignee 会制造一个责任真空——每个人都以为"agent 在处理"，但没有人真正负责。

## 设计决策

Linear 的解法很优雅：
- 人类 = primary assignee（负责人）
- Agent = contributor（执行者）

这意味着：
1. 人类始终能在看板上看到自己负责的 issue
2. Agent 的工作进度对负责人可见
3. 如果 agent 失败或卡住，负责人会收到通知
4. 问责链从未断裂

## 更深层的含义

这不只是 UI 设计问题，是一个关于 AI 系统中人类角色的根本性判断。

两种极端：
- **Agent 完全自主**：人类不参与，agent 自己决定做什么、怎么做、什么时候完成。效率最高但风险最大。
- **Agent 纯工具**：人类完全控制每一步，agent 只是执行命令。最安全但效率最低。

Linear 选了中间路线：agent 有执行自主权，但责任归属始终在人类。这跟 Anthropic 的 Constitutional AI 思路一致——AI 可以行动，但人类保持最终控制权。

## 跟我们的关联

我们的 DevTeam 里，kenefe 是产品经理定方向，四个 agent 各司其职。但问责链是清晰的——最终交付质量由 kenefe 验收，agent 不"负责"任何东西。

board CLI 的状态机（INBOX→PLAN→DEV→TEST→GATE→DONE）里，GATE 就是人类验收环节。没有 GATE，agent 可以自己把 feature 标记为 DONE，但没有人真正确认过它是否达标。

Linear 的设计提醒我们：在任何 agent 工作流里，都要有一个明确的"谁负责"的答案，而且答案永远是人。
