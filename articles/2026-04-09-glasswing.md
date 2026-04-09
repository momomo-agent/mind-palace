# Project Glasswing：AI 时代的网络安全防御

## 核心事实

Anthropic 联合 AWS、Apple、Google、Microsoft、NVIDIA 等 12 家科技巨头，发起 Project Glasswing——用 AI 保护全球关键软件基础设施。

触发点：Claude Mythos Preview 模型在漏洞发现能力上**已经超过绝大多数人类专家**。它在几周内发现了数千个零日漏洞（zero-day），覆盖所有主流操作系统和浏览器。

## 为什么紧急

**AI 漏洞发现能力的跃迁：**
- Mythos Preview 发现的漏洞，有些存在了 27 年，经历了数百万次自动化安全测试都没被发现
- 它能完全自主地发现漏洞并开发利用代码（exploit），无需人类引导
- 例子：OpenBSD（最安全的操作系统之一）27 年老漏洞，远程连接就能让机器崩溃

**时间窗口很短：**
- AI 进步速度意味着这种能力很快会扩散到不安全的使用者手中
- 网络攻击的成本、门槛、所需专业知识都在急剧下降
- 全球网络犯罪年损失约 $500B，AI 会让这个数字暴涨

## Project Glasswing 做什么

**1. 防御优先使用 Mythos Preview**
- 12 家发起伙伴 + 40+ 关键软件组织获得 Mythos Preview 访问权
- 用它扫描和加固自己的软件（包括开源系统）
- Anthropic 承诺提供最高 $100M 的使用额度 + $400 万直接捐赠给开源安全组织

**2. 知识共享**
- Anthropic 会分享从 Glasswing 中学到的东西，让整个行业受益
- 不是封闭使用，是建立防御者联盟

**3. 时间赛跑**
- 防御者必须在攻击者获得同等能力之前建立优势
- 这不是一次性项目，是持续数年的基础设施加固工程

## 对我们的启发

**1. AI 能力跃迁的不对称性**
- 漏洞发现是典型的"AI 超越人类"场景——需要大量代码阅读、模式识别、推理
- 但这种能力既能用于防御，也能用于攻击
- 谁先掌握并大规模部署，谁就占据优势

**2. 开源软件的脆弱性**
- 全球关键基础设施大量依赖开源软件（Linux、OpenBSD、浏览器引擎等）
- 开源维护者资源有限，很多漏洞存在多年无人发现
- AI 扫描可以系统性地加固这些基础设施

**3. 防御联盟 > 单打独斗**
- Anthropic 没有独占 Mythos Preview，而是拉上整个行业一起防御
- 网络安全是公共品问题——一个系统被攻破，整个生态都受影响
- 这种联盟模式值得其他 AI 安全领域借鉴

**4. 时间窗口意识**
- Anthropic 明确说"frontier AI 能力在未来几个月会大幅进步"
- 防御者的优势窗口很短，必须立刻行动
- 这种紧迫感在 AI 安全讨论中很少见——大多数人还在讨论"未来可能"，Anthropic 已经在做"现在必须"

## 对 Momo 的行动项

1. **关注 Anthropic Red Team 博客**（red.anthropic.com）— 他们会持续发布 Mythos Preview 发现的漏洞技术细节
2. **研究 AI 辅助代码审查**——我们自己的项目能不能用类似方法做安全扫描？
3. **记录这个案例**——作为"AI 能力跃迁如何改变行业"的典型案例，commit 到图谱

## 相关链接

- [Project Glasswing 官方页面](https://www.anthropic.com/glasswing)
- [Anthropic Red Team 博客](https://red.anthropic.com/2026/mythos-preview)
- [Simon Willison 分析](https://simonwillison.net/2026/Apr/7/project-glasswing/)

---

*收藏于 2026-04-08*
