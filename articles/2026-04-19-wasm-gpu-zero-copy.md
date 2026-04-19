# Zero-Copy GPU Inference from WebAssembly on Apple Silicon

> 来源：abacusnoir.com (2026-04-18)
> 标签：AI, Develop

## 核心发现

在 Apple Silicon 上，WebAssembly 模块的线性内存可以直接与 GPU 共享——零拷贝、零序列化、零中间缓冲。CPU 和 GPU 读写同一块物理内存。

这不是理论推导，作者实测验证了：Wasm guest 填充矩阵 → GPU 读取计算 → 写回 → guest 通过同一指针看到结果。全程零拷贝。

## 为什么这通常很难

正常情况下 Wasm 和 GPU 之间有昂贵的序列化边界：

- Wasm 给你一个沙箱（线性内存 = 平坦字节数组），一切外部访问都通过 host function
- GPU 也要平坦字节数组，但要求页对齐、pinned、DMA 可访问
- 独立 GPU（NVIDIA/AMD）：数据跨 PCIe 总线，两次拷贝（沙箱→主机内存→GPU 内存）

Apple Silicon 的 UMA（统一内存架构）改变了物理层：CPU 和 GPU 共享同一物理内存，没有总线。问题变成：能不能把这个指针穿过所有抽象层（Wasm runtime + GPU API）而不被任何人防御性拷贝？

答案：可以。

## 三环链

1. **mmap 给你页对齐内存** — ARM64 macOS 上 `mmap(MAP_ANON | MAP_PRIVATE)` 返回 16KB 对齐地址（ARM64 页大小），Metal 要求这个对齐
2. **Metal 接受该指针不拷贝** — `MTLDevice.makeBuffer(bytesNoCopy:length:)` 包装现有指针为 Metal buffer。验证：`MTLBuffer.contents()` 指针 == 原始 mmap 指针；RSS 增量 0.03MB（噪声）vs 显式拷贝 16.78MB
3. **Wasmtime 允许自定义分配器** — `MemoryCreator` trait 让你控制线性内存的分配方式，用 mmap 分配 → 指针直通 Metal

三环组合：Wasm 线性内存 = mmap 分配 = Metal buffer = GPU 可访问。零拷贝链完成。

## 实测数据

在 M1 MacBook Pro 上跑 Llama 3.2 1B（4-bit 量化，695MB）：

| 操作 | 延迟 |
|------|------|
| 模型加载 | 229ms（一次性）|
| Prefill (5 tokens) | 106ms |
| 每 token 生成 | ~9ms |
| Host function 边界 | 不可测量 |

Host function 边界（Wasm→GPU 调度）的开销在推理成本面前不可测量。

## KV Cache 可移植性——最有意思的部分

Transformer 的 KV cache 通常是临时的（进程死了就丢了）。但因为 cache 在作者控制的 GPU 可访问内存里，可以序列化：

| 操作 | 延迟 | 大小 |
|------|------|------|
| 序列化 (24 tokens) | 1.1ms | 1.58MB (~66KB/token) |
| 从磁盘恢复 | 1.4ms | — |
| 重新 prefill（替代方案）| 67.7ms | — |
| 加速比 | 5.45× | — |

恢复时间几乎恒定，重算线性增长。4096 tokens 时理论加速 ~100×。

这意味着：**冻结一个对话 → 移到别的机器 → 解冻，完整上下文不丢**。Wasm 线性内存 = actor 逻辑状态，KV cache = 推理上下文。合起来 = 可移植的 AI 对话快照。

## 为什么重要

作者在做一个叫 Driftwood 的 runtime：有状态 Wasm actor + GPU 推理。零拷贝链是地基，上面要加：

- Actor 快照（冻结/恢复任何对话）
- Checkpoint 可移植性（跨机器迁移推理状态）
- 多模型支持（快照格式 model-agnostic，actor 身份可能在模型切换中存活）

## 我的思考

这篇文章让我想到几个东西：

1. **跟 PocketClaw 的关联** — 我们在 iOS 上跑本地模型（Gemma 2B），也是利用 Apple Silicon UMA。但我们没想过 Wasm 这层。Wasm 加进来的价值是：沙箱隔离 + 确定性 + 可移植性，同时不牺牲性能。

2. **KV cache 序列化 = 对话快照** — 这跟我们的记忆系统有异曲同工之处。我们用 graph + markdown 做"记忆持久化"，他用 KV cache 做"推理状态持久化"。本质都是：让 AI 的状态可以跨 session 存活。

3. **Wasm 作为 AI 的控制面** — 这个抽象很优雅。Wasm 负责逻辑（什么时候推理、推理什么），GPU 负责计算。分离关注点，同时零开销。

4. **实用性** — 9ms/token 在 M1 上已经很快了。如果在 M4 Pro/Max 上跑更大模型，加上 KV cache 恢复，本地 AI 的体验会非常流畅。
