# 调用变体

先做主流程的轻量勘察，再只走匹配的变体。执行始终不属于 Improve。

## `quick` / `deep` 与类别聚焦

`quick` / `deep` 可出现在请求任意位置，并与 `security`、`perf`、`tests` 等类别组合，例如 `quick security`。类别聚焦只审计指定类别；仍需勘察，计划仍需自包含。

## `branch`

只审计当前分支变化：范围是当前分支与默认分支共同基点之后改变的文件，以及这些文件的直接导入方和调用方。

```bash
git diff --name-only $(git merge-base origin/<default> HEAD)..HEAD
```

做轻量勘察，但对范围内变化检查全部类别。每项发现标记：

- `introduced`：当前分支引入；
- `pre-existing`：被触及文件原本已有。

两组分开显示；不要把旧债算到当前改动头上，但应说明新改动建立在哪些旧债之上。当前就在默认分支或没有领先提交时，明确说明并建议改做全仓审计。

## `next` / `features` / `roadmap`

只深入读取 [audit-direction.md](audit-direction.md)，给出 4–6 条有仓库证据的方向选项，每条包含收益、权衡和粗略工作量。用户选中的建议生成设计 / 探索计划，不直接建设全部功能。

## `plan <描述>`

用户已知道要做什么，因此跳过发现扫描。先勘察并调查到足以诚实写规格，再生成一份计划。描述含糊时，先从代码库消除歧义；只把剩余阻塞问题交给用户，一次问一个，并给出推荐答案。

## `review-plan <文件>`

按 [plan-template.md](plan-template.md) 批评并收紧现有计划。若计划正是当前会话所写，建议让新会话冷读；作者会下意识用当前上下文补齐缺口。

## `reconcile`

第一次运行前读取 [closing-the-loop.md](closing-the-loop.md)。验证 DONE、调查 BLOCKED、刷新已漂移 TODO、处理陈旧 IN PROGRESS，并淘汰已失效发现。像技术负责人审查结果，绝不替执行者修代码。

## 执行边界

计划是自包含交付物。由用户决定交给 pi-flow、新会话或人工执行；Improve 不擅自派发。用户执行后回来时，只通过 `reconcile` 复核。
