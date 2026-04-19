# iOS 27 Siri：Apple 终于做了一个 Agent OS

Bloomberg 最新报道揭示了 Apple 对 Siri 的彻底重构计划。这不是一次 UI 刷新——这是 Apple 对"AI 应该如何嵌入操作系统"这个问题的正式回答。

## 核心变化

**从语音助手到系统级 AI Agent。** iOS 27 的 Siri 将住在 Dynamic Island 里，被唤醒后展开为半透明面板，下拉进入对话界面。它不再是"问一句答一句"的工具，而是能维持上下文、接受文件、返回富结果的聊天机器人。

**独立 App。** iPhone、iPad、Mac 都会有一个专门的 Siri App，功能对标 ChatGPT/Claude——搜索、总结、生成内容和图片、分析文件、调用个人数据完成任务。历史对话通过 iCloud 跨设备同步。

**Extensions 框架。** 第三方 AI 可以通过新的 Extensions 框架接入 Siri，App Store 将开辟 AI 集成市场。这意味着 Claude、Gemini 等可以作为 Siri 的"插件"运行在系统层。

**底层是 Google Gemini。** Apple 定制了一个 1.2 万亿参数的 Gemini 模型，跑在 Google TPU 上，Apple 每年付 10 亿美元。这是一个战略性的"买时间"决策——用 Google 的模型能力换自己的产品整合时间。

## 系统级钩子

- "Ask Siri" 按钮出现在 App 菜单里，用户可以把内容直接发给 Siri
- "Write with Siri" 出现在键盘上方，调用 Writing Tools
- Siri 将替代 Spotlight 搜索功能
- 可以搜索特定图片、编辑照片、在 Xcode 里辅助编码、在 Mail/Messages 里发邮件

## 时间线

- WWDC 2026（6月8日）发布，当天出开发者 beta
- 9月正式发布，iPhone 15 Pro 及以上支持
- iOS 27 同时是"稳定性更新"（修 iOS 26 的 bug + Liquid Glass 优化）

## 为什么这很重要

Apple 之前明确说过"不做聊天式助手"。ChatGPT/Claude/Gemini 的成功逼他们改了主意。但 Apple 的做法不是简单复制——他们把 AI 嵌入了操作系统的每一层，从 Dynamic Island 到键盘到 App 菜单。这正是 Agent OS 的路径：AI 不是一个 App，是操作系统本身的能力。

Extensions 框架尤其值得关注。这等于 Apple 承认了"没有一个模型能做所有事"，所以开放第三方接入。这跟我们讨论的 Agent OS 架构（AI 是 kernel，App 是 capability plugin）高度吻合。
