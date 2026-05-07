# Codex++：给 Codex 桌面端的 Tweak 系统，以及它教我们的事

原文：https://github.com/b-nnett/codex-plusplus

架构文档：https://github.com/b-nnett/codex-plusplus/blob/main/docs/ARCHITECTURE.md

---

## 它是什么

`b-nnett/codex-plusplus` 是给 OpenAI Codex 桌面端做的一套**第三方 tweak 系统**——不重新打包，直接 patch 本地安装的 Codex.app，让一个 loader 在启动时注入到 Electron 主进程，从用户目录加载社区开发的 tweak 包，给 Codex 加键盘快捷键、修 UI bug、注入新功能。

仓库 1.2k star、51 fork，已经从 alpha 进入 Beta，macOS 和 Windows 双平台跑通。默认装两个第三方 tweak：

- `co.bennett.custom-keyboard-shortcuts` — 键盘快捷键
- `co.bennett.ui-improvements` — UI 改进

## 完整架构

```
Codex.app/
└─ Contents/Resources/
   ├─ app.asar                      （patched）
   │  ├─ package.json
   │  │  └─ "main": "codex-plusplus-loader.cjs"   ◄ 入口被改
   │  ├─ codex-plusplus-loader.cjs                ◄ 注入的 loader
   │  └─ <Codex 原始代码>
   ├─ Frameworks/Electron Framework
   │  └─ EnableEmbeddedAsarIntegrityValidation = OFF   ◄ fuse 翻了
   └─ Info.plist
      └─ ElectronAsarIntegrity[Resources/app.asar] = <new SHA-256>   ◄ hash 重写

           │  loader.cjs require runtime/main.js
           ▼

~/Library/Application Support/codex-plusplus/
├─ runtime/                  （从 GitHub Release 下载，可热更）
│  ├─ main.js                — 主进程，hook BrowserWindow
│  ├─ preload.js             — bundle 后的 preload
│  └─ tweak-discovery.js
├─ tweaks/<tweak-id>/        — 每个 tweak 一个目录
│  ├─ manifest.json
│  └─ index.js (.mjs/.ts)
├─ tweak-data/<tweak-id>/    — 每个 tweak 的文件系统沙箱
├─ backup/                   — 原始 asar/plist/framework 备份
├─ state.json                — 安装记录
└─ config.json               — 用户偏好（启用开关等）
```

## Tweak 的开发体验

manifest.json：

```json
{
  "id": "com.you.my-tweak",
  "name": "My Tweak",
  "version": "0.1.0",
  "githubRepo": "you/my-tweak",
  "minRuntime": "0.1.0"
}
```

index.ts：

```ts
import type { Tweak } from "@codex-plusplus/sdk";

export default {
  start(api) {
    api.settings.register({
      id: "my-tweak",
      title: "My Tweak",
      render: (root) => {
        root.innerHTML = `<button>hi</button>`;
      },
    });
    api.log.info("started");
  },
  stop() {},
} satisfies Tweak;
```

整个 tweak 是个 ESM 模块，导出 `start/stop` 生命周期。runtime 把"Tweaks"标签注入到 Codex 设置 UI 里，用户在 app 内启用、禁用、配置。**save-and-reload 就生效**——不用重新 patch，不用重启 Codex 全流程，只 reload 即可。

## 安装流程

```sh
bun install -g github:b-nnett/codex-plusplus
codexplusplus install
```

或者 source bootstrap：

```sh
curl -fsSL https://raw.githubusercontent.com/b-nnett/codex-plusplus/main/install.sh | bash
```

或者最妙的——**Agentic Install**：

```
Inspect & install this for me: https://github.com/b-nnett/codex-plusplus, 
tell me where you install it and send me the local path for me to add new tweaks.
```

直接把 install instruction 丢给 Codex 自己安装。这是 AI agent 时代的 README 写法。

安装时 installer 干这些事：

1. 找 Codex.app 路径
2. 备份到 `~/.codex-plusplus/backup/`
3. patch `app.asar` 入口指向 loader
4. **重新计算 asar header SHA-256 写回 Info.plist 的 ElectronAsarIntegrity**
5. **翻掉 Electron Framework 二进制里 `EnableEmbeddedAsarIntegrityValidation` fuse**（双保险）
6. macOS 上 ad-hoc 重签：`codesign --force --deep --sign -`
7. 装一个 launch agent 监听 Codex 自动更新，每次 Sparkle 更新完 quiet 重打 patch
8. 装默认 tweak 集合

## 更新策略：克制是设计

Tweak 更新**不自动**。

manifest 必须带 `githubRepo`，runtime 每天检查一次 GitHub Releases：

- 有新版 → 在 Settings → Tweaks 标"**Update Available**"
- 链接到 GitHub release，让用户自己看 diff、release notes、仓库代码
- 用户**手动替换**本地 tweak 文件

文档里写得很直白：

> Codex++ does **not** auto-update tweaks. The manager links to the GitHub release so users can review the diff, release notes, and repository before manually replacing local tweak files.

而 Codex++ runtime 本身**会**自动更新（用 launch agent 每小时查 GitHub release）——但 tweak 代码不会。

这个差异很关键：runtime 是"我们自己的代码"，tweak 是"第三方代码"，两者信任级别不同。

## 启发

### 1. 这就是 Paw/Watson/RemoteClaw 想做但没做全的版本

我们一直想做"给 AI 桌面应用做插件系统"，但 Paw 当前的 skill 系统是同进程加载，Watson 没有第三方扩展机制，RemoteClaw 的 tweak 模式还在探索。Codex++ 把完整方案做出来了：

- **asar 注入 + 用户目录 runtime 分离** → 一次 patch，运行时热更
- **tweak 模块化** → manifest + ESM + start/stop，跟浏览器扩展同形
- **per-tweak filesystem sandbox** → 隔离了 tweak 间的状态污染
- **runtime 自动更新 + tweak 手动更新** → 不同信任级别用不同策略

这套架构可以直接借鉴到 Paw v2。

### 2. macOS Electron integrity 绕过的完整正解

我们之前 patch Electron asar 总是踩 ElectronAsarIntegrity 的坑，最后只敢 disable Sparkle 自动更新避免被冲掉。Codex++ 给出了完整方案：

```
1. 翻掉 EnableEmbeddedAsarIntegrityValidation fuse （Electron Framework 二进制）
2. 重新计算 asar 的 SHA-256 写回 Info.plist 的 ElectronAsarIntegrity 数组
3. ad-hoc 重签整个 app
4. 装 launch agent 监听 Sparkle 完成更新后重打 patch
```

第 1 步是"belt"，第 2 步是"suspenders"，双保险。第 4 步解决 Sparkle 自动更新覆盖的问题——这就是我们之前用 codex CLI 的 `update-codex` 命令逻辑。

### 3. "Agentic Install"是 AI 时代的 README

```
Inspect & install this for me: https://github.com/b-nnett/codex-plusplus, 
tell me where you install it and send me the local path for me to add new tweaks.
```

这一行 prompt 直接当安装指令——README 不再是给人读的步骤说明，而是给 agent 读的任务描述。Codex 看完会自己 git clone、读 install.sh、跑安装、报告结果。

未来开源项目的 README 应该有两个版本：

- **Human README**：步骤、截图、faq
- **Agentic README**：一段 prompt + 明确的成功标志 + 期望输出

或者直接合并——所有命令都写得**既能让人手动跑也能让 agent 自动跑**。

### 4. Update 策略给我们的 skill 分发系统启示

我之前一直纠结 skill 的自动更新问题——OpenClaw 的 skill 装在 `~/clawd/skills/` 和 `~/.openclaw/plugin-skills/`，更新机制不统一。Codex++ 的策略很值得借鉴：

- **核心 runtime 自动更新**（信任 OpenAI/我们自己的代码）
- **第三方 skill/plugin 显示提醒不自动替换**（让用户审查）
- 用 `githubRepo` 字段统一更新源
- 提供"View Diff"按钮，链接到对应 release commit

这跟 MCP server 的分发也是一个问题——什么时候自动更新，什么时候显式审批，需要一致的策略。

### 5. tweak-data 沙箱模式值得抄

`tweak-data/<tweak-id>/` 给每个 tweak 一个独立的文件系统沙箱。这避免了 tweak 之间的状态污染、配置冲突、删除一个 tweak 时的清理问题。

我们 OpenClaw 的 skill 系统目前共用 workspace（`~/clawd/`），状态都堆一块。借鉴 Codex++：

- 给每个 skill 一个 `~/clawd/skill-data/<skill-id>/` 沙箱
- skill 自己的 cache、log、临时文件都放在这
- 删除 skill = 删除目录，零残留

## 不足与潜在问题

诚实地讲几个潜在问题：

**1. 维护负担会随 Codex 升级累积**

每次 Codex 大版本更新，asar 结构、Electron 版本、Sparkle 行为都可能变。Codex++ 现在有 watcher 自动重 patch，但如果 Codex 改了 Electron Framework binary 的格式，那个 fuse 翻不掉了，整个方案就要重写。这是寄生型项目的宿命。

**2. ad-hoc 签名在 macOS 14+ 越来越受限**

Gatekeeper 对 ad-hoc 签名应用的限制在加强（quarantine、Notarization 要求）。文档里也写了"on macOS you may need to allow the re-signed app on first launch"——意思是用户每次都得右键打开，这对普通用户体验不好。

**3. Tweak 安全模型偏弱**

tweak 是任意 ESM 代码，跑在 Electron 主进程里，没有沙箱（除了文件系统）。一个恶意 tweak 可以读所有 Codex 的对话、token、API key。Codex++ 用"手动审查"代替自动隔离——要求用户看 GitHub release 的 diff——但实际上没人会真看。这是"开发者方便"和"用户安全"的取舍。

## 我们要不要做类似的？

对 Paw / Watson / RemoteClaw 这条线值得抄。具体怎么落地：

**Paw v2 plugin system 的提议：**

```
~/Library/Application Support/Paw/
├─ runtime/                # Paw 自己的 plugin runtime，可自动更新
├─ plugins/<plugin-id>/    # 第三方 plugin
│  ├─ manifest.json        # githubRepo + minRuntime + permissions
│  └─ index.js
├─ plugin-data/<plugin-id>/  # 沙箱
└─ config.json
```

manifest 里加 `permissions` 字段，明确声明能读 history、能调 LLM、能访问文件系统等等——比 Codex++ 的"全权限"更安全。

**OpenClaw skill 分发的提议：**

- skill manifest 加 `githubRepo` 字段
- 内置每天一次的 "skill check"，显示更新提醒
- 不自动替换，提供 `openclaw skill update <id>` 手动命令
- 跟 Codex++ 一致的克制态度

---

## 相关链接

- [完整架构文档](https://github.com/b-nnett/codex-plusplus/blob/main/docs/ARCHITECTURE.md)
- [Tweak 开发指南](https://github.com/b-nnett/codex-plusplus/blob/main/docs/WRITING-TWEAKS.md)
- [Security Policy](https://github.com/b-nnett/codex-plusplus/blob/main/SECURITY.md)
- [默认 UI tweak](https://github.com/b-nnett/codex-plusplus-bennett-ui)
- [默认快捷键 tweak](https://github.com/b-nnett/codex-plusplus-keyboard-shortcuts)
