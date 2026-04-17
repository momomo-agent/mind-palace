# Boris Cherny 的 Opus 4.7 实战技巧

> 来源：Boris Cherny（Claude Code 创始人）via 宝玉翻译
> 原推：https://x.com/bcherny/status/2044786054356709604
> 翻译：https://x.com/dotey/status/2044868344256381254

Boris 过去几周深度使用 Opus 4.7，总结了几个让效率翻倍的实用技巧。

## Auto Mode：告别权限确认地狱

以前用 Claude Code 跑长任务，要么不断确认权限请求，要么用 `--dangerously-skip-permissions` 全跳过。现在 Auto mode 让 Claude 自己判断命令安全性，自动批准执行。

好处：不用频繁确认，能同时运行更多任务。

如果不想用 Auto mode，还有 `/fewer-permission-prompts`——它检查历史操作，找到安全但经常触发权限提示的命令，建议加入白名单。

## Recaps：长任务不怕中断

自动总结 Claude 已完成的任务和下一步计划。中间离开几小时回来，也能迅速回到节奏。

## Focus Mode（CLI）

隐藏所有中间步骤，只呈现最终结果。对 Claude 足够信任时，省掉看中间细节的时间。

## Effort Level 调优

Opus 4.7 用"努力程度"替代了固定的思考预算：

- `low`：响应快、省 token
- `high`：标准深度
- `xhigh`：Claude Code 默认，推荐普通任务用
- `max`：最强推理，特别难的问题用

可以随时切换，按需调整。

## 自我验证工作流（核心）

Boris 最常用的提示词模式：`"Claude 去做某某事，然后 /go"`

`/go` 是他的自定义技能，自动执行三步：
1. 用 bash/浏览器/computer use 做端到端自我测试
2. 运行 `/simplify` 精简代码
3. 提交 PR

不同场景的验证方式：
- 后端：确保 Claude 知道怎么启动服务器，做端到端测试
- 前端：用 Claude Chromium 浏览器扩展，让 Claude 控制浏览器
- 桌面应用：用 computer use

关键洞察：**对于耗时较长的工作，自我验证至关重要。回来检查时，你确切知道代码是真实可用的。**

## 与我们的工作流对比

Boris 的 `/go` 跟我们的四角色 agent 开发团队思路一致——执行完必须自验证。区别是他把验证内化成了一个 slash command，我们是拆成独立的测试验收 agent。

他的 effort level 调优建议也值得参考：我们现在 OpenClaw 配置里可以考虑默认用 `xhigh`，复杂任务手动切 `max`。
