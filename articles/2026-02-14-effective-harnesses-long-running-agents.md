# 长时间运行 Agent 的有效工程实践

> 作者：Anthropic Engineering (Justin Young) · 2026-02-14
> 原文：https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
> 标签：AI / Develop / Article

**💡 看点：Anthropic 官方分享如何让 Agent 跨多个上下文窗口持续工作——初始化 Agent 搭建环境，编码 Agent 增量推进，用 progress.txt 和 git 历史桥接记忆断层。解决了 Agent 一次做太多、过早宣布完成、留下烂摊子等核心问题。**

---

## 核心问题

长时间运行 Agent 的根本挑战：**每个新 session 开始时没有前一个 session 的记忆。** 想象一个软件项目由轮班工程师负责，每个新工程师到岗时对之前发生的事一无所知。

即使有 compaction（上下文压缩），直接让 Opus 4.5 循环运行也会失败，表现为两种模式：

- **一次做太多**：Agent 试图一口气完成整个 App，上下文用完时功能只做了一半，下一个 session 要猜测之前发生了什么
- **过早宣布完成**：看到已有一些进展就认为任务完成了

---

## 两阶段解决方案

### 初始化 Agent（第一个 session）

用专门的 prompt 让模型搭建初始环境：

- **init.sh 脚本**：启动开发服务器的脚本
- **claude-progress.txt**：记录 Agent 工作日志
- **feature_list.json**：基于用户 prompt 展开的完整功能列表（200+ 条），全部标记为 "failing"
- **初始 git commit**：记录添加了哪些文件

### 编码 Agent（后续每个 session）

每个 session 的工作流程：

1. **了解现状**：读 progress.txt、git log、feature list
2. **运行基础测试**：启动开发服务器，跑一遍基本功能确认没坏
3. **选择一个功能**：从 feature list 中选最高优先级的未完成功能
4. **增量实现**：只做一个功能
5. **测试验证**：用浏览器自动化工具端到端测试
6. **清理收尾**：git commit + 更新 progress 文件

---

## 关键设计决策

### 功能列表用 JSON 而非 Markdown

**模型更不容易不当修改或覆盖 JSON 文件。** 用强措辞指令："删除或编辑测试是不可接受的，因为这可能导致功能缺失或 bug。"

### 增量推进是关键

让 Agent 每次只做一个功能，而不是试图一口气完成所有事。这是解决"做太多"问题的核心。

### 保持环境干净

每次 session 结束时，代码应该处于"可以合并到 main 分支"的状态：没有大 bug、代码整洁、文档完善。

### 端到端测试不可或缺

**没有明确提示时，Claude 倾向于标记功能完成但不做端到端测试。** 提供浏览器自动化工具（Puppeteer MCP）后，Agent 能发现仅从代码看不出的 bug，性能大幅提升。

---

## 常见失败模式与对策

- **过早宣布完成** → 用 feature list 文件明确定义"完成"的标准
- **留下 bug 或未记录的进展** → 每个 session 开始时读 progress + git log，结束时写 commit + 更新进度
- **未经测试就标记完成** → 强制要求端到端测试后才能标记 "passing"
- **花时间搞清楚怎么运行** → init.sh 脚本让启动标准化

---

## 未来方向

- **多 Agent 架构**：专门的测试 Agent、QA Agent、代码清理 Agent 可能比单一通用 Agent 表现更好
- **泛化到其他领域**：这些经验可能适用于科学研究、金融建模等需要长时间运行的 Agent 任务

---

## 📎 相关阅读

- **Building effective agents — Anthropic** — Anthropic 的 Agent 构建指南，涵盖工具使用、编排模式、错误处理等基础实践
  https://www.anthropic.com/research/building-effective-agents
- **Claude Agent SDK** — Anthropic 官方 Agent SDK，本文实践的底层框架
  https://platform.claude.com/docs/en/agent-sdk/overview
