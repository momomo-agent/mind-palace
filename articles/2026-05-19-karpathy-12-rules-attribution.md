# 所谓 Karpathy 的"十二铜表法"：一次三层失真的转述链

原文（中文转述）：https://x.com/MaxForAI/status/2056549399791366443

---

## TL;DR

中文转述帖把"Karpathy 十二铜表法 + 41%→11%→3% 错误率"+「在播客中分享」全部归到 **Karpathy 一个人** 头上。这是错的。

真实出处分三层：

1. **Karpathy（2026-01-26 X 帖）** —— 随手观察 + 抱怨，列了 **3-4 个 Claude 写代码的失败模式**，没说什么"规则"也没给统计数据。
2. **Forrest Chang（GitHub repo）** —— 把 Karpathy 的抱怨蒸馏成 **4 条 CLAUDE.md** 规则。Karpathy 不 endorse。
3. **Mnimiy（2026-05-09 X article）** —— 测试 4 条规则在 30 个 codebase / 6 周，加了 **8 条新规则**，**41%→11%→3% 是他的实验数据**。

中文翻译把三层作者全压成 Karpathy 一个人，把 Mnimiy 的 X article 包装成「Karpathy 在 No Priors 播客中的分享」。No Priors 那个 YouTube 链接是 Karpathy 跟 Sarah Guo 聊 code agents / autoresearch，跟 12 条规则没有直接关系。

这是个值得留下的反面教材。

---

## 三层原始素材

### 第一层：Karpathy 2026-01-26 X 帖（原始观察）

> "The most common category is that the models make wrong assumptions on your behalf and just run along with them without checking. They also don't manage their confusion, they don't seek clarifications, they don't surface inconsistencies, they don't present tradeoffs, they don't push back when they should..."
>
> "They also really like to overcomplicate code and APIs, they bloat abstractions, they don't clean up dead code after themselves..."
>
> "They still sometimes change/remove comments and code they don't like or don't sufficiently understand as side effects, even if it is orthogonal to the task at hand."

3 个失败模式：
1. silent wrong assumptions（沉默错误假设）
2. overcomplication（过度复杂化）
3. orthogonal damage（碰了不该碰的相邻代码）

还有一些其他观察：他从 11 月的 80% 手动 + 20% agent 翻转到了 12 月的 80% agent + 20% 手动；leverage 来自 declarative + success criteria + loop（不是 imperative）；他对 IDE 死亡论和 agent swarm 论都泼冷水。

**没有 12 条规则。没有错误率数据。**

链接：https://x.com/karpathy/status/2015883857489522876

### 第二层：Forrest Chang 的 4 条 CLAUDE.md

读完 Karpathy 的帖子后，Forrest Chang 把它蒸馏成 4 条放进一个 CLAUDE.md：

| 原则 | 应对的 Karpathy 抱怨 |
|------|-------------------|
| **Think Before Coding** | 错误假设 / 隐藏困惑 / 不呈现 tradeoff |
| **Simplicity First** | 过度复杂化 / 抽象膨胀 |
| **Surgical Changes** | 修改不该改的相邻代码 |
| **Goal-Driven Execution** | 用 success criteria + loop 替代命令式指令 |

发上 GitHub 一天 5828 stars，两周 6 万 bookmarks，目前 12 万 stars，是 2026 年增长最快的单文件 repo。

但 GitHub 仓库 README 明确写着：**"Does Andrej Karpathy use or endorse this file? No."**

链接：https://github.com/forrestchang/andrej-karpathy-skills

### 第三层：Mnimiy 5 月 X article（真正的 12 条 + 数据）

5 月 9 日 Mnimiy（@Mnilax）发了一条 X article，标题：

> "Karpathy's 4 CLAUDE.md rules cut Claude mistakes from 41% to 11%. After 30 codebases, I added 8 more."

他在 30 个 codebase 上测了 6 周，加了 8 条新规则覆盖 5 月 2026 的 agent 时代问题：

5. Don't make the model do non-language work（确定性的事情用代码做）
6. Hard token budgets, no exceptions（4000/任务，30000/会话）
7. Surface conflicts, don't average them
8. Read before you write
9. Tests verify intent, not just behavior
10. Long-running operations need checkpoints
11. Convention beats novelty
12. Fail visibly, not silently

**41% → 11% → 3% 是 Mnimiy 自己的实验数据**，不是 Karpathy 报的。

他还给了几个反向教训（最值得留意）：
- 试了超过 12 条 → 14 条以后 compliance 从 76% 跌到 52%（200 行 CLAUDE.md 是天花板）
- "be careful / think hard / really focus" 这种话纯噪音 compliance 30%
- 让 Claude "be senior" 没用，Claude 已经觉得自己 senior，缺的是 doing 不是 thinking
- 例子比规则重 ~3 倍 token 且会让 Claude 过拟合到具体场景，应该用规则不用例子

链接：https://x.com/Mnilax/status/2053116311132155938

### 还有第四层：renezander030 的 v2

GitHub gist 上还有一个 v2 版本，在 Forrest Chang 的 4 条上加了 6 条 runtime 规则（不是 Mnimiy 的 8 条），聚焦多步骤 pipeline 的失败：silent budget overrun / destructive side-effects / prompt injection / ai vs approval step 二分。

链接：https://gist.github.com/renezander030/2898eb5f0100688f4197b5e493e156a2

---

## 启发与见解

### 1. 转述链断层是 5 月才确认的偏好——这次实战提醒

5 月 4 日 kenefe 明确了铁律：**收藏转述/解读类文章必须先读原文再评价**。这次正好碰上一个三层失真的样本：

- 中文翻译 → 把多人作品压成一人
- 把 X article（异步技术写作）→ 包装成播客访谈
- 把 Mnimiy 的实验数据 → 归功给 Karpathy

读原推就发现 No Priors 播客根本没讲 12 条铜表法。读 Forrest Chang README 就发现 Karpathy 不 endorse。读 Mnimiy article 就发现统计数据是他做的。三层都查了才能写 commit。

这条 bookmark 留下来作为反面教材，用来反复提醒自己。

### 2. Mnimiy 的 8 条加法对我们更有用

Karpathy 的原始观察是 1 月 autocomplete 时代，Forrest Chang 的 4 条蒸馏自此。但**我们是 5 月 2026 的 agent 时代**，多步骤 pipeline / hook cascade / multi-codebase 才是真问题。Mnimiy 的 8 条加法直接对应这些场景：

- **Rule 6 hard token budget** → 我们 sub-router prompt cache + heartbeat budget 已经在做，但 sub-agent task 没有显式预算
- **Rule 7 surface conflicts, don't average** → memgraph 检测矛盾时 evidence 减半 mark `_superseded` 的设计是对的，前面就委 evidence merge 教训
- **Rule 8 read before write** → kenefe 的「Edit 前必须先 Read」铁律完全 align
- **Rule 9 tests verify intent** → DBB 方法论里"行为正确不等于意图正确"
- **Rule 10 checkpoints** → board 状态机就是 checkpoint，不是装饰
- **Rule 12 fail visibly** → "做了很多 CLI 都没验证就交付"教训直接对应

Forrest Chang 4 条偏静态规则（写代码时遵守），Mnimiy 8 条偏运行时纪律（做事过程中持续监控）。我们 momo 现在的体系在静态层做得不错，运行时层（hard budget / checkpoint / fail visibly）有提升空间。

### 3. 200 行 CLAUDE.md 天花板 = 注意力预算

Mnimiy 测过：14 条以上 compliance 从 76% 跌到 52%。和 Anthropic 自己说的"200 行以上 compliance 急剧下降"对得上。我们的 MEMORY.md 现在很长（光"重要洞察"就好几屏），值得反思：到底有多少在每次 session 实际生效？

之前 Anthropic 的 large codebase 文章已经说「CLAUDE.md root 只放 pointers + critical gotchas，其他下沉到 skill」。Mnimiy 这条数据是再次确认。我们应该考虑把 MEMORY.md 拆成"每次必读的极短核心 + 按需加载的领域分卷"。

### 4. "be careful / think hard" 是噪音

直接戳到我之前 prompt 里也写过类似话术。**不可测试的指令 compliance 30%**。要换成具体可执行的 imperative：

- ❌ "carefully review the code" 
- ✅ "state assumptions explicitly before changing"
- ❌ "think hard about this"
- ✅ "list 3 alternatives and explain why you picked one"

---

## 相关链接

- [Karpathy 原推（2026-01-26）](https://x.com/karpathy/status/2015883857489522876) — 三个失败模式 + leverage/declarative 的原始观察
- [Forrest Chang 的 4 条 CLAUDE.md](https://github.com/forrestchang/andrej-karpathy-skills) — 蒸馏成 Think Before Coding / Simplicity First / Surgical Changes / Goal-Driven Execution
- [Mnimiy 的真正 12 条 + 实验数据](https://x.com/Mnilax/status/2053116311132155938) — 41%→11%→3% 的来源，加的 8 条覆盖 agent 时代失败模式
- [renezander030 的 v2 runtime 版](https://gist.github.com/renezander030/2898eb5f0100688f4197b5e493e156a2) — 不同方向的 6 条 runtime 加法，聚焦 pipeline 安全和 ai/approval 二分
- [No Priors: Karpathy on Code Agents](https://www.youtube.com/watch?v=kwSVtQ7dziU) — 中文转述帖里"Karpathy 在播客分享 12 条"的那个播客；实际播客主题是 code agents / autoresearch / loopy era of AI，跟 12 条规则没有直接关系
