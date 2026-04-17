# Claude Opus 4.7 发布：官方公告完整解读

> 来源：Anthropic 官方
> 原文：https://www.anthropic.com/news/claude-opus-4-7
> 发布日期：2026-04-16

## 核心升级

### 图像分辨率 3 倍提升
支持最长边 2576 像素（约 3.75MP），是之前 Claude 模型的 3 倍多。这是模型层面的改变，不需要 API 参数调整——发送的图片会自动以更高分辨率处理。

受益场景：
- Computer-use agent 读取密集截图
- 从复杂图表/图纸中提取数据
- 需要像素级精度的参考工作

注意：高分辨率图片消耗更多 token，不需要高精度的场景建议先降采样。

### 指令跟随大幅改进
Opus 4.7 会更字面地执行指令。副作用：之前写的 prompt 可能因为"太精确执行"产生意外结果。**迁移时需要重新审查和调优 prompts。**

### 文件系统记忆改进
跨 session 长任务能记住重要笔记，减少每次重新提供上下文的需要。

### 长任务处理
多家企业测试反馈一致：Opus 4.7 能在复杂长任务中保持一致性，减少中途停止或需要人工干预的情况。Devin 的反馈："能连续工作数小时，推进困难问题而不是放弃。"

## 新功能

### xhigh Effort 级别
在 `high` 和 `max` 之间新增 `xhigh` 级别，提供更细粒度的推理/延迟权衡控制。Claude Code 默认 effort 已提升到 `xhigh`。

建议：测试 Opus 4.7 的 coding 和 agentic 场景时，从 `high` 或 `xhigh` 开始。

### Task Budgets（公测）
开发者可以设置 token 预算，引导 Claude 在长任务中分配 token 消耗。适合需要控制成本的长时间 agentic 工作流。

### /ultrareview（Claude Code）
新的 slash 命令，产生专门的代码 review session，读取变更并标记 bug 和设计问题。Pro/Max 用户各有 3 次免费试用。

### Auto Mode 扩展到 Max 用户
Auto mode 让 Claude 代替用户做权限决策，减少长任务中的中断。之前只有特定用户，现在扩展到 Max 用户。

## 迁移注意事项

### Tokenizer 变化
新 tokenizer 改进了文本处理方式，但同样输入可能映射到更多 token：**约 1.0-1.35x**，取决于内容类型。

### 输出 Token 增加
高 effort 级别下，特别是 agentic 场景的后续轮次，Opus 4.7 会思考更多，产生更多输出 token。

### 净效果
Anthropic 内部 coding 评估显示，综合 token 用量在各 effort 级别下是改善的（更少 token 达到同等质量）。但建议在真实流量上测量差异。

**价格不变：$5/$25 per M tokens（input/output）**

## Claude Mythos Preview 确认

官方正式提到 Claude Mythos Preview——比 Opus 4.7 更强，但目前限制发布。

背景：Anthropic 在 Project Glasswing 中提到了 AI 网络安全能力的风险。Mythos Preview 的网络安全能力更强，因此先在 Opus 4.7 上测试新的安全机制（自动检测和拦截高风险网络安全请求），再逐步推向 Mythos 级别模型。

合法网络安全用途（漏洞研究、渗透测试、红队）可以申请 Cyber Verification Program。

## 企业测试反馈亮点

- **Cursor**：CursorBench 70% vs Opus 4.6 的 58%
- **Notion**：工具调用准确率提升 14%，首个通过隐式需求测试的模型
- **XBOW**（自动渗透测试）：视觉精度 98.5% vs Opus 4.6 的 54.5%
- **Rakuten**：SWE-Bench 解决生产任务数量是 Opus 4.6 的 3 倍
- **Vercel**：单次 coding 任务更正确完整，会在开始前对系统代码做证明验证（新行为）

## 安全评估

整体与 Opus 4.6 相近。改进：诚实性、抗 prompt injection。略弱：控制物质危害减少建议的详细程度。

Mythos Preview 仍是最佳对齐模型。
