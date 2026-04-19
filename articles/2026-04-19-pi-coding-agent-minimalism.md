# Pi Coding Agent: 极简主义的胜利

> 来源：Mario Zechner (libGDX 作者) 博客
> 标签：AI, Develop, Tool

## 背景

Mario Zechner 是 libGDX（Java 游戏框架）的作者，也是 Armin Ronacher 反复推荐的 coding agent。他从 Claude Code 用户变成了自己写 agent 的人，原因很简单：Claude Code 变成了一艘太空船，80% 的功能他用不上，而且每次更新都改 system prompt 和工具，破坏他的工作流。

## 四个工具就够了

Pi-coding-agent 只有 4 个工具：
- 读文件
- 写文件
- 执行命令
- 搜索

没有 plan mode、没有 sub-agents、没有 MCP、没有 background bash、没有内置 todo。Mario 的哲学是："如果我不需要它，就不构建它。"

这不是偷懒，是深思熟虑的设计决策。他发现 context engineering——精确控制什么进入模型的 context——比堆功能更重要。现有 harness 会在背后注入你看不到的东西，这破坏了可预测性。

## 关键技术决策

**统一 LLM API（pi-ai）**：支持 Anthropic、OpenAI、Google、xAI、Groq、Cerebras、OpenRouter 和任何 OpenAI 兼容端点。Mario 发现四大 API（OpenAI Completions、Responses、Anthropic Messages、Google Generative AI）表面相似但细节差异巨大——Cerebras 不支持 `store` 字段、Mistral 用 `max_tokens` 而非 `max_completion_tokens`、不同 provider 的 reasoning content 字段名不同。

**Context handoff**：跨 provider 切换时保持对话连续性。这意味着你可以用 Claude 开始一个任务，中途切到 Gemini 继续。

**YOLO by default**：默认不需要确认就执行命令。Mario 认为如果你不信任模型，就不应该用 coding agent。

**Retained mode TUI**：用 differential rendering 实现几乎无闪烁的终端 UI。这是对 Claude Code 闪烁问题的直接回应。

## 极简的代价和收益

**收益**：
- 更小的 system prompt = 更低的成本和更好的模型注意力
- 可预测的行为——没有隐藏的 prompt 注入
- 轻松切换模型——不被任何 provider 锁定
- 完全可检查的 session 格式

**代价**：
- 没有复杂任务的自动分解
- 没有并行执行
- 需要用户自己管理复杂工作流

## 跟 Bitter Lesson 的关系

Boris Cherny 说"always bet on the more general model"，Mario 的实践是这个原则的另一面：不要用复杂的 scaffolding 来弥补模型的不足，因为模型会变强，而你的 scaffolding 会变成负担。

4 个工具 + 好的 context engineering > 80 个工具 + 复杂的编排。这跟 Anthropic "Building Effective Agents" 的结论一致：最成功的实现用简单可组合的模式，不用复杂框架。

## 启发

Pi 的存在证明了一件事：coding agent 的核心价值不在功能多少，在于 context 质量。当你能精确控制模型看到什么，4 个工具就能完成 Claude Code 80 个工具做的事。
