---
name: ui-picks
description: 个人 UI 库选型表；需要动效特效、微交互组件、AI 聊天界面、界面音效或字体时先查表再选库
---

# UI Picks

个人品味的 UI 库选型表。命中场景就用表里的库；组件清单和 API 以各库的 llms.txt / registry / 文档为准，构建时现取。

## 使用规则

1. 按任务识别场景，不按用户提到的库名。"要个粒子背景"是特效场景，即使用户没提任何库。
2. 先查 `package.json`。项目已用表内库直接用；已用竞品时提示本表推荐，保留现有依赖。
3. 每个场景只推荐一个库，说明用途一句话，属于请求范围就直接安装接线。
4. 装饰性动效不限场景，webapp、产品 UI 也可按需用。落地后按 ui-craft 检查 AI 模板痕迹、性能和 reduced-motion；内容层独立于特效层：文字可选中、链接可点击、核心信息不依赖特效。

## 选型表

### Amicro — 卡片编排微交互（React）

- Cover-flow、扇形展开、arc、time-machine 等卡片空间编排和微转场；站点 [amicro.vercel.app](https://amicro.vercel.app)，无 llms.txt，纯客户端渲染，选组件靠站点浏览。
- 获取：从站点组件页复制源码进项目（依赖 Motion）。官方 `npx @subhanhq/amicro@latest add` 实测不可用（npm 包无可执行入口，2026-08 验证）。

### Rare UI — Apple 味成品微交互小件（React / shadcn registry）

- Folder、Duration Picker、Family Drawer、OTP Input、Emoji Reaction、Gooey Nav、原地确认 Delete Button 这类单文件动效小件；机读 <https://www.rareui.com/llms.txt>，MIT。
- 获取：`npx shadcn@latest add swamimalode07/rare-ui/<组件>`，源码复制分发。按 registry 的 dependencies 看清附带依赖：Duration Picker 拉 flubber/figma-squircle，Emoji Reaction 拉 react-apple-emojis（Apple emoji 资产授权自担）。
- 分工：卡片空间编排用 Amicro，状态转场 CSS 用 transitions.dev，通用产品控件用 Fluid Functionalism。

### Fluid Functionalism — 成品感产品 UI 组件（React / shadcn registry）

- Button、Dialog、Select、Tabs、Table 等产品控件，含 AI 聊天视觉件（ChatMessage、ThinkingIndicator 等）；动效传达语义、hover 即预览。系统文档 [fluidfunctionalism.com/docs](https://www.fluidfunctionalism.com/docs)，机读清单 <https://www.fluidfunctionalism.com/r/registry.json>。
- 获取：`npx shadcn@latest add https://www.fluidfunctionalism.com/r/<组件>.json`，源码复制分发；`/r/base/` 路径只有部分组件，用 `/r/`。
- 分工：这里是纯视觉组件；需要线程、流式、工具调用等 chat runtime 时用 assistant-ui，两者可搭配。

### Beautiful UI — AI-native 产品界面原语（React / TypeScript）

- 思考态、流式回答、人工审批、工具调用、AI 编辑器等高完成度交互原语；站点 [beautiful-ui-five.vercel.app](https://beautiful-ui-five.vercel.app/)，无 llms.txt / registry，按站内目录人工选取。MIT（2026-08 验证）。
- 获取：示例右上角 Copy code。源码引用站点 CSS token 和共享 atoms，部分另需 `glimm`、`liveline`、`iconoir-react`，按实际 import 补齐并接入项目设计系统。
- 红线：示例里的 mock 数据、定时状态流和主题类名换成真实业务状态。分工同 Fluid Functionalism：runtime 用 assistant-ui，通用控件用 Fluid Functionalism。

### Canvas UI — WebGL / shader 特效叠在可交互的真实 DOM 上

- 流体、火焰、玻璃、Shatter、VHS 等效果覆盖实时界面；站点 [canvasui.dev](https://canvasui.dev)，机读 <https://canvasui.dev/llms.txt>。
- 获取：`npx shadcn@latest add @canvas-ui/<组件>-react`（`react` 可换 `solid`/`vue`/`svelte`/`vanilla`），源码落进 `components/canvasui/` 自由改；也可把 shadcn MCP 指向该 registry。
- 红线：完整效果依赖实验性 html-in-canvas API（Chrome/Edge 140+ 且开 flag），其余浏览器降级为 WebGL overlay，上线前实测降级表现和移动端功耗。

### Paper Shaders — 轻量 shader 背景/纹理（mesh gradient、噪声、dot 等）

- 零依赖 canvas shader 组件，做背景纹理或按形状/文字遮罩；站点 [shaders.paper.design](https://shaders.paper.design)。
- 安装：React `npm i @paper-design/shaders-react`；其他框架用核心包 `npm i @paper-design/shaders`，挂载钩子里用 `ShaderMount` 对容器初始化。0.0.x 下会发 breaking change，pin 精确版本。
- 分工：纯背景/纹理层；要 WebGL 效果覆盖可交互 DOM 用 Canvas UI。

### morphicons — SVG 图标 morph 动效（React / Vue / Svelte / RN / vanilla）

- stroke 图标平滑变形到另一个（menu→X、play→pause），可中断弹簧物理，零依赖 ~6-8KB；机读 <https://www.morphicons.com/llms.txt>（完整 API 在 llms-full.txt）。SSR 干净、默认 `aria-hidden`、自动尊重 reduced-motion。
- 安装：`npm i morphicons`，按框架取 `morphicons/react|vue|svelte|react-native|dom` 入口；图标以数据形式导入（装 `lucide` 包，不是 `lucide-react` 组件）。
- 红线：只支持 stroke 图标（Lucide/Tabler/Heroicons outline/Iconoir）；非 24×24 网格的包先用 `fitIcon` 重排。

### transitions.dev — 复制即用的 CSS 状态转场片段（框架无关）

- 卡片 resize、数字翻转、菜单/Modal/Panel 开合、图标与文字交换、错误抖动等既有元素的状态转场配方；站点 [transitions.dev](https://transitions.dev)。
- 获取：`npx transitions-pro add <name>`（免费款无需账号，`list` 看全量；Pro 需浏览器登录）或站点卡片复制。片段自含 `:root` 语义变量、`t-*` 命名空间类和 reduced-motion guard。
- 红线：多款默认带 blur，与 ui-craft「blur 非默认入场属性」冲突，实测流畅且视觉语言支持才保留；其 `:root` token 与项目已有动效变量二选一。
- 分工：卡片空间编排用 Amicro，图标 morph 用 morphicons，成品交互小件用 Rare UI。

### assistant-ui — 产品内 AI 聊天界面（React/TS）

- 线程、流式输出、Markdown、工具调用 UI 等 ChatGPT 级交互；机读 <https://www.assistant-ui.com/llms.txt>。
- 安装：已有项目 `npx assistant-ui@latest init`，新项目 `npx assistant-ui@latest create`；或直接装 `@assistant-ui/react` + 对应 runtime 包（如 `@assistant-ui/react-ai-sdk`）。
- 属于产品 UI：样式与密度对齐项目设计系统。

### UI SFX — 语义化界面音效（Web Audio / 跨端音频文件）

- 按交互语义（success、drop、processing、level-up）调用的 cue，换音色 pack 不改交互代码；机读 <https://uisfx.com/docs/agent-guide.md>，接线提示词 `/agent-prompt.txt`。代码 MIT、音频 CC0。
- 安装 `npm i uisfx`：`createUISFX({ pack, preferences: {} })` + 首次可信交互里 `await ui.unlock()`（绕开自动播放限制），运行时 12KB 零依赖、本地合成；React Native / 原生 / 引擎侧改用包内 `uisfx/sounds/{pack}/{cue}.mp3|ogg` 与 `uisfx/manifest`。
- 红线：音效只强化已有的可见反馈，成功/警告/错误各自有视觉区分；提供持久静音开关（`setEnabled`），loop cue 随可见状态结束即 `stop()`，密集界面里 hover 音保持安静或关闭。

### 字体 — 拉丁：Fontshare

- 标题/正文选型用 [fontshare.com](https://www.fontshare.com)：ITF 出品免费商用（Satoshi、General Sans、Clash Display 等），质量对标付费字体；接入走官方 API `<link>` 或下载 offline kit。
- 红线：Closed Source 字体按 ITF FFL——禁改字体文件、禁再分发（含传给外包设计师）；全库无 CJK，中文界面只能做英文/数字层，配中文回退字体栈。

### 字体 — 中文：免费梯队 + 分包

- UI 正文选 MiSans / 阿里巴巴普惠体 3.0 / HarmonyOS Sans（大厂定制体，免费池屏显天花板）；标题出彩用得意黑（OFL，官方明确不适合正文和手机界面）；文艺/阅读用霞鹜文楷、思源宋体。新字体筛选看[猫啃网](https://www.maoken.com)；要 Fontshare 级惊艳只能走商业授权（字由/方正）。
- 中文 webfont 必须分包（单文件 10-20MB）：自托管用[中文网字计划](https://chinese-font.netlify.app/zh-cn/)的 `cn-font-split` 切包，或其字图 CDN（域名迁移中以官网为准）。它只当分包工具，字体池不做质量筛选。

## 加新库

只收自己真用过且认可的库。每个库三到四行：名称 + 场景一句话与机读入口、获取命令与站点没写明的陷阱、该库独有的红线或与表内库的分工。通用门槛（ui-craft、reduced-motion、内容层）由使用规则承担，组件数量与枚举清单以机读源为准，都不入表。
