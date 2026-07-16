---
name: diagnose
description: 针对 bug 和性能回归的纪律化诊断。复现 → 最小化 → 假设 → 插桩 → 修复 → 回归测试。用于描述性能回归时及所有需要 debug，诊断，排查时
---

# Diagnose

bug 的纪律。只有在明确说明理由时才跳过阶段。

探索代码库时，先读根目录 CONTEXT.md（如果存在）——用项目自己的词汇表建立相关 module 的清晰心智模型。

## Phase 1 — 建立反馈闭环

**这就是这个 skill。** 其他一切都是机械步骤。如果你有一个快速、确定、agent 可运行的 bug pass/fail 信号，你就会找到原因 —— 二分、假设检验、插桩都只是在消费这个信号。如果没有，再怎么盯代码也救不了你。

在这里投入不成比例的精力。**激进。创造性。拒绝放弃。**

### 构造闭环的方法 —— 大致按这个顺序尝试

1. **失败测试**，放在能触达 bug 的任何 seam —— unit、integration、e2e。
2. 对运行中的 dev server 使用 **Curl / HTTP script**。
3. 用 fixture input 做 **CLI invocation**，把 stdout 和 known-good snapshot 做 diff。
4. **Headless browser script**（Playwright / Puppeteer / Browser Dev）—— 驱动 UI，断言 DOM/console/network。
5. **Replay a captured trace.** 把真实 network request / payload / event log 保存到磁盘；在隔离环境中通过代码路径重放。
6. **Throwaway harness.** 启动系统的最小子集（一个 service，mock 依赖），用一次函数调用触发 bug 代码路径。
7. **Property / fuzz loop.** 如果 bug 是“有时输出错误”，跑 1000 个随机输入，寻找失败模式。
8. **Bisection harness.** 如果 bug 出现在两个已知状态之间（commit、dataset、version），自动化“boot at state X, check, repeat”，这样可以 `git bisect run`。
9. **Differential loop.** 用相同输入跑 old-version vs new-version（或两个 configs），并 diff 输出。
10. **HITL bash script.** 最后手段。如果必须人类点击，用 `scripts/hitl-loop.template.sh` 驱动他们，让闭环仍然结构化。捕获的输出反馈给你。

建立正确反馈闭环，bug 就修好了 90%。

### 迭代闭环本身

把闭环当产品。一旦有了一个闭环，问：

- 能让它更快吗？（缓存 setup，跳过无关 init，缩窄 test scope。）
- 能让信号更锐利吗？（断言具体症状，而不是“didn't crash”。）
- 能让它更确定吗？（固定时间、seed RNG、隔离 filesystem、冻结 network。）

30 秒 flaky loop 几乎不比没有 loop 强。2 秒 deterministic loop 是 debugging superpower。

### 非确定性 bug

目标不是 clean repro，而是 **更高复现率**。循环 trigger 100×，并行化，加压，缩窄 timing windows，注入 sleeps。50%-flake bug 可调试；1% 不行 —— 持续提高复现率，直到它可调试。

### 当你真的无法建立闭环

停下，并明确说明。列出你试过什么。向用户请求：(a) 访问可复现环境，(b) 捕获 artifact（HAR file、log dump、core dump、带 timestamps 的 screen recording），或 (c) 添加临时生产插桩的权限。没有闭环时不要继续 hypothesise。

直到你有一个自己相信的闭环，才进入 Phase 2。

## Phase 2 — Reproduce

运行闭环。看 bug 出现。

确认：

- [ ] 闭环产生的是**用户**描述的 failure mode —— 不是旁边另一个不同 failure。Wrong bug = wrong fix。
- [ ] failure 可在多次运行中复现（或者，对非确定性 bug，复现率足够高，能用来调试）。
- [ ] 你已经捕获精确症状（error message、wrong output、slow timing），这样后续阶段才能验证 fix 确实解决它。

复现之前不要继续。

## Phase 3 — Hypothesise

在测试任何假设之前，生成 **3–5 个排序假设**。只生成一个假设会锚定在第一个看起来合理的想法上。

每个假设必须 **可证伪**：说明它做出的预测。

> 格式："If `<X>` is the cause, then `<changing Y>` will make the bug disappear / `<changing Z>` will make it worse."

如果你无法说明预测，这个假设就是 vibe —— 丢掉或收紧。

测试前把排序列表展示给用户。他们经常有领域知识能立刻重排（“we just deployed a change to #3”），或知道哪些假设已经被排除。便宜 checkpoint，巨大收益。不要阻塞 —— 用户不在就按你的排序继续。

## Phase 4 — Instrument

每个 probe 必须映射到 Phase 3 的一个具体预测。**一次只改一个变量。**

工具偏好：

- 如果环境支持，用 Debugger / REPL inspection。一个 breakpoint 胜过十条 logs。
- 在区分假设的边界处打 targeted logs。
- 绝不 “log everything and grep”。
- 每条 debug log 都用唯一前缀标记，例如 `[DEBUG-a4f2]`。结尾 cleanup 变成一次 grep。未标记 logs 会活下来；标记 logs 必须死。

Perf branch。对性能回归，logs 通常是错工具。改为：建立 baseline measurement（timing harness、`performance.now()`、profiler、query plan），然后 bisect。先测量，再修。

## Phase 5 — Fix + regression test

在 fix 前写 regression test —— 但只有存在正确 seam 时才写。

正确 seam 是：test 按 bug 在 call site 发生时的真实模式来 exercise 它。如果唯一可用 seam 太浅（bug 需要多个 callers，但你只有 single-caller test；unit test 无法复现触发 bug 的 chain），那里的 regression test 会给 false confidence。

如果没有正确 seam，这本身就是发现。记下来。代码库架构阻止了 bug 被锁定。把它标记给下一阶段。

如果存在正确 seam：

1. 把 minimised repro 转成该 seam 上的 failing test。
2. 看它 fail。
3. 应用 fix。
4. 看它 pass。
5. 对原始（未最小化）场景重跑 Phase 1 feedback loop。

## Phase 6 — Cleanup + post-mortem

宣称完成前必须做：

- [ ] 原始 repro 不再复现（重跑 Phase 1 loop）
- [ ] regression test 通过（或记录了缺少 seam）
- [ ] 所有 `[DEBUG-...]` instrumentation 已移除（grep 前缀）
- [ ] throwaway prototypes 已删除（或移动到清楚标记的 debug 位置）
- [ ] 在 commit message 中说明最终正确的假设 —— 让下一个 debugger 学到东西
- [ ] 宣称修复完成时遵守系统规范的二选一说法：P1 闭环的重跑结果就是证据，不必另取；无法重跑则按 flow-better-test 的手段补证

然后问：什么本可以防止这个 bug？如果答案涉及架构变化（没有好的 test seam、tangled callers、hidden coupling），带着具体信息交给 `/improve-codebase-architecture` skill。修复完成后再给这个建议，不要提前 —— 你现在的信息比开始时更多。
