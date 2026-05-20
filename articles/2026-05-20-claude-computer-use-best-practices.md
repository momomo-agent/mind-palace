# Anthropic 官方 Computer Use 工程实践指南

原文链接：https://claude.com/blog/best-practices-for-computer-and-browser-use-with-claude

---

## 原文整理

Anthropic 发布了 Claude computer/browser use 的完整工程最佳实践，覆盖从基础配置到高级集成模式。适用于 Claude 4.6 family（Opus 4.6, Sonnet 4.6, Haiku 4.5）和 Opus 4.7。

### 1. 分辨率与缩放——最高优先级优化

**核心问题**：API 有内部图像尺寸限制，超限会被静默 downscale，导致模型看到的图和坐标空间不匹配，click 全部偏移。

**API 限制**：
- Claude 4.6 family：max long edge 1568px，max total 1.15MP
- Opus 4.7：max long edge 2576px，max total 3.75MP

**推荐分辨率**：
- 4.6 family → 1280×720（安全默认，80% pixel budget）
- Opus 4.7 → 1080p（更高保真度）
- 进阶：`compute_max_api_fit()` 按源图宽高比算最大 API 安全分辨率

**MacOS 常见坑**：device pixel ratio = 2，截图实际分辨率是屏幕坐标的 2 倍，必须除以 DPR 再发。

**坐标回放**：模型返回的坐标在 display 空间，执行时必须 `screen_x = api_x * (screen_w / display_w)` 缩放回原生分辨率。

### 2. Messages 内容顺序

**铁律**：text instruction 放在 image 之前。让模型在处理截图时已知道在找什么，显著提升 click 精度。

### 3. Thinking Effort 调优

**Claude 4.6 family**：
- 默认推荐 `medium`——最佳精度/成本比，retry 后跟 high 收敛
- `low` 比关闭 thinking 更省 token（更少错误→更少 retry）
- `max` 对 UI 任务无收益，不推荐

**Opus 4.7**：
- 默认推荐 `high`——接近 max 精度但 token 减半
- `low` 已达 Sonnet 4.6 max 水平（1/10 token）
- 复杂一次性任务用 `max`

**为什么更多 thinking 不总是有帮助**：UI 任务主要是感知性（识别元素、定位点击），不是深度逻辑推理。thinking 帮助最大的场景是多步规划、异常恢复、跨信息交叉引用。

### 4. Prompt Injection 防御

- 使用官方 `computer_20251124` tool type 时，classifier 自动运行（零延迟零成本）
- 三层防御：训练时 RL 抗注入 + 实时 classifier + 持续红队
- 自定义 tool 暂不支持 classifier，可填表申请

**最佳实践**：
- 高风险操作 human-in-the-loop
- 最小权限原则
- 全链路 action 日志
- system prompt 明确区分用户指令 vs 网页内容

### 5. Context Management（长 session 核心）

**问题**：每个 screenshot 消耗 1000-1800 token，200k context 约 100-150 步就满。

**方案 1：Cache-aware Rolling Buffer**
- 保留最近 keep_n=3 张截图
- 超过 keep_n + interval(25) 时批量替换为 `[Image omitted]`
- 批量替换保证 prefix byte-stable → cache 命中率最大化

**方案 2：LLM-based Compaction**
- 用专门 prompt 让 LLM 总结对话历史（保留 user instructions verbatim + task template + constraints + progress + next step）
- Server-side compaction（beta）：`compact_20260112` 自动触发
- Client-side 需同步 truncate 本地 messages array

**推荐组合**：
1. 1 个 stable prefix breakpoint + 3 个 trailing tool_result breakpoint
2. Rolling buffer (keep_n=3, interval=25)
3. Server-side compaction @ 150k tokens

### 6. Advisor Tool（实验性）

**双模型分工**：
- Executor（Sonnet 4.6）：机械执行 click/type/scroll
- Advisor（Opus 4.7）：关键决策点提供规划/纠错

**触发方式**：server-side tool，executor 在需要时自动调用 advisor。比全程用 Opus 便宜很多，但保留 reasoning 质量。

**注意**：advisor blocks 在 messages 里会残留，如果后续关闭 advisor tool 需要手动 strip 这些 blocks 否则 400 报错。

### 7. Batch Tools（实验性）

`computer_batch` / `browser_batch`：一次 tool call 包含多个 sub-action，减少 round trip。风险是 compounding error（action 2 依赖 action 1 的视觉结果但看不到中间截图）。

### 8. Show-Don't-Tell Workflow Recording

**核心思路**：用户演示一遍，系统录制 click/screenshot/voice，回放时把 demo 当 context 喂给 Claude。

**数据模型**：WorkflowStep（action + description + selector + coordinates + screenshot + viewport_dimensions + speech_transcript）

**回放三档**：
- Strict：严格跟步骤，UI 变化太大就停
- Adaptive（推荐默认）：以 demo 为指导但适应 UI 变化
- Goal-oriented：只关注最终目标，demo 当 hint

**关键洞察**：回放不是坐标重放，Claude 用 demo 理解意图后在当前 UI 找等价元素。蓝色圆圈标注点击位置帮助 Claude 定位。

### 9. 不起作用的方法

- 图像切 tile 分别发送 ❌
- 叠加坐标网格 ❌
- 不同 resize 算法（LANCZOS vs sips）❌ 无差异

---

## 启发与见解

**对 agent-control 的直接影响**：
我们的 macOS 截图链路（retina 2x DPR）一直没做 pre-downscale，这可能是某些场景 click 命中率不稳定的根因之一。应该在 agent-control 的 screenshot 环节加入 `compute_max_api_fit` 逻辑，确保发给 LLM 的图永远在安全范围内。

**Advisor Tool ≈ 我们的 conductor-cli 架构**：
Anthropic 的 Sonnet executor + Opus advisor 分工，跟我们 conductor-cli 的 Talker→Conductor→Worker 四层架构同构。区别是他们是 server-side tool（API 内部路由），我们是 client-side orchestration。验证了"机械执行用便宜模型 + 关键决策用强模型"这个方向是对的。

**Rolling Buffer + Compaction 组合**：
这个 context management 策略可以直接用在 Watson/Paw 的长 session 管理上。特别是 batch pruning（interval=25）保证 cache prefix 稳定的技巧，比逐条删除优雅很多。

**Show-Don't-Tell 的产品化潜力**：
这个范式对 Fluid Agent 有直接启发——用户演示一次 workflow，系统学会后自动执行。比纯 prompt 描述可靠得多，因为截图+标注提供了视觉 grounding。可以作为 Fluid Agent 的 Skill 录制机制。

**Thinking effort 的实证数据**：
终于有官方数据证明 UI 任务不需要 max thinking。medium/high 就够了，因为 UI 是感知性任务不是逻辑推理。这跟我们在 agent-control 上的经验一致——复杂的不是"想"而是"看准"。

---

## 相关链接

- [Computer Use Best Practices Demo](https://github.com/anthropics/claude-quickstarts/tree/main/computer-use-best-practices) — Anthropic 官方参考实现，含 trajectory viewer、batch tools、advisor tool
- [Claude Computer Use Tool Docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool) — 工具规格文档
- [Adaptive Thinking Docs](https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking) — effort 等级配置文档
- [Prompt Injection Defenses](https://www.anthropic.com/research/prompt-injection-defenses) — Anthropic 注入防御研究
