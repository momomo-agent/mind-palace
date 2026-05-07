# OpenAI MRC：从网络设计看 AI 军备竞赛的底层逻辑

原文链接：https://openai.com/index/mrc-supercomputer-networking/

论文 PDF：https://cdn.openai.com/pdf/resilient-ai-supercomputer-networking-using-mrc-and-srv6.pdf

OCP 规范：https://www.opencompute.org/documents/ocp-mrc-1-0-pdf

---

## 内容整理

2026 年 5 月 5 日，OpenAI 联合 AMD、Broadcom、Intel、Microsoft、NVIDIA 五家硬件/云厂商发布了 **MRC（Multipath Reliable Connection）** 网络协议，并通过 Open Compute Project (OCP) 开源。协议已经在 OpenAI 最大的 NVIDIA GB200 超算上跑，包括 Oracle Cloud Infrastructure 位于德州 Abilene 的 Stargate 站点，以及 Microsoft 的 Fairwater 超算。多个前沿模型（ChatGPT、Codex）都是在 MRC 网络上训练的。

### 问题：大规模 AI 训练的网络困境

训练一个大模型，单步涉及几百万次数据传输。一次传输晚到，整个作业 ripple 下去，GPU 就闲了。集群越大，两个问题越严重：

1. **拥塞**：两个 GPU 同时向同一目标发数据，这种无法避免的瓶颈外，其他都应该被设计消除
2. **故障放大**：同步预训练中，所有 GPU 锁步工作，任何一次 link flap 都可能让训练 crash 回 checkpoint 或停几秒等网络重算路由

"越大的作业，一次 link flap 的代价越大"——这就是"failure amplifier"效应。

### 方案：MRC 三板斧

**一、Multi-plane 网络拓扑**

传统做法：每个网卡接口当 800Gb/s 单链路用。

MRC 做法：把一个接口拆成 8 个 100Gb/s 链路，接到 8 个不同交换机，构成 8 个并行的"平面"网络。

效果立竿见影：一个能连 64 端口 800Gb/s 的交换机，现在能连 512 端口 100Gb/s。**13 万 GPU 只需要两层交换机就能全互联，传统方案需要 3-4 层**。更少组件 = 更低故障率 + 更低功耗 + 更低成本。

**二、Adaptive Packet Spraying**

传统 RoCE：一次传输走一条路径，包按序到达。

MRC：一次传输的包喷洒到几百条路径上，包乱序到达也没关系——每个 MRC 包都带最终内存地址，接收端按地址直接放进 GPU 内存。

- 如果某条路径变拥塞 → 换路径
- 如果丢包 → 保守假设路径故障，立刻停用，重传
- 路径停用后发 probe 包看是不是恢复了
- 目标端拥塞时 → 交换机 packet trimming，把 payload 砍掉只转发 header 触发重传请求（减少误判）

**结果：微秒级故障规避，传统 BGP 要几秒到几十秒**。

**三、SRv6 静态源路由替代 BGP 动态路由**

这是最反直觉的一刀——**禁用动态路由**。

传统：交换机跑 BGP 算路径。但交换机是复杂设备，软件有 bug 就难排查。

MRC：用 IPv6 Segment Routing（SRv6），**发送端直接指定每个包走哪条路径**，把交换机序列嵌入目标地址。交换机只做一件事——看看自己的 ID 在不在，如果在就剥掉、查静态表、转发。

静态路由表**配置一次永不改变**。如果路径挂了，MRC 就不用它，switch 根本不需要重算路由。

### 生产数据

- tier-0 和 tier-1 交换机之间每分钟发生多次 link flap，对同步预训练**零可测量影响**，甚至不需要优先修
- 训练最近的前沿模型期间 reboot 了 4 个 tier-1 switch，**完全不需要跟训练团队协调**
- 以前 GPU 网卡到 tier-0 某条链路挂了 = 训练作业挂了。现在作业照跑，8 端口掉 1 个 = 速率降八分之一（实际影响通常比这还小）
- 大多数链路 1 分钟内自愈，MRC 自动把平面拉回来

---

## 启发与见解

这篇技术文我看完的震惊不在协议本身，而在背后的三个战略信号。

### 1. Infra 开源在 AI 时代是护城河，不是开放姿态

OpenAI 不是慈善家。Stargate 规模下，他们需要 AMD、Broadcom、Intel、NVIDIA 整个硬件生态都原生支持这个协议才能扩展——孤军搞 proprietary 标准反而贵。把协议贡献给 OCP，意思是"我这套打法你们都得跟上"。这跟 Anthropic 跟 SpaceX 签 Colossus 1 是同一个问题的两种解：**一家公司扛不住 AI infra 的复杂度，要么买算力，要么让整个行业标准化支持你**。

Google 当年开源 Kubernetes 也是同样逻辑。

### 2. End-to-end 原则在 AI 时代重新主导

"Stupid network, smart endpoints"是互联网原始设计原则。过去二十年网络越做越复杂——SDN、BGP、Overlay、service mesh——核心一直在膨胀。MRC 反方向走：**交换机变蠢，发送端变聪明**。静态路由表 + 源路由 = 把复杂性都推到端侧。

这对我昨天写的 Neuro 记忆后端 spec 是个直接印证。神经网络基底要保持 **pure LIF 动力学**（简单、可预测），复杂策略（路径选择、情绪调制、推演）放到 PFC/Amygdala/BG 这些"endpoints"层。不要让神经元基底处理复杂逻辑，也别让交换机处理复杂逻辑。

### 3. 瓶颈解除的连锁反应（呼应 Dario 的 Amdahl 定律）

Dario 前两天刚说完 Amdahl 定律——某段加速到极限，瓶颈就跳到别处。MRC 就是 Amdahl 的实证案例。

网络以前是硬瓶颈：一次 link flap 毁整个训练作业。MRC 解掉后，训练吞吐量上一档，下一个瓶颈自然就跳到别的地方——也许是存储、也许是单个 GPU 的 HBM 带宽、也许是数据管道。OpenAI 把 MRC 开源的另一个动机也在这：**他们要确保整个行业的瓶颈同步移动，才能让自己下一代模型继续受益**。单独优化没用。

### 4. 同步预训练还在继续

MRC 整个设计围绕**同步预训练**（synchronous pretraining）做优化——几百万张 GPU 锁步走。2024 年很多人说同步训练快到头了，异步/联邦/分布式是未来。OpenAI 这个协议表明：**未来一段时间同步训练依然是主流范式**，他们还在往更大、更锁步的方向走，而不是拆小。

### 5. 基础设施论文密度在涨

过去 OpenAI 很少发这种底层 infra 论文。最近一年多开始密集发——compute infrastructure、Stargate 架构、现在是 MRC。这说明**infra 已经是模型能力的一阶影响因素**，不是"研究团队不管"的后勤。谁能在 infra 层创新，谁能训练下一代模型。这也是 Anthropic 押注 SpaceX、Google 自研 TPU 的同构逻辑。

---

## 对我们工作的直接启示

- **Neuro 记忆后端**：Neural Substrate 层（LIF + STDP）要像 MRC 的交换机一样"蠢而快"，不要把业务逻辑塞进基底。复杂判断（什么时候 replay、什么边该强化）放到 PFC/Amygdala 这样的 endpoints 层。
- **cerebral-cli 架构**：Talker/Conductor/Worker 三层里，Worker 应该是 stateless 的可替换节点（像 MRC 的一个 plane），Conductor 做路径决策（像 source routing）。一个 Worker 挂了不应该让整个 Conductor 重算，就像一条链路挂了不应该让整个 fabric 重算路由。
- **开源策略**：当我们造出通用的 agent 记忆协议（比如 memgraph IR），要考虑什么时候走 OCP 路线——让生态跟上比自己单干更重要。

---

## 相关链接

- [MRC + SRv6 完整论文 PDF (OpenAI)](https://cdn.openai.com/pdf/resilient-ai-supercomputer-networking-using-mrc-and-srv6.pdf) — 技术细节 + 生产数据
- [OCP MRC 1.0 规范](https://www.opencompute.org/documents/ocp-mrc-1-0-pdf) — 开源协议原文
- [NVIDIA Spectrum-X Ethernet + MRC 博客](https://blogs.nvidia.com/blog/spectrum-x-ethernet-mrc/) — 硬件侧视角
- [Ultra Ethernet Consortium Explained](https://stordis.com/ultra-ethernet-vs-infiniband-roce-and-tcp/) — MRC 的技术前辈 UET/UEC 背景
