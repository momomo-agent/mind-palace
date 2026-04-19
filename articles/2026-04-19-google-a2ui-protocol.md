# Google A2UI: Agent 生成 UI 的标准协议

> 来源：Google Developers Blog
> 标签：AI, Design, Develop

## 问题：Agent 需要会"说" UI

想象一个帮你订餐厅的 agent。纯文本交互需要来回问答：几个人？什么时间？有空位吗？一个简单的日期选择器 + 时间选择器 + 提交按钮就能解决的事，文本要 6 轮对话。

Agent 需要能生成 UI，但在多 agent 世界里，执行任务的 agent 可能在远程服务器上，属于不同的组织。它不能直接操作你的 DOM。

传统方案是发 HTML/JS 然后用 iframe 沙箱。但这很重、视觉不统一、安全边界复杂。

## A2UI 的解法：UI spec as messages

A2UI（Agent to UI）是一个声明式 UI 协议。Agent 生成 JSON 格式的 UI 描述，客户端用自己的原生组件渲染。

核心哲学：
- **安全优先**：传输的是数据不是代码，不执行任何东西
- **客户端控制**：渲染、样式、安全全由客户端决定
- **可更新**：UI 可以增量更新，不需要重新生成
- **跨平台**：同一份 JSON 在 Web（Lit/Angular）、移动端（Flutter）、桌面端都能渲染

Agent 生成的不是"一个网页"，而是"一组组件的组合描述"。客户端从自己的组件库里找对应组件渲染，所以输出永远跟宿主应用的风格一致。

## 跟 A2A 的关系

A2UI 是 A2A（Agent-to-Agent Protocol）的 UI 层。A2A 让不同组织的 agent 能协作，A2UI 让这些 agent 的输出能在任何客户端上渲染。

Google 的 agent 跟 Cisco、IBM、SAP、Salesforce 的 agent 协作时，每个 agent 都可以生成 A2UI 格式的 UI，由最终客户端统一渲染。

## 跟我们的关联

这跟 agentic-render 和 GenUI Lab 是同一个方向。我们的 agentic-render 也是让 AI 生成 UI 描述然后客户端渲染，但我们用的是 HTML 而非声明式 JSON。

A2UI 的声明式方案更安全（不执行代码），但表达力受限于预定义的组件集。HTML 方案更灵活但有安全风险。

未来可能的方向：用 A2UI 做标准交互组件（表单、列表、卡片），用 HTML/Canvas 做自由度更高的可视化和创意内容。两者互补而非替代。

## 关键启发

"UI spec as messages, not code"——这个抽象层级的选择决定了安全性和灵活性的平衡。声明式 > 命令式，在 agent 生成 UI 的场景下尤其如此，因为你不能信任远程 agent 的代码。
