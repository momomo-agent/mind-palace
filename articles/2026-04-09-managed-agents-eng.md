# Anthropic Managed Agents 架构：把 agent 的"大脑"和"手"分开

## 核心洞察

Anthropic 工程博客揭示了 Managed Agents 的底层架构——把 agent 解耦为三个独立组件：

1. **Session**（事件日志）— append-only 的所有事件记录
2. **Harness**（大脑）— 调用 Claude 和路由工具调用的循环
3. **Sandbox**（手）— 执行代码和编辑文件的环境

**类比操作系统**：OS 把硬件虚拟化为 process/file，Managed Agents 把 agent 组件虚拟化为 session/harness/sandbox。接口稳定，实现可自由替换。

## 为什么要解耦

### 问题：单体容器 = 宠物（Pets）

一开始他们把所有组件塞进一个容器。好处是文件编辑是直接系统调用，没有服务边界。但问题是：

1. **容器崩溃 = 会话丢失** — 没有独立的会话存储，容器挂了数据就没了
2. **无法调试** — WebSocket 事件流不能告诉你失败在哪里。是 harness bug？事件流丢包？还是容器离线？看起来都一样
3. **调试和数据安全冲突** — 要 debug 必须开 shell 进容器，但容器里有用户数据，这本质上意味着缺乏调试能力
4. **VPC 对接困难** — harness 假设 Claude 在容器里工作。客户要连接到自己的 VPC，必须做网络对等或在自己的环境运行 harness

**核心问题**：这些是经典的"宠物 vs 牛群"问题。宠物是有名字的、需要精心照顾的个体；牛群是可互换的、可以替换的。

### 解决方案：解耦 = 牛群（Cattle）

**Harness 离开容器** — harness 不再住在容器里。它调用容器就像调用任何其他工具：`execute(name, input) → string`。容器变成了牛群。容器挂了？harness 捕获工具调用错误，传回 Claude。Claude 决定重试？用标准配方 `provision({resources})` 重新初始化一个新容器。

**Harness 也是牛群** — 会话日志在 harness 外面，harness 里不需要任何东西在崩溃后存活。当一个 harness 挂了，用 `wake(sessionId)` 启动新 harness，用 `getSession(id)` 恢复事件日志，从最后一个事件继续。

**安全边界** — 在耦合设计中，Claude 生成的不受信任代码和凭据运行在同一容器里。解耦后，harness 运行在受信任环境，sandbox 运行在受隔离环境。harness 和 sandbox 之间的边界就是安全边界。

## 三个核心接口

| 接口 | 职责 | 可替换性 |
|------|------|---------|
| Session | append-only 事件日志 | 可独立替换 |
| Harness | 调用 Claude、路由工具调用 | 可独立替换 |
| Sandbox | 执行代码、编辑文件 | 可独立替换 |

**关键原则**：对这些接口的形状有主见，但不关心背后运行什么。

## 对我们的启发

**1. 虚拟化思想是通用的**
- 操作系统虚拟化硬件 → process/file
- 云计算虚拟化服务器 → VM/container
- Managed Agents 虚拟化 agent 组件 → session/harness/sandbox

**2. "宠物 vs 牛群"是架构演进的通用模式**
- 我们的 DevTeam 也有类似问题——agent 是"宠物"（有固定角色、固定流程）还是"牛群"（可互换、可替换）？
- 理想状态：agent 是牛群，谁来执行不重要，重要的是接口和协议

**3. Session 的 append-only 日志模式**
- 所有事件 append 到日志，不修改已有记录
- 这和我们的记忆系统一致——事件流是不可变的，只能追加
- 可以随时恢复和重放

**4. 安全边界的设计**
- 不受信任的代码和受信任的凭据必须分离
- 我们的 agentic-service 也应该遵循这个原则——用户代码在隔离环境，核心系统在受信任环境

## 对 Momo 的行动项

1. **研究我们的 DevTeam 是否可以解耦为类似的三组件**
   - Session → 任务事件日志
   - Harness → Agent 调度循环
   - Sandbox → 代码执行环境

2. **评估 agentic-service 的安全边界**
   - 用户代码是否和系统凭据隔离？
   - 是否遵循了"大脑和手分离"原则？

3. **commit 到图谱**
   - Managed Agents 架构作为"agent 虚拟化"的典型案例
   - 记录"宠物 vs 牛群"架构演进模式

## 相关链接

- [Scaling Managed Agents: Decoupling the brain from the hands](https://www.anthropic.com/engineering/managed-agents)
- [Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps)
- [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [The Bitter Lesson](http://www.incompleteideas.net/IncIdeas/BitterLesson.html)

---

*收藏于 2026-04-09*
