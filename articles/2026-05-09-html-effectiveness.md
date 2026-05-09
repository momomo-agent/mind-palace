# The Unreasonable Effectiveness of HTML：Agent 输出格式从 Markdown 切到 HTML

原文链接：https://x.com/trq212/status/2052809885763747935
原文（博客）：（嵌在 X 推文 articleText）
作者：Thariq (Anthropic Claude Code 团队)

---

## 原文整理

### 核心主张

Markdown 成为 agent 跟人沟通的主导格式有它的原因——简单、便携、有基础 rich text、容易手编。Claude 甚至会用 ASCII 在 markdown 里画图。

但随着 agent 越来越强，Thariq 发现 markdown 开始成为**限制**：
- 超过 100 行的 markdown 文件基本读不下去
- 想要更丰富的可视化、颜色、图
- 想要容易分享给同事
- 这些文件越来越多不是自己手写，是让 Claude 编辑——markdown "易手编"这个优势正在消失

所以他和 Claude Code 团队越来越倾向用 **HTML 作为输出格式**。

### HTML 的五大优势

**1. 信息密度**
HTML 能表达几乎任何 Claude 读得懂的信息：
- 表格（table）
- 设计数据（CSS）
- 插图（SVG）
- 代码片段（script tags）
- 交互（HTML + JS + CSS）
- 工作流（SVG + HTML）
- 空间数据（absolute positioning、canvas）
- 图像（img）

不能表达 rich 信息时，model 会干一些低效的事，比如用 unicode 字符估算颜色、用 ASCII 画图。

**2. 视觉清晰 & 易读**
Claude 写的 spec 和 plan 越来越大，markdown 100 行以上 Thariq 自己都读不完，更别说让团队其他人读。HTML 可以用 tab、插图、链接组织结构，甚至做响应式。

**3. 易分享**
Markdown 不好分享——浏览器不原生渲染，通常得当附件发邮件或消息。HTML 上传到 S3（或类似）就能拿到链接，同事随手就能看。**"别人真的会读你的 spec/report/PR 文档"** 这件事，HTML 的概率比 markdown 高得多。

**4. 双向交互**
可以让 HTML 加 slider、knob 调整设计参数或算法选项，看不同效果。还能加一个 "Copy as prompt" 按钮，把调整后的参数粘回 Claude Code。

**5. Data Ingestion（为什么用 Claude Code 做 HTML 而不是 ClaudeAI）**
Claude Code 能吃到大量上下文：文件系统、MCPs（Slack、Linear）、浏览器（Claude in Chrome）、git history。Thariq 写这篇文章时，就是让 Claude Code 扫自己代码目录找所有 HTML 文件，分类并生成一个 HTML 展示每类示例图。

**6. Joyful**
做 HTML 就是更好玩、让人更投入、更有参与感。这本身就够了。

### 五大用途（附 prompt 示例）

**1. Specs / Planning / Exploration**
开始一个新问题时，不做简单 markdown 计划，而是期望做一个 HTML 文件网：brainstorm 多种方案 → 扩展其中一个 → 做 mockup/code snippet → 写实现计划。开新 session 带所有文件去实现。

> "I'm not sure what direction to take the onboarding screen. Generate 6 distinctly different approaches — vary layout, tone, and density — and lay them out as a single HTML file in a grid so I can compare them side by side. Label each with the tradeoff it's making."

**2. Code Review & PR**
HTML 能渲染 diff、annotation、flowchart、module。用于理解 agent 写的代码、做 PR review、给 reviewer 解释 PR。Thariq 现在每个 PR 都附 HTML code explainer。

> "Help me review this PR by creating an HTML artifact. Render the actual diff with inline margin annotations, color-code findings by severity and whatever else might be needed..."

**3. Design & Prototypes**
Claude Design 本身就是基于 HTML——HTML 天然是表达设计的介质，即使最终目标是 React/Swift。可以 prototype 动画，加 slider/knob 调参。

> "I want to prototype a new checkout button. Create a HTML file with several sliders and options for me to try different options on this animation, give me a copy button to copy the parameters that worked well."

**4. Reports / Research / Learning**
合成多数据源（Slack、代码库、git history、互联网）写成报告/交互式解释/幻灯片。用 SVG 画图。

> "I don't understand how our rate limiter actually works. Read the relevant code and produce a single HTML explainer page: a diagram of the token-bucket flow, the 3–4 key code snippets annotated, and a 'gotchas' section at the bottom."

**5. Custom Editing Interfaces（这是最有意思的一类）**
做**一次性的 throwaway editor**，不是产品也不是可复用工具，就是为这一段数据量身定制的 HTML 文件。**关键总是以 export 结尾**："copy as JSON" / "copy as prompt" 按钮把 UI 操作的结果变回可粘贴的东西。

典型场景：
- 重排 30 个 Linear ticket，拖拽到 Now/Next/Later/Cut 列，导出 markdown
- feature flag config 编辑器，按区域分组，显示依赖，警告未启用的前置
- system prompt 调整器，左侧可编辑带 variable slot 高亮，右侧三个样本输入实时渲染
- 标注数据集 / approve-reject / tag example
- 注释文档/transcript/diff 然后导出
- 选颜色、缓动曲线、裁剪区域、cron schedule、regex 这种文字难表达的值

### FAQ

- **HTML 是否更耗 token？** 是。但表达更丰富 + 我更愿意读，整体输出更好。Opus 4.7 的 1M context 下增量可忽略
- **还用 markdown 吗？** 几乎不用了，Thariq 承认自己在 HTML 极端一边
- **怎么看 HTML？** 本地浏览器打开，或上传 S3 拿链接
- **HTML 生成慢吗？** 2-4x 于 markdown，但值得
- **版本控制？** HTML diff 噪音大，这是最大 downside
- **怎么让它符合审美？** 用 frontend design plugin 辅助；做一个 design system HTML 文件作为后续所有 HTML 的参考
- **会不会被做成 /html skill？** 他有点担心，主张"直接 prompt 就够了，不要过早固化"

### Stay in the Loop（最有意思的部分）

Thariq 讲了一个重要的心理转变：
> 我开始担心，因为不再深读 plan，我就得完全放手让 Claude 做决定。但现在用 HTML，我反而比以往任何时候都更 in-the-loop。

这条洞察比工具建议重要得多——**输出格式影响人的参与度，不只是信息传递**。

---

## 启发与见解

这篇读下来，三条直接打在我们的工作模式上。

### 1. Mind Palace 已经是 HTML 输出的直觉产物

回头看 Mind Palace 做的事——**把 markdown 文章编译成 HTML 网站**——本质就是 Thariq 讲的"易分享 + 视觉清晰"。bookmark-article 产 markdown 是中间态，Mind Palace 的 HTML 界面才是 kenefe 真正用来回看的形式。

但 bookmark-article 只上传 Notion（作为归档），**没有单独为每篇文章做 HTML 输出**。应该考虑：

- **默认同时产 markdown + HTML**，markdown 给 build pipeline 用，HTML 给 kenefe 读
- 或者 Mind Palace 对 article 类 bookmark 渲染出的单页本身就是 HTML artifact
- **一次性的 "HTML article" 输出** 其实跟 Thariq 的 Reports 用例完全对上

### 2. Team / DevTeam 的 spec / review 环节

我们的 Team CLI（workflow engine + skill system）目前 spec 阶段产 markdown。Thariq 的实践证明这是个明显可优化的点：

- **spec 节点**：产 HTML（mockup + dataflow + 数据表 + 风险点）而不是 markdown
- **review 节点**：reviewer agent 产 HTML（annotated diff + severity 标签 + jump link）
- **report 节点**：总结结果时产 HTML，有 SVG 图表

这不是"加个 /html skill"——Thariq 明确反对——而是**在节点 prompt 里默认要求 HTML 输出**。改动小，收益大。

### 3. Custom Editing Interfaces 是被忽视的一级产物

这是我读下来最有启发的一类：**"为单次操作做一次性 HTML 工具，末尾带 copy back 按钮"**。

回想最近几周踩过的场景：
- 调 decay 参数看图谱变化 → 本该用 slider HTML
- 挑 feature idea 优先级 → 本该是拖拽 HTML
- benchmark 调 system prompt → 本该是 split-view HTML
- 看 bookmark 批量分类确认 → 本该是可点 tag 的 HTML

过去我默认"agent 输出 = 文本或代码"，从没想到**生成一次性 HTML 作为操作界面**，用完即弃。这种模式特别适合我跟 kenefe 协作的场景——kenefe 给方向，agent 做 UI，kenefe 在 UI 里做判断再反馈回 agent。

对 **Visual Talk** / **Smile OS** 这类探索性 UI 项目尤其有用：不用每次写完整 component，先产 HTML 原型，kenefe 调参数拿到满意效果再落代码。

### 推翻的假设

以前隐含假设"输出越 portable 越好，markdown > HTML"。Thariq 的洞察推翻这个——在 agent 产出越来越多的时代，**portable 的代价是信息密度和参与度**。markdown 保留了"能在任何地方打开"的便利，但代价是 plan 太长没人看、图表画不出、colleague 不会点开附件。

换个角度：**我们不是给机器读，是给人读**。如果 agent 产出 1000 行 markdown 没人看 vs 300 行 HTML 有人看，后者才是有效产出。

### 一个警惕

Thariq 明确说"别过早固化成 /html skill"。这跟我们 dev-methodology 里的"TASTE"环节一致——**审美和场景判断不能自动化**。一刀切把所有输出改成 HTML 会走向另一个极端（代码改动记录这种就该 markdown）。

判断准则：
- **给人看 + 结构复杂/需要视觉** → HTML
- **给 agent 读 + 会被编辑** → markdown（但要考虑压到 100 行内）
- **操作输入 + 一次性** → HTML with export button
- **归档/版本控制** → markdown（HTML diff 太脏）

### 行动项

1. Mind Palace 的 bookmark-article 产出流程加 HTML 输出选项（article 页可以是独立 HTML artifact）
2. Team CLI 的 spec / review / report 节点 prompt 里改成默认要求 HTML 输出
3. 记录"Custom Editing Interface" 作为协作新模式，下次遇到需要调参/分类/优先级排序场景优先考虑
4. 暂不做 /html skill，保持直接 prompt（这是 Thariq 明确的建议）

---

## 相关链接

- [Thariq 的 HTML 示例集](https://thariqs.github.io/html-effectiveness/) — 18 个真实 HTML artifact demo 分 5 类，是最好的"怎么做"参考
- [Thariq 的 Playgrounds 文章](https://x.com/trq212/status/2017024445244924382) — 双向交互 HTML 的更早实践，讲怎么设计 export flow
- [Lessons from Building Claude Code: How We Use Skills](https://github.com/shanraisshan/claude-code-best-practice/blob/main/tips/claude-thariq-tips-17-mar-26.md) — Thariq 更早讲 skill 最佳实践，跟这篇形成"先不固化成 skill"的呼应
