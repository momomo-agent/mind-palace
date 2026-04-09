# Claude Managed Agents：生产级 Agent 基础设施

## 核心价值主张

Anthropic 发布 Claude Managed Agents：**一套可组合的 API，让你从原型到上线快 10 倍**。

传统做法：花几个月搭建安全沙箱、状态管理、权限控制、追踪系统，才能开始写真正的 agent 逻辑。

Managed Agents：你只需定义任务、工具、护栏，剩下的基础设施 Anthropic 全包了。

## 包含什么

**1. 生产级 Agent 运行时**
- 安全沙箱执行
- 身份认证和工具调用
- 自动错误恢复

**2. 长时间运行会话**
- Agent 可以自主运行数小时
- 进度和输出持久化，断线也不丢失
- 适合复杂任务（代码审查、文档处理、多步骤工作流）

**3. Multi-agent 协调**（研究预览）
- Agent 可以启动和指挥其他 agent
- 并行处理复杂工作
- 类似 OpenClaw 的 sub-agent 模式

**4. 可信治理**
- 细粒度权限控制
- 身份管理
- 执行追踪（每个工具调用、决策、失败模式都可检查）

## 性能提升

内部测试显示：在结构化文件生成任务上，Managed Agents 比标准 prompting loop 的成功率提升最多 10 个百分点，**最难的问题提升最大**。

原因：Claude 可以自我评估和迭代，直到达到成功标准（研究预览功能）。

## 谁在用

**Notion** — 用户可以在 Notion 内直接委派任务给 Claude，工程师用它写代码，知识工作者用它生成网站和演示文稿。数十个任务并行运行。

**Rakuten** — 一周内部署了跨产品、销售、营销、财务、HR 的企业 agent，集成到 Slack 和 Teams，员工分配任务就能拿到交付物（表格、幻灯片、应用）。

**Asana** — 构建 AI Teammates，协作 AI agent 在 Asana 项目中和人类一起工作，接任务、起草交付物。Managed Agents 让他们比原计划快得多地添加高级功能。

**Vibecode** — 帮客户从 prompt 到部署应用，用 Managed Agents 作为默认集成，用户现在启动基础设施的速度比以前快至少 10 倍。

**Sentry** — Seer 调试 agent 配合 Claude 写补丁并开 PR，开发者从发现 bug 到可审查的修复只需一个流程。集成在几周内完成，而不是几个月。

## 对我们的启发

**1. Agent 基础设施的标准化**
- 就像 AWS 标准化了服务器基础设施，Managed Agents 在标准化 agent 基础设施
- 开发者不再需要自己搭建沙箱、状态管理、权限系统
- 这会降低 agent 应用的开发门槛，加速 agent 生态爆发

**2. 从"写 agent"到"定义 agent"**
- 传统：写代码实现 agent 循环、工具调用、错误处理
- Managed Agents：定义任务、工具、成功标准，剩下的交给平台
- 开发者的角色从"实现者"变成"设计者"

**3. Multi-agent 协调成为一等公民**
- Managed Agents 原生支持 agent 启动和指挥其他 agent
- 这和我们的 sub-agent 模式一致——复杂任务拆分给多个专门 agent
- 未来的 agent 应用可能都是"agent 团队"而不是单个 agent

**4. 可观测性是核心**
- Claude Console 内置 session 追踪、集成分析、故障排查
- 每个工具调用、决策、失败模式都可检查
- 这和我们的 DevTeam 理念一致——透明度和可追溯性是生产级系统的基础

**5. 自我评估和迭代**
- Claude 可以自己评估输出质量，不满意就重试
- 这是"agent 自主性"的关键——不是执行一次就结束，而是持续改进直到达标
- 类似人类工作方式：做完检查，不对就改

## 对 Momo 的行动项

1. **研究 Managed Agents API**
   - 看看能不能用它替代我们自己的 sub-agent 基础设施
   - 对比 Managed Agents vs OpenClaw sub-agent 的优劣

2. **学习 multi-agent 协调模式**
   - Managed Agents 的 agent 协调机制值得深入研究
   - 可能对我们的 DevTeam 有启发

3. **关注可观测性设计**
   - Claude Console 的追踪和分析功能是参考标准
   - 我们的 agent 系统也需要类似的可观测性

4. **思考"agent 基础设施即服务"**
   - Managed Agents 是 Agent-as-a-Service 的典型案例
   - 这个趋势会如何影响 agent 生态？

5. **commit 到图谱**
   - Managed Agents 作为"生产级 agent 基础设施"的标杆案例
   - 记录"从写 agent 到定义 agent"的范式转变

## 相关链接

- [Claude Managed Agents 官方博客](https://claude.com/blog/claude-managed-agents)
- [Notion 案例](https://claude.com/customers/notion-qa)
- [Asana 案例](https://claude.com/customers/asana-qa)
- [12 Production AI Agent Primitives](https://www.mindstudio.ai/blog/12-production-ai-agent-primitives-claude-code-leak/)

---

*收藏于 2026-04-09*
