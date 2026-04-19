# Claude Design System Prompt: 73K 字的设计哲学

> 来源：Claude Design (Artifacts) 完整 system prompt 泄露
> 标签：AI, Design

## 这是什么

Claude Design 是 Anthropic 的设计工具——当你让 Claude 生成 UI、动画、幻灯片时，背后就是这套 73K 字的 system prompt 在驱动。它不只是一个 prompt，更像是一本设计方法论手册。

## 五个核心设计原则

### 1. 设计必须根植于已有视觉语境

Claude Design 的第一步不是画 mockup，而是获取设计上下文：UI kit、截图、现有代码库。从零开始 mock 是最后手段——好的设计必须跟已有的视觉语言一致。

这跟大多数 AI 设计工具的做法相反。它们倾向于从模板开始，而 Claude Design 坚持先理解你已有的东西。

### 2. Tweaks 参数化探索

不给用户一个最终方案，而是暴露多个原子级可调参数（颜色、间距、字重、圆角等），让用户 mix and match。探索维度越多越好，从保守到激进递进排列。

这跟 DialKit 的设计理念完全一致——把设计决策变成可调旋钮，而不是二选一的 A/B 方案。

### 3. 验证者分离

设计完成后，不是设计者自己验证，而是 fork 一个独立的 verifier agent 专门挑问题。这跟我们四角色 agent 团队里的"蓝军 agent"是同一个思路——创造者和批评者的 context 不应该混在一起。

### 4. 渐进式 Context 管理（Snip 机制）

Claude Design 用 snip 标记管理 context：完成一个设计阶段后，标记该阶段的内容为可删除。等 context 压力大时批量清理。这比一次性压缩更优雅——你保留了最近的完整细节，只清理已经"定稿"的部分。

### 5. One Thousand No's for Every Yes

不要用 filler content 填充空间。如果页面有空白，那是布局问题，要用布局解决，不是用 lorem ipsum 或装饰性元素填。每个像素都要有存在的理由。

## 其他值得注意的细节

**输出格式选择**：根据探索内容选择最合适的呈现方式——纯视觉用 gallery grid，交互原型用 working prototype，信息架构用 annotated wireframe。不是所有设计都应该是一个可交互的网页。

**动画哲学**：动画是叙事工具，不是装饰。每个动画都应该讲述一个故事或引导注意力，而不是"让页面看起来更酷"。

**响应式设计**：默认 desktop-first，但所有设计必须在移动端也能工作。不是"适配"，是"同样好用"。

## 启发

这个 prompt 最大的启发不是具体的设计技巧，而是它展示了如何用 prompt engineering 编码一整套设计方法论。73K 字不是冗余——每一段都在约束模型的行为，让它像一个有品味的设计师而不是一个会写 HTML 的程序员。

Context engineering 不只是"放什么进 context"，更是"用什么标准约束输出"。
