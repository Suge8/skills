---
name: promo
description: 项目宣传物料工坊：用户说"做物料/宣传图/hero 图/社媒图/OG 图/商店截图/演示 GIF/演示视频/README 配图"，或项目要发布、开源、上架缺视觉物料时使用。读 PRODUCT/DESIGN 文档定基调，按物料类型分支执行，产物落盘 design/promo/。不用于：应用内 UI 设计（impeccable）、单独 logo（logo skill 直接用）。
---

# Promo（物料工坊）

编排者，自己不生成任何东西：logo 归 logo skill、AI 图归 gpt-image、文案归 copywriting + stop-slop、截图归 browser-dev/系统工具。本 skill 管的是：搞清项目是什么 → 缺什么物料 → 按正确的工具链生产 → 落盘成套。

## Step 0 — 建立语境（物料质量的上游）

1. 读 `docs/PRODUCT.md`（定位、给谁、卖点）和 `docs/DESIGN.md`（色板、字体、气质）——这是所有物料的事实源。都缺时建议先跑 project-setup；用户不想跑就问最小三件事：项目是什么、给谁用、想要什么气质
2. 判定项目类型（决定截图/录制工具链）：**web / 浏览器扩展 / 桌面 app / CLI-TUI**
3. 盘点已有物料：`design/` 目录、README 里的图、商店页现状

## Step 1 — 出缺口清单，用户挑

按用途列菜单（缺的标出来），等用户挑，不全做：

| 物料 | 用在哪 | 分支 |
|---|---|---|
| Logo / 3D 资产系列 | 应用内、README、社媒头像 | [VISUAL.md](./VISUAL.md) 链 A |
| AI 宣传底图（hero/OG/社媒） | 官网首屏、GitHub social、推文卡片 | [VISUAL.md](./VISUAL.md) 链 B |
| 产品截图（美化合成） | README hero、商店图库、Product Hunt | [SHOTS.md](./SHOTS.md) |
| 演示 GIF / 视频 | README、社媒、商店 | [MOTION.md](./MOTION.md) |
| 配套文案（标题/口号） | 叠加在图上、社媒帖 | copywriting → stop-slop |

## Step 2 — 生产纪律

- **每个产物生成后必须真实查看**（Read 图片/看视频首末帧），对照验收标准：简洁、高级、现代、单焦点、零 AI 味。不达标改了再看，最多三轮拿给用户挑方向
- 产物落盘 `design/promo/{visual,shots,motion}/`，文件名带用途和尺寸：`hero-github-1280x640.png`
- 全部完成给一张交付清单：文件 → 建议投放位置（README 哪一节、商店哪个位）

## 质量红线

- 图上文字一律 HTML 叠加，禁止让 AI 渲染文字（必崩）
- 截图内容必须是真实感数据，禁止 lorem ipsum、空列表、测试账号名
- 尺寸必须精确匹配目标平台（表在 SHOTS.md），不许"差不多然后被平台裁烂"
