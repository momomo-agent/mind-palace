# Beyond Prototyping — Nate Parrott 谈 AI 设计的未来

> Anthropic 设计师 Nate Parrott 的深度访谈，前 Browser Company Arc 设计师。来源：AI Design Field Guide

## 核心观点

### 设计 = 与模型沟通意图

Nate 认为，AI 时代的设计本质正在从"画像素"转向"与模型沟通意图"。设计师需要戴上"用户同理心帽子"——不是为用户，而是为模型。

> "Design becomes a matter of figuring out how to communicate your ideas to the model."

### 42 Pages：一个被证伪的论点

Nate 在 2024 年 8 月做了 42 Pages——一个基于 HTML 的 Figma。核心思路：用 Figma 的交互体验设计界面，底层全部输出 HTML，把 HTML 给 LLM 说"把它变成真的，像素不要动"。

结果被自己证伪了：Bolt、V0、Lovable 这类 vibe coding 工具出现后，prompt->code 的路径比 design->HTML->code 更快。但他强调直接操控能力不能丢——42 Pages 最酷的部分是可以用滑块实时调整 AI 生成的动画曲线、颜色、阴影。

### 知道什么时候让模型自由发挥，什么时候控制它

> "The art of AI design comes down to knowing when to let the model cook and when to put it in a baby chair."

- 让模型 cook：布局、配色、基础交互
- Baby chair 模式：品牌调性、微妙动效、特定心理预期

### 共享软件的社会价值

如果每个人都有自己的完美版 Word，反而是坏事——"我的 Word 和你的 Word 一样"本身就有社会价值。设计师的未来角色是"了解用户、找到共识、固化成优雅的设计"。

### 原型的终极形态

- 最好的原型是直接写代码——比在 Figma 里连线状态快得多
- Figma 正在从原型工具退化为画图工具——我们已经过了它作为原型工具的巅峰期
