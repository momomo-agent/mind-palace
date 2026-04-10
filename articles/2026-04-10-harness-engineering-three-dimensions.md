# Harness Engineering 三维度：一个独立开发者的半年验证

> Leo (@runes_leo) 用 Claude Code 当全天候工作伙伴半年，踩坑的形状跟 OpenAI/Cursor/Anthropic 三篇 harness engineering 报告描述的一模一样。三个独立的 scaling 问题，没有人同时解了三个。

## 三个维度

yage.ai 把三篇报告拆清楚了：

1. **交互维度（OpenAI）**：agent 的工作环境怎么设计。核心问题是知识传递——"Codex 看不到的等于不存在"
2. **空间维度（Cursor）**：几百个 agent 怎么并行不打架。单个 agent 够聪明，放在一起就开始互相覆盖
3. **时间维度（Anthropic）**：一个 agent 跑几个小时怎么不跑偏。长 session 的 context 退化和自评失真

三个独立的 scaling 问题。没有人同时解了三个。

## 交互维度：CLAUDE.md 的自然生长

Leo 的 CLAUDE.md 演进路径：

- 第一个月：每天花 15 分钟重复同样的话（项目是干嘛的、代码风格、哪些文件别动）
- 烦了 → 开始往 CLAUDE.md 写规则，几行提示
- 越写越多 → 6KB（用户信息、交付标准、协作偏好）
- 6KB 不够 → 拆成 rules/ 目录，4 个文件 22KB，每次 session 自动加载
- 另有十几份按需文档，CLAUDE.md 维护索引表，AI 自己判断需要读哪些

这跟我们的 skill 体系完全同构：AGENTS.md + SOUL.md + TOOLS.md 是自动加载的 context，skills/ 是按需加载的。

一条被逼出来的规则：持仓数据同时存在三个 markdown 文件里，三个版本互相矛盾。从此搞了 SSOT 路由表——每种信息只有一个存储位置，不查路由就写等于违规。这跟我们的 MEMORY.md + timeline/ + graph.db 三层记忆的 SSOT 原则一样。

## 空间维度：worktree 隔离

两个 subagent 同时改同一个目录，跑完发现互相覆盖了一半。解法：

- 需要改代码的 agent → worktree 隔离（独立 git worktree）
- 纯搜索/研究类 → 不用隔离，直接跑

另一个收获：**专业化比通用化靠谱**。59 个 skill 覆盖从推文写作到策略部署。让对的 agent 干对的事，比一个全能 agent 什么都干好很多。

这跟 kenefe 的四角色 agent 团队思路一致：架构/执行/测试/蓝军各自专注，context 互不污染。

## 时间维度：2-4 小时 session 最危险

最坑的一次：session 跑了快三小时讨论交易策略，AI 在后半段把前面讨论过的约束条件忘了，给出矛盾建议。

关键发现：
- **15 轮对话或 30 次工具调用后**，AI 对之前的细节开始模糊
- 有时会"创造性地"补全不存在的事实
- **2-4 小时 session 最隐蔽**：不够长到明显出错，但够长到决策质量悄悄下降
- AI 自评失真是真的——agent 跑久了觉得自己回答得很好，实际已经偏了

防护措施：
1. **session-end 强制刷写记忆**：today.md（当天进度）+ active-tasks.json（跨 session 待办）
2. **离开信号检测**：检测到"先这样""出门了"立即执行，不等用户主动触发
3. **patterns.md**：每次被纠正、连续失败三次、发现反直觉的事情立即记录。428 行。同一错误 3 次以上提炼成 behaviors.md
4. **长 session 主动提醒重开**：AI 主动要求结束对话，诚实面对 context 退化

## 对我们的启发

1. **三维度框架是真的**——我们的 agent 架构也面对同样三个问题：AGENTS.md/skills 解决交互维度，Claude Code worktree 解决空间维度，heartbeat/memory 解决时间维度
2. **patterns.md = 我们的 self-improvement skill**——Leo 的 428 行纠错规则跟我们的 `memory/lessons/` 同构，但他更系统化（3 次以上提炼成 behaviors.md）
3. **SSOT 路由表值得借鉴**——我们的记忆系统有 MEMORY.md + timeline/ + graph.db 三层，但没有显式的路由表说明"什么信息存哪里"
4. **session-end 强制刷写**——我们的 heartbeat 做了类似的事，但没有"离开信号检测"机制
5. **2-4 小时 session 陷阱**——这个具体阈值（15 轮/30 次工具调用）值得记住
6. **59 个 skill 的专业化路线**——验证了 skill 数量不是问题，关键是每个 skill 做好一件事
