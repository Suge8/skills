---
name: project-setup
description: 项目一致性体检与文档补齐：新项目初始化、项目做到一半怀疑缺骨架、开源前检查、用户说 setup/初始化/体检/补文档/一致性时使用，即使用户只说"这个项目缺什么"。探索现状 → 体检表 → 分节确认 → 派活给专业 skill。不用于：单独的 UI 设计（用 impeccable）、发布（用 ship）、写代码。
---

# Project Setup（项目体检）

清单 + 路由器，**自己不生产内容**。一致性的来源是：每个项目同一套文档骨架，文档是事实源，内容由专业 skill 生产，日常开发的 agent 读文档而不是重新发明。本 skill 只保证骨架存在、缺口被看见、活派给对的 skill。

## Step 1 — 探索（只读，不动任何文件）

- 技术栈与任务运行器（package.json / Cargo.toml / justfile）
- 有无 UI（前端框架、src-tauri、routes 目录等信号）
- 开源信号（LICENSE 存在？git remote 是公开仓库？用户说过要开源？）
- 现有文档盘点：AGENTS.md、CONTEXT.md、docs/PRODUCT.md、docs/DESIGN.md、README、CONTRIBUTING、SECURITY、CHANGELOG、docs/adr/
- 验证链现状：有没有 agent 可独立运行的测试命令（对照 better-test 的 references/toolchains.md 判断达标与否）

## Step 2 — 体检表

按下面清单输出一张表：`✓ 已有 / ✗ 缺 / — 不适用`，缺的附一行推荐动作。

**所有项目必备**

| 文档 | 作用 | 位置 |
|---|---|---|
| AGENTS.md | agent 导览图：一句话定位、目录导览、常用命令、指向其余文档 | 根目录 |
| CONTEXT.md | 领域词汇表：项目里每个词的准确含义 | 根目录 |
| PRODUCT.md | 产品一页纸：给谁用、解决什么、明确不做什么 | docs/ |

PRODUCT.md 分级：产品项目用完整版（impeccable 的格式）；工具/库项目用三行版（给谁、解决什么、不做什么）——三行版成本接近零，但能防止 agent 给极简工具"顺手"加企业级功能。

**有 UI 才要**：docs/DESIGN.md（设计系统事实源）。

**要开源才要**：LICENSE（根，GitHub 侧栏识别要求）、用户向 README（根）、CONTRIBUTING.md 和 SECURITY.md（放 `.github/`：GitHub 功能照常生效，根目录保持干净；三个合法位置 根/.github/docs 中的最优解）。

**位置总原则**：高频入口（README/LICENSE/CHANGELOG/AGENTS/CONTEXT）在根；低频社区件在 `.github/`；深度内容（PRODUCT/DESIGN/adr/开发文档）在 `docs/`。已存在于其他合法位置的不迁移——位置不是问题，双份才是。

**体检项（只报告，绝不动手）**：验证链是否达标（达标四问见 better-test Step 0）。不达标就在表里写一行现状 + 推荐工具链，让用户拿去找 better-test 建。

## Step 3 — 分节确认

一节一个问题，**每节先给推荐答案**，让用户一个词就能接受。已有的文档不重写——只在内容与现状明显脱节时报告差距。同一事实不得存两份（发现新旧两份时提议合并，保留 docs/ 下的那份）。

## Step 4 — 派活

| 缺口 | 派给 | 说明 |
|---|---|---|
| docs/DESIGN.md、docs/PRODUCT.md（完整版） | impeccable | 新项目用 `init`，已有代码用 `document` 反向生成 |
| CONTEXT.md | grill 的 CONTEXT-FORMAT.md 格式 | 从代码里提取候选术语起草；头部写活文档声明（“发现用法与本表冲突或遇未收高频术语，与用户确认后随手修订，不必专门立项”），并在 AGENTS.md 索引行标注“活文档”；待确认的立场（如 _Avoid_ 选词）可邀用户快速问答收紧，也可留待日常自然收紧 |
| AGENTS.md、PRODUCT.md 三行版 | 本 skill 直接写 | 内容全部来自 Step 1 的探索事实，不编造 |
| README | 结构走 crafting-effective-readmes，营销向文案走 copywriting，成稿过 stop-slop | 语言规则见下 |
| CONTRIBUTING / SECURITY | 本 skill 起草，文案走 stop-slop | 语言规则见下 |

## 语言规则

- 内部文档（AGENTS.md、CONTEXT.md、docs/ 全部）：**中文**
- 社区文件（CONTRIBUTING.md、SECURITY.md）：**英文**——受众是全球贡献者
- README：**英文主体**，顶部语言切换链接指向 `README.zh-CN.md`（Vue/Ant Design 等主流做法；单文件双语会太长）
- CHANGELOG：跟随仓库现有格式（ship skill 负责维护）
