# Architecture HTML 渲染规范

渲染是模板驱动的，保证任何仓库、任何 agent 产出几乎一致的界面：复制 [templates/architecture.html](./templates/architecture.html)，把 `__ARCH_DATA__` 替换为数据 JSON、`__TITLE__` 替换为标题、`__WIKI_DIGEST__` 替换为 `node docs/architecture/verify.mjs --digest` 的输出，写入 `docs/architecture/architecture.html`；数据 JSON 同时存为 `docs/architecture/data.json`（派生产物，随渲染更新，供增量微调与 diff）。视觉语言全部固化在模板里：森纸单主题（暖纸底 + 墨绿主色，分区鼠尾草绿/陶土/雾蓝）、等距城市、总览/多场景切换与白色流光、节点聚焦显示其跨场景数据流、侧边栏分组折叠与过滤、左右两栏整体可收起、平移缩放；体检命中的节点带警示标（楼顶与侧边栏），点击跳体检页对应小节。要改视觉改模板，不逐仓库定制。

**零手写论断**：HTML 中关于代码库的每一句话，要么是嵌入的 wiki 页原文直接渲染，要么由图数据确定性派生（上下游、参与场景）。数据 JSON 里不出现独立撰写的功能/原理文字；`meta.reading` 只描述怎么读这张图，不描述代码库。内容不够好去改 wiki 页，不在 JSON 里补写。

## 数据 JSON

```jsonc
{
  "meta": {
    "title": "仓库名",
    "headline": "面板首屏标题",
    "logo": "<svg class=\"logo\" style=\"fill:currentColor\" ...>",  // 可选；仓库有 logo/favicon 就内联（去 style、改 currentColor）
    "repoUrl": "https://github.com/x/y/blob/main",                  // 可选；有则出处变跳转链接，无则点击复制路径
    "stats": [["语言", "Go · TS"], ["入口", "4", "外部触发系统的门：HTTP、CLI、定时…"]],  // 全部真实数字；只写读者能懂的架构维度，第三元素可选，hover 提示一句人话解释
    "reading": "<p>怎么读这张图（描述可视化本身，不描述代码库）</p>",
    "sources": ["docs/architecture/wiki/system.md"]
  },
  "wiki": {                                   // 全部 wiki 页原文嵌入（含 frontmatter），键为 wiki/ 相对路径
    "index.md": "…", "system.md": "…", "data-flow.md": "…", "modules/auth.md": "…"
  },
  "health": { "dead": 2, "suspects": 5, "deadExports": 184, "cycles": 0, "breaks": 0 },  // 可选；体检计数全部取自工具输出（见 HEALTH.md），评分公式固化在模板，不手填分数
  "districts": [   // 进程/部署边界；按序自动分配暖调低饱和色，可用 tint 覆盖
    { "id": "go", "label": "GO 控制面", "icon": "grid", "r": [1, 2, 3, 4] }
  ],
  "nodes": [
    { "code": "G2", "district": "go", "name": "auth 域", "short": "认证",  // code 是图上门牌：分区首字母+序号，不自造缩写；short ≤4 字
      "icon": "lock", "form": "box", "x": 6.4, "y": 7.4, "h": 0.8,       // w/d 默认 1.1
      "count": 12,                                                        // 仅群组节点（slabs）标数量
      "page": "modules/auth.md",                                          // 面板「介绍」tab 渲染此页；可带 #小节标题 锚点；多节点可指同一页不同锚点
      "sources": ["src/auth/token.ts"],
      "health": ["hotspot"] }                                             // 可选；体检命中类别 dead/cycles/hotspot/breaks，按 HEALTH.md 从 health.md 条目映射，未命中不写
  ],
  "links": [   // 静态结构关系：覆盖 code-map 聚合后的全部模块级依赖，多条文件级 import 合并为一条；细虚线，hover 显示 label
    { "from": "A", "to": "B", "label": "说明", "what": "可选详情", "via": [[1, 2]] }
  ],
  "flows": [   // 多场景运行流：每个真实入口（HTTP API、CLI、队列消费者、定时任务…）至少一条，同类入口可合并；每条 5–12 步；顶部悬浮 tab 切换，点 tab 时面板渲染 page 指向的 data-flow.md 小节
    { "title": "用户下单", "page": "data-flow.md#用户下单（HTTP）", "steps": [
      { "from": "A", "to": "B", "title": "步骤名", "what": "这一步发生了什么",
        "sources": ["src/call-site.ts"], "via": [] }   // sources 必填：这一步的调用点证据
    ] }
  ]
}
```

每条 flow 必须对应 data-flow.md 已写的端到端路径；每个步骤必须有真实调用点，找不到调用点的步骤不得画入。每个节点至少被一条 link 或 flow 触及——孤立节点要么补上真实关系，要么并入群组，要么不该单独成楼（verify 会硬性检查）。

图标名取自模板内置 symbol 集（`ic-*`）：globe、sliders、gateway、lock、user、card、calendar、target、shield、cube、coin、book、bridge、grid、users、chat、layers、file、cpu、server、wrench、plug、db、bolt、folder、sparkle、bell；按语义选最近的。

## 形态语义

- `box` 普通域；`tall`（h 1.6–1.8）编排者、闸口等关键枢纽；`stack` 数据库；`cylinder` 缓存/对象存储；`slabs`（w 1.9 + count）同类模块群；`external` 外部供应商（虚线盒）。
- 地面名牌（icon + code + short）自动放在建筑前方并避让重叠；全名在侧边栏和面板。建筑控制在 20–40 栋——放开的是 wiki 页数，不是楼数；装不下的模块进群组节点如实计数，多个 wiki 页可映射到同一栋楼的不同锚点。

## 布局几何（等距投影约束）

- 地面坐标系：x 向右下，y 向左下。footprint 1.1 时**列距 ≥ 2.6、行距 ≥ 2.4**，否则等距投影下相邻建筑互相重叠、名牌挤压。verify 以略宽松的红线硬性把关（xgap ≥ 1.3 或 ygap ≥ 1.1），不过关 exit 1。
- 分区矩形互不重叠，之间留 ≥ 1.5 格通道（verify 硬检）；节点必须落在所属分区矩形内（verify 硬检）。构图尽量方（宽高比 ≤ 1.9），入口区放西侧，外部供应商放东侧，数据放南侧，主流程大致自西向东。
- `via` 航点让连线走分区间通道和行/列间隙，不穿建筑 footprint；模板会把线端裁到建筑边缘，同对节点的平行边自动错道。

## 完成检查

`node docs/architecture/verify.mjs` 通过即完成——数据侧问题（图完整性、几何红线、穿楼、认领对账、健康字段合法性）全部由 verify 硬检，逐仓库产出不需要浏览器验证。

## 模板维护（仅改 templates/architecture.html 时）

界面行为是模板不变量，改模板后用浏览器过一遍：场景播放与单步、节点聚焦与面板锚点跳转、边缘把手收起展开、分组折叠与过滤、警示标点击跳转、平移缩放与 reduced-motion；窄屏视口（≤820px）验抽屉滑入滑出与双指捿合。
