# 截图管线（原始截图 → HTML 合成 → 平台成图）

## 按项目类型取原始截图

| 项目类型 | 工具 | 要点 |
|---|---|---|
| Web | browser-dev | 设精确视口 + 2x deviceScaleFactor 直出高清；亮/暗两套 |
| 浏览器扩展 | Playwright `launchPersistentContext` + `--load-extension` | popup/sidepanel 都有 URL 可直接开页截图 |
| 桌面 app | 原生 `screencapture -l <窗口ID>` | 先把窗口 set 到目标尺寸再截；带系统圆角阴影版直接用，进 HTML 合成用 `-o` 去阴影版 |
| CLI / TUI | `freeze --execute "<命令>"` 或 freeze 截取输出 | 直出带窗口 chrome 的精美 SVG/PNG |

桌面窗口两条命令：

```bash
osascript -e 'tell app "System Events" to set size of window 1 of process "CuePad" to {1280, 800}'
screencapture -o -l $(osascript -e 'tell app "CuePad" to id of window 1') raw.png
# AppleScript 拿不到 id 时兜底：python3 -c 用 Quartz CGWindowListCopyWindowInfo 按 app 名找 kCGWindowNumber
```

**原始截图纪律**：真实感数据（有内容的会话/列表，不是空状态和 lorem）；界面收拾干净（关无关弹窗、满电池心态）；同一批物料用同一套数据保持连贯。

## HTML 合成管线（从"能看"到"能宣传"的关键一步）

写一个本地临时 HTML：目标平台精确尺寸的画布 + 背景（VISUAL 链 B 的底图，或 CSS 渐变）+ 截图（圆角 + 阴影 + 可选轻微透视）+ 标题文案（copywriting 出、stop-slop 过、DESIGN.md 的字体色板）→ browser-dev 按画布尺寸整屏截图 → 成图。

要点：截图放 2x 源图缩小显示才锐利；文案层级最多两级（大标题 + 一行副题）；构图留呼吸感，宁空勿挤。

## 平台尺寸表（成图必须精确匹配）

| 目标 | 尺寸 | 备注 |
|---|---|---|
| GitHub social preview | 1280×640 | 仓库 Settings 上传 |
| OG / Twitter card | 1200×630 | 官网 meta 用 |
| README hero | 2400×1260 出图 | 显示 1200 宽，2x 防糊 |
| Chrome Web Store 截图 | 1280×800 | 备 640×400 小版 |
| Chrome Web Store 宣传图 | 440×280 | 小而精，单焦点 |
| Product Hunt gallery | 1270×760 | 首图决定点击率 |
| App Store (macOS) | 2880×1800 | 桌面 app 上架用 |
| 社媒方图 | 1080×1080 | 通用 |

与 better-test 的取证截图区分：那边求快求真，这边求美——别混用产物。
