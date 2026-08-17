# Architecture HTML 渲染规范

渲染是模板驱动的，保证任何仓库、任何 agent 产出几乎一致的界面：复制 [templates/architecture.html](./templates/architecture.html)，把 `__ARCH_DATA__` 替换为数据 JSON、`__TITLE__` 替换为标题、`__WIKI_DIGEST__` 替换为 `node docs/architecture/verify.mjs --digest` 的输出，写入 `docs/architecture/architecture.html`；数据 JSON 同时存为 `docs/architecture/data.json`（派生产物，随渲染更新，供增量微调与 diff）。视觉语言全部固化在模板里：Anthropic 单主题（ivory `#F0EEE6` 底 + cream `#FAF9F5` 卡，层级靠表面色阶不靠阴影，墨色 `#141413`，Book Cloth 珊瑚主色）、大地色分区色与胶囊分区标签（自动上下避让）、圆点虚线边界、多形态建筑、地面名牌、连续流程追踪、hover 聚焦、平移缩放、响应式取景。要改视觉改模板，不逐仓库定制。

## 数据 JSON

所有内容来自 wiki 页面与 code map，逐条有出处；不编造节点和边。**每个 flow 步骤必须带 `sources`（该步真实调用点的文件/目录）；找不到调用点的步骤不得画入流程。**

```jsonc
{
  "meta": {
    "title": "仓库名 · 当前系统",
    "headline": "面板首屏标题",
    "logo": "<svg class=\"logo\" style=\"fill:currentColor\" ...>",  // 可选；仓库有 logo/favicon 就内联（去 style、改 currentColor）；title 只写仓库名，不加后缀
    "repoUrl": "https://github.com/x/y/blob/main",                  // 可选；有则出处变跳转链接，无则点击复制路径
    "stats": [["语言", "Go · TS"], ["模块", "24"]],                  // 头部统计，全部真实数字
    "what": "<p>系统一段话，可用 <mark> 高亮关键论断</p>",
    "reading": "<p>怎么读这张图</p>",
    "how": "<p>实现纪律（原理 tab）</p>",
    "sources": ["ARCHITECTURE.md"]
  },
  "districts": [   // 进程/部署边界；按序自动分配暖调低饱和色，可用 tint 覆盖
    { "id": "go", "label": "GO 控制面", "icon": "grid", "r": [1, 2, 3, 4] }
  ],
  "nodes": [
    { "code": "G2", "district": "go", "name": "auth 域", "short": "认证",  // short ≤4 字，上地面名牌
      "icon": "lock", "form": "box", "x": 6.4, "y": 7.4, "h": 0.8,       // w/d 默认 1.1
      "count": 12,                                                        // 仅群组节点（slabs）标数量
      "what": "功能一句话", "how": "原理，可用 <mark>",
      "sources": ["src/auth/"] }
  ],
  "links": [   // 静态结构关系：细虚线，hover 显示 label，点击进面板
    { "from": "A", "to": "B", "label": "说明", "what": "可选详情", "via": [[1, 2]] }
  ],
  "flow": [    // 主运行流：实线箭头 + 常驻流动点 + 播放/单步/点步骤跳转，8–12 步
    { "from": "A", "to": "B", "title": "步骤名", "what": "这一步发生了什么",
      "sources": ["src/call-site.ts"], "via": [] }   // sources 必填：这一步的调用点证据
  ]
}
```

图标名取自模板内置 symbol 集（`ic-*`）：globe、sliders、gateway、lock、user、card、calendar、target、shield、cube、coin、book、bridge、grid、users、chat、layers、file、cpu、server、wrench、plug、db、bolt、folder、sparkle、bell；按语义选最近的。

## 形态语义

- `box` 普通域；`tall`（h 1.6–1.8）编排者、闸口等关键枢纽；`stack` 数据库；`cylinder` 缓存/对象存储；`slabs`（w 1.9 + count）同类模块群；`external` 外部供应商（虚线盒）。
- 地面名牌（icon + code + short）自动放在建筑前方通道，不遮后排；全名在侧边栏和面板。模块按职责聚合成 20–35 栋，装不下的进群组节点如实计数。

## 布局几何（等距投影约束）

- 地面坐标系：x 向右下，y 向左下。footprint 1.1 时**列距 ≥ 2.6、行距 ≥ 2.4**，否则等距投影下相邻建筑互相重叠。
- 分区矩形互不重叠，之间留 ≥ 1.5 格通道；构图尽量方（宽高比 ≤ 1.9），入口区放西侧，外部供应商放东侧，数据放南侧，主流程大致自西向东。
- `via` 航点让连线走分区间通道和行/列间隙，不穿建筑 footprint；模板会在世界坐标把线端裁到建筑边缘，箭头不进盒。

## 完成检查

用浏览器截图验证再交付：初始取景铺满画布、名牌与分区标签无遮挡、流程线不穿楼、hover/点击/侧边栏/连线联动正常、播放追踪走完全部步骤、点空白能取消选中、原理 tab 每步都有真实调用点出处。
