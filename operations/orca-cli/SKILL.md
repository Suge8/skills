---
name: orca-cli
description: "用公开 orca CLI 操作 Orca 应用：worktree、终端、仓库、automation 和内嵌浏览器；用户说 $orca、要在 Orca 里开 worktree/终端、读取终端输出、做所有权交接（handoff）时使用。受监督的多 agent 协调用 orchestration；Orca 之外的桌面 UI 用 bcu。"
---

# Orca CLI

本文件是发现入口（stub），不是使用指南。完整且与版本匹配的 Orca CLI 参考由 `orca` 二进制自身提供——刻意不写进本文件，以免与真正执行命令的二进制脱节。

当 Orca 运行中的编辑器/runtime 是事实源时使用 Orca：Orca 管理的 worktree、文件夹上下文、终端、仓库、automation、worktree 评论，以及 Orca 应用内嵌的浏览器。触发词包括 "$orca-cli"、"Orca worktree"、"子 worktree"、"在 worktree 里起 codex/claude"、"读/等/发 Orca 终端"、"完整交接（handoff/handover）"、"把这个交给另一个 agent"、"控制 Orca 里的浏览器"。与 Orca 状态无关时用普通 shell 工具。

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
ORCA skills get orca-cli
```

它会打印与即将处理命令的二进制完全匹配的完整指南——worktree、交接、终端、automation 和内置浏览器。先读它，再运行需要的具体命令。

不要凭记忆或本 stub 的缓存副本猜子命令和参数。它们随 Orca 版本变化，本文件有意不再罗列。用 `ORCA status --json` 确认应用在运行（需要时用 `ORCA open --json` 启动），agent 调用优先加 `--json`。

## 旧版 Orca 不认识 `skills get` 时

仅当选定的二进制明确报告 `skills get` 是未知命令时才用此回退。其他失败不能证明是旧二进制；如实报告，不要猜测或更换可执行文件。对确认的旧版二进制，只用下面这组有界、只读的引导命令定位现状。不要卡死，也不要发明命令：

```text
ORCA status --json
ORCA worktree ps --json
ORCA terminal list --json
```

然后告诉用户：升级 Orca 后可通过 `ORCA skills get orca-cli` 恢复完整的版本匹配指南。超出这些命令的操作问用户，不要猜这个旧二进制可能不支持的命令面。
