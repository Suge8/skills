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

## 指挥官纪律（本地经验，与 Orca 版本无关）

命令语法一律以 `ORCA skills get orchestration` 现取为准；这里只写二进制指南没讲、
且已经踩过的东西。

### 观测通道先自证

- 首次用某命令的 `--json`：先原样看输出确认字段，再写解析；解析器 fail-loud
  （直接下标，缺字段就抛错），禁止 `.get(k, {})` 链——它把「我解析错了」静默变成「没消息」。
- 判空必须交叉对账：`check` 返回空时用 `inbox` 独立核一次。
- 每次 check 后立刻 ack，哪怕批次里只有心跳——未 ack 的旧批次会一直重放并**挡住所有新消息**
  （踩过：worker 的 ask 与 escalation 被一个只含心跳的旧批次挡了一小时）。
- 触发器：连续 2 个等待窗口为空、但工作树有新改动或进程在吃 CPU → 查自己的观测通道，
  别猜「worker 在慢慢干」。踩过：字段猜错，5 个窗口报 0 条，一个阻塞 ask 被晾 70 分钟。
- worker 的 ask 是阻塞的，一个没答的问题 = 一个 worker 停摆；wait 返回后先扫 question。
- `send --to dispatch:<id>` 只对**活跃中**的 worker 有效（它会在循环里主动 check）；
  worker_done 后 dispatch 已 settle，闲置 worker 不查收件箱，邮件永远没人读。
  给已收工的 worker 派活只有一条路：`task-create` + `worker-start --terminal`（踩过：
  修复指令发给 settled dispatch，worker 闲了两小时才发现）。

### 放行用工具，不用眼睛

指挥官不逐行读 diff——那是最弱的验证，也不扩展。按项分工具：

- 机械项一条命令判：commit body 非空、改动清单没夹带、worker 报的验证命令裸退出码。
- 代码质量派对抗性 review（`/review`，见 worker-preferences），指挥官读结论、裁分歧。
  触发条件：改动碰门禁/发布/安全/共享契约，或新增了别人会依赖的不变量。
- 行为正确性交给测试与 CI，不在本地复跑一遍；收益类主张必须由 CI 实测数字兑现，
  估计值不许写进永久记录。
- 只剩三件事必须指挥官自己判：新引入的失败面有没有守门、跨 worker 会不会打架、要不要打回。

### PR 是最后一步

- worker「完成」= 本地提交 + 送审（diff 摘要 + commit message 全文 + 验证证据），
  默认禁止自行 push 或开 PR；审完只有打回或放行两个出口。
- 打回给判据不给答案，否则 worker 的独立验证价值归零。
- 已推才发现问题：`--amend` + `--force-with-lease`，不关闭重开（会丢评论线程与 CI 历史）。
- 派活前自问「我会拿哪些判据打回」，凡是会打回的都写进任务书并给范例来源
  （如「先看 `git log origin/main -5` 的提交信息格式」）。同一缺陷在多个 worker 身上同时出现，
  是任务书的缺陷不是 worker 的——修模板，别逐个纠正。
