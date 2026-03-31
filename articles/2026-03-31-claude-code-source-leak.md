# Sublime Text 的 Ctrl+Z 如何救回 Claude Code 的全部源码

## 事件经过

2025 年 2 月 24 日，Anthropic 发布了 Claude Code——一个通过 npm 安装的 AI 编程 CLI 工具。开发者 Dave Schumaker 第一时间下载后，出于职业习惯打开了 `node_modules` 里的 `cli.mjs`（23MB 的 minified 文件）。

文件顶部写着 `--enable-source-maps`。底部赫然出现了完整的 inline source map：

```
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKIC...
```

Sublime Text 告诉他，这行字符串有 **18,360,183** 个字符。这意味着 source map 几乎占了文件体积的大半，而且很可能包含完整的 `sourcesContent`——原始 TypeScript 源码一字不差地嵌在里面。

但他没来得及提取——得带狗 Benson 去看兽医。

## Anthropic 的擦除行动

在兽医诊所等候时，Claude Code 弹出提示："Update installed, restart to apply." Dave 顺手更新了。

晚上回来再看 `cli.mjs`——source map 字符串消失了。Anthropic 在几个小时内完成了紧急响应：

1. 推送新版本移除 source map
2. 从 npm registry **unpublish** 了旧版本（0.2.8）
3. 连 npm 缓存里的 tgz 都被清理了

Dave 试了 `npm cache`、npm registry 下载旧版——全部失败。历史正在被系统性地擦除。

## Ctrl+Z 的奇迹

故事到这里本该结束了。但 Dave 关机前瞥了一眼还开着的 Sublime Text——`cli.mjs` 文件仍然在编辑器里。

他按下了 `⌘+Z`。

Sublime Text 的 undo 历史恢复了文件到更新前的版本。**完整的 source map 字符串出现了。**

编辑器的本地 undo buffer 不受文件系统写入影响——npm 更新覆盖了磁盘上的文件，但 Sublime Text 保留了内存中的旧版本。这个完全偶然的因素让一个计划周密的擦除行动功亏一篑。

## 源码里发现了什么

从 source map 中提取的源码揭示了 Claude Code 的完整架构：

**技术栈**：React + Ink 构建 CLI 界面。这个选择很有意思——用声明式 UI 框架做终端应用，而不是传统的 blessed/inquirer 方案。

**Loading 状态词**：等待 AI 响应时显示的随机动词，一共 57 个：

> Accomplishing, Clauding, Finagling, Honking, Moseying, Noodling, Percolating, Reticulating, Schlepping, Smooshing, Vibing...

这些词的选择体现了 Claude 品牌的人格化策略——不是冷冰冰的 "Processing..."，而是有趣、略带幽默的动词，让等待时间变得可爱。

**架构模块**：AI client（直接调 Anthropic Messages API）、命令注册系统、文件操作管理、Shell 执行环境、遥测系统、OAuth + API Key 双轨认证。

## 后续

Anthropic 随后对 GitHub 上提取源码的仓库发起了 DMCA 下架通知。但社区已经有了多个去混淆版本在流传（ghuntley 的 cleanroom deobfuscation 是最完整的一个）。

陈成（sorrycc）在 2026 年 3 月重新梳理了整个事件，写了一个简洁的 source map 提取脚本，并指出了这个经典的安全疏忽：**source map 是开发调试用的，包含从变量名到注释的所有信息，不应该出现在生产发布物中。**

## 启示

1. **发布前检查 .map 文件**——一个 `sourcesContent` 字段就能暴露全部代码
2. **npm unpublish 不等于真正擦除**——缓存、CDN 镜像、编辑器 undo buffer 都可能保留旧版本
3. **闭源 + npm 发布是矛盾的**——对比 OpenAI Codex CLI 直接用 Apache 2.0 开源，Anthropic 的闭源策略在 npm 生态里天然有泄露风险
4. **Sublime Text 的 undo 是永久的**——只要不关闭 tab，undo 历史不受磁盘文件变化影响。这不是 bug，是 feature
