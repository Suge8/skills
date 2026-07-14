---
name: ui-craft
description: 仅用于已有应用 UI 的最终打磨：保留信息架构和设计系统，统一控件尺寸、桌面指针或触屏密度、排版、交互状态和细节动效，包括 Popover、Dialog、Toast。新页面或整体重设计用 impeccable。
---

# UI Craft

打磨已有产品界面。没有现成设计系统时，使用本文的尺寸与动效默认值；项目已有组件、token 或平台原生规范时，以项目为准。

完整设计、重设计和品牌页面交给 Impeccable；本 Skill 负责尺寸、状态、文案、动效和发布前收口。

## 0. 开始前

1. 读取现有 Button、Input、菜单、Dialog、token 和一个相邻页面。不得脱离项目重设全局尺寸。
2. 判断主要输入：`pointer`、`touch` 或 `hybrid`；再选择一个密度：`compact`、`comfortable` 或 `touch`。
3. 原生桌面应用优先使用 AppKit、SwiftUI、WinUI 等系统控件尺寸；下表主要供 Web、Electron 和自绘界面使用。
4. 同一界面只保留一个默认密度。组件因业务需要例外时，用语义变体，不散落魔法值。
5. 窗口变宽时增加内容、列或面板，不按视口比例放大控件。

## 1. 密度与控件尺寸

| Profile | 典型场景 | Button / Input | Icon button | Row | Label | Icon |
|---|---|---:|---:|---:|---:|---:|
| `compact` | 浏览器插件、桌面工具栏、数据密集工具 | 32px | 28–32px | 28–32px | 13px | 14–16px |
| `comfortable` | 普通桌面应用、设置页、Dialog | 36px | 32–36px | 36–40px | 14px | 16–18px |
| `touch` | 触屏或以触控为主的混合设备 | 44px；Material 用 48dp | 44/48px | 44/48px | 14–16px | 18–20px |

这些值是项目没有设计系统时的默认值，不是覆盖平台规范的命令。

- WCAG 2.2 AA 的指针目标基线是 24×24 CSS px。紧凑桌面的常用操作默认不低于 28px；目标小于 24px 时必须满足 WCAG 的间距或其他例外。
- 触屏目标按平台使用 44pt 或 48dp。可见图形可以更小，但扩展命中区不得与相邻目标重叠。
- 桌面指针界面不得为了模拟触屏而统一添加 40/44px 隐形命中区。
- Button、Input、Select 和相邻分段控件使用同一高度。主 CTA 通过颜色、位置和层级突出，通常不跨密度放大。
- 默认水平 padding：`compact` 10–12px，`comfortable` 12–16px，`touch` 16–20px；图标按钮保持正方形。
- 文字与图标间距 6–8px。不要因按钮含图标就额外放大高度。
- 密度由 token 或组件 variant 控制，例如 `control-height`、`control-padding-x`、`icon-size`；禁止每个组件各写一套尺寸。
- 同心圆角遵循 `outer radius = inner radius + padding`；圆角服务于组件层级，不随控件高度机械取满。

## 2. 排版与间距

| 用途 | `compact` | `comfortable` |
|---|---:|---:|
| 正文 | 13.5–14px | 14–15px |
| 控件、菜单、条目标题 | 13px | 14px |
| 次要说明 | 12–13px | 12.5–13.5px |
| 非关键元信息 | 11.5–12px | 12px |

- 关键标签、状态和操作文字不小于 12px。不要用缩小文字补救过大的控件。
- CJK 小字号需要更高行高和实机检查；字重不能靠浏览器抗锯齿开关补救。
- 产品 UI 使用固定字号阶梯，不随视口流式缩放。长正文行长控制在 65–75ch。
- 使用 4px 基础间距尺度；2、6、10px 只用于图标或光学校准。相关内容紧，分组之间松。
- 标题用 `text-wrap: balance`，长正文用 `text-wrap: pretty`。
- 几何居中看起来偏移时才做光学校准，并记录在共享组件，不逐实例修补。

## 3. 视觉层级

- 先用间距和对齐分组。数据表、设置组、可调整面板等需要明确边界时，允许使用 1px 低对比分割线；不得无条件删除或添加分割线。
- Card 只包裹真正独立、可操作的内容，禁止嵌套 Card。Card 大小不得反向决定全局控件尺寸。
- 阴影使用一套低透明层级；表面色或描边足以表达层级时不用阴影。禁止直接堆默认 `shadow-lg/xl`。
- 图片需要边界时加 1px 低透明描边；颜色应适配当前表面，不固定冷暖倾向。
- 动态数字使用 `tabular-nums`。
- Empty state 先解释状态和下一步。品牌插画、呼吸动画只在产品语气支持时使用，不作为默认模板。
- Sticky 操作只用于高频、跨长列表仍需可见的动作；确认不会遮挡内容、键盘焦点或小窗口视口。

## 4. 文案与交互语义

- 标签使用名词短语或明确动词；描述类短文案不加尾句号，完整错误句可以保留句号。
- 删除用户已知的上下文、重复主语和无意义眉题。分组标题必须弱于条目。
- 中英文案保持语义、阈值和数量一致；关键措辞用测试锁定。
- 每个交互组件都实现适用的 default、hover、focus-visible、active、disabled、loading、error 和 success 状态。清晰反馈是必需的，复杂动画不是。
- Web 自定义控件和项目约定使用 `cursor: pointer`；原生桌面控件遵循平台行为，不全局覆盖 cursor。
- 点击当前 tab、当前选项等幂等目标不得刷新视图或重播进场动画。
- Disabled 优先使用原生 `disabled`。需要保留焦点以解释原因时使用 `aria-disabled` 并拦截动作；不要用 `pointer-events: none` 掩盖语义。
- `:focus-visible` 必须清晰，并与鼠标状态同等完整。
- 有选中项的列表打开时让当前项进入可视区，不重排数据；用 `aria-current`、`aria-selected` 等语义表达状态。
- Chat、日志和时间线打开时可跟随最新内容；用户离开底部后暂停，回到底部恢复。阈值由行高或 token 决定，使用事件和 observer，禁止轮询。
- 复制按钮只在复制是高频任务时常驻；否则在 hover、focus-within 或上下文菜单中出现，并保证键盘可达。

## 5. 默认动效语言

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

- 默认反馈使用颜色、opacity、轻微位移等 120–180ms 过渡。标志性动效使用 280–700ms，但只能出现在少数高意图组件。
- Motion 必须表达状态、层级、方向或操作结果。静态内容不因“需要高级感”而自动入场。
- Enter 与 exit 成对设计；exit 通常为 enter 时长的 70–80%，距离更短。
- 动画必须可中断、可逆，不排队。异步状态由事件、Promise、transitionend 或 observer 驱动。
- 默认只动画 transform 和 opacity。Blur、filter、mask、阴影动画需经过性能验证。
- `prefers-reduced-motion: reduce` 下移除位移、缩放、重绘和 stagger，保留即时状态变化。

## 6. 进出场配方

| 组件 | Enter | Exit |
|---|---|---|
| 行内区块、列表项 | 120–160ms，opacity + `translateY(2–4px)` | 100–120ms，短位移淡出 |
| Popover / Dropdown | 140–180ms，从触发方向位移 4–6px，`scale(.98→1)` | 100–130ms 反向收起 |
| Dialog | 180–220ms，opacity + `translateY(8px)` + `scale(.98→1)` | 140–170ms，位移 4px |
| Toast | 180–220ms，从堆叠方向进入 | 130–160ms 淡出，剩余项 180ms 重排 |
| 视图切换 | 180–240ms，方向与导航关系一致 | 140–180ms |

- Blur 不是默认入场属性；只有视觉语言明确需要且实测流畅时添加。
- Stagger 间隔 30–50ms，最多 6 个语义块；长列表只动画新增或可见项。
- 首屏默认可见，不误播路由或交互动效。条件区块收起时同步处理 `inert` 和焦点。
- 桌面文字按钮按下优先使用颜色或 `translateY(1px)`；需要缩放时用约 `.98`，不得全局固定 `.96`。

## 7. Icon 动效库

| Motif | 参数 | 用途 |
|---|---|---|
| 位移 | 140–180ms，2–3px | 箭头、发送、外链等有方向的动作 |
| 旋转 | 160–200ms，45–90° | 展开、刷新、设置等状态变化 |
| Cross-fade | 160–220ms，opacity + `scale(.8→1)` | 播放/暂停、复制/完成、展开/收起 |
| Wiggle / Pop | 280–360ms，一次 | 收藏、固定、删除确认等少量强调 |
| Draw 重绘 | 450–700ms，一次 | 内容型或品牌化图标的标志性反馈 |

简单 hover 反馈是默认；Wiggle、Pop 和 Draw 由组件语义或产品动效语言显式启用，不分配给每个图标。

### Draw 规范

多笔画 SVG 不得硬编码像素级 `stroke-dasharray`。先给每条可绘制笔画设置 `pathLength="1"`，再使用：

```css
[data-draw] path {
  stroke-dasharray: 1 1;
  stroke-dashoffset: 1;
}
[data-draw][data-active] path {
  stroke-dashoffset: 0;
}
```

- 在组件初始化时归一化 SVG；未归一化的图标保持静态，不在 pointerover 时临时改 DOM。
- 重绘完成后的终态必须等于静态图标，避免动画结束跳变。
- Pointer leave 不反向“擦除”图标；恢复静态状态即可。状态切换需要可逆时使用 Cross-fade。
- 触发器使用专属 `data-*` 属性，不用通用 `.group:hover`，防止外层 hover 误触发。

## 8. 动效实现纪律

- 优先使用项目已有 motion、GSAP 或 CSS；不为单个微动效新增依赖。
- 禁止 `transition: all`。只声明实际变化的属性。
- `will-change` 只在性能测量证明有收益时使用，并在动画后释放。
- Tailwind v4 的独立 translate、scale、rotate 属性可能被 keyframe 的 `transform` 覆盖；组合前检查最终 computed style。
- One-shot 动画结束后回到静态样式。使用 `fill-mode: both` 时，终态必须与组件状态一致。
- Toast 全应用共用一个 Stack；tone、图标和颜色映射只有一处事实源。
- 列表新增可用轻量 enter，删除后用 FLIP 重排；高频流式更新不逐项播放复杂动画。

## 9. 无障碍与验证

- 验收基线是 WCAG 2.2 AA；优先使用 button、input、nav、dialog 等语义元素，复杂组件遵循 WAI-ARIA APG。
- ARIA 属性必须配套键盘、焦点和状态行为。
- 自动检查之外，使用纯键盘走完整路径，并在实际 pointer 与 touch 设备上验证对应 profile。
- 用浏览器或应用截图比较相邻组件的高度、基线、图标和密度；不能只看 token 数值。
- 动效验证包含快速重复操作、中途反向、低性能设备和 reduced-motion。

## 审查输出

按发现的问题分组输出 Before / After；没有证据的问题不列。优先修 token 和共享组件，不逐实例打补丁。

- [ ] 已读取现有设计系统，并明确 input mode 与 density profile
- [ ] Button、Input、Select 高度一致；桌面未套用触屏命中区；触屏达到 44/48
- [ ] 字号、图标、padding 和 row height 来自同一密度 token
- [ ] 分割线、Card、Sticky、Empty state 都由内容语义决定，没有插件模板外溢
- [ ] 每个控件状态完整；幂等操作、列表定位、Chat 跟随使用事件驱动
- [ ] 默认反馈克制；Enter/Exit 成对；标志性 Draw/Wiggle/Pop 只用于明确组件
- [ ] 无 `transition: all`、动画终态跳变、通用 `.group:hover` 污染或强制 `.96` 缩放
- [ ] Focus、键盘、目标尺寸、reduced-motion 和性能验证通过
