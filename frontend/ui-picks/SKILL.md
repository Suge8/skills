---
name: ui-picks
description: 个人 UI 库选型表：需要动效组件、canvas 特效、AI 聊天界面等能力时查表选库，按指定方式安装最新版本；用户说"选型库 / 我的库 / 用什么库"时使用。
disable-model-invocation: true
metadata:
  provisional: true
---

# UI Picks

个人品味的 UI 库选型表。命中场景就用表里的库，不另找竞品；组件清单和 API 以各库的 llms.txt / registry / 文档为准，构建时现取，不依赖本文快照。

## 使用规则

1. 按任务识别场景，不按用户提到的库名。"要个粒子背景"是特效场景，即使用户没提任何库。
2. 先查 `package.json`。项目已用表内库直接用；已用竞品（如别的 chat UI 库）时提示本表推荐，但不擅自换依赖。
3. 每个场景只推荐一个库，说明用途一句话，属于请求范围就直接安装接线。
4. 特效层不得牺牲内容层：文字保持可选中、链接可点击、核心信息不依赖特效呈现。
5. 装饰性动效仅限 brand/marketing 场景（落地页、portfolio、hero 的标志性时刻）；产品 UI、Dashboard、表单不用。落地后仍受 impeccable 反 AI 痕迹检查与 ui-craft 性能、reduced-motion 门禁约束。

## 选型表

### React Bits — 装饰性文字动画、动态背景、hero 特效

- 站点 [reactbits.dev](https://reactbits.dev)；选组件先读 <https://reactbits.dev/llms.txt>，再从文档拉对应变体源码（JS/TS × CSS/Tailwind 四种）。
- Copy-paste 分发，源码落进项目自由改；不装整库依赖。
- Vue 用 [vue-bits](https://github.com/DavidHDev/vue-bits)，Svelte 用 [svelte-bits](https://github.com/DavidHDev/svelte-bits)，同作者同模式。

### Canvas UI — WebGL / shader 特效叠在可交互的真实 DOM 上

- 流体、火焰、玻璃、Shatter、VHS 等效果覆盖实时界面；站点 [canvasui.dev](https://canvasui.dev)，清单读 <https://canvasui.dev/llms.txt>。
- 安装：`npx shadcn@latest add @canvas-ui/<组件>-react`（`react` 可换 `solid`/`vue`/`svelte`/`vanilla`）；也可把 shadcn MCP 指向该 registry。
- 红线：完整效果依赖实验性 html-in-canvas API（Chrome/Edge 140+ 且开 flag），其余浏览器降级为 WebGL overlay。上线前必须实测降级表现；移动端验证功耗与帧率。

### Paper Shaders — 轻量 shader 背景/纹理（mesh gradient、噪声、dot 等）

- 零依赖 canvas shader 组件，做背景纹理或按形状/文字遮罩；站点 [shaders.paper.design](https://shaders.paper.design)，组件与参数以该文档为准。
- 安装：React `npm i @paper-design/shaders-react`；其他框架（Svelte/Vue/Solid 等）用零依赖核心包 `npm i @paper-design/shaders`，在挂载钩子里用 `ShaderMount` 对着容器元素初始化。官方 0.0.x 下会发 breaking change，必须 pin 精确版本。
- 与 Canvas UI 分工：Paper Shaders 是纯背景/纹理层不承载交互；要 WebGL 效果覆盖可交互 DOM 才用 Canvas UI。

### assistant-ui — 产品内 AI 聊天界面（React/TS）

- 线程、流式输出、Markdown、工具调用 UI 等 ChatGPT 级交互；站点 [assistant-ui.com](https://www.assistant-ui.com)，文档读 <https://www.assistant-ui.com/llms.txt>。
- 安装：已有项目 `npx assistant-ui@latest init`，新项目 `npx assistant-ui@latest create`；或直接装 `@assistant-ui/react` + 对应 runtime 包（如 `@assistant-ui/react-ai-sdk`）。
- 属于产品 UI：样式与密度对齐项目设计系统，不套库默认主题了事。

## 加新库

每个库三到五行：名称 + 场景一句话、获取方式（llms.txt / registry / CLI）、边界与红线。只收自己真用过且认可的库，不收备选清单。
