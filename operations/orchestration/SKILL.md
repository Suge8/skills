---
name: orchestration
description: "用 Orca orchestration 做受监督的多 agent 协调：任务 DAG、dispatch、worker_done/escalation、阻塞式 ask/reply、decision gate 和 coordinator 循环；用户明确要求监督 worker、汇总 worker_done 或协调任务依赖时用。worker 选型读 ~/.agents/docs/worker-preferences.md。所有权交接和普通终端控制用 orca-cli。"
---

# Orca Orchestration

本文件是发现入口（stub），不是使用指南。完整且与版本匹配的 Orca orchestration 参考由 `orca` 二进制自身提供——刻意不写进本文件，以免与真正执行命令的二进制脱节。

需要结构化多 agent 协调时使用 Orca orchestration：消息线程、阻塞式 ask/reply、任务 dispatch、worker_done/escalation 等待、任务 DAG、decision gate、coordinator 循环，或把工作拆分给多个 agent。完整所有权交接（"hand off / handoff / handover / 交给另一个 agent / 另一个 worktree"）在用户没有要求监督、等待结果或协调 DAG 时用 orca-cli skill，普通终端控制、shell 命令、worktree 管理和内置浏览器也用 orca-cli。协调依赖真实的 Orca runtime 状态；绝不用非 Orca 的 subagent 工具替代。

派发 worker 前，agent 与模型选型读 `~/.agents/docs/worker-preferences.md`（单一事实源）。

## 为本会话确定 CLI

只解析一次可执行文件，后续所有命令复用：

- 设置了 `ORCA_CLI_COMMAND` 环境变量就用它的值。Orca 为受管 WSL 会话导出该变量。
- 否则，在暴露 `ORCA_DEV_REPO_ROOT` 的开发检出会话里用 `orca-dev`。
- 否则，在 Orca 受管终端之外的 Linux 上用 `orca-ide`。绝不要在那里裸跑 `orca`——在 Orca 终端之外它通常解析为 GNOME Orca 屏幕阅读器（`/usr/bin/orca`），会在用户机器上开始语音朗读。
- 其余情况用 `orca`。

下文 `ORCA` 是已解析可执行文件的占位符。运行前先替换；不要创建 shell 变量，也不要按字面运行 `ORCA`。POSIX shell、PowerShell 和 cmd.exe 中同理。

选定的可执行文件跑不起来就报告确切错误并停止。不要回落到其他可执行文件——那可能悄悄指向另一个 Orca 构建。

## 运行 Orca 命令前先加载完整指南

```text
ORCA skills get orchestration
```

它会打印与即将处理命令的二进制完全匹配的完整指南——任务创建与 dispatch、注入的生命周期前导词、worker_done 权威、decision gate 和 coordinator 循环。先读它，再运行需要的具体命令。

不要凭记忆或本 stub 的缓存副本猜子命令和参数。它们随 Orca 版本变化，本文件有意不再罗列。用 `ORCA status --json` 确认应用在运行（需要时用 `ORCA open --json` 启动），agent 调用优先加 `--json`。
