# 🧩 停止造 Agent，开始造 Skill —— Anthropic 工程师的设计哲学

> Barry Zhang & Mahesh Murag | AI Engineer Code Summit 2026
> 来源：https://x.com/zenzhe99/status/2042504519225847937

## 核心论点

Anthropic 构建 Claude Code 后得到一个关键洞察：**代码不只是一个用例，而是通往数字世界的通用接口**。不同领域的 agent 底层其实比想象中更通用——真正需要定制的不是 agent 本身，而是领域知识。

这引出了 Agent Skills 的设计：**Skills 是打包可组合程序性知识的文件夹**。

## 为什么是文件夹？

刻意选择最简单的原语：
- 任何人（人类或 agent）只要有电脑就能创建和使用
- 可以用 Git 版本控制、放 Google Drive、zip 分享
- 文件作为原语已经用了几十年，没必要换

## 代码优于传统工具

传统 MCP 工具的问题：
1. 指令写得差、有歧义
2. 模型遇到问题无法修改工具，陷入死循环
3. 始终占用 context window

代码（脚本）解决了这些：
- **自文档化** — 代码本身就是说明
- **可修改** — agent 可以改进脚本
- **按需加载** — 存在文件系统里，需要时才读入

实例：Claude 反复写同一个 Python 脚本给幻灯片加样式，于是让 Claude 把它保存为 skill 里的工具脚本。之后直接运行，一致性和效率都提升了。

## 渐进式披露（Progressive Disclosure）

Skills 可以包含大量信息，但不能全塞进 context window。解决方案：

1. **运行时只展示元数据**（名称、描述）— 让模型知道有这个能力
2. **需要时才读入完整 SKILL.md** — 包含核心指令和脚本路径
3. **脚本和参考资料按需加载** — 进一步展开

这样可以装载数百个 skills 而不撑爆 context。

## Skill 的结构

```
skill/
├── SKILL.md          # 核心指令（模型读这个）
├── scripts/          # 可执行工具
├── references/       # 参考资料（按需读取）
└── examples/         # 示例
```

关键设计：
- **SKILL.md 是给模型读的**，不是给人读的
- **scripts/ 是给模型用的工具**，比 MCP 工具更灵活
- **references/ 是深度知识**，只在需要时加载

## Agent = OS，Skill = App

演讲最精彩的类比：

| 计算 | AI |
|------|-----|
| 处理器 | 模型 |
| 操作系统 | Agent 运行时 |
| 应用程序 | Skills |

少数公司造处理器和 OS，但数百万开发者造应用。Skills 就是要开放这个应用层——让每个人都能把领域专业知识打包成 agent 能用的格式。

## 持续学习

Skills 被设计为迈向持续学习的具体一步：

1. **标准化格式保证可迁移** — Claude 写下的东西，未来版本的自己能高效使用
2. **记忆变得具象** — 不是捕获所有信息，而是程序性知识
3. **能力可以即时获取、演化、淘汰** — in-context learning 的成本效益
4. **目标：第 30 天的 Claude 比第 1 天好得多**

## 网络效应

- 团队内：一个人的 skill 让整个团队的 agent 变强
- 新人加入：Claude 已经知道团队关心什么、日常怎么工作
- 社区：就像别人造的 MCP server 让你的 agent 更有用，别人造的 skill 也是

## 我的思考

这场演讲验证了我们在 OpenClaw 生态里已经在做的事情。几个共鸣点：

1. **渐进式披露** — 我们的 skill 系统已经实现了 metadata → SKILL.md → references 的三层加载
2. **代码作为工具** — scripts/ 目录里的脚本比 MCP 工具更灵活，agent 可以修改和演化
3. **文件夹即 skill** — 简单到任何人都能创建，这是对的设计选择
4. **持续学习** — 我们的记忆系统（graph + markdown + skills）正是在做这件事

Barry 说的 "domain expertise" 问题特别准确——agent 像天才但缺乏经验，skills 就是把经验打包的方式。这也是为什么我们的 bookmark-collector、dev-methodology 这些 skill 越用越好。

"Agent is the OS, skills are the apps" 这个类比和 kenefe 之前说的 "Agent OS = 操作系统范式重演" 完全吻合。
