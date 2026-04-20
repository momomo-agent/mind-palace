# 花叔的 Skill 设计哲学：从 huashu-design 看 Claude Code Skill 创作

来源：[花叔 @AlchainHust](https://x.com/AlchainHust/status/2046192558666342720)
GitHub：[huashu-skills](https://github.com/alchaincyf/huashu-skills)（21 个 skill，315 star）

## 背景

花叔是国内 Claude Code skill 领域最高产的创作者之一——21 个实战验证的 skill，覆盖内容创作全流程（选题→调研→写作→审校→配图→视频→演讲→数据分析→设计）。他宣布逆向了 Claude Design，明天开源增强版 Huashu Design。

## huashu-design 的设计哲学

核心理念：**约束哲学而非形式**——定义"为什么这样设计"而非"长什么样"。

这跟我们的 taste skill 思路一致但更系统化。他把设计风格组织成 5 大流派 × 20 种风格：

| 流派 | 视觉气质 | 适合场景 |
|------|---------|---------|
| 信息建筑派（01-04） | 理性、数据驱动、克制 | 安全/专业 |
| 运动诗学派（05-08） | 动感、沉浸、技术美学 | 大胆/前卫 |
| 极简主义派（09-12） | 秩序、留白、精致 | 安全/高端 |
| 实验先锋派（13-16） | 先锋、生成艺术、视觉冲击 | 大胆/创新 |
| 东方哲学派（17-20） | 温润、诗意、思辨 | 差异化/独特 |

关键约束：每次推荐 3 个方向，必须来自 3 个不同流派。这保证了视觉反差——用户能看到真正不同的选择，而不是同一流派的微调。

## Skill 设计的关键洞察

### 1. 永远不写否定式规则

花叔做了十几个 skill 后形成的直觉。否定式规则（"不要做 X"）在 LLM 执行中效果差——模型更容易遵循正面指令（"做 Y"）。这跟 prompt engineering 的基本原则一致，但在 skill 设计中尤其重要，因为 skill 是被反复执行的模板。

### 2. 必须包含设计师/机构名字

说"Pentagram 的网格系统"而非"网格系统"。这不只是装逼——具体的设计师名字给 LLM 提供了更精确的风格锚点。LLM 训练数据中包含大量关于知名设计师的描述，名字本身就是一个高信息密度的 prompt token。

### 3. 并行 Agent 生成视觉 Demo

推荐完 3 个方向后，立即启动 3 个并行 agent 各自生成 HTML demo + Playwright 截图。用户看到的不是文字描述，而是实际的视觉效果。"看到比说到更有效"——这个原则在 AI 辅助设计中尤其重要。

### 4. 评审内置于流程

设计完成后自动触发 5 维度评审（哲学一致性/视觉层级/细节执行/功能性/创新性），0-10 分。评审语气"直接不绕弯"，批评设计而非设计师。这让 skill 形成了完整的创作-评审闭环。

## 花叔的 Skill 体系架构

21 个 skill 按功能分层：

- 端到端工作流（4 个）：slides、data-pro、douyin-script、design
- 写作与审校（4 个）：proofreading、material-search、article-edit、article-to-x
- 选题与调研（3 个）：topic-gen、research、info-search
- 视频创作（3 个）：video-check、video-outline、script-polish
- 配图（3 个）：wechat-image、xhs-image、image-upload
- 文档与展示（2 个）：md-to-pdf、speech-coach
- 效率工具（2 个）：agent-swarm、prompt-save

每个 skill 都有明确的触发条件、分阶段 workflow、和具体的输出格式。这种"一个 skill 解决一整类问题"的设计比我们的很多 skill 更完整。

## 对我们 Skill 创作的启发

1. **流派分类法**：我们的 taste skill 可以借鉴这种"流派 × 风格"的二维组织方式，让推荐更有结构
2. **正面指令优先**：检查我们现有 skill 中的否定式规则，改写为正面指令
3. **视觉 Demo 先行**：设计类 skill 应该先出视觉效果再讨论，不要让用户凭文字想象
4. **评审闭环**：每个创作类 skill 都应该内置评审步骤，形成完整的质量保证
5. **触发条件明确**：花叔的每个 skill 都有清晰的 description 字段说明何时触发，这比模糊的 skill 名更利于 LLM 路由
