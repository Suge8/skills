# HTML 报告格式

架构评审渲染为一个自包含 HTML 文件，放在操作系统临时目录中。Tailwind 和 Mermaid 都来自 CDN。Mermaid 能可靠处理图结构图表；手写 div 和内联 SVG 处理更偏编辑化的视觉表达（质量图、剖面图）。两者混用，不要所有东西都依赖 Mermaid，否则会开始显得通用。

## 头部脚手架

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <title>架构评审 — {{仓库名}}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script type="module">
      import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
      mermaid.initialize({ startOnLoad: true, theme: "neutral", securityLevel: "loose" });
    </script>
    <style>
      /* 小型自定义层，用于 Tailwind 无法干净覆盖的东西：
         虚线接缝、手绘感箭头头部等。 */
      .seam { stroke-dasharray: 4 4; }
      .leak { stroke: #dc2626; }
      .deep { background: linear-gradient(135deg, #0f172a, #1e293b); }
    </style>
  </head>
  <body class="bg-stone-50 text-slate-900 font-sans">
    <main class="max-w-5xl mx-auto px-6 py-12 space-y-12">
      <header>...</header>
      <section id="candidates" class="space-y-10">...</section>
      <section id="top-recommendation">...</section>
    </main>
  </body>
</html>
```

## 页眉

仓库名、日期和一个紧凑图例：实线框 = 模块，虚线 = 接缝，红箭头 = 泄漏，粗深色框 = 深模块。不要介绍段落，直接进入候选项。

## 候选卡片

图承担主要表达。文字稀疏、直白，并自然使用术语表中的词（[LANGUAGE.md](LANGUAGE.md)）。

每个候选是一个 `<article>`：

- **标题**，短标题，命名这次加深（例如 “折叠 Order intake pipeline”）。
- **徽章行**，推荐强度（`强` = emerald，`值得探索` = amber，`推测性` = slate），加上依赖类别标签（`进程内`、`本地可替换`、`端口与适配器`、`mock`）。
- **文件**，等宽列表，`font-mono text-sm`。
- **前后对比图**，核心内容。两列并排。见下面的模式。
- **问题**，一句话。哪里痛。
- **方案**，一句话。改什么。
- **收益**，bullet，每条 ≤6 个词。例如 “测试命中一个接口”、“Pricing 逻辑不再泄漏”、“删除 4 个浅模块”。
- **ADR 提示**（如果适用），amber tint box 中一行。

不要写成段解释。如果图还需要一段文字才能看懂，重画图。

## 图表模式

选择适合 candidate 的模式。混合使用。不要让每张图都长一样，多样性就是重点之一。

### Mermaid graph（依赖 / 调用流的主力）

当重点是“X 调 Y 调 Z，看这一团有多乱”时，使用 Mermaid `flowchart` 或 `graph`。用 Tailwind 风格卡片包住它，避免看起来像空降。用 classDef 把泄漏边标红，把深模块标深色。Sequence diagrams 很适合表达 “before: 6 round-trips; after: 1.”。

```html
<div class="rounded-lg border border-slate-200 bg-white p-4">
  <pre class="mermaid">
    flowchart LR
      A[OrderHandler] --> B[OrderValidator]
      B --> C[OrderRepo]
      C -.leak.-> D[PricingClient]
      classDef leak stroke:#dc2626,stroke-width:2px;
      class C,D leak
  </pre>
</div>
```

### 手写 boxes-and-arrows（当 Mermaid layout 和你打架时）

把模块画成带边框和 label 的 `<div>`。箭头用内联 SVG `<line>` 或 `<path>`，absolute 定位在 relative container 上。当你想让 “after” 图像一个粗边框深模块、内部结构灰掉时，用这个模式，Mermaid 无法渲染出正确权重。

### 剖面图（适合展示层层浅薄）

堆叠水平带（`h-12 border-l-4`）展示一次调用穿过的层。之前：6 层薄层，每层几乎什么都不做。之后：1 个厚带，标注合并后的职责。

### 质量图（适合 “接口几乎和实现一样宽”）

每个模块两个矩形，一个表示接口表面积，一个表示实现。之前：接口矩形几乎和实现矩形一样高（浅）。之后：接口矩形短，实现矩形高（深）。

### 调用图折叠

之前：把函数调用树渲染成嵌套框。之后：同一棵树折叠成一个框，现已内部化的调用用淡化方式显示在里面。

## 样式指导

- 偏编辑化，不要 corporate-dashboard。留足空白。标题可选 serif（`font-serif` 配 stone/slate 很好）。
- 克制用色：一个 accent（emerald 或 indigo），红色用于泄漏，amber 用于 warnings。
- 图保持约 320px 高，让 before/after 能舒服并排，不需要滚动。
- 图中模块 label 使用 `text-xs uppercase tracking-wider`，它们应该读起来像 schematic，不像 UI。
- 唯一 scripts 是 Tailwind CDN 和 Mermaid ESM import。除此之外报告是静态的，不要 app code，不要 Mermaid 自身渲染以外的交互。

## 首要推荐小节

一个更大的卡片。候选名称，一句话说明为什么，链接到它的卡片。就这些。

## 语气

直白中文，简洁，但架构名词和动词必须直接来自 [LANGUAGE.md](LANGUAGE.md)。简洁不是术语漂移的借口。

**精确使用：** 模块、接口、实现、深度、深、浅、接缝、适配器、杠杆收益、局部性。

**绝不替换为：** 组件、服务、单元（指模块时） · API、签名（指接口时） · 边界（指接缝时） · 层、包装器（当你指的是模块时）。

**符合风格的表述：**

- “Order intake 模块很浅，接口几乎等同于实现。”
- “Pricing 泄漏穿过接缝。”
- “加深：一个接口，一个测试位置。”
- “两个适配器证明接缝合理：生产用 HTTP，测试用内存。”

**收益 bullets** 用术语表里的词命名收益：*“局部性：缺陷集中在一个模块”*，*“杠杆收益：一个接口，N 个调用点”*，*“接口收缩；实现吸收包装器”*。不要写 *“更容易维护”* 或 *“更干净的代码”*，这些词不在 [LANGUAGE.md](LANGUAGE.md) 里，也没发挥价值。

不要 hedge，不要清嗓子，不要写 “值得注意的是……”。如果一句话能变成 bullet，就变成 bullet。如果一个 bullet 可以删，就删掉。如果一个术语不在 [LANGUAGE.md](LANGUAGE.md)，先找已有术语，再创造新词。
