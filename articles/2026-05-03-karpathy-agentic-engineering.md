# Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering

Karpathy 在红杉 AI Ascent 2026 的访谈里，把一年前他自己提出的 Vibe Coding 往前推了一步：Agentic Engineering。

核心观点不复杂：Vibe Coding 降低了软件创造的门槛，让更多人能做东西；但当 Agent 开始读上下文、改文件、调工具、跑测试、处理部署时，它已经走进了软件工程的链路。这时候需要的不是"更聪明的 AI"，而是一套让 Agent 在真实工程系统里可控工作的机制。

## Software 3.0 不是"写 Prompt 就行"

Karpathy 延续了他的 Software 1.0/2.0/3.0 框架。3.0 的重点不在 Prompt 替代代码，而在上下文、文档、工具、测试和运行环境都变成了需要被设计的对象。文档从"给人看"变成"给 Agent 执行"——README、API 文档、Runbook 要同时满足人能理解、Agent 能执行、系统能验证。

## Agent Control Plane

文章提出了 Agent Control Plane 的概念，把 Agentic Engineering 要解决的问题拆成八个控制面：Context、Spec、Tool、Permission、Runtime、Verification、Audit、Cost。这不是新问题，但 Agent 把它们推到了台前。

## 可验证性决定自动化边界

没有验证体系托底，Agentic Engineering 顶多算更高级的 Vibe Coding。可验证性大概会决定 Agent 自动化能走多远。做架构的人，重心可能要从模块、接口往上挪一层，去想 Agent 能在什么样的环境里安全地工作。

## 跟我们的关系

这篇文章描述的 Agent Control Plane，本质上就是 OpenClaw 在做的事——不是替代开发者，是让 Agent 在真实工程系统里可控地工作。上下文管理、权限控制、工具暴露、执行隔离、结果验证，这些都是 Agent Harness 的核心问题。
