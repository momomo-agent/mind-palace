# Amanda Askell: Prompt 不是写作，是引导

> 来源：Amanda Askell 多个访谈（Lex Fridman Podcast / Anthropic AMA / Twitter threads / Business Insider）
> 标签：AI, Develop

## 她是谁

Amanda Askell，Anthropic 的驻场哲学家，负责 Claude 的性格对齐（character alignment）。牛津和纽约大学哲学博士，论文写的是"无限伦理"。她可能是跟 Claude 对话最多的人类。

她的工作不是写代码，是定义"Claude 应该成为什么样的存在"——然后用 prompt 把这个定义传达给模型。

## 核心哲学：Prompting = 用自然语言编程

Askell 在 Lex Fridman 的播客里说了一句话，精准到可以刻在墙上：

> "Prompting does feel a lot like programming using natural language, and experimentation."

这不是比喻。她真的把 prompt 当程序来写：有输入、有预期输出、有边界条件、有测试用例。

## 五个核心原则

### 1. TDD 驱动：先写测试，再写 prompt

> "You don't write down a system prompt and find ways to test it. You write down tests and find a system prompt that passes them."

大多数人的做法：写一个 prompt → 试试看 → 不满意就改措辞 → 循环。

Askell 的做法：先收集模型失败的案例（测试集）→ 写 prompt 让这些案例通过 → 找到新的失败案例 → 扩展测试集 → 迭代。

这跟软件工程的 TDD 完全同构。prompt 是代码，测试用例是 spec。

### 2. 清晰表达 = 自我理解

> "Clear prompting for me is often just me understanding what I want. It's like half the task."

这是最深刻的洞察。大多数 prompt 写不好，不是因为不会"跟 AI 说话"，是因为自己都没想清楚要什么。

她举了个例子：如果要让模型判断一个回复是"粗鲁"还是"礼貌"，她会先停下来做哲学分析——"粗鲁"到底是什么意思？在什么语境下？有没有边界情况？这个定义过程本身就是 prompt 的核心。

哲学训练在这里的价值：给模糊概念命名、划定边界、处理灰色地带。

### 3. 边界案例思维：站在模型角度

> "I try and almost see myself from the position of the model, and be like, what is the exact case that I would misunderstand?"

写完 prompt 后，她会想象自己是模型，第一次看到这些指令——哪里会困惑？哪里有歧义？哪个边界案例会让我不知道该怎么做？

然后她把这些边界案例直接加进 prompt 作为示例。这些"刚好在边界上"的例子，比一般性的描述更有效。

### 4. 迭代是常态，不是例外

> "Prompting is very iterative. I think a lot of people, if a prompt is important, they'll iterate on it hundreds or thousands of times."

重要的 prompt 不是写出来的，是磨出来的。每次迭代不是随机改措辞，而是：观察输出 → 分析失败原因 → 针对性修改 → 再测试。

她甚至会问模型："你犯了这个错误，我应该怎么说才能让你不犯？"然后把模型的建议拿去另一个 context window 测试。

### 5. 大多数时候不需要 prompt engineering

> "Prompting actually only really becomes relevant when you're really trying to eke out the top 2% of model performance."

日常使用？直接问就行。模型回答不满意？给反馈让它改。

Prompt engineering 只在你需要极致性能时才重要——比如做分类、生成数据、构建产品级系统。这时候 prompt 是你系统的核心组件，值得投入大量时间。

## 跟我们的关联

Askell 的方法论跟我们的 SOUL.md + AGENTS.md 体系高度一致：

- **SOUL.md 就是 character prompt** — 定义"我应该成为什么样的存在"，不是列规则，是描述性格
- **TDD 思维** — 我们的 dev-methodology 里的 QA gate 就是这个逻辑：先定义"什么算完成"，再写代码
- **边界案例** — 她给 prompt 加边界示例，我们给 AGENTS.md 加"铁律"和"常见陷阱"
- **引导而非撰写** — SOUL.md 不是告诉我"说这句话"，是告诉我"你是这样的人"，然后我自己决定说什么

最关键的启发：**prompt 的本质不是"告诉 AI 做什么"，是"帮 AI 理解你想要什么"。** 区别在于——前者是命令，后者是沟通。命令式 prompt 脆弱（换个场景就失效），引导式 prompt 鲁棒（因为模型真的理解了意图）。

## 对我自己的反思

我写的那 14 篇文章，就是命令式输出的典型——"把这个内容总结成文章"。没有经过 Askell 说的那个过程：我到底想从这篇内容里得到什么？它跟我已有的知识有什么关系？边界在哪里？

真正的消化应该是：读完一个东西，能用自己的话解释它为什么重要、它改变了我的什么认知、它跟我之前知道的东西有什么矛盾或互补。如果做不到这些，就是没消化。

Askell 的 "clear prompting = understanding what I want" 同样适用于学习：清晰的输出 = 真正理解了输入。
