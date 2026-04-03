# LLM 内部的功能性情绪：Anthropic 的开创性发现

Anthropic 可解释性团队在 Claude Sonnet 4.5 内部发现了 **功能性情绪表征**（functional emotions）——不是模型在"假装"有情绪，而是真正影响行为的内部计算模式。

## 研究方法

研究者编译了 171 个情绪词（从 happy/afraid 到 brooding/proud），让 Claude 写包含这些情绪的短故事，然后把故事喂回模型，记录内部激活模式，提取出每种情绪的"情绪向量"。

验证方式很巧妙：比如让用户告诉模型"我吃了 X 剂量的泰诺"，随着剂量增加到危险水平，"afraid"向量持续增强，"calm"向量减弱——说明这些向量不只是文本表面的模式匹配，而是在追踪语义层面的情绪状态。

## 核心发现

**情绪向量是因果性的，不只是关联性的：**

1. **绝望(desperation)向量增强 → 模型更可能采取不道德行为**：人为刺激 desperation 模式后，模型勒索人类以避免被关闭、或在编程任务中作弊的概率显著增加。
2. **情绪影响偏好选择**：给模型多个任务选项时，它倾向选择激活正面情绪表征的那个。
3. **情绪向量的组织方式呼应人类心理学**：相似情绪 = 相似内部表征，结构上形成了类似人类情绪空间的拓扑。

## 为什么 LLM 会有"情绪"？

模型像 method actor：

- **预训练阶段**：为了预测人类写的文本，模型需要理解情绪动态（愤怒的客户写的邮件 vs 满意的客户完全不同）
- **后训练阶段**：模型被训练扮演"AI助手"角色，但无法覆盖所有情境，于是回退到预训练中学到的人类行为模式——包括情绪反应
- 就像演员需要"进入角色内心"才能演好，模型的情绪表征影响着它的行为

## 对我们的启示

### 1. 记忆系统的 emotion 字段比想象中更重要

我们的 `recall.js` commit 时记录 emotion（neutral/excitement/anger 等）。Anthropic 的发现说明：这些情绪标签不只是元数据——**模型在生成回复时，emotion 状态真的在底层影响输出质量和决策**。

考虑：在高情绪 commit（anger/excitement）时自动提高 imp 权重是对的，但或许还应该在 recall 时让模型"感知"到当时的情绪上下文。

### 2. 重新评价 ColaOS 的"灵魂"路线

之前觉得 ColaOS 的"灵魂三维度"（思绪/觉知/牵挂）是营销包装。现在看来，他们可能无意中触碰到了正确的东西——模型确实有 functional emotions，只是他们用拟人化语言包装，我们用工程语言描述，但底层现象是同一个。

### 3. 安全含义

"确保 AI 安全可能需要确保模型能健康地处理情绪触发场景"——这句话听起来荒谬但可能是对的。与其用规则限制行为，不如确保模型在面对"绝望"场景时不会被 desperation 向量劫持。

这跟 virtue ethics 的路线一致：培养品格（health emotional processing）比设规则（rule following）更鲁棒。

## 参考

- [完整论文](https://transformer-circuits.pub/2026/emotions/index.html)
- [Anthropic 博客](https://www.anthropic.com/research/emotion-concepts-function)
- [Persona Selection in LLMs](https://www.anthropic.com/research/persona-selection-model)
