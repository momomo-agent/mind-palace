# huashu-design：当设计工具层消失

来源：<https://github.com/alchaincyf/huashu-design>

## 它是什么

一个 agent skill，装进 Claude Code / Cursor / Codex / OpenClaw，然后用自然语言做设计。不是"AI 辅助设计"——是设计工具本身消失了，你跟 agent 说话，agent 交付成品。

交付物不是草图：iOS App 原型（真 iPhone 15 Pro bezel、可点击、Playwright 自动测试）、HTML slides + 可编辑 PPTX（真文本框不是图片铺底）、时间轴动画 MP4/GIF（25fps/60fps 插帧+BGM）、印刷级信息图、5 维度设计评审。

作者说得很直白：Claude Design 发布那天玩到凌晨四点，几天后再也没打开过——不是它不好，是宁愿让 agent 在终端里干活也不愿打开图形界面。

## 三个核心机制

### 品牌资产协议

这是整个 skill 最硬的部分。涉及具体品牌时强制执行 5 步：问用户有没有 brand guidelines → 搜官方品牌页 → 下载资产（SVG→HTML全文→截图取色，三条兜底） → grep 提取色值按频率排序 → 固化成 `brand-spec.md` + CSS 变量。

关键原则：绝不从记忆猜品牌色。

作者做了 A/B 测试（v1 vs v2，各跑 6 个 agent），v2 的稳定性方差比 v1 低 5 倍。他说"稳定性的稳定性，这是 skill 真正的护城河"。这句话很精准——agent 的问题不是做不出好东西，是做出好东西的概率不稳定。skill 的价值不在于提高上限，在于提高下限。

### 反 AI slop 规则

明确列出要避免的"一眼 AI"视觉：紫渐变、emoji 当图标、圆角+左 border accent、SVG 画人脸、Inter 做 display font。替代方案：`text-wrap: pretty` + CSS Grid + serif display + oklch 色彩。

这跟我们的审美追求一致——kenefe 说过"能跑就行"不够，要"这是不是最好的做法"。AI slop 的本质是 LLM 的视觉最大公约数，skill 通过硬编码规则把这些默认行为覆盖掉。

### Junior Designer 工作流

不闷头做大招：先写 assumptions + placeholders + reasoning，尽早 show 给用户，再迭代。需求模糊时触发 Fallback——从 5 流派 × 20 种设计哲学里推荐 3 个差异化方向，并行生成 Demo 让用户选。

这跟我们的开发方法论（WHY→HOW→TASTE→DO）和 kenefe 偏好的开发方式（先画流程图→kenefe 调整→分模块实现）高度一致。核心都是：先对齐理解，再动手。

## 值得学的

### Skill 作为方法论的编码

huashu-design 本质上是把一个资深设计师的工作流程编码成了可执行的 skill。品牌资产协议不是"建议"，是硬流程——agent 必须走完 5 步才能动手。这跟我们的 dev-methodology skill 思路一样：把方法论变成 agent 必须遵守的约束，而不是"参考建议"。

### 稳定性 > 上限

"80 分的 skill 比 100 分的产品好用"——对不愿打开图形界面的人来说。这个定位很清醒。agent skill 的竞争力不在于单次最佳输出，在于每次输出都不低于某个水平线。品牌资产协议的 5 步硬流程就是在保证下限。

### 工具层消失的趋势

Claude Design 是"更好的图形工具"，huashu-design 是"让图形工具这层消失"。这跟 Agent OS 的思路一脉相承——App 溶解成 Capability，用户不再需要知道"用什么工具"，只需要说"我要什么"。

### 从产品蒸馏 Skill

作者从 Claude Design 的系统提示词里蒸馏出结构化 spec，再写成 skill。这是一种新的"逆向工程"——不是逆向代码，是逆向产品的设计决策和工作流程。我们的 framework-reverse-engineering skill 做的是类似的事，只是对象是二进制框架而不是产品提示词。

## 局限

作者很诚实：完全空白品牌从零设计质量掉到 60-65 分；不支持 Framer Motion 级别的复杂动画（3D/物理/粒子）；PPTX 不能拖进 Keynote 改文字位置。

更根本的局限：这是一个"说话→等结果"的模式，没有实时交互反馈。Claude Design 的 GUI 让你能拖、能改、能实时看效果，这种交互密度是纯对话模式做不到的。两种模式各有适用场景：快速出稿用 skill，精细调整用 GUI。
