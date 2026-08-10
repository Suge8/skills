---
name: herdr
description: "控制 Herdr 终端复用器：用户提到 herdr，要求查看或控制它的 workspace、tab、pane 分屏布局、命令进程或 pane 里的 agent 时使用；要派多个 worker 并行干活、委派开发任务、监督验收 worker 或汇总完成结果时也使用；说过夜跑、长任务、挂机、无人值守推进到底这类长跑委托时也使用；单纯想后台跑一条命令不触发；需要在受管 pane 内运行（HERDR_ENV=1）。"
---

# Herdr

Herdr 把终端组织成 workspace、tab 和 pane，能识别 pane 里运行的 coding agent，并通过 `herdr` CLI 暴露当前会话。

发出任何控制命令前，先确认本 agent 运行在 Herdr 管理的 pane 里：

```bash
test "${HERDR_ENV:-}" = 1
```

检查失败就直接说明自己不在 Herdr 内并停止。不要从 Herdr 之外探查或控制聚焦中的 Herdr 会话。

检查通过后，`PATH` 里的 `herdr` 二进制即与当前会话通信。用它查看相邻工作、创建终端布局、启动 agent 和命令、读取输出、等待状态变化。

## 学习当前 CLI

已安装的二进制是命令语法的唯一权威。先运行：

```bash
herdr --help
```

再直接运行命令组（不带子命令）打印相关组的用法：

```bash
herdr agent
herdr pane
herdr workspace
herdr tab
herdr worktree
herdr terminal
herdr notification
herdr integration
herdr session
```

不要用裸 `herdr` 做探索——它会启动或附着 TUI。也不要靠省略参数去试探带副作用的嵌套命令：像 `herdr workspace create` 这类命令带默认值即合法，会真的执行。

多数控制命令返回 JSON。标识符和状态从这些响应里读，不要靠预测。

## 理解布局、pane 和 agent

按任务选择匹配的原语：

- workspace、tab、pane 的拓扑负责组织终端位置。
- pane 命令控制裸终端：shell、测试、服务器、输入和输出。
- agent 命令控制当前占据某个 pane 的已识别 coding agent。

pane 无论是否承载 agent 都存在。`agent start` 要求已有一个可用的 shell pane，绝不会创建、拆分或移动布局。普通进程用 pane 命令；需要 Herdr 校验 agent 身份或解读 `idle`、`working`、`blocked`、`done`、`unknown` 生命周期状态时用 agent 命令。

agent 命令的目标接受唯一的存活 agent 名称，或当前承载该 agent 的 pane ID；不接受 terminal ID 和裸 agent 类型标签。名称需匹配 `[a-z][a-z0-9_-]{0,31}` 且在存活 agent 中唯一。名称跟随当前 pane 的占用者，该 agent 退出、被释放或被替换时名称随之清除。

`idle` 表示 agent 就绪可接收输入，且其 tab 已在聚焦的 Herdr UI 中被看过。`done` 是同一底层空闲状态，但对应未被看过的后台工作完成。聚焦该 tab，或用 focus 命令指向该 pane 或 agent，会标记为已看；CLI 读取不会标记。`blocked` 表示 Herdr 识别到审批或提问界面。`unknown` 表示 pane 里有 agent 但 Herdr 无法可靠分类；它不能证明工作已完成。

## 使用 ID 与调用方上下文

公开 ID 是不透明的稳定句柄：

- workspace：`w1`
- tab：`w1:t1`
- pane：`w1:p1`

关闭的 tab 和 pane 的 ID 不会复用。pane 移入另一个 workspace 后会获得新的 workspace 限定 pane ID。`pane move` 之后，用 `.result.move_result.pane.pane_id` 或存活 agent 名称继续操作；旧值在 `.result.move_result.previous_pane_id` 中报告，只有被移动进程继承的调用方上下文还能解析旧 ID，不要把它当通用 agent 目标。

Herdr 会把调用方上下文注入每个受管 pane：

```bash
printf '%s\n' "$HERDR_WORKSPACE_ID" "$HERDR_TAB_ID" "$HERDR_PANE_ID"
```

pane 命令要指向调用方自身的 pane 时优先用 `--current`。省略目标可能落到 UI 聚焦的 pane 上，而那个 pane 可能属于用户或其他客户端。

发现实时状态：

```bash
herdr workspace list
herdr tab list --workspace "$HERDR_WORKSPACE_ID"
herdr pane current --current
herdr pane list --workspace "$HERDR_WORKSPACE_ID"
herdr agent list
```

创建类响应会给出后续要用的 ID：`workspace create` 返回 `.result.workspace`、`.result.tab` 和 `.result.root_pane`；`tab create` 返回 `.result.tab` 和 `.result.root_pane`；`pane split` 在 `.result.pane` 返回新 pane。

## 启动并协调 agent

默认在当前 tab 里开兄弟 pane、沿用当前工作目录。除非用户明确要求，不要创建 workspace、tab、worktree 或换目录。

用户指定了拆分方向就照做；否则先查看调用方 pane：

```bash
herdr pane layout --pane "$HERDR_PANE_ID"
```

宽 pane 向右拆，窄或高的 pane 向下拆。避免同方向反复拆分产生过窄的列或过矮的行。保持用户焦点留在调用方 pane，并显式保留调用方的工作目录：

```bash
herdr pane split --current --direction right --cwd "$PWD" --no-focus
```

需要时把 `right` 换成 `down`。从 `.result.pane.pane_id` 读取新 pane ID。

可用的 shell pane 必须停在交互式提示符：shell 本身在前台，没有前台命令、编辑器或 agent 在跑。用一个有意义的唯一名称在该 pane 启动 agent。kind 与模型选型读 `~/.agents/docs/worker-preferences.md`（单一事实源）。

```bash
herdr agent start reviewer --kind pi --pane <returned-pane-id> -- --name "↳审查改动"
```

pi 的 `--name` 设置会话名，`↳` 标记子代理身份，后面写这个 worker 在做什么。侧栏第二行渲染成 `reviewer · ↳审查改动`：左边的 herdr 名和第一行的 workspace 已经表达了身份与归属，会话名只补「在干什么」，别重复。侧栏宽 26 列且中文双宽，任务描述控制在 4-6 个中文字，超出从尾部截断。

从返回的 `.result.agent.agent_session.value` 记下会话文件路径。这是 worker 的永久身份证：pane、tab、worktree 全没了它还在，恢复时靠它精确定位。

运行 `herdr agent` 查看已安装的 kind 列表和选项。原生 agent 参数只放在 `--` 之后：

```bash
herdr agent start reviewer --kind pi --pane <returned-pane-id> -- <agent-args...>
```

`agent start` 只在 Herdr 于同一 pane 检测到预期 agent 并认为其可接收交互输入后才返回，默认 30 秒启动超时。

通过 agent 界面提交工作：

```bash
herdr agent prompt reviewer "审查当前 diff，只报告可执行的发现。" --wait --timeout 120000
```

代码审查优先用 pi 内置的 flow 插件：发送 `/review` 激活对抗性审查循环，自动多轮优化；期间可随时插话调整方向。循环运行时 flow 拦截 pi 的中断键位，发 esc 或 ctrl+c 都能停止循环：

```bash
herdr agent prompt reviewer "/review" --wait --timeout 300000
herdr agent send-keys reviewer esc   # 或 ctrl+c
```

`agent prompt` 会按 pane 的实时 bracketed-paste 模式原子地提交文本和编码后的回车；对 working 中的 agent 也可提交（排队语义），给忙碌 worker 追加指令无需等 idle。常规工作用 `--wait` 就够：它等待第一个稳定的 `idle`、`done` 或 `blocked` 状态。不要用 `--until` 重复这些默认值。

从非 working 状态发出的 prompt 必须在五秒内产生可观测的生命周期变化，否则 Herdr 返回 `agent_prompt_stalled` 而不是无限等待。这个等待跟踪的是生命周期状态而非单个回合：如果 agent 已在工作，当前回合的完成也可能满足它。

`--until` 只用于特定状态的工作流，比如等一个已在运行的 agent 请求输入：

```bash
herdr agent wait reviewer --until blocked --timeout 120000
```

不带 `--until` 的独立 `agent wait` 与 `agent prompt --wait` 使用相同的稳定状态默认值。

交互式 agent 界面控件用逻辑按键：

```bash
herdr agent send-keys reviewer esc
herdr agent send-keys reviewer ctrl+c
```

Herdr 在写入任何字节前会校验所有按键。通过已解析的 agent 读取结果：

```bash
herdr agent get reviewer
herdr agent read reviewer --source recent-unwrapped --lines 120
```

等待失败或返回 `blocked` 时，先看 `agent get` 和 `agent read` 再决定发送什么输入。只有在刻意做裸终端控制时才用 pane 界面。

## 在另一个 pane 运行普通命令

按同样的几何规则开兄弟 pane，保留调用方工作目录，不改变用户焦点：

```bash
herdr pane split --current --direction right --cwd "$PWD" --no-focus
```

从 `.result.pane.pane_id` 读取新 pane ID，然后运行并检查命令：

```bash
herdr pane run <returned-pane-id> "just test"
herdr pane wait-output <returned-pane-id> --match "test result" --timeout 120000
herdr pane read <returned-pane-id> --source recent-unwrapped --lines 120
```

`pane run` 原子地发送命令文本和回车。`pane wait-output` 会立即搜索所选快照，已有输出也能匹配。字面子串用 `--match <text>`，Rust 正则用 `--regex <pattern>`。省略 `--timeout` 表示无限等待。

按任务选择读取源：

- `visible`：当前渲染的视口。
- `recent`：最近渲染的输出，含软换行。
- `recent-unwrapped`：最近输出且软换行已合并；日志和文字记录优先用它。
- `detection`：用于 agent 检测的纯文本底部缓冲快照。

颜色和终端样式本身是证据时用 `--format ansi`，否则用 text。

`--lines` 会向 Herdr 请求 pane 可用屏幕和宿主回滚缓冲中的更多行。全屏 agent（备用屏）的历史 0.8.0 起可自动读取：agent 处于 idle 且请求行数超过可见屏幕时，`agent read --lines N` 会自动滚屏收集完整历史并复位视口；agent 在 working/blocked/unknown 时返回 `agent_not_idle`——等 idle 重试或改用 `--source visible`。

仍读不全时，让 agent 把完整回复以 Markdown 写入临时目录并只回复文件路径，然后直接读文件。这只是兜底手段，不要在最初的 prompt 里就要求文件输出。

## 多 worker 协调（本地经验）

用户要无人值守长跑（「过夜跑」「长任务」「我睡了」「挂机推进到底」「你自己做完」）：读 [references/overnight.md](references/overnight.md)，按该框架接管全程。

协调多个 worker 时的纪律：

- 永不 wait-loop：不要用阻塞的 `agent wait` 占住自己的回合等 worker。派发后直接结束当前工作或回应用户。
- 等外部事件（CI/部署/长构建）不空等也不轮询：后台 shell 链桥接 `nohup sh -c '<阻塞等待命令>; herdr agent prompt <需要结果的 agent> "<事件>已出结果，去收"' &`——把外部完成翻译成定向唤醒，唤醒对象通常是自己。终局任务必须挂桥：全场再无其他事件源时，结果落地无人接。
- 每次开始处理用户消息、或完成一件事后，先跑一次 `herdr agent list` 扫全部 worker 状态；有 `blocked` 优先处理，有 `done` 验收。
- 收到 `[herdr-supervisor]` 消息（来自 `~/.pi/agent/extensions/herdr-supervisor.ts`，仅在本 Pi 运行于 Herdr 受管 pane 时激活）：按消息列出的 worker 逐个 `herdr agent read <名称>` 查看现场，再决定 prompt 纠偏、`/review`、验收或收尾；处理完不要重复轮询。依赖它前必须知道的运行条件：① 扩展在会话启动时加载，会话早于扩展安装/改动的要先 `/reload` 再指望它唤醒；② 它只监督本 workspace 的 worker（与「worker 开在指挥官自己 workspace」纪律配套），跨 workspace 的事件不投递；③ 命名 worker 连续 working 超阈值（默认 30 分钟）无任何状态转换会收到疑似卡死通知——先 read 现场判断是真卡死（如僵尸 CI watch）还是长任务，再决定打断或继续等；④ 只有命名 worker（`agent start` 起的名）的完成会被推送，用户看没看过其 tab 都推；未命名 pane（用户自己的会话）永不推送——所以 worker 必须用 `agent start` 命名启动；接手手动开的会话用 `herdr agent rename <pane_id> <name>` 命名，即纳入推送与看门狗。
- worker 选型与 `/review` 发送规则读 `~/.agents/docs/worker-preferences.md`。
- **`/review` 只能由指挥官注入，worker 自己触发不了**（它是 worker 会话 TUI 的 slash 命令，不是可执行文件）。因此任务书绝不能写「worker 自己走完 /review」——踩过三次：worker 找不到它就自作主张起子 agent（`scheduler-review`/`capfixreview`），甚至与本体同 tab 共用 worktree，清理时 `tab close` 会连带关掉本体（得用 `pane close`）。**正确写法**：「PR 就绪就停下汇报「待审」，我会发 /review」；并写死**禁止 worker 执行任何 herdr 命令、禁止起子 agent**（会干扰其他 pane；共享 worktree 必互踩）。指挥官配额尽时宁可明确改用自审替代（如 flow-optimize CLOSEOUT）并记账补审，也不要把一个 worker 做不到的动作写进它的指令。
- **一个指挥官一个 workspace**：supervisor 的归属边界是 workspace 而非「谁派的」（`herdr-supervisor.ts` 只比对 `HERDR_WORKSPACE_ID`）。两个指挥官挤同一 workspace 时，**双方会收到对方所有 worker 的完成推送**，导致重复接管与指令打架。另开一轮并行指挥时用 `herdr workspace create` 开新 workspace，不要往别人的 workspace 里塞 tab。
- 两个及以上 worker 时，一个 worker 一个命名 tab（`herdr tab create --workspace "$HERDR_WORKSPACE_ID"`，tab 名与 agent 名一致），不要把多个 worker 挤进同一 tab 的分屏——手机端 Collie 按 Space→Tab 导航，命名 tab 直接对应推送里的名字。tab/worktree 等创建类命令省略 `--workspace` 会落到 UI 聚焦的 workspace——那可能是用户正在看的别处（踩过：worker tab 开进了用户的 .ssh workspace）。单个临时 helper 仍按上文兄弟 pane 处理；此规则优先于「不要创建 tab」的默认约束。
- 会改代码的 worker 各自隔离到独立 git worktree，但仍须留在指挥官当前 workspace。不要用 `herdr worktree create --workspace "$HERDR_WORKSPACE_ID"` 达成此目的：当前 CLI 的 `--workspace` 选择来源仓库上下文，该命令仍会新建 workspace，supervisor 因此收不到完成事件。先用 `git worktree add -b <branch> <path> <base>` 在 /tmp 或仓库旁创建 worktree，再用 `herdr tab create --workspace "$HERDR_WORKSPACE_ID" --cwd <path> --label <worker-name> --no-focus` 建命名 tab，从 `.result.root_pane.pane_id` 取 pane 启动 agent。创建后必须确认 `.result.root_pane.workspace_id == HERDR_WORKSPACE_ID`，不一致就停止派活并纠正；多个 worker 禁止共享同一 checkout，否则必然互踩。
- 释放 worker 前先问「它的改动还会走到哪些异步验证层」，按最远触达层定关闭时机：
  纯文档/报告（不触异步层）→ PR 合并即关；产品代码 → post-merge（或等效异步层）绿了再关；
  碰发布链 → 真实发布走通再关。有尾巴任务未完的，要么等完成要么指挥官显式接管并记录。
  踩过：8021 行删除的 worker 在 post-merge 还在排队时被释放连带 worktree 删除。
  清理时只关自己创建的 tab/pane；需要留存的调试现场按用户要求保留。
- 关闭 pane / 删除 worktree **不等于**丢失 worker：pi 会话按目录持久化在
  `~/.pi/agent/sessions/`（删 worktree 不影响）。恢复：重建同路径 worktree 后在其内 `pi -c`
  接续最近会话；跨目录用 `pi --session <jsonl路径>`；保留原件分叉用 `pi --fork`。
  恢复后第一句必须对齐磁盘状态（告知「你的 PR 已合并/现场是重建的」），否则 agent 按过时
  记忆行动。早关的真实代价因此是「一次恢复操作 + 状态对齐」，不是上下文永久丢失。
- worker 叙事与状态冲突时信状态：正文说「已开工/继续做」但 agent_status=idle 就是已停——宣布计划不等于执行，按未完成处理（催动或打回）。踩过：worker 宣布 PR 计划后未执行即停，指挥官把该完成推送误判为质检轮间隙噪音，双向空等死锁。
- supervisor 静默不等于没事件：工作树有新改动或进程在吃 CPU 但收不到消息时，主动 `herdr agent list` + `agent read` 对账，别猜「worker 在慢慢干」。

### 验收纪律（工具无关，源自 Orca 时期实战）

指挥官不逐行读 diff——那是最弱的验证，也不扩展。按项分工具：

- 机械项一条命令判：commit body 非空、改动清单没夹带、worker 报的验证命令裸退出码。
- 代码质量派对抗性 review（`/review`，多个不同强模型并行对抗审查，强度远超指挥官自审），指挥官只读结论、裁分歧。触发条件：改动碰门禁/发布/安全/共享契约，或新增了别人会依赖的不变量；**命中即必须派，逐项裁决送审摘要不能替代**——那仍是指挥官自己读 diff，最弱的验证。
- 行为正确性交给测试与 CI，不在本地复跑一遍；收益类主张必须由实测数字兑现，估计值不许写进永久记录。
- 只剩三件事必须指挥官自己判：新引入的失败面有没有守门、跨 worker 会不会打架、要不要打回。

### PR 与任务书（工具无关，源自 Orca 时期实战）

- worker「完成」= 本地提交 + 送审（diff 摘要 + commit message 全文 + 验证证据），默认禁止自行 push 或开 PR；审完只有打回或放行两个出口。
- 打回给判据不给答案，否则 worker 的独立验证价值归零。已推才发现问题：`--amend` + `--force-with-lease`，不关闭重开（会丢评论线程与 CI 历史）。
- 派活前自问「我会拿哪些判据打回」，凡是会打回的都写进任务书并给范例来源（如「先看 `git log origin/main -5` 的提交信息格式」）。同一缺陷在多个 worker 身上同时出现，是任务书的缺陷不是 worker 的——修模板，别逐个纠正。

## 安全与协作规则

- 后台工作用 `--no-focus`，除非用户要求切换上下文。
- 用 `--current`、显式 pane ID 或唯一 agent 名称；不要依赖其他客户端聚焦的 pane。
- ID 从 JSON 响应解析，不要按侧栏顺序或示例推导。
- 不要关闭不是你创建的 workspace、tab、pane 或会话，除非用户明确要求。
- 绝不从活动会话运行 `herdr server stop`，除非用户明确要停止服务器及其 pane 里的进程。
- 绝不杀掉 Herdr 主进程。需要隔离服务器的实验用命名测试会话。
- CLI 服务器错误以 JSON 输出到 stderr，退出码 1；CLI 语法错误退出码 2。
