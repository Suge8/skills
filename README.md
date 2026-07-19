# Skills 使用指南

给自己看的备忘录：什么时刻、说哪句话。大部分 skill agent 会自动触发，但**直接说名字最稳**。

## 日常开发循环（按时刻查）

| 时刻 | 说什么 | skill |
|---|---|---|
| 开新项目，或老项目感觉缺文档、不一致 | "跑 project-setup" | project-setup |
| 方案纠结、和 agent 讨论两轮还没结论 | "跑个 prototype 我挑" | prototype |
| 有了想法/计划，想被追问到想清楚 | "拷问我"（项目有 CONTEXT.md 会自动启用文档模式） | grill |
| 做 UI：新页面、重设计、评审 | 提 impeccable | impeccable |
| 做 UI：已有界面最后打磨、统一动效 | 提 ui-craft | ui-craft |
| 出 bug、性能回归 | "diagnose 排查" | diagnose |
| 项目测试不行/缺测试链，或想让测试更好 | **"跑 flow-better-test"** | flow-better-test |
| agent 说修好了但你存疑 | 用你的原话："你确定修好了吗/真实测试了吗" | flow-better-test |
| 问"还有优化空间吗"（验收干净 / 功能提升都算） | **"跑 flow-optimize"**，它会分流减法/加法 | flow-optimize |
| 全仓体检：开源前、接手老项目、安全/依赖/测试覆盖审计 | "跑 improve"；只审一类说 "improve security/perf/tests"；想方向说 "improve next" | improve |
| 执行完 improve 的计划回来验收，或 plans/ 放久了对账 | "improve reconcile" | improve |
| 代码能跑但想更干净（不改行为） | 提 code-simplifier | code-simplifier |
| 想动架构、合并紧耦合模块 | 提 improve-codebase-architecture | improve-codebase-architecture |
| 要提交/发版/开源推送 | **"ship"**（它会问你 Y/N 更新版号） | ship |
| 上下文快满、要换会话/换模型接手 | "handoff" | handoff |
| 写官网/落地页/产品描述的营销文案 | 提 copywriting（成稿过 stop-slop 去 AI 味） | copywriting |
| 写/重写 README | 提 readme | crafting-effective-readmes |
| 做宣传物料：hero 图/社媒图/商店截图/演示 GIF/3D 资产 | **"给 XX 做物料"** | promo |
| 主题→运动优先视频方案（反 PPT） | 提 motion-director | motion-director |
| Remotion 写 composition / Studio / 渲染 | 提 remotion-best-practices；项目在 `~/content-create` | remotion-best-practices |
| 模型直出带音轨短 MP4 | 提 video-gen | video-gen |

## 三个新习惯（最重要）

1. "还有优化空间吗" → 直接说 **"跑 flow-optimize"**——它会问你要减法（验收干净）还是加法（对标提升），两个分支都有终止条件，都敢说"没有了"
2. ~~几十轮方案讨论~~ → **"跑个 prototype"**——让代码说话，你只负责挑
3. ~~手写转交提示词~~ → **"handoff"**——自动生成交接文档 + 可粘贴的启动提示词

## 不用记的（agent 自动用）

- **搜索**：exa（语义/代码搜索）、brave（精确关键词/找网址）、context7（库文档）
- **验证**：flow-better-test 的养链部分是自动的（系统层强制：改动收工前确认有覆盖，没有就补或取证）。你只做验收：完成报告带 ✅ 证据就信；带 ⚠️ 未验证就照步骤花 30 秒验；啥都不带就说"你确定修好了吗"——这句老话就是触发器
- **工具**：flow-browser-use（网页调试）、better-computer-use（桌面操控，也是桌面 app 取证兑底）、ssh、web-clone（仿站）、gsap（动画）、logo、gpt-image、stop-slop（去 AI 味文案）、search-skills（翻归档技能）
- **视频三件套**（不互斥）：motion-director 出方案 → remotion-best-practices 在 `~/content-create` 落地；或 video-gen 直出短片。后两者与导演层可叠加
- **归档里留着备用的**：office 五件套（docx/pdf/pptx/xlsx/obsidian，交作业时说"用归档的 pptx"）、其余已被现有 skill 覆盖不用碰

## 组合套路

- **新项目一条龙**：project-setup → grill 拷问需求 → prototype 挑方案 → 开发 → flow-optimize 验收 → ship
- **功能升级一条龙**：flow-optimize 加法分支找差距 → 你挑 →（大改先 prototype）→ 开发 → flow-optimize 减法验收 → ship
- **修 bug 一条龙**：diagnose 定位 → 修 → 回归用例入链（flow-better-test）→ ship
- **开源前**：project-setup（体检出缺的开源件）→ improve（全仓安全/依赖审计）→ flow-optimize → ship
