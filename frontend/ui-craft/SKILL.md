---
name: ui-craft
description: 新建、重设计、打磨或审查界面时读：密度尺寸、排版层级、文案反馈、动效配方与实现纪律、无障碍门槛
---

# UI Craft

设计、重设计并打磨可交付界面。项目已有组件、token 或平台规范时以代码为准；若存在 `DESIGN.md`，将它作为设计线索读取并与代码核对。缺少设计文档时照常推进。

## 开始前

1. 读取现有 Button、Input、菜单、Dialog、token 和一个相邻页面，全局尺寸沿用项目既有值。
2. 判断主要输入：`pointer`、`touch` 或 `hybrid`；再选择一个密度：`compact`、`comfortable` 或 `touch`。
3. 原生桌面应用优先使用 AppKit、SwiftUI、WinUI 等系统控件尺寸；下表主要供 Web、Electron 和自绘界面使用。
4. 同一界面只保留一个默认密度。组件因业务需要例外时，用语义变体承载。
5. 窗口变宽时增加内容、列或面板，控件尺寸保持固定。

### 整体设计

仅在新建界面或大幅重设计时执行：

1. 从用户请求、README 和现有代码明确主要用户、核心任务与使用环境。只询问会改变实现的决策。
2. 沿用已有品牌、组件和 token；都没有时选择一个明确的视觉方向，直接落实到配色、字体、间距和表面层级。
3. 每个页面保持一个主要任务和清晰的视觉焦点。先建立信息层级，再决定 Card、分栏、侧栏或长页面结构。
4. 避开可预测的 AI 模板：渐变文字、默认玻璃拟态、无限等尺寸 Card Grid、每节重复 Eyebrow、无业务依据的大数字 Hero、统一米黄色背景，以及每段相同的入场动画。
5. 完成后在真实界面验证宽屏、窄屏、键盘操作和主要状态。

### 深度参考路由（按需读取）

| 触发 | 读取 |
|---|---|
| 调色板生成、OKLCH、对比度修复、gamut、主题色 | `reference/colors/index.md` |
| 选字体配对、可变字体、OpenType、字阶体系 | `reference/typography/index.md` |
| 超出「无障碍与验证」的深查：焦点陷阱、ARIA 模式、读屏、live region | `reference/accessibility/index.md` |
| 整体/全面审查 | 按「审查输出」执行；覆盖无障碍、排版、配色三域时分别读对应 `index.md`，发现合并为一份报告 |

## 密度与控件尺寸

| Profile | 典型场景 | Button / Input | Icon button | Row | Label | Icon |
|---|---|---:|---:|---:|---:|---:|
| `compact` | 浏览器插件、桌面工具栏、数据密集工具 | 32px | 28–32px | 28–32px | 13px | 14–16px |
| `comfortable` | 普通桌面应用、设置页、Dialog | 36px | 32–36px | 36–40px | 14px | 16–18px |
| `touch` | 触屏或以触控为主的混合设备 | 44px；Material 用 48dp | 44/48px | 44/48px | 14–16px | 18–20px |

这些值是项目没有设计系统时的默认值，平台规范优先。

- WCAG 2.2 AA 的指针目标基线是 24×24 CSS px。紧凑桌面的常用操作默认不低于 28px；目标小于 24px 时必须满足 WCAG 的间距或其他例外。
- 触屏目标按平台使用 44pt 或 48dp。可见图形可以更小，扩展命中区与相邻目标保持分离。
- 桌面指针界面保持指针尺寸的命中区，触屏命中区只给 `touch` profile。
- Button、Input、Select 和相邻分段控件使用同一高度。主 CTA 通过颜色、位置和层级突出。
- 默认水平 padding：`compact` 10–12px，`comfortable` 12–16px，`touch` 16–20px；图标按钮保持正方形。
- 文字与图标间距 6–8px；含图标的按钮与纯文字按钮同高。
- 密度由 token 或组件 variant 控制，例如 `control-height`、`control-padding-x`、`icon-size`，全部组件共用这一套。
- 同心圆角遵循 `outer radius = inner radius + padding`；两层间距超过 24px 时视为独立表面，各自取值。圆角服务于组件层级。

## 排版与间距

| 用途 | `compact` | `comfortable` |
|---|---:|---:|
| 正文 | 13.5–14px | 14–15px |
| 控件、菜单、条目标题 | 13px | 14px |
| 次要说明 | 12–13px | 12.5–13.5px |
| 非关键元信息 | 11.5–12px | 12px |

- 关键标签、状态和操作文字不小于 12px；控件过大时缩控件，字号保持。
- CJK 小字号需要更高行高和实机检查，字重靠字体本身而非浏览器抗锯齿。
- 产品 UI 使用固定字号阶梯。长正文行长控制在 65–75ch。
- 使用 4px 基础间距尺度；2、6、10px 只用于图标或光学校准。相关内容紧，分组之间松。
- 标题用 `text-wrap: balance`，长正文用 `text-wrap: pretty`。
- 移动端 Web 的输入控件字号不小于 16px，否则 iOS Safari 聚焦时会自动放大页面；需要更紧凑时缩 padding 和行高。
- 正文链接下划线用 `text-underline-offset` 加 `text-decoration-skip-ink: auto`。
- 定义 `::selection`，选中色取品牌色的低饱和版本，并保证选中文字仍可读。
- 几何居中看起来偏移时才做光学校准，并记录在共享组件。
- RTL 与混合方向：在方向变化的边界设置 `dir`，空间镜像用逻辑属性（`margin-inline-start` 等）。

## 视觉层级

- 先用间距和对齐分组。数据表、设置组、可调整面板等需要明确边界时，使用 1px 低对比分割线；分割线的增删由内容语义决定。
- Card 只包裹真正独立、可操作的内容，且只有一层；全局控件尺寸由密度 token 决定。
- 普通内容 Card 使用中性边界。状态或类别由 Badge、图标或文字表达；单侧彩色强调边（accent border）只用于具有明确提示语义的 Callout 或 Alert，并由共享语义 token 映射。
- 表面需要表达"可抬起"时使用一套 shadow-border token：1px 半透明 ring 加两层柔光。只表达分隔时用 1px 线。

```css
:root {
  --shadow-border:       0 0 0 1px oklch(0 0 0 / .06), 0 1px 2px -1px oklch(0 0 0 / .06), 0 2px 4px 0 oklch(0 0 0 / .04);
  --shadow-border-hover: 0 0 0 1px oklch(0 0 0 / .08), 0 1px 2px -1px oklch(0 0 0 / .08), 0 2px 4px 0 oklch(0 0 0 / .06);
}
```

- 半透明 ring 适应任意背景，且 `box-shadow` 不占布局，hover 加深不会推动周围元素。
- 暗色模式下三层黑影不可见，退成单层白 ring：`0 0 0 1px oklch(1 0 0 / .08)`，hover `.13`。
- `forced-colors: active` 会把 `box-shadow` 强制为 `none`。用阴影表达边界的表面在该媒体查询内补 `border: 1px solid`，颜色交给系统。
- 分割线、表格边界、输入框轮廓、选中态和 focus ring 保持真实 border。密集列表的行用分割线而非阴影。
- 图片需要边界时加 1px 纯中性描边：亮色 `oklch(0 0 0 / .1)`，暗色 `oklch(1 0 0 / .1)`；带色相的近黑叠在图片边缘像脏污。
- 可滚动或折叠区域给出可见提示：露出下一项的一部分、边缘渐隐或计数。
- 布局按最长文本设计：多语言长词、大数字和用户输入都能容纳。定宽容器搭配 `min-width: 0` 和明确的换行或截断策略，截断后原文仍可获取。
- 动态数字使用 `tabular-nums`。
- Sticky 操作只用于高频、跨长列表仍需可见的动作；确认它让出内容、键盘焦点和小窗口视口。

## 空态与渐进披露

界面由内容挣得，默认留白（Getting Real §9.4 The Blank Slate；NN/g《Designing Empty States in Complex Applications》）。

- 容器为空时，只对已有内容才有意义的控件（搜索、筛选、排序、计数、批量操作、依赖既有内容的次级入口）等内容出现后再渲染，且位置与最终布局一致。整屏让位给一个居中引导：一句状态 + 一句下一步 + 1（最多 2）个动作。
- 空态里的动作是此刻就能完成的直达路径；此刻走不通的能力写成一句预告文案。
- 加载中留白，数据到达后再决定空态或内容。失败态与空态分开表达，失败可重试。
- 空态文案说清"还没有"与"怎么开始"，用中性色和常规图标。
- 插画先用产品已有的品牌图形；确需生成时按产品语气（gpt-image / promo skill），统一光影与配色。呼吸/漂浮动效只在语气支持时用。
- 有合理缺省值的可选表单字段收进「添加 X（可选）」显式展开，展开后保持展开：双向折叠会把已填但非法的值藏进折叠里。完成任务的硬约束（数量区间、格式要求）以紧凑形式常驻。
- 教学性说明（机制解释、候选来源、玩法）收进标签旁的问号 Toggletip；错误、门槛、后果按「表单标注与反馈」持久可见。placeholder 与禁用态提示已承担"下一步"时，空内容区留白。
- 低频可选输入按需展开：默认收成 icon-only 或一行入口，点开出输入框（autoFocus），失焦且值为空时收回；已有内容时保持展开。必填项常驻。

## 文案与交互语义

- 使用用户熟悉的名词和明确动词，采用 sentence case。短标签、单句描述和 Button 文案省略尾句号；错误信息说明问题和可执行的修复方法。
- Button 与链接写具体动作或目的，脱离相邻正文仍能理解；上下文已唯一确定对象时省略对象名。
- 设置项的名称和描述写"打开后会发生什么"，用肯定句。
- 中英文案保持语义、阈值和数量一致；只有措辞本身是需求时才用测试锁定。

### 信息减法与页面结构

任务涉及重复页眉、同义标题/描述、显而易见 helper、重复 CTA 或 UI 文案收紧时，先读取 `reference/content-reduction.md`，再修改代码。每条保留文字必须提供新的定位、状态、指令、动作、后果或帮助；分别验证桌面、窄屏和读屏语义。

### 表单标注与反馈

任务涉及 Label、Placeholder、输入图标、helper/error、Tooltip、Toggle、Banner 或 Toast 的取舍时，先读取 `reference/forms-and-feedback.md`。以下是生产 UI 发布门；请求冲突时说明依据并实施最接近原意的安全替代：

- 认证、地址、付款和多字段表单保留持久可见 Label；Placeholder 只补充格式示例，与 Label 不同义。
- 错误、安全影响、不可逆后果和完成任务所需的信息放在持久可见的位置。
- Toggle 等控件已有明确终态时，终态即反馈。

反馈放置默认（完整决策表见 reference）：

| 情况 | 位置 |
|---|---|
| 用户能在字段内修复的错误 | 字段旁，保持到修复，用 `aria-invalid` 和 `aria-describedby` 关联 |
| 登录等整组凭据失败 | 表单内 Alert，统一文案，账号与密码错误同一措辞 |
| 用户改不了的系统或网络问题 | 区域 Banner 或表单内 Alert，字段保持常态 |
| 无需处理的操作结果 | Toast 或 `role="status"` |

- 错误文案是指令：平静语气，正面表述（"仅使用字母"）；能提前告知的格式要求在出错前就写出来。
- 提交后把焦点移到第一个错误字段；提交按钮始终可用，校验在提交时发生。

- 每个交互组件都实现适用的 default、hover、focus-visible、active、disabled、loading、error 和 success 状态。
- Web 自定义控件和项目约定使用 `cursor: pointer`；原生桌面控件遵循平台行为。
- 点击当前 tab、当前选项等幂等目标保持视图原样。
- Disabled 优先使用原生 `disabled`。需要保留焦点以解释原因时使用 `aria-disabled` 并拦截动作。
- `:focus-visible` 必须清晰，并与鼠标状态同等完整。
- 有选中项的列表打开时让当前项进入可视区；用 `aria-current`、`aria-selected` 等语义表达状态。
- Chat、日志和时间线打开时可跟随最新内容；用户离开底部后暂停，回到底部恢复。阈值由行高或 token 决定，使用事件和 observer。
- 复制按钮只在复制是高频任务时常驻；否则在 hover、focus-within 或上下文菜单中出现，并保证键盘可达。

## 默认动效语言

```css
:root {
  --ease-enter: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-state: cubic-bezier(0.2, 0, 0, 1);
  --duration-micro: 120ms;
  --duration-state: 160ms;
  --duration-overlay: 200ms;
  --duration-view: 240ms;
}
```

- 默认反馈使用颜色、opacity、轻微位移等 120–180ms 过渡。高频操作只保留即时反馈；标志性动效使用 280–700ms，只出现在少数低频、高意图组件。
- 动画预算与操作频率成反比：键盘快捷键、命令面板开合等每日上百次的操作即时切换；delight 只留给低频或首次体验。
- 进出场和即时反馈默认缓出；屏内连续位移或形变使用 ease-in-out；匀速循环才使用 linear。
- Motion 表达状态、层级、方向或操作结果；静态内容保持静态。
- 动画传达的状态变化同时有颜色、图标或文字等静态线索，reduced-motion 或错过动画的用户仍能得知结果。
- Enter 与 exit 走同一空间路径；exit 通常为 enter 时长的 70–80%，距离更短。交互高频重复或退场无空间信息时直接移除。
- 动画从当前呈现值继续，可中断、反向且不排队。异步状态由事件、Promise、transitionend 或 observer 驱动。
- 位移、缩放和进出场动画 transform/opacity；状态反馈可以过渡颜色。布局或材质属性仅在语义需要且目标设备验证流畅时使用。
- `prefers-reduced-motion: reduce` 下位移、旋转、缩放、布局重排和 stagger 直接呈现终态；保留短 opacity/color 反馈和静态布局所需的 transform。

### 弹簧与空间连续性

- 颜色、opacity 和短 hover 用 CSS tween；手势、共享布局、可中断位移和有深度的 Card 编排才用 spring。单个按钮在 CSS 层解决。
- 项目没有 spring token 时，微型图标或布局切换可从 `{ stiffness: 500, damping: 30, mass: 0.8 }` 起调；Card、CoverFlow 等较大空间编排可从 `{ stiffness: 220, damping: 24, mass: 0.8 }` 起调。默认无明显回弹，只有动量手势或 playful 语气允许轻微 overshoot。
- Motion 的 `duration/bounce` 与 `stiffness/damping/mass` 是两套配置，只写其中一套。
- 拖拽释放时把当前速度交给 spring；边界使用渐增阻力。Pointer drag 使用 capture，并从元素当前屏幕位置继续。
- 任务涉及拖拽、swipe、bottom sheet、carousel 等手势驱动交互时，先读取 `reference/gestures.md` 获取速度交接、动量投射和边界阻力的具体参数。
- 一组元素由一个交互状态驱动；位置、旋转、缩放、opacity 和 z-order 由 `index - activeIndex` 等同一几何关系派生。每个组件只保留一个主运动意图。
- `transform-origin` 对齐物理锚点：Popover 指向 trigger，Card fan 使用扇轴，Modal 保持中心。进出方向、z-order 和阴影符合相同的空间关系。
- 图标或文案替换使用固定占位和叠层；presence 初始渲染静止，退出完成前保留旧层，共享布局从旧几何连续过渡到新几何。

## 进出场配方

| 组件 | Enter | Exit |
|---|---|---|
| 行内区块、列表项 | 120–160ms，opacity + `translateY(2–4px)` | 100–120ms，短位移淡出 |
| Popover / Dropdown | 140–180ms，从触发方向位移 4–6px，`scale(.98→1)` | 100–130ms 反向收起 |
| Dialog | 180–220ms，opacity + `translateY(8px)` + `scale(.98→1)` | 140–170ms，位移 4px |
| Toast | 180–220ms，从堆叠方向进入 | 130–160ms 淡出，剩余项 180ms 重排 |

- Blur 只在视觉语言明确需要且实测流畅时加入。Cross-fade 两层重叠感调不掉时，可在过渡期加 ≤2px blur 融合新旧状态。
- Stagger 默认间隔 30–50ms，最多 6 个语义块；长列表只动画新增或可见项。首屏、成功页、Onboarding 等低频分段入场可放宽到 80–100ms，最后一个块的开始时间不超过 400ms。
- Stagger 按语义分块；切 tab、hover 列表行、筛选重排、打开菜单等高频交互即时呈现。同一区域只在本会话首次进入时错峰。
- Tooltip 首次 hover 保留延时防误触；已有 Tooltip 打开时，相邻 Tooltip 立即显示并跳过入场动画。
- 首屏默认可见。条件区块收起时同步处理 `inert` 和焦点。

### 视图级转场（路由）

- 路由推移交给浏览器 View Transitions：旧侧是快照、退场零重渲染，新转场启动即跳过旧转场。只有转场期间仍需与旧内容交互时才自建双层退场树。
- 根显式退出（`:root { view-transition-name: none }`），只命名当前在动的那一层；嵌套层由 `:active-view-transition-type()` 决定谁动，静止层 `animation: none`。
- 覆盖层放行点击（`::view-transition { pointer-events: none }`）；持久侧栏与导航保持在转场之外。
- 纯位移推移关掉 `::view-transition-group` 的默认宽高插值：它逐帧插值盒子尺寸，偷帧且拉伸旧快照；高差交给裁切。
- 一次导航一次提交，loader 只预热；数据到达在同一层原位换真身、零转场，否则会演成「内容自己推自己」。
- 后退/前进直切；判据用 history 动作类型（PUSH/REPLACE vs BACK/FORWARD），历史位次分不出前进与新导航。Safari 侧滑自带 UA 动画，叠加即双重运动。
- 弹簧手感用求解器离线采样成 `linear()` 曲线挂在转场伪元素上：手感 token 与动画引擎解耦。

### 按下反馈

视觉位移 = 尺寸 × (1 − scale) ÷ 2。按尺寸分档，目标每边 1.5–2px：

| 控件 | scale |
|---|---:|
| 图标按钮、≤40px 小控件 | 0.90–0.92 |
| 标准按钮 80–160px | 0.96 |
| 宽 CTA ≥200px | 0.98 |
| 整卡片、列表行 | 用 `translateY(1px)` 加 elevation 降一级 |

- 按下 80–100ms、释放 150–200ms，均 ease-out：按压跟手，释放才是动画。
- 同时把 elevation 降一级更接近物理按压。超过 200px 的元素用位移和阴影，缩放会让文字发虚。
- 用 `transition-property: scale`（或 transform）保持可中断，中途松手能平滑回弹。
- 纯文字链接和导航项只换颜色。

## Icon 规范

任务涉及图标选型、描边粗细、填充态、尺寸、颜色状态或 RTL 方向时，先读取 `reference/icons.md`；下表只管动效。

| Motif | 参数 | 用途 |
|---|---|---|
| 位移 | 140–180ms，2–3px | 箭头、发送、外链等有方向的动作 |
| 旋转 | 160–200ms，45–90° | 展开、刷新、设置等状态变化 |
| Cross-fade | 160–220ms，opacity + `scale(.8→1)` | 播放/暂停、复制/完成、展开/收起 |
| Wiggle / Pop | 280–360ms，一次 | 收藏、固定、删除确认等少量强调 |
| Draw 重绘 | 450–700ms，一次 | 内容型或品牌化图标的标志性反馈 |

简单 hover 反馈是默认；Wiggle、Pop 和 Draw 由组件语义或产品动效语言显式启用。

- Icon swap 保持 16–20px 固定槽位；旧图标与新图标叠放，使用成对的 cross-fade、scale 或相反方向位移，Button 外壳尺寸固定。
- 复制完成、收藏成功等状态动效由真实动作触发并保留可读终态。装饰性 sparkle 最多一次，50–100ms 的局部错峰排在主反馈之后。
- 方向性图标的轨迹匹配动作方向；高频工具栏只切换颜色或做 2–3px 位移。

### Draw 规范

多笔画 SVG 先给每条可绘制笔画设置 `pathLength="1"`，再使用归一化的 dash：

```css
[data-draw] path {
  stroke-dasharray: 1 1;
  stroke-dashoffset: 1;
}
[data-draw][data-active] path {
  stroke-dashoffset: 0;
}
```

- 在组件初始化时归一化 SVG；未归一化的图标保持静态。
- 重绘完成后的终态等于静态图标。
- Pointer leave 直接恢复静态状态。状态切换需要可逆时使用 Cross-fade。
- 触发器使用专属 `data-*` 属性，隔离外层 hover。

## 动效实现纪律

- 优先使用项目已有 Motion 或 CSS；单个微动效用现有方案。
- 只声明实际变化的属性，禁止 `transition: all`。
- 可被快速重复触发的进出场用 transition：可中断重定向，keyframes 中断即从零重播。纯 CSS 入场优先 `@starting-style`。
- Motion 的 `x`/`y`/`scale` 简写在主线程 rAF 运行，页面负载下会掉帧；确定性动画优先 CSS 或 WAAPI，JS 动画需要硬件加速时写完整 `transform` 字符串。
- 拖拽跟随直接写目标元素的 `transform`；在父容器改 CSS 变量会触发全子树样式重算。
- `will-change` 只在性能测量证明有收益时使用，并在动画后释放。
- 同一节点的同一属性只由 CSS 或 Motion 中一个系统控制；需要组合时拆 wrapper。
- 使用 Motion 时在应用边界设置 `MotionConfig reducedMotion="user"`，局部保留 opacity/color 替代；Presence 切换默认关闭首帧入场，列表替换或共享几何使用 layout/popLayout 等连续布局能力。
- Tailwind v4 的独立 translate、scale、rotate 属性可能被 keyframe 的 `transform` 覆盖；组合前检查最终 computed style。
- One-shot 动画结束后回到静态样式。使用 `fill-mode: both` 时，终态与组件状态一致。
- Hover 动效只在精细指针启用；语义和关键反馈同时支持 focus、键盘与 touch。
- Toast 全应用共用一个 Stack；tone、图标和颜色映射只有一处事实源。
- 列表新增可用轻量 enter，删除后用 FLIP 重排；高频流式更新即时呈现。

## 无障碍与验证

- 验收基线是 WCAG 2.2 AA；优先使用 button、input、nav、dialog 等语义元素，复杂组件遵循 WAI-ARIA APG。
- ARIA 属性配套键盘、焦点和状态行为。
- 自动检查之外，使用纯键盘走完整路径，并在实际 pointer 与 touch 设备上验证对应 profile。
- 截图只验证静态对齐；动效录制或用浏览器 Animation/Performance 工具逐帧检查起点、终点、反向和掉帧。
- 在数据加载、滚动和连续操作同时发生时复测；确认没有每帧全页 layout/paint、图层爆增或主线程长任务。
- 动效验证包含快速重复操作、中途反向、低性能设备和 reduced-motion。

## 审查输出

按发现的问题分组输出 Before / After；只列有证据的问题。优先修 token 和共享组件。

- 每条发现标一个严重度：`HIGH` 阻断任务、误导用户、隐藏内容或控件；`MEDIUM` 明显损害理解、效率或一致性；`LOW` 局部打磨。同一根因合并为一条，列出全部发生位置。
- 一次审查最多 15 条。
- 附一张"考虑过但否决"（2–5 条）：位置、候选改法、否决理由。项目约定故意如此、证据不足、改了只增加复杂度都是正当否决理由。
- 验证分两栏：已验证（写出命令或操作与观察结果）和未验证（写出原因）。
- 结论只能是三中之一：有 `HIGH` 则 `Block`；只剩 `MEDIUM`/`LOW` 则 `Needs changes`；无待办且覆盖已验证才是 `Approve`。
- 审查默认只读。

## 完成标准

「开始前」的 input mode 与 density profile 已落地；从「密度与控件尺寸」到「动效实现纪律」每节的每条规则都已对照目标界面逐一核对，触及的 token 与共享组件已修而非逐实例打补丁；「无障碍与验证」已在真实设备与负载下跑完并写出观察结果。任一节未核对完，任务未完成。
