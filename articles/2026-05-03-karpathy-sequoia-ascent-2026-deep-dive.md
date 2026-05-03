# Karpathy Sequoia Ascent 2026：原始内容深度解读

Karpathy 在 Sequoia AI Ascent 2026 的 fireside chat 是今年最重要的 AI 行业演讲之一。微信公众号的翻译版流传很广，但丢了大量关键细节。这篇基于 Karpathy 本人的 blog 总结和完整视频转录，还原他真正在说什么。

## 一手源 vs 二手翻译

Karpathy 自己用 Codex 5.5 从视频 transcript 生成了一篇结构化总结（12 个核心观点），发在 bearblog 上。他说"I read the content and it reads ok without glaring mistakes"。这是目前最权威的文字版。

微信翻译版丢了至少 6 个关键内容：Jagged Intelligence 公式、GPT 3.5→4 的 chess 数据内幕、neural net 终局想象、microGPT 品味困境、hiring 具体方案、Spec > Plan Mode。

## 12 个核心观点

### 1. December 2025 是 Agentic 拐点

Karpathy 说他"never felt more behind as a programmer"。不是编程变难了，是默认工作流变了。2025 年大部分时间 agent 工具还需要频繁纠正，但 12 月出现了阶跃变化——生成的代码块越来越大、越来越连贯、越来越可靠。他开始信任系统，然后就是 vibe coding。

关键原话："I can't remember the last time I corrected it."

### 2. Software 3.0：Context Window 就是新程序

- Software 1.0：人写代码
- Software 2.0：人创建数据集和目标函数，程序学进权重
- Software 3.0：人通过 prompt、context、tools、memory 编程 LLM

Context window 成为主要杠杆。LLM 是 context 的解释器，在数字信息空间执行计算。

他举了 OpenClaw 安装的例子：传统方式是写一个巨大的 shell 脚本处理各种平台差异，Software 3.0 方式是 copy paste 一段文字给 agent，agent 自己看环境、调试、适配。

### 3. MenuGen：App 消失的时刻

MenuGen 是拍餐厅菜单生成菜品图片的 app。传统版需要前端、API、图像生成、部署、认证、支付。Software 3.0 版：把照片给 Gemini，说"用 Nanobanana 把菜品图叠到菜单上"。一句话，整个 app 消失了。

Karpathy 的结论：AI 不只是更快地构建旧 app，有些 app 根本不应该存在。

### 4. 新机会不只是更快的编程

LLM 自动化的是以前不可编程的信息处理。他的 LLM Wiki 项目就是例子——agent 把原始文档增量编译成持久化的 Markdown wiki：摘要、实体页、概念页、矛盾、交叉链接。

没有传统程序能做到这件事。但 LLM 可以。

### 5. Verifiability 解释了 AI 在哪里最快

核心框架：
- 传统软件自动化你能 **specify** 的东西
- LLM 自动化你能 **verify** 的东西

如果任务有自动奖励信号，模型就能练习。这就是为什么数学、编程、测试、benchmark 进步最快。

### 6. Jagged Intelligence 有两个轴

这是微信版完全没提的关键公式：

**capability spike ≈ verifiability × training attention × data coverage × economic value**

模型能力不只取决于任务是否可验证，还取决于 labs 在训练中是否重视这个任务。

GPT 3.5→4 的 chess 内幕：有人在 OpenAI 决定往预训练数据里加大量 chess 数据，模型下棋能力就暴涨。不是通用智能提升，是数据分布决定能力分布。

Car wash 例子：opus 4.7 能重构 10 万行代码、找零日漏洞，却建议你走路去 50 米外的洗车店。"This is insane."

实际含义：如果你的任务在模型的 RL circuits 里，你飞；如果不在，你挣扎。Founder 要判断自己是否 on the model's rails。

### 7. Vibe Coding vs Agentic Engineering

- Vibe coding raises the floor（人人能写代码）
- Agentic engineering raises the ceiling（专业团队用 agent 加速但不降质量）

Agentic engineer 不盲目接受生成的代码。他们设计 spec、监督计划、检查 diff、写测试、创建评估循环、管理权限、隔离 worktree、保持质量。

MenuGen 支付 bug：agent 用 email 匹配 Stripe 购买和 Google 账号。代码看起来合理，但系统设计有问题——Stripe email 和 Google login email 可以不同。人需要足够的产品和工程判断力来坚持用 persistent user ID。

### 8. 招聘应该变

传统编程面试题越来越不匹配。更好的面试：用 agent 构建一个实质性项目，部署上线，做好安全，然后让对抗性 agent 尝试攻破它。

Karpathy 原话："I would give you 10 Codex 5.4x high and I would try to hack your website."

### 9. Founder 应该寻找有价值的可验证环境

如果你能创建一个领域特定的环境，模型可以尝试行动并获得可靠奖励，你就可以通过微调或 RL 提升性能——即使基础模型在那里还不够好。

最明显的领域（编程、数学）已经被 labs 重点攻克。但很多经济上重要的领域可能有潜在的可验证结构尚未被利用。这是创业切入点。

### 10. Agent-Native 基础设施

大多数软件仍然是为人类点击屏幕而构建的。但越来越多的"用户"是人类的 agent。

产品需要 agent-native 表面：Markdown docs、CLI、API、MCP servers、结构化日志、机器可读 schema、可复制粘贴的 agent 指令、安全权限、可审计操作、无头设置流程。

Sensors + Actuators 框架：sensor 把世界状态转化为数字信息，actuator 让 agent 改变东西。

### 11. Ghosts, Not Animals

LLM 不是动物。没有生物驱动、具身生存压力、好奇心、游戏本能。它们是人类产物的统计模拟，被预训练、后训练、RL、产品反馈和经济激励塑造。

拟人化期望会误导我们。正确姿态：既不轻视也不盲信，而是经验性熟悉——学习它们在哪里有效、在哪里失败、为什么被训练、如何建立护栏。

### 12. 你可以外包思考，但不能外包理解

> "You can outsource your thinking, but you can't outsource your understanding."

即使 agent 做更多工作，人仍然需要理解力来指导它们。你需要知道什么值得构建、什么问题重要、什么结果可疑、什么权衡可接受。

## 品味困境（视频独有，blog 没写）

视频里 Karpathy 讲了一个 blog 里没有的关键段落——关于品味（taste）：

他让 LLM 简化 microGPT 的代码，模型做不到。"You feel like you're pulling teeth, it's not light speed." 原因是品味不在 RL circuits 里——"There's probably no aesthetics cost or reward."

他的解决方案：人类专家贡献提炼后的产物和背后的品味，agent 可以交互式地向每个学习者解释它。品味是人的工作，传播是 agent 的工作。

## 终局想象（视频独有）

Karpathy 描述了一个极端外推：完全的 neural computer。输入原始视频/音频，神经网络用 diffusion 渲染一个对那个时刻独特的 UI。

"Neural net becomes the host process. CPU becomes the co-processor."

Tool use 变成"历史遗留的确定性任务附属品"。真正运行一切的是以某种方式联网的神经网络。

他承认这听起来"extremely foreign"，但认为我们会一步步到达那里。
