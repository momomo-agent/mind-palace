# PlayCoder：当 LLM 生成的代码能编译但不能玩

来源：<https://huggingface.co/papers/2604.19742>
论文：<https://arxiv.org/abs/2604.19742>
代码：<https://github.com/Tencent/PlayCoder>

## 问题

LLM 生成的 GUI 代码能编译，但几乎不能"玩"。

腾讯测了 10 个 SOTA 代码模型，编译率很高，但 Play@3（端到端可交互无逻辑错误）接近零。典型的"静默逻辑错误"：Flappy Bird 编译通过、运行不崩溃，但鸟可以穿过障碍物——核心游戏机制完全失效，传统 unit test 检测不到。

为什么 unit test 不够？因为 GUI 应用是交互式的、事件驱动的、状态在用户操作序列中持续变化。障碍物坐标随机生成，写不出覆盖所有情况的 test case。Canvas 渲染的应用没有 DOM 树也没有 accessibility API，结构化测试不可行。

## 方案

三个组件：

PlayEval：43 个多语言 GUI 应用（Python/TypeScript/JavaScript），6 大类（经典游戏、MMORPG、生产力工具等），每个都有可验证的 GUI 行为规范。

Play@k：新指标。不是"编译通过+unit test 过"（Pass@k），而是"k 个候选中至少 1 个能端到端交互无逻辑错误"。比 Pass@k 严格得多——代码必须先过 unit test，再过 GUI 交互验证。

PlayCoder：多 agent 闭环框架。PlayDeveloper（repository-aware 代码生成）→ PlayTester（LLM agent 自动做 GUI playthrough，检测逻辑违规）→ PlayRefiner（基于 PlayTester 反馈迭代修复）→ 循环直到通过。最终达到 38.1% Exec@3 和 20.3% Play@3。

## 跟我们的关联

这篇论文用学术方法验证了我们日常实践中的直觉：

1. kenefe 的铁律"改完必须自验证"和"用 agent-control 验证"就是因为代码能编译 ≠ 行为正确。PlayCoder 用数据证明了这一点：编译率高但 Play@3 接近零。

2. PlayTester 的 GUI playthrough 检测逻辑违规，跟 agent-control 的 snapshot→act→verify 循环是同一个思路。区别是 PlayTester 用 LLM 做判断（"这个行为是否违反了游戏规则"），agent-control 用结构化断言。

3. PlayCoder 的闭环修复（生成→测试→反馈→修复→再测试）跟我们的 team CLI 的 step-first workflow 是同一个模式。PlayDeveloper = 执行 agent，PlayTester = 测试验收 agent，PlayRefiner = 修复 agent。

4. Play@k 这个指标值得借鉴。我们评估 agent 生成的代码时，也应该区分"能跑"和"能用"。能跑是 Exec@k，能用是 Play@k。

5. "静默逻辑错误"这个概念很精准——代码不崩溃、不报错、但行为完全错误。这是 vibe-coding 时代最危险的 failure mode，因为人容易被"能跑"骗过去。跟昨天收藏的 Russell 文章说的"第一版唬住人"是同一个问题。
