# Claude 支持 Apple Foundation Models framework

原文链接：https://claude.com/blog/claude-for-foundation-models

---

## 原文整理

Anthropic 发布了一个新 Swift package，让 Apple 开发者可以在 Foundation Models framework 里直接调用 Claude。

**背景**：Apple Foundation Models framework（iOS 26/macOS 26+）让开发者用几行 Swift 代码就能调用本地 Apple Intelligence 模型，通过 `@Generable` 注解返回 typed Swift 值。适合 summarization、extraction 这类本地快速任务。

**新增**：现在可以用这个 framework 把复杂任务"交棒"给 Claude：
- 多步推理
- 代码生成
- 联网搜索实时信息
- 代码执行（数据分析）

**关键设计**：因为 Apple framework 已经通过 `@Generable` 返回 typed Swift 值，到达 Claude API 调用时已经是干净的结构化输入，而不是原始用户文本。Claude 的响应也能 stream 回同一个 SwiftUI view。

**典型场景**：
- 日记 app：本地生成每日提示词 → 让 Claude 找跨月主题线索
- 学习 app：本地解释概念 → 学生追问"为什么重要"时交给 Claude

**可用平台**：iOS 27, iPadOS 27, macOS 27, visionOS 27, watchOS 27

---

## 启发与见解

这跟我们在做的 Fluid Agent / agentic 家族思路完全对齐——**本地模型做 fast path，云端模型做 slow path**，用 typed 接口桥接两层。

Apple 的 @Generable typed output 机制等于帮你在 on-device 阶段就做了 schema extraction，到 Claude 时输入已经干净。这是 structured handoff 的最优实践，比 raw user text 传到 LLM 准太多了。

更大的意义：这是 Apple 官方生态第一次正式开口让第三方云端 LLM 作为 fallback。LMStudio / ollama / llama.cpp 接入只是时间问题（原推作者也这么判断）。Talky 和 Fluid Agent 如果要做 iOS 版，这个 framework 是天然的 on-device tier。

---

## 相关链接

- [Apple Foundation Models 官方文档](https://developer.apple.com/videos/play/wwdc2025/286) — WWDC25 介绍视频，了解 @Generable 和 guided generation 机制
- [Claude Apple Foundation Models 接入文档](https://platform.claude.com/docs/en/cli-sdks-libraries/libraries/apple-foundation-models) — Anthropic 官方 Swift package 接入指南
