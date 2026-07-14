---
name: impeccable
description: "用于前端界面设计、重设计、评审、审计、打磨和实现，覆盖网站、落地页、产品 UI、Dashboard、表单、空状态、响应式、无障碍、性能、排版、配色、动效、UX 文案和设计系统。不用于纯后端或非 UI 任务。"
version: 3.9.1
license: Apache 2.0
---

# Impeccable

设计并迭代可交付的前端界面：真实可运行的代码、明确的设计选择和完整验证。

## 本地约束

- 这是唯一入口。命令只是路由，不得生成独立 Skill。
- 不安装或启用 Pin、Hooks、Provider 副本、子 Agent，也不运行 `npx impeccable install/update`。
- 更新由 `~/.agents` 的受控更新流程完成，不在会话启动时联网检查。
- 项目上下文默认写入 `docs/PRODUCT.md` 和 `docs/DESIGN.md`；兼容读取根目录和 `.agents/context/` 中的旧文件，但同一事实不得保留两份。
- 文中相对路径均以本 Skill 目录 `/Users/sugeh/.agents/skills/frontend/impeccable` 为基准。

## 开始前

1. 每个会话运行一次：

   ```bash
   node /Users/sugeh/.agents/skills/frontend/impeccable/scripts/context.mjs
   ```

   若请求指向 monorepo 中的文件、路由或应用，推断具体路径并追加 `--target <path>`。本对话已读过输出时不得重跑。
2. 若输出 `NO_PRODUCT_MD`：
   - 从零创建、`craft` 或 `shape` 任务，先读取 `reference/init.md`。
   - 已有界面的局部修改、评审、审计或打磨，直接以现有代码为上下文继续；只在完成后建议用户按需初始化文档，不得阻塞当前任务。
3. 用户调用命令（如 `craft`、`audit`、`polish`）时，必须读取对应的 `reference/<command>.md`。
4. 熟悉项目现有设计系统和组件。至少读取一个 CSS、token、theme、代表性组件或页面文件。已有系统可用时沿用，只有 UX 明确受益时才偏离。
5. 读取匹配的 register 参考：营销、落地页、Campaign、长内容、Portfolio 读 `reference/brand.md`；应用、后台、Dashboard、工具读 `reference/product.md`。按任务表述、当前页面、PRODUCT.md 的顺序判断。
6. 全新项目且没有现有品牌颜色时，运行：

   ```bash
   node /Users/sugeh/.agents/skills/frontend/impeccable/scripts/palette.mjs
   ```

   用返回的品牌种子色组织 bg、surface、ink、accent、muted，并统一使用 OKLCH。已有品牌 token 时不得重选。

## 设计标准

产出可直接发布的代码，不交付原型或起点。除非用户要求，不走捷径；不确定就问。完成标准是美观、响应式、快速、准确、无明显缺陷并符合品牌。每个页面、区段或组件都要用现有浏览器、截图或 Computer Use 工具验证。

### 颜色

- 验证对比度。正文与背景至少 4.5:1；大字（≥18px，或粗体 ≥14px）至少 3:1。Placeholder 同样需要 4.5:1。
- 彩色背景上的灰字容易发灰；改用背景同色相的深色阶，或正文颜色的透明版本。

### 排版

- 正文行长控制在 65–75ch。
- 不搭配两个相似但不同的字体；沿对比轴搭配（serif + sans、geometric + humanist），或使用同一字体的不同字重。
- Hero / Display 标题的 `clamp()` 上限不超过 6rem（约 96px）。
- Display 字距不得小于 -0.04em。
- h1–h3 使用 `text-wrap: balance`；长正文使用 `text-wrap: pretty`。

### 布局

- 用有变化的间距建立节奏。
- Card 只有在它确实是最佳交互形式时才使用；禁止嵌套 Card。
- 一维布局用 Flexbox，二维布局用 Grid；`flex-wrap` 更简单时不要默认 Grid。
- 无断点响应式 Grid 使用 `repeat(auto-fit, minmax(280px, 1fr))`。
- 建立语义化 z-index：dropdown → sticky → modal-backdrop → modal → toast → tooltip；禁止 999、9999 等任意值。

### 动效

- 动效必须表达层级、反馈、状态变化或叙事，不能事后装饰。
- 除非必要，不动画 CSS 布局属性。
- 使用 ease-out-quart / quint / expo 等指数缓出；不用 bounce 或 elastic。
- 高级动效使用项目已有的 motion、GSAP、anime.js、lenis 等库。
- 每个动画都必须提供 `prefers-reduced-motion: reduce` 替代。
- 同一列表内可以 stagger；禁止给每个区段套相同入场动画。
- Reveal 只能增强默认可见内容，不得依赖 class 触发才显示正文。
- Blur、backdrop-filter、clip-path、mask、shadow/glow 仅在改善效果且保持流畅时使用。

### 交互

- `overflow: hidden/auto` 容器中的绝对定位 Dropdown 会被裁切；使用原生 `<dialog>`、Popover API、`position: fixed` 或 Portal。

## 仅适用于全新项目

### 颜色与主题

- 使用 OKLCH。
- 奶油色、沙色、米色近白背景是饱和的 AI 默认。除非品牌明确要求，不要把“温暖、传统、编辑感”直接翻译成暖调近白背景。选择饱和品牌底色、chroma 0 的真正 off-white，或明显属于品牌的中深色 neutral。
- Neutral 只向品牌色相增加 0.005–0.015 chroma，不因“感觉温暖/冷静”而统一偏暖或偏冷。
- 深色或浅色都不是默认。先写清谁在什么环境和光线下使用；场景无法决定主题时，说明还不够具体。
- 先选配色策略：
  - **Restrained**：tinted neutral + 一个占比 ≤10% 的强调色。
  - **Committed**：一个饱和色承载 30–60% 的表面。
  - **Full palette**：3–4 个职责明确的颜色。
  - **Drenched**：表面本身就是颜色。

## 绝对禁止

命中下列模式时直接换结构：

- Card、列表项、Callout 或 Alert 上大于 1px 的彩色侧边条。
- `background-clip: text` 渐变文字。
- 把 Glassmorphism 当默认装饰。
- “大数字 + 小标签 + 辅助统计 + 渐变强调”的 Hero Metric 模板。
- 无限重复的等尺寸“图标 + 标题 + 文案”Card Grid。
- 每个区段标题上方都有小号大写宽字距 Eyebrow。
- 把 `01 / 02 / 03` 当所有区段的默认骨架；只有真实有序流程才使用编号。
- 标题在任一断点溢出容器。

## AI 痕迹检查

如果用户能一眼判断“这是 AI 做的”，设计就失败了。除检查上述禁用项，还要检查两层惯性：

- **第一层**：只看产品类别就能猜中主题和配色。重写使用场景和配色策略。
- **第二层**：看“类别 + 反例”仍能猜中审美家族。继续调整，直到结果不再是训练数据中的明显默认。Brand 任务同时读取 `reference/brand.md` 的高饱和审美家族清单。

## 命令

| 命令 | 用途 | 参考文件 |
|---|---|---|
| `craft [feature]` | 先确定方向，再端到端实现并视觉迭代 | `reference/craft.md` |
| `shape [feature]` | 写代码前规划 UX/UI | `reference/shape.md` |
| `init` | 建立 `docs/PRODUCT.md`、`docs/DESIGN.md` 和项目上下文 | `reference/init.md` |
| `document` | 从现有代码生成 `docs/DESIGN.md` | `reference/document.md` |
| `extract [target]` | 提取复用组件和 Design Token | `reference/extract.md` |
| `critique [target]` | 带启发式评分的 UX 评审 | `reference/critique.md` |
| `audit [target]` | 检查无障碍、性能和响应式 | `reference/audit.md` |
| `polish [target]` | 发布前质量收口 | `reference/polish.md` |
| `bolder [target]` | 放大过于保守或平淡的设计 | `reference/bolder.md` |
| `quieter [target]` | 降低过度刺激的设计 | `reference/quieter.md` |
| `distill [target]` | 去除复杂度，保留本质 | `reference/distill.md` |
| `harden [target]` | 补齐错误、i18n 和边界情况 | `reference/harden.md` |
| `onboard [target]` | 设计首次使用、空状态和激活流程 | `reference/onboard.md` |
| `animate [target]` | 添加有目的的动效 | `reference/animate.md` |
| `colorize [target]` | 为单调界面建立配色 | `reference/colorize.md` |
| `typeset [target]` | 改进字体和排版层级 | `reference/typeset.md` |
| `layout [target]` | 修正间距、节奏和视觉层级 | `reference/layout.md` |
| `delight [target]` | 添加克制且有记忆点的细节 | `reference/delight.md` |
| `overdrive [target]` | 在需求明确时突破常规视觉限制 | `reference/overdrive.md` |
| `clarify [target]` | 改进 UX 文案、标签和错误信息 | `reference/clarify.md` |
| `adapt [target]` | 适配不同设备和屏幕 | `reference/adapt.md` |
| `optimize [target]` | 诊断并修复 UI 性能 | `reference/optimize.md` |
| `live` | 在浏览器中选择元素并生成视觉变体 | `reference/live.md` |

## 路由规则

1. 用户只说 `impeccable`：若已有 PRODUCT.md，运行一次：

   ```bash
   node /Users/sugeh/.agents/skills/frontend/impeccable/scripts/context-signals.mjs
   ```

   根据真实信号推荐 2–3 个价值最高的下一步，再给命令菜单；不得自动执行建议。若缺 PRODUCT.md，新项目优先建议 `init`，已有项目按当前代码继续。
2. 首词命中命令：读取对应参考并执行，后续文本作为目标。
3. 意图明确映射到命令（如“修间距”→`layout`，“文案不清楚”→`clarify`）：按该命令执行；两个命令都合理时只问一个选择问题。
4. 无明确命令：按通用设计任务执行开始前步骤、全局规则和 register 参考。

推荐时使用这些信号：

- 有代码但无 DESIGN.md：建议 `document`。
- 从未评审：建议对具体页面执行 `critique`。
- 最近评审分数低或存在 P0/P1：建议 `polish`；快照过期则重跑 `critique`。
- Git 改动集中在一个界面：将 `audit` 或 `polish` 限定到这些文件。
- Dev Server 正在运行：可以建议 `live`，否则不优先推荐。
- `scan.targets` 非空时，可运行：

  ```bash
  node /Users/sugeh/.agents/skills/frontend/impeccable/scripts/detect.mjs --json <targets...>
  ```

  Detector 只扫描本地文件。失败或项目过大时跳过，不得阻塞任务。

`teach` 是 `init` 的旧别名。`craft` 会先执行 `shape`；完成初始化和方向确认后再恢复原任务。
