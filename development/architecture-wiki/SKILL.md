---
name: architecture-wiki
disable-model-invocation: true
description: 在目标仓库建立并维护 docs/architecture/：Markdown wiki 事实源 + 自包含 architecture.html 可视化 + verify 过期检查接入 lint/CI。用户要架构图、代码库可视化、architecture wiki，或架构 verify 报错时使用。
---

# Architecture Wiki

代码是事实源，wiki 是持续维护的压缩理解，HTML 是派生的可视化界面。三条边界定死：

- wiki 只写有出处的事实：每页 frontmatter 记录来源文件与内容哈希。
- architecture.html 永远可删可重建，只从 wiki 渲染，不承载独立知识。
- 过期判断交给确定性脚本 verify.mjs；LLM 只负责理解与更新内容，程序负责判断是否需要更新。

全语言适用：verify 只依赖 git 哈希与文本检查。JS/TS 仓库额外有 oxc 确定性 import 图（零幻觉的边）；其他语言由你读码提取关系并逐条引用文件，verify 仍确定性把关来源。

## 目标仓库布局

```
docs/architecture/
├── architecture.html   # 派生可视化，嵌 wiki-digest
├── verify.mjs          # 从本 skill templates/ 复制，零依赖
└── wiki/
    ├── index.md        # 导航目录 + baseline commit
    ├── system.md       # 系统总览：模块、职责、边界
    ├── data-flow.md    # 端到端数据流与 payload
    └── modules/<name>.md
```

## Frontmatter 约定

每个 wiki 页：

```
---
sources:
  - src/auth/token.ts 8f3a21bc4d2e validateToken refreshToken
---
```

每行 `<仓库相对路径> <git blob 哈希前缀（≥8 位）> [关键 symbol...]`。sources 必须是文件不能是目录，挑支撑页面论断的关键文件而非穷举，控制误报面。哈希来自 `git hash-object <path>`，取前 12 位。symbol 是页面正文点名的函数/类型/路由名，verify 会检查它仍存在于该文件。index.md 额外一行 `baseline: <commit sha>`。

verify 检查：来源文件存在且哈希一致（不一致时直接打印记录版本 → 工作区的 unified diff，未触及锚定 symbol 的标「疑似机械漂移」；记录的 blob 未入对象库时无 diff 可出，退回纯文件名报错）、symbol 仍在、页间相对链接可达、无孤儿页（除 index 外每页有入链）、HTML digest 与 wiki 正文一致（digest 只算正文，frontmatter 是维护簿记，纯刷哈希不影响 HTML）。任一失败退出码 1，报告列出具体页面和文件。

## 首次建立（仓库无 docs/architecture/ 时）

1. 取事实：JS/TS 仓库运行 `bun scripts/code-map.mjs <repo-root> [限定前缀...]`（路径相对本 skill 目录），得到含 tsconfig paths 解析的真实 import 图（文件级 imports/exports/loc/外部包）；其他语言直接读代码提取模块与调用关系。oxc 依赖装在本 skill 的 scripts/ 目录里，不碰目标仓库，缺失时直接在 scripts/ 下 `bun install`（无 bun 则 `npm install`），不需要征求用户同意。完成标准：接下来 wiki 里每个节点、每条边都能指回具体文件；运行流每一步都找到真实调用点（入口、RPC 定义、队列生产/消费点），找不到调用点的步骤不画。
2. 写 wiki：按上面布局。模块页一页一个职责域，按职责聚合不按文件铺开，页数随项目规模自然增长（页多时 index.md 按子系统分组导航）。每个模块页固定四节：**职责**、**对外接口**、**数据怎么流**、**改动指南**。前两人话后两技术：职责与数据怎么流用人话写业务行为，非作者一读就懂，不出现代码标识符；文件名、函数名集中在对外接口与改动指南两节，写「auth 域只暴露 `validateToken`/`refreshToken`（`src/auth/token.ts`）」这种句子，坑也写在改动指南。data-flow.md 按入口铺全：每个真实入口（HTTP API、CLI、队列消费者、定时任务…）至少一条端到端路径，写清入口 → 处理 → 存储与 payload 形态。每页填 sources 哈希，index.md 填 baseline（当前 HEAD）并链接所有页面。写完抽两页自测：读完能答「这模块负责什么、谁在用它、改它先看哪个文件」，答不上的页重写。模块页 ≥3 且 subagents 可用时，读 [FANOUT.md](./FANOUT.md)：模块页并行派工，总览页自己写。
3. 复制 [templates/verify.mjs](./templates/verify.mjs) 到 `docs/architecture/verify.mjs`，运行一次直到通过。
4. 渲染 HTML：读 [RENDER.md](./RENDER.md)，用 templates/architecture.html 模板注入数据 JSON，不手写界面。完成标准：RENDER.md 「完成检查」逐项用浏览器截图验过。
5. 接入 lint：在仓库现有检查入口（package.json scripts / justfile / Makefile / CI workflow）追加 `node docs/architecture/verify.mjs`，与现有 lint、typecheck 并列一起跑；不塞进 linter 插件内部。仓库完全没有检查入口时，新建最小入口只跑 verify（如 package.json 加 `"lint": "node docs/architecture/verify.mjs"`，或 CI 加一步）；verify 零依赖，只需 node + git。用户顺便想给 JS/TS 仓库补代码 linter 时才推荐 oxlint。

## 同步（代码变更后，或 verify 报错时）

1. 跑 `node docs/architecture/verify.mjs`：过期来源会直接打印记录版本 → 工作区的 unified diff，标「疑似机械漂移」的可快速略过；无 diff 可出时（记录的 blob 未入对象库，如上次 sync 时改动尚未提交）退回 `git diff <baseline>.. -- <file>` 自查。
2. 按 diff 逐页二选一：页面论断受影响 → 改正文；确认不受影响（注释、格式、不改变论断的实现细节）→ 正文不动。禁止未读 diff 就进入下一步——--sync 即签字“已审阅这些变更”。
3. `node docs/architecture/verify.mjs --sync`：一次性刷新全部过期哈希前缀并把 baseline 推进到当前 HEAD；symbol 消失、断链等语义问题不会被自动修，照常报错手工处理。
4. 改过正文才需重渲染 architecture.html（digest 只算正文，纯刷哈希不影响；digest 取 `node docs/architecture/verify.mjs --digest`）。跑 verify 通过后结束。
