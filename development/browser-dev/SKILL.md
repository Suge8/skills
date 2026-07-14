---
name: browser-dev
description: 用 Agent Browser CLI 控制专属 Helium 实例（默认无头、带登录态快照）调试网页：前端开发、页面验证、console/network 排错、UI 截图迭代。
allowed-tools: Bash(./bin/browser-dev:*), Bash(./bin/browser-dev-start:*), Bash(./bin/browser-dev-sync-profile:*), Bash(agent-browser:*)
---

# Browser Dev

`./bin/browser-dev` 控制专属 Helium：独立 profile `~/.browser-dev/profile`（登录态精拷自用户 Helium）+ 独立端口 `9333`。**默认无头**——截图、snapshot、console/network、扩展、登录态全部可用，不抢用户视口。与用户日常 Helium 并行，绝不动用户的浏览器。

## 入口

```bash
/Users/sugeh/.agents/skills/development/browser-dev/bin/browser-dev-start   # 确保 CDP 可用
/Users/sugeh/.agents/skills/development/browser-dev/bin/browser-dev <cmd>   # wrapper，默认连 9333
```

- 有头（用户要亲眼看流程 / 验证码 / 反爬）：`BROWSER_DEV_HEADED=1 … browser-dev-start`。模式启动时定死，已有 9333 实例不切换；切模式先 `pkill -f "user-data-dir=$HOME/.browser-dev/profile"` 再启动。
- 必须经 wrapper 或显式 `--cdp`；裸 `agent-browser open` 会绕过专属 profile。
- 用户说"已经打开/已登录"：先读现有 tabs，不要 `open` 导航当前页。以 `/json/list` 为事实源：

```bash
BROWSER_DEV_SKIP_START=1 ./bin/browser-dev tab
curl -s http://127.0.0.1:9333/json/list
```

## 标准流

```txt
start → open/tab → snapshot -i → errors/console/network → action → wait → snapshot -i
```

- 优先 `snapshot -i`（只取交互元素，输出减半）；需要完整结构才全量 snapshot；视觉问题用 `screenshot`。
- 页面跳转后旧 `@eN` ref 失效，重新 snapshot。报错先查 `errors / console / network`。

## 性能与并行

- 无依赖读取用 `batch` 一次合并（round-trip 是主要开销）；依赖新 `@eN` 的步骤不能提前 batch。
- 同一实例的命令共享 active-tab 状态：**不要并行发多条 browser-dev 命令**，会竞态。
- 真需要并行隔离浏览器：要登录态则 `BROWSER_DEV_PORT=9334 BROWSER_DEV_PROFILE=~/.browser-dev/profile-b`（先 sync-profile 到该路径）再 start；不要登录态直接 `agent-browser --session <name>`（自带隔离无头浏览器，不经 wrapper）。
- tab 卫生：多页面同窗 `tab new`；临时页用完 `tab close`；任务结束清理本次开的 tab。
- 生命周期：任务内保活（冷启动 2-3s，不要反复开关）；任务结束且浏览器是本次启动的 → `./bin/browser-dev stop`（只杀专属实例）；可能有其他 agent 在用就留着，最多一个实例，`doctor` 可见。

## 命令 / 诊断 / profile

- 命令速查 [references/commands.md](references/commands.md)；参数不确定读 `agent-browser skills get core --full`；系统性 QA 读 `skills get dogfood`；Electron 读 `skills get electron`。
- `./bin/browser-dev doctor`（只读，不启动）/ `doctor --start`（验证启动链）；输出 OK/WARN/FAIL，WARN 不是失败。
- 登录态过期：先退出用户日常 Helium（防拷到写一半），再 `./bin/browser-dev-sync-profile --force`，重新 start 生效。改源/目标用 `BROWSER_DEV_SOURCE_PROFILE` / `BROWSER_DEV_PROFILE`。

## 定位 fallback 与 CDP 逃生舱

- shadow/canvas/跨源 iframe 定位不稳：`screenshot --annotate` + `get box` 校准，再 mouse 坐标兜底。
- CLI 覆盖不了的场景直接走裸 CDP：`curl -s http://127.0.0.1:9333/json/list` 找 target，`./bin/browser-dev get cdp-url` 拿 ws 端点发原生 CDP 命令。

## 边界

- `eval` 只做只读读取（snapshot/get/console/network 不够时）；改状态用 `click/fill/type/press`。
- 不打印 cookies/token，不 dump 整个 DOM/storage。
- 不执行付款、删除、发消息、改密码、提交生产数据。
