# Agent 安全架构深度分析：整体沙箱 vs Tool-Level 隔离

来源：[flyingpenguin](https://www.flyingpenguin.com/build-an-openclaw-free-secure-always-on-local-ai-agent/)（信息安全博客，1995 年至今）
对比对象：[NVIDIA NemoClaw + OpenClaw](https://developer.nvidia.com/blog/build-a-secure-always-on-local-ai-agent-with-nvidia-nemoclaw-and-openclaw/) vs [Wirken](https://github.com/gebruder/wirken)

## 核心论点

作者把当前 agent gateway 的安全模型类比为 MS-DOS：整个 agent 装进一个沙箱，沙箱内部没有隔离——就像 DOS 时代任何程序都能直接操作内核和磁盘。修复方式不是"更好的沙箱"，而是像 1973 年 Unix 那样从架构上引入分层隔离（进程分离、用户分离、文件权限、管道）。

他的原话很精辟：每一个 workaround 都是对"沙箱包住整个 agent"这个约束的妥协。约束本身值得重新审视。

## 两种架构范式

### 范式 A：整体沙箱（NemoClaw/OpenClaw）

NVIDIA 的 NemoClaw 是一个参考栈，用 OpenShell 把 OpenClaw 整个装进容器：

```
[Host OS]
  └── [Docker Container / OpenShell sandbox]
        ├── OpenClaw (agent framework)
        ├── 所有 tool 调用
        ├── 所有 channel adapter
        └── 所有凭据
```

这个架构的安全边界是容器本身。agent 在容器内拥有完全权限，安全靠容器壁。

导致的 workaround 链：

1. **Ollama 绑定 0.0.0.0** — agent 在独立 network namespace 里，访问不了 host 的 127.0.0.1，所以推理服务必须暴露到所有网络接口。这意味着同一网络的任何设备都能访问你的模型。

2. **出站连接在 host TUI 审批** — 因为 tool 层没有权限概念，只能在 netns 边界拦截。你看到的是"某个进程要连某个 IP:port"，而不是"agent 要执行 curl 命令"。审批粒度太粗。

3. **Telegram 通过 chat channel 内发 pairing code** — 没有独立的身份平面（identity plane），只能借用聊天通道做配对。

4. **Web UI 需要 capability token + SSH tunnel** — UI 也在容器内，需要额外的端口转发才能从外部访问。token 只显示一次，丢了就没了。

5. **curl-pipe-bash 安装** — 安装脚本没有签名验证。

### 范式 B：Tool-Level 隔离（Wirken）

Wirken 反过来——agent 作为 host 进程运行，只有 tool 执行才进沙箱：

```
[Host OS]
  ├── Wirken Gateway (Rust binary)
  │     ├── Agent Runtime (host process)
  │     ├── Adapter Registry
  │     ├── Permission Engine (3-tier)
  │     └── Session Log (hash-chained)
  │
  ├── Channel Adapter: Telegram (独立进程, Ed25519 身份)
  ├── Channel Adapter: Discord (独立进程, Ed25519 身份)
  ├── Channel Adapter: Slack (独立进程, Ed25519 身份)
  │
  ├── MCP Proxy (独立进程, vault handle 隔离)
  │
  ├── Vault (XChaCha20-Poly1305, OS keychain 派生密钥)
  │
  └── [Docker Container] ← 只有 shell exec 才进这里
        ├── cap_drop ALL
        ├── no-new-privileges
        ├── read-only rootfs
        ├── 64MB tmpfs at /tmp
        ├── workspace bind-mount (可写)
        └── 无网络
```

关键设计决策：

1. **Ollama 保持 127.0.0.1** — agent 在 host 上，loopback 就够了。推理服务不暴露。

2. **每个 channel 是独立 OS 进程** — Telegram adapter 被攻破，不影响 Discord adapter。每个 adapter 有自己的 Ed25519 密钥对，通过 Unix domain socket + challenge-response 认证。IPC 用 Cap'n Proto（零拷贝、遍历限制）。adapter 只能处理自己 channel 的消息，不能调用 tool、读其他 channel 的 session、访问其他 channel 的凭据。

3. **三层权限模型**：
   - Tier 1：低风险操作，自动批准
   - Tier 2：中风险操作，首次使用审批，30 天记忆
   - Tier 3：高风险操作（curl、rm、sudo 等 16 个前缀），每次调用都需审批
   
   权限在 tool dispatch 层执法，不是在网络边界。

4. **Shell exec 在 hardened container 内** — 不是整个 agent 在容器里，而是每个 shell 命令在独立容器里跑。容器配置极其严格：
   - `cap_drop ALL`：丢弃所有 Linux capabilities
   - `no-new-privileges`：禁止提权
   - Read-only rootfs：根文件系统只读
   - 64MB tmpfs at /tmp：临时空间有限
   - 无网络：shell 命令不能访问网络
   - Workspace bind-mount：只有工作目录可写

5. **凭据在进程外 vault** — XChaCha20-Poly1305 加密，密钥从 OS keychain 派生，per-credential 过期和手动轮换。MCP proxy 也是独立进程，agent 进程永远看不到 MCP 凭据。

6. **安装脚本有签名验证** — Ed25519 签名，公钥内嵌在安装脚本中，每个失败路径都是 fail-closed。

## Hash-Chained 审计链

这是 Wirken 最有工程深度的部分。

每个 session 的每个事件（用户消息、assistant 消息、tool call、tool result、LLM 请求/响应元数据、权限决策）都写入一个 append-only 的 hash chain：

```
Event[n].hash = SHA-256(Event[n-1].hash || Event[n].payload_hash)
```

每个 turn 结束后，agent 的 Ed25519 身份签名当前 chain head。

实际审计日志长这样：

```
[ 4] assistant_tool_calls
     call: exec({"command":"curl https://httpbin.org/get"})
[ 5] permission_denied
     action_key='shell:curl' tier=tier3
[ 6] tool_result
     tool=exec success=False
     output: Permission denied: 'exec' requires tier3 approval.
[10] attestation
     chain_head_seq=9
     chain_head_hash=ff57c574ab503a74...
```

注意：curl 被 Tier 3 拦截，tool call 从未到达沙箱。拒绝本身也是审计链上的一个节点。

另一个例子——已批准的 sh 命令在沙箱内执行：

```
[14] assistant_tool_calls
     call: exec({"command":"sh -c \"touch /cannot_write_here 2>&1; ...\""})
[15] tool_result
     tool=exec success=True
     output:
       touch: cannot touch '/cannot_write_here': Read-only file system
       ws_ok=1    ← workspace bind-mount 可写
       tmp_ok=1   ← tmpfs 可写
```

`Read-only file system` 是内核级拒绝（不是 DAC 检查），rootfs 本身是只读挂载。

`wirken sessions verify` 可以离线重放整条链，验证每个 leaf hash 匹配 payload、每个 chain hash 匹配 `SHA-256(prev_hash || leaf_hash)`。这意味着审计日志是防篡改的——任何修改都会破坏链。

更进一步，每个 LLM 调用也被记录为 typed event，包含发送给模型的 messages 和 tools 的 SHA-256 hash。verifier 可以从日志重算这些 hash 并标记任何偏差。这让你能回答"agent 到底给模型发了什么"这个问题。

## Sub-Agent 安全

Wirken 的 sub-agent 模型也值得注意：

- 父 agent 通过 `spawn_subagent` 创建子 agent
- 每个子 agent 有独立的 capability ceiling：tool allowlist、最大权限层级、最大轮次、最大运行时间
- 子 agent 无头运行（no interactive approvals）
- 独立 session log
- 硬性深度上限：4 层

这比 OpenClaw 的 sub-agent 模型严格得多——OpenClaw 的 sub-agent 基本继承父 agent 的所有权限。

## Agent 无状态设计

Wirken 的 agent 在 turn 之间是无状态的。每次收到消息，AgentFactory 通过重放 session log 来恢复 agent 状态。如果 agent 在 turn 中间崩溃，harness 在唤醒时检测到不完整的 tool round，将其作为失败暴露，而不是静默重新执行副作用。

这个设计很聪明——避免了"agent 崩溃后重启，重新执行了一个已经执行过的 API 调用"的问题。

## 9 步架构对比表

| 步骤 | NemoClaw | Wirken |
|------|----------|--------|
| 1. Runtime | 注册 NVIDIA container runtime，设 cgroup namespace=host | 无需配置，agent 是 host 进程 |
| 2. Ollama | 绑定 0.0.0.0（跨 netns 访问） | 保持 127.0.0.1（loopback 足够） |
| 3. 安装 | curl-pipe-bash，无签名验证 | curl-pipe-sh + Ed25519 签名验证，fail-closed |
| 4. 模型 | ollama pull + run 预加载 | 相同 |
| 5. 配置 | Wizard 生成沙箱镜像（策略+推理打包） | Wizard 写 provider config + channel 注册 |
| 6. Telegram | Chat channel 内 pairing code | Bot token 进加密 vault + Ed25519 keypair |
| 7. Web UI | Capability token（一次性显示，丢了就没了） | Loopback-bound，无 token |
| 8. 远程访问 | OpenShell 端口转发 + SSH tunnel | 仅 SSH tunnel |
| 9. 权限 | Netns 边界执法（IP:port 粒度） | Tool dispatch 层执法（命令前缀粒度，3 层分级） |

## 技术栈对比

| | NemoClaw/OpenClaw | Wirken |
|---|---|---|
| 语言 | Node.js (TypeScript) | Rust |
| 二进制 | npm 包 + 依赖 | 单个静态二进制（musl） |
| Channel 隔离 | 同一进程 | 每个 channel 独立 OS 进程 |
| 凭据存储 | 配置文件 | XChaCha20-Poly1305 vault |
| 审计 | 日志文件 | Hash-chained + Ed25519 签名 |
| IPC | 进程内 | Cap'n Proto over UDS |
| 测试 | — | 452 tests |
| 许可证 | MIT | MIT |

## 我的思考

### 这篇文章说对了什么

1. **安全边界的粒度决定了安全质量**。整体沙箱是"一道墙"，tool-level 隔离是"每个房间都有锁"。前者一旦被突破就全完了，后者的 blast radius 被限制在单个 tool call。

2. **workaround 是架构问题的症状**。当你需要把 Ollama 绑到 0.0.0.0 才能让 agent 访问推理服务时，说明安全边界画错了位置。

3. **审计不只是日志**。hash-chained + 签名的审计链是可验证的，普通日志文件不是。在 agent 可能被 prompt injection 操纵的世界里，"agent 到底做了什么"这个问题需要密码学级别的答案。

### 这篇文章没说的

1. **性能代价**。每个 shell exec 启动一个 Docker 容器，冷启动延迟不可忽略。对于高频 tool call 的场景（比如我们的 heartbeat 里跑十几个命令），这个开销可能很痛。

2. **网络隔离的 trade-off**。shell exec 容器无网络意味着 agent 不能在 shell 里 curl API——必须通过 Wirken 的 tool 层走。这对某些工作流是限制。

3. **复杂度转移**。整体沙箱的复杂度在运维侧（配置容器），tool-level 隔离的复杂度在开发侧（实现权限引擎、IPC、vault）。Wirken 的 Rust 实现质量看起来很高（452 tests、Cap'n Proto、Ed25519），但维护成本也高。

### 对 Fluid OS 的启发

我们设计 OS 层权限时，应该借鉴 Wirken 的思路：

1. **权限在 tool dispatch 层**，不在 agent 容器层。每个 tool call 是独立的安全决策点。
2. **channel 进程隔离**。我们的 OpenClaw 目前所有 channel 在同一进程——一个 channel 的 bug 影响所有 channel。
3. **hash-chained 审计**。agent 的行为需要可验证的记录，不只是可读的日志。
4. **sub-agent capability ceiling**。父 agent 应该能声明子 agent 的权限上限，而不是继承全部权限。

但也要注意：Wirken 是从安全第一的角度设计的，我们是从功能第一的角度演进的。两条路最终会在中间汇合——关键是知道对方在哪里，然后有意识地靠拢。
