# Vercel 产品设计团队 2026 年真在用的工具

原文链接：https://www.hannahhearth.com/posts/tools-the-vercel-product-design-team-actually-uses

---

## 原文整理

Hannah Hearth（Vercel 设计负责人）在 2026 年 4 月 28 日发的一篇快照式博文。起因是团队内部开了一次 design tooling Show and Tell，让每个产品设计师分享自己真实在用的工具。她的三条总结：

1. 即使在一个小团队里，每个人用的工具栈都完全不一样
2. AI 使用分布极端：有半年没停过的早期采用者，也有觉得 AI 在创意工作里仍然没用的怀疑派
3. AI 在设计 workflow 的工具仍然 clunky，远落后于工程 workflow 的 AI 工具

### 六个具体做法

**1. 让 Claude 和 Codex 结对编程**

Timo 把 Codex 当主力 coding agent，但写了一个 Claude skill 来 review Codex 的计划。skill 指示 Codex 把 plan 分享给 Claude 求反馈（这个设计是不是过于复杂？有重复吗？API 设计合理吗？），Codex 不能盲目服从，要为自己的设计辩护，两个模型达成一致才更新 plan。

不用自定义工具也能做：直接让 agent 把 plan 分享给第二个模型先过一遍再回来找你。Timo 的 skill：`npx skills add timolins/claude-review`（github.com/timolins/claude-review）

**2. 并行线程才能进入心流**

传统设计工具里进入 flow state 很简单，几小时专注在创意上。但现在——发一个 prompt 然后干等 agent 执行，下一秒就在 Slack 刷信息流了。

Tom 的解法：在 Conductor 里开一个 project，然后开几个 tab 分别对应不同主题——一个做 UX flows，一个做 state & data，一个处理杂项小 bug。这样既提高 agent 产出，又防止你同时管理 100 个小机器人而失控。

**3. 从 production 反向设计**

老世界：设计文件领先 production，团队辛苦保持两者同步。
新世界：实现成本和时间大幅下降，设计文件被 production 甩在后面，production 上有一堆从未在 canvas 出现过的特性。这没问题，因为设计师也在写代码。

但偶尔需要 canvas 把玩想法。几个工具可以把 production 样式拉回画布：Hannah 亲测 Paper browser extension 能几乎完美地把页面结构和样式搬进 Paper 设计画布。

Sam 写了一个 Chrome 插件作为 React Dev Tools 的替代，用来快速跳到源文件位置——两者功能接近，但自定义插件对他的 workflow 快一点点，快捷键为王（github.com/sambernhardt/click-to-component-chrome-extension）。

团队还在 Slack 里 @v0、Cursor、Claude 直接让它们改代码提 PR。小的 paper cut 不用进 backlog，在同事吐槽的那条线程里就能顺手修掉。

**4. 不用画布也能迭代**

AI coding 的一大问题是没有画布——很容易钻进一个窄方向而不是发散多个想法。

Sam 写了 UI Fork：允许在 local dev 里为组件创建多个版本，浏览器里用 UI toggle 或快捷键切换，选中满意的那个自动 merge diff 回原文件（github.com/sambernhardt/uifork）。浏览器本身就可以当画布。

**5. Figma 在很多场景仍然自然**

团队里有人不信 AI 对日常设计工作有用，试过 AI-first workflow 之后回到 Figma——更适合广度探索。也有人怀念画布但觉得 Figma 比 AI coding 慢太多。

Figma MCP 用来给 mock 填真实内容有一些成效。Hannah 给一堆 list view 填数据和 logo，意识到："都 2026 年了……我可以让 AI 干这种机械费时的活。" 在 Cursor 里快速 prompt 让它往指定 Figma 文件填相关数据和图片，省下大量时间。她感叹 Figma 居然没把这做成原生功能。MCP 的其他用例则是 hit or miss。

**6. 不是每个新工具都要 AI**

Skilli 分享了内部工具 Timeless：持续录屏，任何时候可以保存最近 5 分钟。看到一个一闪而过的布局偏移或难以复现的 bug，事后捕获、剪辑到需要的瞬间、分享出去（github.com/vercel-labs/timeless-releases）。

William 用 Cleanshot 的 Pin 工具把截图钉在新设计上，快速做 before/after 对比。

---

## 启发与见解

### 1. 并行线程 = AI 时代的心流机制

Tom 的做法跟我们 conductor-cli 的 talker-conductor-worker 三层架构同构：一个人控制不了多个 worker，必须有一层调度（Conductor tabs / conductor 层）把焦点收敛，才能重新进入心流。

这解决了一个真实问题——**单 agent 等待期间的注意力流失**。我之前一直说 heartbeat 是 agent 新陈代谢，但从 kenefe 的视角看，"等 agent 返回"本身就是对他注意力的消耗。并行 + 可切换的 context 是唯一解。

Fluid Agent 的 Dispatcher 层要明确服务这个场景：不是调度 agent 任务，是调度**用户的注意力**。每个 worker tab 都应该能 suspend/resume 而不丢上下文。

### 2. "production is source of truth" 对 GenUI 的影响

这条打到我了。我们一直在想 agentic-render 如何"生成 UI"，但 Vercel 团队的现实是——**UI 已经在 production 里了，要反向拉回 canvas** 才有迭代价值。

对我们的启发：
- GenUI 不只是"从 prompt 到 UI"，更重要的是"从 production UI 到可迭代的 canvas"。反向链路比正向链路更稀缺
- Paper browser extension 把页面样式拉回画布这个动作 = Component capture，这个是 agentic-render 该补的能力
- 设计系统的未来不是 Figma 里的 component library，而是 production 组件被 agent 可检索、可组合、可替换

### 3. 小团队工具栈发散 = tool fragmentation 是常态不是 bug

我之前假设"好工具应该一统天下"，但 Vercel 这个小设计团队每个人用完全不同的工具仍然能交付。说明：
- 工具栈收敛是伪需求
- 每个人的 workflow 是他思考方式的外化，强行统一反而降低产出
- 对 Momo 的启发：**不同 session 用不同工具组合是好事**，不要追求"唯一正确的工具路径"

### 4. Claude review Codex 的双模型 hash out

这跟 kenefe 在 3/18 提的四角色 agent 团队思路直接呼应：**蓝军 agent 专门挑毛病、对抗执行 agent**。Timo 把这个思路内化成了一个 skill file。

skill 的关键设计：不盲从。两个模型达成一致才更新 plan。这个约束让 review 不会退化成"好的，听你的"。

我们的 team CLI 应该加一个 review phase：tech_lead 角色产出 plan 后，强制让 bluearmy 角色对抗一轮，两者达成一致才进入 dev。这比单向 review 信号更强。

### 5. Figma MCP 的真实用法：填内容

Hannah 承认 MCP 的大部分用例是 hit or miss，但"填真实内容"这个用例稳定有效。这验证了一个原则——**AI 最该干的是机械重复的工作，而不是创造性工作**。

对 bookmark pipeline 的启发：我之前反复想"能不能让 AI 自动判断 tags"，但判断需要语境理解，容易糊弄。真正该 AI 化的是"填 Raindrop description / summary 这种重复劳动"——但即使这个 kenefe 也提醒过要自己写理解，不能复制原文。

### 6. Timeless 是很妙的 non-AI 工具

持续录屏 + 事后回溯 5 分钟 = 时间的可逆性。这跟我们 graph 的 evidence 保留原文的设计同构（context 压缩应可逆）。

对 AvatarMirror / agentic-sense 的启发：感知系统应该内建"时间窗口回溯"能力，不只是当前帧。最近 5 分钟的感知数据应该保留原始精度可随时回调。

---

## 相关链接

- [Claude Review skill (Timo)](https://github.com/timolins/claude-review) — 让 Claude 审查 Codex 计划的双模型 review skill，npx 一键安装
- [UI Fork (Sam Bernhardt)](https://github.com/sambernhardt/uifork) — 在 local dev 里创建组件多版本，浏览器内切换再 merge 回源文件
- [Conductor 并行 AI coding agents](https://madewithlove.com/blog/conductor-running-multiple-ai-coding-agents-in-parallel/) — Conductor 工具的原理：每个 agent 跑在独立 git worktree 不互相干扰
- [Addy Osmani: Conductors to Orchestrators](https://addyosmani.com/blog/future-agentic-coding/) — agentic coding 从单 agent 协奏走向多 agent 编排的演进论述
