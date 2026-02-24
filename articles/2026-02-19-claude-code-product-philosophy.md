# 人们只会做他们已经在做的事——Claude Code 背后的产品哲学

> **来源**: [宝玉 @dotey](https://x.com/dotey/status/2024164616595542458) · 原始视频: [The Lightcone (YC)](https://www.youtube.com/watch?v=PQU9o_5rHC4)

💡 **看点：Boris Cherny（Claude Code 创作者）在 YC 播客深度分享产品从终端小工具到 10 亿美元 ARR 的全过程，三条核心产品哲学值得所有 builder 反复读。**

---

## 要点速览

- Claude Code 最初只是 Boris 为了学 API 写的终端聊天工具，选终端是因为不用做 UI，至今还在终端里运行
- Anthropic 产品哲学："不为今天的模型构建，为六个月后的模型构建"
- Plan Mode 的全部技术实现就是在 prompt 里加一句"请不要写代码"，Boris 预测一个月内就不需要了
- Claude Code 推出后，Anthropic 人均工程生产力增长 150%（Boris 在 Meta 时数百人工作一年才能实现 2%）
- Boris 从 Opus 4.5 开始 100% 用 Claude Code 写代码，卸载了 IDE，每天约 20 个 PR

## 从"我在听什么音乐"到 AGI 时刻

Boris 给模型加了 bash 工具后问了一句"我在听什么音乐？"，Claude 写了一段 AppleScript 调用 Mac 音乐播放器查了当前播放的歌。那还是 Sonnet 3.5 时期。

> "那是我第一次真正感受到 AGI 的时刻。我意识到：这个东西就是想用工具，它只想跟世界互动。"

## CLAUDE.md 只需两行

Boris 的 CLAUDE.md 只有两行：提交 PR 后自动合并；PR 提交后发到团队频道让人审批。他的建议：

> "很多人把 CLAUDE.md 搞得太复杂了。删掉，从头来过。每个新模型需要的指令越来越少。"

## Plan Mode 的 30 分钟诞生

Boris 周日晚上 10 点浏览 GitHub issues，看到用户一直在说"先想想方案，别写代码"。他花了 30 分钟写完代码，当晚发布。

> "Plan Mode 没有什么秘密。它只是在 prompt 里加了一句'请不要写代码'。"

## 三条核心产品哲学

1. **潜在需求** — 人们只会做他们已经在做的事。帮他们把正在做的事做得更简单，而不是让他们做完全不同的事
2. **为未来的模型构建** — 不要为今天的模型做产品，要为六个月后的模型做
3. **永远不要跟模型对赌（The Bitter Lesson）** — 任何 scaffolding 都是技术债，下一个模型大概率自己就能做到

## 元编程故事

团队成员 Daisy 提交了一个 PR 给 Claude Code 加新功能。但她没有直接实现那个功能，而是先写了一个让 Claude Code 能够测试任意工具的工具，然后让 Claude 自己去实现了那个新功能。

## "软件工程师"头衔的消亡

Boris 认为编程将对所有人"基本解决"，"软件工程师"这个头衔可能会消失，变成"builder"。Anthropic 内部已经是这样：PM 写代码，设计师写代码，EM 写代码，财务人员也写代码。

> "我知道这件事可以变得多糟。当我想到今年会发生什么，最坏的情况非常非常糟糕。我想待在一个真正理解这一点的地方。"
