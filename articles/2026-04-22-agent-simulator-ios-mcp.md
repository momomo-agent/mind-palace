# Agent Simulator：iOS Simulator 的 MCP 控制面板

来源：<https://github.com/jasonkneen/agent-simulator>

## 它解决什么问题

AI agent 操控 iOS Simulator 的三个痛点：看不到屏幕（只能截图）、输入要抢光标（macOS 焦点冲突）、不知道屏幕上有什么（没有结构化信息）。

Agent Simulator 一次性解决了这三个：MJPEG 实时流（看得到）、axe cursor-free 输入（不抢光标）、accessibility tree + React component tree（知道有什么）。

## 架构

三层：

1. Rust `sim-server`：MJPEG 视频流 + axe HID 输入。axe 通过 `FBSimulatorHID → CoreSimulator` 做像素精确输入，不需要 Simulator.app 焦点，不移动 macOS 光标。
2. Node `server.js`：HTTP API + WebSocket bridge + Metro symbolicate proxy。
3. MCP `server.mjs`：15 个 MCP tools，stdio 协议，任何 MCP client（Claude Desktop/Codex/Cursor）都能用。

## 15 个 MCP Tools

最值得关注的几个：

- `sim_tree`：完整 iOS accessibility tree。`flat: true` 返回扁平化的 labeled element 列表，省 LLM context。
- `sim_tap_by_label`：按 AX label/value 查找元素并点击中心——比坐标点击鲁棒得多，不怕布局变化。
- `sim_inspect`：检查 RN 组件，返回 source-symbolicated component stack。
- `sim_source`：读指定 file:line 周围的代码窗口。
- `sim_select_by_source`：给 fileName + line，探测网格找到渲染了该源码的组件。

## 跟 agent-control 的对比

| 维度 | agent-control | Agent Simulator |
|------|--------------|-----------------|
| 输入方式 | simctl + accessibility API | axe（FBSimulatorHID，cursor-free） |
| 屏幕感知 | 截图 | MJPEG 实时流 |
| 元素定位 | AX tree snapshot | AX tree + React component tree |
| 协议 | CLI 命令 | MCP（15 tools） |
| 源码关联 | 无 | Metro symbolicate → 源码定位 |
| 适用范围 | 任何 iOS app | 任何 iOS app（RN app 有额外能力） |

Agent Simulator 在几个方面比我们的方案更好：

1. axe 的 cursor-free 输入不抢 macOS 焦点，agent 操控 simulator 时用户可以继续用电脑。我们的方案需要 simctl 或 accessibility API，某些操作会抢焦点。

2. `sim_tap_by_label` 按语义定位而非坐标，对布局变化更鲁棒。我们的 agent-control 也用 AX label，但 Agent Simulator 把它封装成了一个原子操作（查找+点击），减少了 agent 的决策步骤。

3. MJPEG 实时流比截图更流畅，agent 能"看到"动画和过渡效果。

4. MCP 协议让任何 MCP client 都能用，不需要 CLI wrapper。

值得考虑把 axe 集成到 agent-control 的 iOS 路径里，或者直接用 Agent Simulator 作为 iOS simulator 的 MCP backend。
