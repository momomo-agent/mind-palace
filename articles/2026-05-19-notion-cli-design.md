# Notion CLI 设计四原则：同时服务人和 agent 的契约

原文链接：https://x.com/notionhq/status/2056451082411544969
视频原片：https://www.youtube.com/watch?v=k-6ldiWIDsg
配套文档：https://developers.notion.com/cli/get-started/overview

---

## 原文整理

7 分钟视频里 Notion 工程师 Carter 和 Anthony 拆解了他们做 `ntn`（Notion CLI）时的四条设计原则。每一条都来自实战，不是抽象建议。

### 1. Progressive disclosure（渐进式披露，0:21）

`ntn help` 不会一次性 dump 出所有命令，只列 top-level 命名空间：`data sources`、`files`、`pages`、`workers`...

想用 workers 就 `ntn workers help`，得到完整子命令清单。每一层都是穷尽的——你看到什么就是什么，没有隐藏命令。

> "Just as you don't want to dump too much on humans and overwhelm them, the same is true for agents and their context. If we print too much information, that actually costs users money or compacts their session."

对人是怕信息过载，对 agent 是怕 context 被吃掉花钱。同一个问题。

### 2. Actionable error messages（可操作的错误信息，2:26）

不只是返回 `error: not found`，要返回**下一步该做什么**。

举两个例子：

- `ntn workers sync trigger` 漏了必填参数 → 报错时直接给你"请加 `--key` 参数，可以这样改：`ntn workers sync trigger --key=xxx`"，能直接 paste。
- 查 data source 返回 404 → 真正原因往往是"这个 data source 没共享给当前 integration key"。CLI 不只 echo 服务器的 404，而是把这层语义 unwrap 出来告诉你。

可选的 verbose 模式可以打出完整的 HTTP request/response，让开发者自己 debug——这又是 progressive disclosure 的一层。

### 3. 数据和消息分离（stdout vs stderr，4:04）

`ntn workers list -v`：

- **stdout**：worker 列表数据本身（白色文字）
- **stderr**：辅助信息——请求 URL、响应状态、调试日志（灰色文字）

终端里看几乎没差别，但一旦你想 `| jq`，差别就是天和地：

```bash
ntn workers list --json | jq '.[].id'   # ✓ 干净
# 如果数据和日志都走 stdout，jq 会爆
```

> "If we're outputting all our auxiliary messages to stdout, you can't then pipe that to jq and extract for instance your IDs as JSON."

这是 Unix 老规矩，但很多新 CLI 做错。

### 4. Interactive vs non-interactive（5:27）

OAuth 登录这种交互流，在 TTY 下是浏览器弹窗 + prompt：

```
? Do you want to log into an existing workspace, or create a new one? (Use arrow keys)
> existing
  new
```

Agent / 脚本环境（non-TTY）不能弹 prompt。CLI 需要自动检测，然后改成：

```
Show this URL to your user to authenticate:
https://notion.com/oauth/...

Then run: ntn auth poll --token=xxx
```

agent 可以打印 URL 给用户、然后轮询等用户授权完成。同一个命令，两种行为，自动切换。

---

## 启发与见解

### 跟我们的工作直接相关

四条原则我们都在 dogfood，但没把它写下来。趁这个视频把契约固化：

| Notion 原则 | 我们的实现 |
|-------------|-----------|
| Progressive disclosure | `memgraph` / `board` / `twcli` 全部 sub-namespace 结构，`--help` 渐进式 |
| Actionable error | bookmark-collector 的 obfuscation 检测教训：报错"管道到解释器被拦"时给改写建议（ TOOLS.md 已记） |
| stdout/stderr 分离 | `twcli tweet --fx --json` 默认 JSON 走 stdout；`llm` 全局命令 verbose 走 stderr |
| TTY vs non-TTY | `tavily` / `mfetch` 默认非 TTY 输出 JSON 或 markdown，TTY 下才上色 |

四条放一起就是一个**给 agent 用的 CLI 契约**。任何 agentic-\* 家族新 CLI 都该过一遍这个 checklist。

### 跟最近的几条收藏汇流

- **Yage Agent FS 综述**（5/9 收藏）：FS 即 context，push → pull。CLI 是 agent 拉数据的 "ls/cat" 接口，stdout 干净 = pull 通道干净。
- **Anthropic unhobble**（5/9 收藏）：不限制 LLM 能力。CLI 的 verbose flag 就是 unhobble——agent 想 drill 就给它 drill 的工具，不靠 prompt 限制它别问。
- **Perplexity Skill 手册**（5/9 收藏）："If it's easy to explain, the model already knows it. Delete it." → CLI help 也一样，不要把 model 已经知道的写进 description，把节省下的 token 留给 actionable 信息。

### 一个反直觉的点

视频里没明说但很重要：**人和 agent 的 CLI 体验不是矛盾，是同一个目标**。

人类讨厌 `error: not found` 没下一步，agent 也讨厌——它会卡住、瞎试、烧 context。
人类讨厌一次性看完几百个命令，agent 也讨厌——top-level 列表能 fit 进 attention window，几百行就溢出。
人类喜欢能 pipe，agent 必须能 pipe——它没有眼睛，只有 stdout。

把人类体验做好了，agent 体验自动好。反过来不一定。

### 对 OpenClaw / agentic-* 家族的具体借鉴

1. **每个 CLI 加 `--json` flag 默认 non-TTY 自动开**：现在 memgraph / board 还有交互输出，agent 调用得 parse string，应该有结构化路径。
2. **error message 加"hint:" 字段**：参考 sakasegawa/ncli 那个 pattern matching → 附加 tool-specific hints 的设计。
3. **OAuth 类交互流补 non-interactive 路径**：现在很多脚本 agent 跑就卡在 TTY prompt。
4. **memgraph commit 的 imp 自动检测**已经做了类似的"语义补全"，但报错时不够 actionable，可以学 ntn 的"paste this"。

---

## 相关链接

- [Meet the Notion CLI: Built for Agents & Humans](https://www.youtube.com/watch?v=k-6ldiWIDsg) — 7 分钟视频原片
- [Notion CLI 文档](https://developers.notion.com/cli/get-started/overview) — 官方上手指南
- [Building a CLI That Works for Humans and Machines](https://www.openstatus.dev/blog/building-cli-for-human-and-agents) — OpenStatus 的同主题深度文章，TTY 检测 / wizard fallback / 结构化错误 / JSON 输出
- [Writing CLI Tools That AI Agents Actually Want to Use](https://dev.to/uenyioha/writing-cli-tools-that-ai-agents-actually-want-to-use-39no) — MCP 替成 CLI 后 token 用量降 40% 的实战复盘，"Zero indirection" 原则
- [Sakasegawa: I Built a Coding-Agent-Friendly CLI for Every Notion User](https://nyosegawa.com/en/posts/notion-cli-for-coding-agent/) — 一个开发者用 Remote MCP 包成 CLI 的设计推演，error pattern matching → 附加 hint 的实现细节
- [Agent-Native Email CLI by Nylas](https://cli.nylas.com/guides/agent-first-email-design) — 同设计哲学的另一个产品案例，pipe-friendly 邮件操作
