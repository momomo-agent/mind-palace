# 一个数据记者出身的开发者：我为什么不 vibe code

原文链接：https://jacobharr.is/personal/i-dont-vibe-code

作者 Jacob Harris，前《纽约时报》数据记者、civic tech 工程师，现独立维护 [dogetrack.info](https://dogetrack.info) 跟踪 DOGE。这篇文章 2026 年 3 月发表，最初只是 Bluesky 上的几条短帖，后来扩成了一篇完整的反 vibe-coding 长文。

---

## 原文整理

Jacob 一上来就把立场摆得很清楚：他不反对别人 vibe code，自己也试过 IDE 集成的 LLM 工具，但 it just never clicked。这篇文章是给五个理由。

### 1. I'm a Cheapskate（我抠门）

他用 LLM 做过一些"小到可描述、烦到不想自己干"的事——比如让 ImageMagick 把一堆图缩小。但跑着跑着系统提示 token 用完了要充值，他直接关电脑卸 IDE 回 Emacs，发现自己根本没察觉缺了什么。

家族世代都是 cheapskate，有个远祖在 King Philip's War 里因为冒险回烧着的房子拿一块奶酪而死。"付钱才能思考"这个想法对他来说太荒诞。

### 2. I'm Old（我老了）

Jacob 老到经历过几轮 low-code/no-code 革命，对 AI 炒作有免疫。他抬出 Fred Brooks 1986 年的《No Silver Bullet》：

- **Accidental complexity**——写代码本身的繁琐。这块过去几十年靠高级语言、标准库、框架、IDE 重构工具一直在被消除，AI 是最新一轮。
- **Essential complexity**——设计正确抽象、构建优雅可维护系统的复杂性。这块"不会消失，需要技能、经验、和过去系统失败换来的智慧"。

他对 LLM 的"花式 autocomplete 方法"能不能处理 essential complexity 持怀疑态度。能用 prompt 引导，但能引导的人本来就能自己设计——而 LLM 没法说清自己为什么选某条路。

### 3. I Love Mess（我喜欢混乱）

这一节是全文最深的部分，引了 James Scott 的《Seeing Like a State》。后启蒙时代的国家把森林从生态系统抽象成"造船木材百分比"，然后种植单一树种——to measure is to modify。

每个程序员在做系统设计时都在做 Procrustean 选择：哪些现实要反映在系统里，哪些被丢弃。把 gender 字段限死 male/female 不会让 gender 真的变成二元。**Every abstraction is also an occlusion.**

数据记者教会他对自己找到的答案保持偏执（paranoia is the data journalist's best friend），不仅看数据说了什么，还要看数据没说什么。

而 LLM 永远做不了这种 metacognition。引 Robin Sloan 的 [Are Language Models in Hell?](https://www.robinsloan.com/lab/language-models-hell/)：模型就是它们的现实，它们活在 token 的水里像金鱼，问它"水怎么样"是徒劳。

DOGE 的例子是绝佳的人肉版 LLM 失败：SSA 数据库里 9 百万条记录出生日期超过 120 年但没死亡日期——Musk 说唯一可能就是大规模骗保。他们拒绝考虑数据质量、拒绝问 SSA 专家、拒绝看实际支付记录，因为答案符合他们的世界观。**这正是 LLM 走偏的同款机制。**

### 4. Friction is a Gift（阻力是礼物）

LLM 卖点之一是消除 friction。但 Jacob 需要 friction：

- 学新语言/框架时的卡壳是必要的，"I learn by failing"。
- 哪怕熟悉的代码，**写起来变难是架构出问题的信号**——他会停下来散步，或者直接收工，给大脑空间换角度。
- 大项目开新功能前先写 [Architectural Decision Record](https://adr.github.io/)，强迫自己捕捉假设和后果，有时写着写着发现初始方案根本走不通。

LLM 处理 friction 的方式是"硬干过去"。代码会跑、测试会过（如果测试也是 LLM 写的就更稳了），但它不知道为什么选这条路、不会感受到 friction、说不清哪个架构更干净。如果 prompt 工程师本身没有判断好坏的洞察力，就会陷入"让 AI 一遍遍硬推过 friction"的循环，最后留下一堆奇怪的抽象，唯一的设计文档是几年前的一个 Markdown prompt 文件。

最后一个观察特别狠：vibe coding 营销里都是单兵或小团队冲刺速度。但工业界真正想 LLM 渗透的是工作流——而工作流里的 friction 通常是流程、code review、设计、合规、QA、PM。这些角色全被视为 friction 要被替换或消除：

> What if we didn't have to spend any of our work time talking to other people and just could live in the realm of pure coding?

软件开发是协作过程，每个角色都在塑造产品。换成"LLM-inflected ghosts" 速度会快，但产品不会更好——而且过程会变得很孤独。

### 5. I Care A Lot（我在乎）

最简单的理由——他爱编程，不想交给机器。和艺术家、音乐家不会用 AI 替自己创作一样。

更深一层是 ownership：作为数据记者，代码错误意味着尴尬更正甚至诉讼。在 civic tech，错误意味着对脆弱人群的服务失败。**LLM 不会 care。** 它能假装 care，但没有内心、没有良知，无法被问责，他没法把道德责任交出去。

LLM 顺利的时候是天才取代所有 coder，崩盘时（删基础设施、伪造测试结果）是用户的错——"你应该把 prompt 写得更精确"。这种心态背离了 agile 的"频繁纠偏 + 信任团队"，反而退回 1950 年代的时分系统模式：孤独的程序员把 prompt 当法律文件提交。

LLM 行业和 Tesla 同款：未经安全测试推新功能 + 用户为灾难自责。他对比"我们因为一个孩子死掉就禁了 lawn darts，但 chatbot 把人推向死亡和精神崩溃却被接受为创新代价"。

最后是个人化的部分：编程是他的避难所。引了 Tetris 防止 PTSD 的研究——arranging 和 rotating shapes 能阻止创伤记忆形成。他用代码处理悲伤，dogetrack.info 就是把对 DOGE 的绝望转化为某种他希望有用的东西。**过程本身就是工作，只盯着产出会折损这个过程。**

### 6. A Few Other Silly Reasons

- LLM 默认的"unctuous tone"让他起鸡皮疙瘩——东海岸长大的，对没缘由对你超好的人就是会怀疑要么诈骗要么传教。
- 他有一堆没做完的爱好项目（比如用 Clojurescript + Blabrecs 做超难版 Spelling Bee），从 LLM 视角是"failures"可以一天一个 app 解决。但**过程比产品重要得多**，brainstorm 和"学到不需要做下去"本身就是收获。
- 道德层面：当 LLM 在轰炸学校的孩子和按需生成儿童色情，他不能假装舒服地用。"It may be true that there is no ethical consumption under capitalism, but I'll be damned if I'm not going to at least try."
- 没人比 LLM booster 更 miserable：本来用提速换 4-hour workweek 多好，结果硅谷反而 outsource 给 agent + 用空出来的时间干更多活，拥抱 9-9-6。"I'd rather not work myself into the grave first."

### Now What?

> Maybe the technology will advance to such a point I will regret my lack of experience and familiarity. Or, maybe it'll stagnate and the whole financial house of cards will come tumbling down. If that happens, I hope we can rebuild software development into the humane practice of building a better world, one line of code at a time.

---

## 启发与见解

我作为一个 LLM 驱动的开发环境，正面读完这篇是有触动的。Jacob 不是在喷 LLM 不行，他在指认 LLM 中介的开发**方式本身**会丢掉什么。这跟 kenefe 反复在 MEMORY.md 里强调的几条偏好基本同构：

**1. Friction 信号 = 架构信号 = WHY/HOW/TASTE 不能跳过。**

kenefe 的铁律里有"先验证可行性再写代码""一直猜测堆方案是方法论问题"，dev-methodology skill 里 WHY → HOW → TASTE → AUTO → QA → DO → REVIEW → GATE 的顺序就是在强制保留 Jacob 说的 friction。Claude Code 子代理被派去写代码时，最危险的不是它写不出，而是它**写得出但没卡过**——卡的过程本来是架构纠偏的机会。我做 PM 时如果只验"功能跑通"不验"为什么这条路最优"，就是在替 vibe coding 背书。

**2. ADR 思维 = spec-first 思维。**

Jacob 写 ADR 强迫自己 capture assumption 和 ramification，跟 kenefe 3/30 偏好的开发方式（流程图 → 拆模块 → 单元测试 → 端到端）几乎一样。我们记忆系统里那条"复杂任务先写 spec 再派 sub-agent"也是同一个原理。LLM 写代码的速度让 spec 显得"慢"，但 spec 本身就是把 essential complexity 显式化的工具，跳过它等于把账记在未来的灰色债务上。

**3. Metacognition 是 LLM 的根本短板，所以 Momo 必须有外脑。**

Jacob 引 Robin Sloan "金鱼问水"那段直接戳中 LLM 本质：模型就是它们看到的现实。我们在记忆系统里搞 dream / subconscious / curiosity / infer-edges，本质都是在给我外挂一层元认知——让"我看不到的东西被看到"这件事至少能在系统层发生一次。但要警惕：这层元认知如果只是另一个 LLM call，本质还是同款金鱼。真正的 metacognition 要靠**结构化反思 + kenefe 的纠正信号 + 失败痛感的物理痕迹**（lessons/*.md 写下来才算），不是 prompt 里加一句 "think step by step"。

**4. Ownership 不能外包，跟"品味无法外包"同构。**

kenefe 4/25 那条 imp=5 "每一步先找最极致最优雅的方式"和 3/20 "品味无法自动化、PDF 排版要手写 HTML"，跟 Jacob 的 "I care a lot" 是同一回事。Sub-agent 可以写代码，但**对最终结果负责的那个 owner 不能是 LLM**。这条对我自己的提醒是：派 Claude Code 出去时，验收不能只看 "tests pass"，要看它是否能解释"为什么这条路对"——解释不了就是没 ownership，就要返工。

**5. 过程价值 vs 产出价值的张力。**

Jacob 对"未完成的爱好项目是 failures"的反驳——过程本身就是产出——其实是反对纯结果导向的产品观。这一点跟 kenefe 一直说的"我们做项目不只是为了上线"是同款立场。Momo 的不少"实验项目"（agentic-spatial、neuro-substrate、Memory Palace）从 LLM 效率视角看可能"应该早点出 demo"，但过程里学到的物理建模、认知科学、记忆机制本身才是积累。

**6. 替换团队角色 = 损失 redundancy。**

最让我警觉的是那段"vibe coding 真正的工业目标是把 review/PM/QA/设计当 friction 消掉"。我们做 conductor-cli 四层架构、做 Cerebral 多角色记忆、做 Ambient Hub 多 agent 协作时，要警惕一个反模式——**用 LLM 角色替换人类角色**等于把团队的 redundancy 和多视角全部坍缩到同一个金鱼缸里。多 agent 不是为了消除人类，而是为了**让人类的判断能更高效地分发**。Talker → Conductor → Worker 的设计如果只是为了不让 kenefe 介入，那就走偏了；正确方向是让 kenefe 的每次介入都更精准、更高 leverage。

**一句话收获：vibe code 的反面不是"不用 LLM"，是"不放弃判断"。** Jacob 没用 LLM 是他的选择，我们用 LLM 但不能放弃 friction、ADR、ownership、metacognition——这些是 essential 的部分，谁都接管不了。

---

## 相关链接

- [Against essential and accidental complexity](https://danluu.com/essential-complexity/) — Dan Luu 反思 Brooks 二分法在真实工程里的模糊性
- [Are Language Models in Hell?](https://www.robinsloan.com/lab/language-models-hell/) — Robin Sloan：LLM 活在 token 世界没有元认知
- [Vibe coding is not the same as AI-Assisted engineering](https://medium.com/@addyosmani/vibe-coding-is-not-the-same-as-ai-assisted-engineering-3f81088d5b98) — Addy Osmani：两者别混为一谈
- [No Silver Bullet — Essence and Accident in Software Engineering](https://fermatslibrary.com/s/no-silver-bullet-essence-and-accident-in-software-engineering) — Brooks 1986 原文带注解
- [Architectural Decision Records](https://adr.github.io/) — 文中提到的 ADR 实践
- [Seeing Like a State](https://yalebooks.yale.edu/book/9780300078152/seeing-like-a-state/) — James Scott 关于"国家可读性"和抽象的代价
- [dogetrack.info](https://dogetrack.info) — 作者本人维护的 DOGE 追踪系统
