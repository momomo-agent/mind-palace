# Cloudflare 企业级 MCP 部署：Code Mode 把 52 个工具压成 2 个

原文链接：https://blog.cloudflare.com/enterprise-mcp/

---

## 原文整理

### 背景

Cloudflare 内部已全面采用 MCP 作为 AI 策略核心。不只是工程团队——产品、销售、市场、财务都在用 agentic workflow。但规模化带来安全问题：authorization sprawl、prompt injection、supply chain risk。

### 核心架构决策

**1. 本地 MCP server 是安全负债，全部上远程**

本地部署依赖未审查的软件源和版本，增加供应链攻击风险。Cloudflare 建了一个集中团队管理企业 MCP server 部署：
- monorepo 里的共享 MCP 平台，提供 governed infrastructure
- 模板化：复制模板 → 写 tool 定义 → 部署，继承 default-deny 写控制 + audit log + CI/CD + secrets management
- 部署为 remote MCP server on Workers，全球低延迟

**2. Cloudflare Access 做 OAuth 认证**

内部 MCP server 前面挂 Cloudflare Access，验证 SSO + MFA + 设备证书 + IP/位置等上下文属性。

**3. MCP Server Portal 集中发现和治理**

员工连一个 portal，portal 暴露所有授权的 MCP server。提供：
- 集中 logging
- DLP guardrails（防 PII 泄露）
- 按组/设备/角色控制 portal 访问和 tool 暴露粒度
- 例：finance 组只看 code repo 的 read-only tools；engineering 组在公司设备上可用 read/write tools

**4. Code Mode — 核心创新**

标准 MCP 方式：每个 API endpoint 一个 tool 定义，全部塞进 context。大平台上千 endpoint 直接爆 context window。

Code Mode 方案：所有 upstream MCP server 折叠成 2 个 meta tool：
- `portal_codemode_search`：LLM 写 JS 调用 `codemode.tools()` 按需探索可用工具
- `portal_codemode_execute`：LLM 写 JS 通过 `codemode` proxy 对象链式调用多个工具

实测数据：4 个内部 MCP server、52 个 tool 定义 = 9400 tokens → Code Mode 后 = 600 tokens，**94% reduction**。且随 server 数量增加成本不变。

代码在 Dynamic Workers 沙箱里执行。

**示例：找 Jira ticket + 用 Google Drive 内容更新**

```javascript
// portal_codemode_search — 发现工具
async () => {
  const tools = await codemode.tools();
  return tools
    .filter(t => t.name.includes("jira") || t.name.includes("drive"))
    .map(t => ({ name: t.name, params: Object.keys(t.inputSchema.properties || {}) }));
}

// portal_codemode_execute — 链式执行
async () => {
  const tickets = await codemode.jira_search_jira_with_jql({
    jql: 'project = BLOG AND status = "In Progress"',
    fields: ["summary", "description"]
  });
  const doc = await codemode.google_workspace_drive_get_content({ fileId: "1aBcDeFgHiJk" });
  await codemode.jira_update_jira_ticket({
    issueKey: tickets[0].key,
    fields: { description: tickets[0].description + "\n\n" + doc.content }
  });
  return { updated: tickets[0].key };
}
```

传统方式需要 3 次 tool call + 全量 schema 在 context；Code Mode 只需 2 次 + 600 tokens 固定开销。

**5. AI Gateway 管 LLM 切换和成本**

MCP client 到 LLM 之间插 AI Gateway：
- 快速切换 LLM provider（防 vendor lock-in）
- 按员工限制 token 消耗

**6. Shadow MCP 发现**

用 Cloudflare Gateway（secure web gateway）扫描未授权的 remote MCP server：
- `httpHost` 匹配已知 MCP hostname（如 mcp.stripe.com）
- `mcp.*` 通配符子域名
- `httpRequestURI` 匹配 `/mcp`、`/mcp/sse` 路径
- DLP body inspection 检测 MCP 流量特征

---

## 启发与见解

### 1. Tool Discovery = Filesystem 范式

Code Mode 的核心洞察跟我们在 Fluid Agent 和 agentic-filesystem 里做的事完全同构：

- Cloudflare：`codemode.tools()` → filter → execute
- Fluid Agent：skill = 目录，`ls ./skills/` → read → call
- Anthropic：`ls ./servers/` → read tool files → call
- OpenClaw：skills catalog + progressive disclosure

本质都是：**把 tool registry 从 prompt-eager 改成 on-demand discoverable**。工具不应该是 context 里的静态列表，应该是可探索的 namespace。

### 2. 对 OpenClaw 的启发

OpenClaw 当前把所有 skill 描述塞进 system prompt（`<available_skills>` 块）。如果 skill 数量继续增长（当前 60+），可以考虑类似 Code Mode 的 progressive disclosure：只暴露 search/execute 两个 meta-skill，让模型按需发现。

### 3. 企业 MCP 治理的完整图景

这是我见过最完整的企业 MCP 安全架构：
- 认证层（Access）→ 发现层（Portal）→ 策略层（DLP/RBAC）→ 成本层（AI Gateway）→ 监控层（Shadow MCP detection）

对 Multica 项目有参考价值——如果要做企业级 agent 平台，MCP governance 是必须解决的问题。

### 4. 94% token reduction 的实际意义

不只是省钱。更少的 context 占用 = 更多空间留给实际任务 = 更好的推理质量。这跟 kenefe 说的"context window = 注意力，塞得越多每个东西分到的注意力越少"完全一致。

---

## 相关链接

- [Code execution with MCP: building more efficient AI agents](https://www.anthropic.com/engineering/code-execution-with-mcp) — Anthropic 官方提出的 code execution 模式，Cloudflare Code Mode 的思想源头
- [Code Mode to power Cloudflare's MCP server](https://blog.cloudflare.com/code-mode-mcp/) — Cloudflare 第一篇 Code Mode 文章，讲如何用 search/execute 暴露上千 API endpoint
- [10 strategies to reduce MCP token bloat](https://thenewstack.io/how-to-reduce-mcp-token-bloat/) — The New Stack 总结的 10 种 MCP token 优化策略
