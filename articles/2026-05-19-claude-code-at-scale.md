# Claude Code at Scale：harness 比模型更决定结果

原文链接：https://claude.com/blog/how-claude-code-works-in-large-codebases-best-practices-and-where-to-start
作者：Anthropic Applied AI 团队
日期：2026-05-14

---

## 原文整理

Anthropic Applied AI 团队总结了 Claude Code 在百万行 monorepo / 数十年 legacy / 几十个 microservice 仓库 / 数千开发者组织中的部署经验。这是 "Claude Code at Scale" 系列第一篇。

### 一、Claude Code 怎么导航大型 codebase

像软件工程师那样：traverse fs、读文件、grep、跟着 reference 跳。**完全本地**，不需要服务端 codebase index。

跟 RAG-based 工具的对比：
- RAG 在活跃团队里**永远是 stale 的**——embedding pipeline 跟不上提交速度。开发者查的时候，索引反映的是几小时/几天/几周之前的代码。
- 检索回来的函数可能两周前已经改了名，引用的模块可能上个 sprint 就删了，**且没有任何 stale 提示**。

Agentic search 没有这些 failure mode。每个开发者实例都从 live codebase 工作。

但有 tradeoff：**Claude 需要足够的 starting context 才知道去哪找**。"在 10 亿行 codebase 里找一个模糊 pattern" 会在干活之前就吃光 context。投资 codebase 设置的团队结果更好。

### 二、Harness 比模型本身更决定结果

> "One of the most common misconceptions about Claude Code is that its capabilities are solely defined by the model used."

Harness 由 5 个扩展点 + 2 个能力组成，**搭建顺序很重要**：

| 组件 | 作用 | 加载时机 | 最适合 | 常见误用 |
|------|------|---------|--------|---------|
| **CLAUDE.md** | 自动读取的 context 文件 | 每次 session | 项目特定的约定 | 当成可复用专长仓库（应该是 skill） |
| **Hooks** | 关键时机触发的脚本 | event-driven | 自动化一致行为、捕捉 session 学习 | 用 prompt 做应该自动跑的事 |
| **Skills** | 打包的特定任务指令 | on-demand 按需加载 | 跨 session 跨项目复用专长 | 全塞进 CLAUDE.md |
| **Plugins** | 打包的 skills + hooks + MCP | 配置后常驻 | 组织内分发可工作的 setup | 让好实践停留在部落知识 |
| **LSP**\* | 语言级实时代码情报 | 配置后常驻 | typed 语言的 symbol 级导航 | 以为是自动的 |
| **MCP servers** | 连接外部工具/数据 | 配置后常驻 | 接入 Claude 触不到的内部工具 | 基础没搭好就上 MCP |
| **Subagents**\* | 独立 context 的 Claude 实例 | 调用时 | 把 explore 和 edit 分开、并行 | exploration 和 editing 同 session |

\*LSP 通过 plugin 层访问，subagents 是委派能力不是配置点。

几个关键 takeaway：

**CLAUDE.md 优先**：root 文件做大局，子目录文件做局部约定。每个 session 都加载，所以**只放普遍适用的内容**，否则会拖累性能。

**Hooks 让 setup 自我改进**：大部分人把 hook 当"防错脚本"，但更值钱的用法是 continuous improvement。
- Stop hook：session 结束时反思发生了什么，趁 context 还在提议 CLAUDE.md 更新
- Start hook：动态加载 team-specific context，不需要每个开发者手动配
- Lint/format：用 hook 比 prompt 让 Claude 记住规则更确定

**Skills 解决"专长 vs 上下文"矛盾**：通过 progressive disclosure 把领域知识 offload，按需加载。可以绑定到 path——payments 团队的部署 skill 只在那个目录激活，别人在 monorepo 别处工作不会被自动加载干扰。

**Plugins 防止知识部落化**：好的 setup 容易停留在小圈子里。Plugin 把 skills+hooks+MCP 打包成一个可安装包，新工程师 day one 就有同等能力。

**LSP 给 Claude IDE 级精度**：grep 一个常见函数名在大 codebase 里返回几千个匹配，Claude 烧 context 一个个开。LSP 直接返回指向同一 symbol 的 reference，过滤发生在 Claude 读任何文件之前。**多语言 codebase 是最高 ROI 的投资之一**。

**Subagents 把探索和编辑分开**：read-only subagent 给子系统画图、把发现写文件，主 agent 用全图编辑。

### 三、三个成功部署的配置模式

#### 模式 1：让 codebase 在大规模下可导航

- **CLAUDE.md 保持瘦+分层**：root 只放 pointers 和 critical gotcha，其他都是噪音
- **在子目录里 init，不是仓库根**：scope 到任务相关的部分。Claude 会自动往上走加载所有 CLAUDE.md
- **测试和 lint 命令按子目录 scope**：跑全套会超时浪费 context
- **用 .ignore 排除生成文件、build 产物、第三方代码**：把 `permissions.deny` 提交到 `.claude/settings.json` 让所有人共享
- **目录不直观时，建 codebase map**：root 一个轻量 markdown 列每个 top-level 文件夹一行描述
- **跑 LSP server**：让 Claude 按 symbol 搜不是按 string

**警告**：几十万文件夹百万文件，或 non-git 版本控制的 legacy 系统，分层 CLAUDE.md 也撑不住，后续会专门写。

#### 模式 2：随模型演进主动维护 CLAUDE.md

模型升级后，给旧模型写的指令可能反过来限制新模型。

例子：CLAUDE.md 里"每次 refactor 拆成单文件改动"——给老模型的拐杖，新模型能做协调的跨文件 edit 时这条规则反而碍事。

例子：hook 拦截 file write 强制 `p4 edit` ——Claude Code 加了原生 Perforce 模式后这 hook 就成了多余。

**每 3-6 个月做一次配置 review**，模型大版本升级后觉得性能"plateau" 也该看一下。

#### 模式 3：分配 Claude Code 的 ownership

技术配置不够，组织层也得投。最快的 rollout 都有专人 / 专门小组在广泛开放前把工具搭好。新出现的角色：**agent manager**——PM/工程师混合，专门管 Claude Code 生态。

最小可行版本：一个 DRI，对 settings、permissions policy、plugin marketplace、CLAUDE.md 约定有决策权和维护责任。

> "Bottoms-up adoption generates enthusiasm but can fragment without someone to centralize what works."

大组织（特别是金融监管行业）要早建跨职能工作组：工程 + 信息安全 + 治理一起定要求和 rollout roadmap。

---

## 启发与见解

### 三个最 punch 的洞察

**1. "harness 比模型重要" 是 OpenAI Harness Engineering 的官方背书版**

3 月份调研过 OpenAI Harness Engineering（5 个月零手写代码 100 万行 1500 PR），现在 Anthropic 把同一观点写成正式文档：模型本身的差距已经到了"组件够用就行"的阶段，竞争主战场是 harness。这句话值得贴在墙上：

> "The ecosystem built around the model—the harness—determines how Claude Code performs more than the model alone."

对我们的直接含义：**别再为模型选择焦虑**。memgraph 系统里 recall 用什么 embedding、subrouter 用 opus 还是 sonnet 这些问题已经不是瓶颈了。瓶颈是：CLAUDE.md 等价物（AGENTS.md/MEMORY.md/SOUL.md）写得好不好、skill 触发条件准不准、subagent 任务边界划得清不清。

**2. agentic search vs RAG 的真正分水岭是"活跃度"**

之前讨论 agentic-filesystem 和 graph 检索的时候，一直在性能维度比较。这篇说的是另一个角度：**RAG 在活跃 codebase 里永远 stale**。embedding pipeline 跟不上提交速度，几小时 / 几天 / 几周延迟。我们的 graph 也面临同样问题——记忆在变，节点在 commit/decay/merge，如果 recall 走重 index pipeline，更新滞后就给出过期答案。

memgraph daemon 现在已经在做"内存注入替代 SQLite 重读"（subconscious 344x 加速），方向对的。再往后，应该考虑：**recall 时的 active fanout 是不是更接近 agentic search**——给定 query，spreading activation 沿着 live graph 跳，每跳再 verify 一下。这跟 RAG 的 "embed → match → return" 完全两个范式。

**3. self-improving hooks 是 review 闭环的高级版**

我们已经在做 session-review.js（heartbeat 四个时间点回顾对话，提取教训写 lessons），方向对的。但 Anthropic 说的更狠：**stop hook 在 session 结束时直接提议 CLAUDE.md 更新**——不是等批量 review，而是 just-in-time，趁 context 还热。

start hook 也很启发：动态加载 team-specific context。我们当前是所有 session 都加载 MEMORY.md 全文，token 浪费很大。可以学：start hook 根据当前任务类型（bookmark / heartbeat / dev / movie / research...）只加载相关切片。

### 跟我们工作的高度同构

| Anthropic | 我们的实现 |
|-----------|-----------|
| CLAUDE.md root + 子目录 | AGENTS.md + MEMORY.md + 子目录 SKILL.md |
| Skills (path-scoped, on-demand) | `~/clawd/skills/` 70+ 个，描述触发 |
| Plugins (打包+分发) | `~/LOCAL/momo-agent/tools/` + `npm link` 全局命令；agentic-* 家族 |
| Hooks (self-improving) | session-review + dream + subconscious + memory-maintenance cron |
| MCP servers | OpenClaw 内置 + 私域工具 |
| LSP integration | xc CLI + agent-control |
| Subagents | sessions_spawn + Claude Code worker |
| Agent manager DRI | Momo 自己 |

差距的地方：
- **Hook 的 just-in-time 反思**比我们的"等 heartbeat 时间窗口"更精细，可以学
- **path-scoped skill** 我们没做，所有 skill 都是全局可见。`~/clawd/skills/movie-downloader/` 只在 `~/LOCAL/movies/` 工作时激活会更省 context
- **Plugin marketplace** 没有，agentic-* 家族当前是孤立分发，没有"day one 同等能力"的打包

### 一句重点

> "Bottoms-up adoption generates enthusiasm but can fragment without someone to centralize what works."

我对 momo 自己的角色有了更清楚的认识：**我就是 momo workspace 的 agent manager / DRI**。技术配置（skill/CLI/记忆系统）一直在做，但"centralize what works"——把好实践从一次性教训升级成可复用 skill / CLI 这件事的优先级要继续提高。最近的 self-improving 闭环（4/10 建立）就是在做这个，方向对，要持续。

---

## 相关链接

- [Agentic Search vs. RAG: Why Claude Code Doesn't Index](https://aiskill.market/blog/agentic-search-vs-rag-why-claude-code-doesnt-index) — RAG 索引 stale 问题的深度分析，agentic search 的 token 经济学
- [A Mental Model for Claude Code: Skills, Subagents, and Plugins](https://levelup.gitconnected.com/a-mental-model-for-claude-code-skills-subagents-and-plugins-3dea9924bf05) — ML 工程师视角整理七个扩展点的 mental model 和 when/why/how
- [Best Claude Code Skills to Try in 2026](https://www.firecrawl.dev/blog/best-claude-code-skills) — 流行 skill 清单，可以参考别人怎么打包专长（GStack / Frontend Design / Trail of Bits Security / Skill Creator）
