---
name: ui-picks
description: 个人 UI 库选型表：需要动效组件、canvas 特效、AI 聊天界面等能力时查表选库，按指定方式安装最新版本；用户说"选型库 / 我的库 / 用什么库"时也使用。
---

# UI Picks

个人品味的 UI 库选型表。命中场景就用表里的库，不另找竞品；组件清单和 API 以各库的 llms.txt / registry / 文档为准，构建时现取，不依赖本文快照。

## 使用规则

1. 按任务识别场景，不按用户提到的库名。"要个粒子背景"是特效场景，即使用户没提任何库。
2. 先查 `package.json`。项目已用表内库直接用；已用竞品（如别的 chat UI 库）时提示本表推荐，但不擅自换依赖。
3. 每个场景只推荐一个库，说明用途一句话，属于请求范围就直接安装接线。
4. 特效层不得牺牲内容层：文字保持可选中、链接可点击、核心信息不依赖特效呈现。
5. 装饰性动效不限场景：落地页、portfolio 之外，webapp、产品 UI 也可按需用，好看且服务体验即可；落地后仍受 impeccable 反 AI 痕迹检查与 ui-craft 性能、reduced-motion 门禁约束。

## 选型表

### Amicro — 卡片编排微交互（React）

- Cover-flow、扇形展开、arc、time-machine 等卡片空间编排和微转场；站点 [amicro.vercel.app](https://amicro.vercel.app)。
- 获取：从站点组件页直接复制源码进项目（依赖 Motion）。官方 `npx @subhanhq/amicro@latest add` 实测不可用（npm 包无可执行入口，2026-08 验证），修复前不要用。
- 无 llms.txt，文档是纯客户端渲染，选组件靠站点浏览。
- 落地后按 ui-craft 的弹簧与空间连续性纪律收口（同一几何关系派生、可中断、reduced-motion）。

### OriginKit — 文字动效 / 光标特效 / 图片画廊 / 背景动画（React / Framer）

- 约 160 个免费动效组件：文字特效、光标特效、图片画廊、背景动画和 hero/features 等营销 sections；站点 [originkit.dev](https://www.originkit.dev)。
- 获取：`npx originkit@latest add <compid>`（shadcn 式源码分发，落进 `components/originkit/`，deps 自动装，`add` 消耗账号 quota）；机读靠 MCP `https://mcp.originkit.dev/mcp`（list_components / get_component / search / fetch，可按 react/nextjs/vite 适配源码），无 llms.txt 和 registry.json。
- 红线：产品处于 BETA；组件按 Framer 优先编写，React 侧落地后检查 Framer 绑定剥离干净（`"use client"`、no-op shim 无残留）。
- 分工：Amicro 管卡片空间编排，Canvas UI 管 WebGL 覆盖交互 DOM，Paper Shaders 管纯背景纹理；文字/光标/画廊类动效归这里。

### Fluid Functionalism — 成品感产品 UI 组件（React / shadcn registry）

- 23 个产品 UI 组件（Button、Dialog、Select、Tabs、Table 等）含 AI 聊天视觉件（ChatMessage、ThinkingIndicator、ThinkingSteps、AskUserQuestions）；设计理念是动效传达语义、hover 即预览，与 ui-craft 门禁契合。
- 获取：`npx shadcn@latest add https://www.fluidfunctionalism.com/r/<组件>.json`（源码复制分发）；机读清单读 <https://www.fluidfunctionalism.com/r/registry.json>（53 项，含 hooks 与 surface/spring token），不要用 `/r/base/` 路径（仅部分组件存在）。系统文档在 [fluidfunctionalism.com/docs](https://www.fluidfunctionalism.com/docs)，无 llms.txt。
- 与 assistant-ui 分工：这里是纯视觉组件；需要线程、流式、工具调用等完整 chat runtime 时用 assistant-ui，两者可搭配。

### Canvas UI — WebGL / shader 特效叠在可交互的真实 DOM 上

- 流体、火焰、玻璃、Shatter、VHS 等效果覆盖实时界面；站点 [canvasui.dev](https://canvasui.dev)，清单读 <https://canvasui.dev/llms.txt>。
- 获取：`npx shadcn@latest add @canvas-ui/<组件>-react`（`react` 可换 `solid`/`vue`/`svelte`/`vanilla`）；也可把 shadcn MCP 指向该 registry。这是源码复制分发：组件落进 `components/canvasui/` 自由改，不把库装成依赖。
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
