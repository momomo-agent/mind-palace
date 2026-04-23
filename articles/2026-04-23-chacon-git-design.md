# GitHub 联合创始人：Git 从来没被设计过

> 来源：SaitoWu 对 Scott Chacon × a16z 播客的深度笔记
> 原始播客：[Rebuilding Git for AI Agents - a16z](https://www.youtube.com/watch?v=vJiCnQeYLho)

## Git 是一个没有设计者的工具

Scott Chacon 说了一句大实话：Git 当年根本没想过要做面向用户的产品。

它是给 Linux 内核团队写的管道命令，本质就是一堆 Perl 脚本凑合用——核心团队自己写 Perl，懒得写的人就直接用这些脚本。后来这套东西被社区采纳，又从 Perl 改写成 C，但命令几乎没变。20 年过去了，没有人真正从"产品设计"的角度驱动过它的演进。

他形容 Git 是一个"Frankenstein"。什么都往里加，功能很强，但没有设计感。作为一个开源项目，"只要看起来还行的想法就会被加进去"，但没有人定义产品方向，也没有人真正 say no。

Git 的设计基于 Unix philosophy：每个命令只做一件事，输出可以 pipe 给下一个命令。但这从一开始就是一个折中——既想让机器好用，又想让人类可读，结果是两边都没做好。Git 解决的是底层 hard problems（delta 压缩、wire 传输协议、tree 的高效读写），但用户体验从来不是目标。

## GitHub 团队和 Git 核心团队的关系

Scott 回忆，当年 GitHub 刚起来时，Git 核心团队觉得他们"不太聪明"，因为 GitHub 团队不会写 C。后来这种"勉强的尊重"（grudging respect）是慢慢建立的——因为太多项目迁移到了 GitHub。

但 Linus 的真实态度是：GitHub 只是"不错的托管商"，但"我讨厌 PR，讨厌你们那套东西"。本质上就是把 GitHub 当免费托管用。

## 为什么 AI Agent 和 Git 合不来

一个非常精准的观察：

- Agent 每执行一个命令，就要查一次 status
- Interactive rebase 对 agent 来说几乎是噩梦
- Agent 需要不断解析 Git 的文本输出，再自己做决策

但 Git 从来没为这种使用方式设计过。更有意思的是：agent 现在还在用 sed、grep 这些 20 年前的 Unix 工具。甚至很多年轻人，是被 agent 教会这些工具的。

## GitButler 的解决方案：Virtual Branches

他的答案不是推翻 Git，而是"加一层"。核心思路：保留现有的数据存储和传输协议，在用户界面层注入 product taste。GitButler 可以和普通 Git 自由切换，是一个 drop-in replacement。

最关键的技术创新是 Virtual Branches（虚拟并行分支）：

- 所有人（人类或 agent）在同一个代码库上工作
- 用 virtual branches 隔离每个人的改动
- 不复制文件，不产生传统 merge conflict
- 用户"感觉"在自己的分支上，但底层没有真正分叉
- 改动在一个 loop 结束或尝试提交时自动合并

这不是隔离，而是真正的并行协作。对比现在常见的 Git WorkTree 方案（给项目做多份副本，每个人在不同副本里开发，再手动合并），Virtual Branches 优雅得多。

## 代码审查已经过时了

Scott 说得非常直接："你真的会把 PR 从头读到尾吗？"

现实是大多数人只是扫一眼，没明显问题就 approve。PR 模式还带来了"commit slop"——"oops"、"fix again"、"actually fix"，commit message 逐渐失去意义。

而早期 mailing list 模式更好：patch 本身就是 artifact，逼着你写清楚。

在 agent 时代：自动拉取 patch → 编译 → 跑测试 → 输出摘要。Review 变成"验证结果"，而不是盯 UI。

## Metadata 会变得比代码更重要

他们在实验把这些信息直接挂到版本控制上：chat transcript、tool call logs、设计规格。让版本控制记录"为什么"，而不是只记录"做了什么"。

但问题也很现实：每个 prompt 都存，每次调用都存，数据量会爆炸。他还做过一个 CRDT 实验：记录每一次 file buffer save，可以回到 17 分钟前任意状态。技术很酷，但 UI 完全不可用，信息过载，最终被砍。

结论很直接：能做出来 ≠ 人类能用。

## 未来最强的工程师

全场最重要的一句话："未来最强的工程师，是那些能沟通、能写作、能描述的人。"

当 AI 把"how"变得极其便宜，约束变成 why 和 what。能清晰定义产品、写好 spec 的人，才能真正驾驭 agent。

多 agent 协作的正确方式不是同时跑 20 个 agent（那是管理灾难），而是让 agent 在"空闲时间"通信——"我在改这个文件，你别动。"本质上是在解决一个老问题：inter-team communication。而这正是 agent 最擅长的。
