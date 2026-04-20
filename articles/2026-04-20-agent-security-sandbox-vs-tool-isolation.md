# Agent 安全架构：整体沙箱 vs Tool-Level 隔离

flyingpenguin 博主（信息安全领域，博客始于 1995 年）通过跟随 NVIDIA NemoClaw + OpenClaw 教程，逐步对比了两种 agent 安全架构，并用自己开发的 Wirken gateway 展示了替代方案。

## 核心论点：MS-DOS 教训重演

作者把当前 agent gateway 的安全模型类比为 MS-DOS——整个 agent 装进一个沙箱，内部没有隔离。就像 DOS 时代任何程序都能直接操作内核和磁盘一样，沙箱内的 agent 拥有对所有工具的完全访问权。

修复方式不是"更好的沙箱"，而是像 Unix 那样从架构上引入分层隔离。

## 两种范式对比

### 整体沙箱（NemoClaw/OpenClaw）

- 整个 agent 运行在容器内
- Ollama 需要绑定 0.0.0.0（因为 agent 在独立 netns 里访问不了 loopback）
- 出站连接在 host-side TUI 审批（netns 边界执法）
- Telegram 通过 chat channel 内发 pairing code 配对
- Web UI 需要 capability token + SSH tunnel（因为 UI 也在容器内）

每一步都是对"沙箱包住整个 agent"这个约束的 workaround。

### Tool-Level 隔离（Wirken）

- Agent 作为 host 进程运行，Ollama 保持 127.0.0.1
- 每个 channel 是独立进程，各自持有 Ed25519 身份
- Vault（密钥存储）运行在进程外
- Shell exec 在 hardened Docker 容器内执行：
  - `cap_drop ALL` + `no-new-privileges`
  - Read-only rootfs
  - 64MB tmpfs at /tmp
  - 无网络访问
- 16 个高危命令前缀（如 curl）每次调用都需审批（Tier 3）
- 其他命令首次使用审批，30 天记忆（Tier 2）
- Hash-chained 审计链：每个 tool call、permission denial、result 都是链上节点

## 审计链设计

Wirken 的审计链是工程上的亮点：

```
[4] assistant_tool_calls → curl 请求
[5] permission_denied → Tier 3 拒绝，tool call 从未到达沙箱
[6] tool_result → 返回拒绝信息
[10] attestation → SHA-256 链式签名
```

每个事件都有 `chain_head_hash = SHA-256(prev_hash || leaf_hash)`，`wirken sessions verify` 可以重放验证整条链的完整性。这意味着审计日志是防篡改的。

## 9 个架构决策点对比

| 步骤 | NemoClaw | Wirken |
|------|----------|--------|
| Runtime | 容器内运行，需配置 NVIDIA container runtime | Host 进程，Docker 仅用于 tool sandbox |
| Ollama | 0.0.0.0（跨 netns） | 127.0.0.1（loopback 足够） |
| 安装 | curl-pipe-bash | curl-pipe-sh + release 签名验证 |
| 模型 | ollama pull + run | 相同 |
| 配置 | Wizard 生成沙箱镜像 | Wizard 写 provider config + channel 注册 |
| Telegram | Chat channel 内 pairing code | Bot token 进加密 vault + Ed25519 keypair |
| Web UI | Capability token（一次性显示） | Loopback-bound，无 token |
| 远程访问 | OpenShell 端口转发 + SSH tunnel | 仅 SSH tunnel |
| 权限 | Netns 边界执法 | Tool dispatch 层执法，分层权限 |

## 对我们的启发

OpenClaw 目前的安全模型确实偏向"信任 LLM 自己做对的事"——exec 工具直接在 host 上运行，权限控制主要靠 obfuscation 检测和用户审批。Wirken 的 tool-level 隔离思路值得关注：

1. **每个 exec 调用独立沙箱** — 而不是整个 agent 在沙箱里
2. **分层权限** — 高危操作每次审批，低危操作首次审批后记忆
3. **防篡改审计链** — 不只是日志，是可验证的事件链

这跟我们 Fluid OS 的安全模型设计有直接关系——OS 层面的权限应该在 tool dispatch 层而不是在 agent 容器层。
