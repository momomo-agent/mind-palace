# DeerFlow 2.0: 字节跳动的开源 Deep Research Agent

> 来源：GitHub bytedance/deer-flow
> 标签：AI, Develop, Tool

## 什么是 DeerFlow

字节跳动开源的 deep research agent 框架。不是一个简单的搜索+总结工具，而是一个完整的多 agent 研究系统：接收研究问题→分解子问题→并行搜索→综合分析→生成报告。

## 架构

DeerFlow 用 LangGraph 构建，核心是一个有向图工作流：

1. **Coordinator**：接收用户问题，判断是简单问答还是需要深度研究
2. **Planner**：把复杂问题分解成可并行执行的子任务
3. **Research Team**：多个 researcher agent 并行执行子任务，每个 agent 有自己的工具集（web search、crawler、code interpreter）
4. **Writer**：综合所有研究结果，生成结构化报告
5. **Human-in-the-loop**：关键决策点可以暂停等人类确认

## 2.0 的改进

- **Podcast 生成**：研究报告可以自动转成播客格式（对话式音频）
- **PPT 生成**：研究结果自动生成演示文稿
- **MCP 集成**：支持 Model Context Protocol，可以接入外部工具
- **多模型支持**：不绑定特定 LLM provider

## 跟我们的关联

DeerFlow 的 Planner→Research Team→Writer 流程跟我们 DevTeam v4 的 workflow engine 结构类似。区别是 DeerFlow 专注研究任务，我们专注开发任务。

有意思的是 DeerFlow 的 human-in-the-loop 设计——不是每步都问人，而是在关键决策点暂停。这跟 Linear 的 accountability 原则一致：agent 有执行自主权，但人类保持控制权。

## 启发

Deep research 是 agent 最自然的应用场景之一——任务可分解、子任务可并行、结果可综合、输出可验证（引用源可追溯）。Karpathy 的可验证性框架在这里也适用：研究报告的质量可以通过引用准确性、覆盖度、逻辑一致性来部分验证。
