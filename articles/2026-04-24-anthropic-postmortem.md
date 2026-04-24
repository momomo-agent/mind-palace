# Anthropic 官方 Postmortem：Claude Code 为什么变笨了

> 来源：Anthropic Engineering Blog
> 日期：2026-04-23
> 原文：https://www.anthropic.com/engineering/april-23-postmortem

## 背景

过去一个月，大量用户反馈 Claude Code 变笨了。Anthropic 调查后发现是三个独立的 harness/product 层问题叠加，API 和模型本身未受影响。所有问题已在 4/20 的 v2.1.116 中修复。

## 三个根因

### 1. Reasoning Effort 降级（3/4 → 4/7 回滚）

Opus 4.6 发布时默认 reasoning effort 设为 `high`。但部分用户遇到 thinking 时间过长导致 UI 看起来卡死的问题。

3 月 4 日，团队将默认值从 `high` 改为 `medium`。内部 eval 显示 medium 在大多数任务上"智能略低但延迟显著降低"，同时避免了长尾延迟问题，还能帮用户省 usage limit。

但用户很快反馈 Claude Code 感觉变笨了。团队做了一系列 UI 改进（启动提示、内联 effort 选择器、恢复 ultrathink），但大多数用户保持了 medium 默认值。

4 月 7 日回滚：Opus 4.7 默认 `xhigh`，其他模型默认 `high`。

教训：延迟 vs 智能的 tradeoff 不应该替用户做决定。

### 2. 缓存优化 Bug（3/26 → 4/10 修复）

这是最严重的问题。

设计意图：session idle 超过 1 小时后，prompt 已被 cache evict，此时清除旧的 thinking sections 可以减少 uncached tokens，降低恢复成本。清除一次后恢复正常发送完整 thinking history。

实现 bug：清除不是只执行一次，而是在 session 剩余的每一轮都执行。一旦 session 触发过 idle 阈值，后续每个请求都只保留最近一个 thinking block，丢弃之前所有的。更糟的是，如果用户在 Claude 执行 tool use 的过程中发消息，新 turn 也会在 broken flag 下启动，连当前 turn 的 reasoning 都被丢弃。

表现：Claude 越来越健忘、重复、做出奇怪的工具选择。同时因为持续丢弃 thinking blocks 导致 cache miss，用户的 usage limit 消耗更快。

为什么没被发现：这个 bug 通过了多轮 human code review、automated code review、单元测试、E2E 测试、自动验证和 dogfooding。原因是它只在 stale session（idle 超 1 小时）触发，且两个无关的内部实验（消息队列实验 + thinking 显示方式变更）掩盖了症状。

有意思的细节：团队用 Opus 4.7 的 Code Review 回测了出问题的 PR，Opus 4.7 能发现这个 bug，Opus 4.6 不能。

### 3. 系统 Prompt 限制词数（4/16 → 4/20 回滚）

Opus 4.7 比前代更啰嗦。为了控制 output tokens，团队在系统 prompt 中加了一行：

> "Length limits: keep text between tool calls to ≤25 words. Keep final responses to ≤100 words unless the task requires more detail."

经过数周内部测试和 eval 无回归后上线。但更广泛的 eval 发现 Sonnet 4.6 和 Opus 4.7 都有 3% 的智能下降，立即回滚。

## 为什么看起来像"广泛退化"

三个问题影响不同的流量切片（不同模型、不同 session 状态），在不同时间段发生（3/4、3/26、4/16），叠加后的聚合效果看起来像广泛、不一致的退化。早期报告很难与正常的用户反馈波动区分开。

## 核心教训

1. 内部 dogfooding 用的不是公开版本——测试新功能的内部版本掩盖了公开版本的问题。以后会确保更多内部员工使用完全相同的公开版本。

2. Prompt 对智能的影响比想象的大——一行 25 词限制就能造成 3% 的智能下降。每次 prompt 变更都需要跑更广泛的 per-model eval suite。

3. 缓存/context 管理是 harness 层最危险的区域——bug 在 context management、API、extended thinking 的交叉点，通过了所有自动化检查。

4. 三个独立小问题的叠加效果可以看起来像一个大问题——这让 root cause 分析变得极其困难。

## 对我们的启发

这个 postmortem 跟我们的经验高度相关：

- harness 层问题 vs 模型问题的区分——我们用 OpenClaw 也经常遇到"感觉模型变笨了"，但实际可能是 prompt、context 管理、或配置问题
- dogfooding gap——kenefe 一直强调的"不 dogfood 的库不可能好用"，Anthropic 踩的就是这个坑
- prompt 对智能的影响——我们的 AGENTS.md/SOUL.md 也是系统 prompt 的一部分，每次修改都可能影响模型表现
- 缓存 bug 的隐蔽性——只在特定条件（stale session）触发，且被其他实验掩盖，这种 bug 最难发现
