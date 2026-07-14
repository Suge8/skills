---
name: computer-use
description: "使用 Orca `orca computer` 读取和操控本机桌面应用：窗口、可访问控件、截图、点击、输入、滚动和拖拽。仅在用户明确要求操作桌面 UI 或指定 Orca Computer Use 时触发；普通网页调试优先 browser-dev，终端与文件任务不用。"
---

# 计算机操作

通过 `orca computer` 使用本 Skill 操作桌面 UI。当目标是网站或 Web 应用时，操作承载该页面的桌面浏览器应用或窗口。

## 前置条件

- 优先使用 `orca computer ...`；Linux 上若找不到 `orca`，则使用 `orca-ide computer ...`。仅在此 Orca 工作树中测试本地开发运行时时，使用 `./config/scripts/orca-dev computer ...`。
- 优先使用 `--json`。截图字节不会写入 JSON，而是保存到 `screenshot.path`。
- 除非用户明确要求，否则不得推送、提交表单、发送消息、购买商品、删除数据、更改账户设置或泄露密钥。
- 若应用包含敏感内容，只读取用户要求的部分。

```bash
orca status --json
orca computer capabilities --json
```

## 核心循环

```bash
orca computer list-apps --json
orca computer get-app-state --app com.spotify.client --json
orca computer click --app com.spotify.client --element-index 42 --json
```

每次操作后，使用其返回的新状态选择下一个元素索引。元素索引是树中的数字标签；过滤嘈杂区段时，索引可能不连续，因此不得根据 `elementCount` 或 "Visible elements." 推断有效索引。元素索引有效期很短；等待、导航、焦点变化、滚动、窗口变化或应用重新渲染后，索引都可能失效。

在 `--json` 输出中，从 `result.snapshot.treeText` 读取无障碍树和可操作索引。`elementCount` 只表示数量，不得用于推断索引。

## 应用选择器

优先使用 `list-apps` 返回的 bundle ID；名称无歧义时也可使用。仅当 bundle ID 和名称都无法明确匹配时，才使用 `pid:<number>`。

```bash
orca computer get-app-state --app com.microsoft.edgemac --json
orca computer get-app-state --app Spotify --json
orca computer get-app-state --app pid:12345 --json
```

应用有多个窗口或标题存在歧义时，先运行 `list-windows`。若结果中的 ID 不是 `none`，优先使用 `--window-id <id>`；否则使用 `--window-index <n>`。选定窗口后，在目标窗口发生变化前，`get-app-state` 和后续操作始终传入同一个选择器。

## 命令

```bash
orca computer permissions --json
orca computer capabilities --json
orca computer list-apps --json
orca computer list-windows --app <app> --json
orca computer get-app-state --app <app> --json
orca computer get-app-state --app <app> --restore-window --json
orca computer click --app <app> --element-index <index> --json
orca computer click --app <app> --x 100 --y 100 --json
orca computer perform-secondary-action --app <app> --element-index <index> --action <name> --json
orca computer set-value --app <app> --element-index <index> --value "text" --json
orca computer type-text --app <app> --text "text" --json
orca computer press-key --app <app> --key Return --json
orca computer hotkey --app <app> --key CmdOrCtrl+A --json
orca computer paste-text --app <app> --text "text" --json
orca computer scroll --app <app> (--element-index <index> | --x <x> --y <y>) --direction down --json
orca computer drag --app <app> --from-element-index <index> --to-element-index <index> --json
orca computer drag --app <app> --from-x 100 --from-y 100 --to-x 300 --to-y 300 --json
```

仅在不需要像素信息时使用 `--no-screenshot`。敏感文本使用 `--text-stdin` 或 `--value-stdin`，避免载荷进入 shell 历史记录。在 Linux 和 Windows 上，操作载荷仍会经过一个短期存在的本地操作文件；除非用户明确要求，否则不要发送密钥：

```bash
printf '%s' "$TEXT" | orca computer set-value --app <app> --element-index <index> --value-stdin --json
```

## 操作规则

- 优先使用语义操作：可编辑字段使用 `set-value`，控件使用 `click`；`perform-secondary-action` 只能使用元素列出的操作名称。
- 任何改变 UI 的操作完成后，先使用返回的新状态或重新运行 `get-app-state`，再选择下一个元素索引。
- 仅在字段已获得焦点且确认应用中存在已聚焦的文本接收控件后使用 `type-text`。系统会将合成键盘输入标记为未验证，因此必须检查返回状态，不能假定文本已经写入。
- Return、Escape、Tab 和方向键等单键或导航键使用 `press-key`。`hotkey` 只能发送一组修饰键加一个普通键，例如 `CmdOrCtrl+A` 或 `CmdOrCtrl+Shift+P`；跨平台组合键优先使用 `CmdOrCtrl+...`。
- 部分操作可在后台应用中执行，实际行为取决于应用。若操作成功但 UI 未变化，刷新状态后改用更明确的语义操作，或恢复窗口并使其获得焦点。
- 对暴露值的文本字段优先使用 `set-value`。当 Provider 能读取刷新后的值时，该命令可以报告经过验证的写入结果。
- 坐标以窗口为局部坐标系；只使用同一目标窗口最新截图或状态中的坐标。

## 截图

`get-app-state` 返回无障碍树和截图。使用无障碍树获取索引并执行操作，使用截图做视觉确认。截图失败通常表示窗口被隐藏、最小化、移出屏幕或权限被阻止。

传给 `click`、`scroll` 和 `drag` 的坐标是窗口局部操作坐标。若截图返回的 `scale` 不等于 `1`，操作前按下式转换截图像素：

```text
action_x = screenshot_pixel_x / screenshot.scale
action_y = screenshot_pixel_y / screenshot.scale
```

无障碍树提供元素索引或元素边框时，优先使用它们。仅在检查最新截图的缩放比例和窗口尺寸后，才使用从截图推导的原始坐标。

在 Linux 和 Windows 上，截图可能来自目标窗口边界对应的可见桌面区域。需要可靠像素时，使用 `--restore-window`，防止其他窗口遮挡目标区域；若无法取得焦点，应信任无障碍树，而不是可能被遮挡的像素。

## 应用说明

浏览器：对于 Edge、Chrome、Safari 等浏览器窗口，直接设置地址栏或搜索框的值，再按 Return。不得假定原始键盘输入会进入地址栏。浏览器不在最前方时使用 `--restore-window`。标签页很多时，无障碍树可能只显示当前标签页和 "inactive browser tabs omitted" 标记；这是有意降噪。除非用户要求管理标签页，否则只操作当前页面或地址栏。

对于 Gmail 写信等浏览器内表单，每次操作字段后都要验证当前聚焦的 UI 元素。页面文本字段可能在未转移 DOM 焦点的情况下暴露无障碍操作；如果点击或 `set-value` 没有改变聚焦的接收控件，则从一个已知聚焦字段开始使用 `Tab` / `Shift+Tab`，或使用最新截图中的窗口局部坐标。填写草稿正文时，优先向已确认聚焦的字段执行 `paste-text`，然后检查返回状态再继续。

```bash
orca computer get-app-state --app com.microsoft.edgemac --restore-window --json
orca computer set-value --app com.microsoft.edgemac --element-index <addressBarIndex> --value "test123" --json
orca computer press-key --app com.microsoft.edgemac --key Return --json
```

Spotify：点击播放控件后刷新状态；UI 通常会异步变化。

Slack：无障碍树可能很浅，而截图仍包含有用信息。用户要求时可以读取可见的 Slack UI；发送消息或触发工作流仍需用户明确授权。

## 错误处理

- `app_not_found`：运行 `list-apps`，改用 bundle ID 重试。若目标是 Gmail 等 Web 应用，应选择承载它的桌面浏览器应用或窗口；`orca computer` 的应用选择器指向桌面应用，不是网站名称，因此不得原样重试 `orca computer ... --app Gmail`。
- `app_blocked`：停止；Computer Use 有意阻止了该目标。
- `window_not_found` / `window_stale`：运行 `list-windows`，选择当前有效的选择器，再运行 `get-app-state`。
- `window_not_focused`：使用 `--restore-window` 重试一次。若错误信息说明已经请求恢复窗口，则停止重复恢复，手动将应用移到前台或检查权限。可编辑字段优先使用 `set-value`，并在假定键盘输入生效前检查状态。
- `element_not_found`：索引已失效；重新运行 `get-app-state`。
- `unsupported_capability`：Provider 或桌面环境不支持该操作；改用语义替代方案，或在错误信息指出缺失依赖时安装该依赖。
- `action_not_supported`：检查元素列出的操作，使用其中一个名称重试；适用时也可改用 `click` 或 `set-value`。
- `value_not_settable`：该元素不接受直接写值；先使其获得焦点，且仅在能够检查返回状态时使用键盘输入。
- `element_not_clickable`：元素没有可操作边框；改用有边框的父元素或子元素，或从最新截图中选择窗口局部坐标。
- `invalid_argument`：修正命令参数；不得原样重试同一命令。
- `action_timeout`：重试前先检查当前状态，再使用更简单的语义操作；若状态观察过慢，可使用 `--no-screenshot`。
- `screenshot_failed`：若无障碍树足够，使用 `--no-screenshot`。若错误信息指出 Screen Recording 或截图权限问题，运行 `orca computer permissions --id screenshots --json`。
- `accessibility_error`：运行 `orca computer capabilities --json`。若错误信息指出辅助功能权限问题，运行 `orca computer permissions --id accessibility --json`。
- 无障碍树为空或没有截图：应用可能没有可见窗口、窗口已最小化，或权限尚未授予。
- 权限错误：运行 `orca computer permissions --json`。若错误信息指出某项权限，运行 `orca computer permissions --id accessibility --json` 或 `orca computer permissions --id screenshots --json`，通过设置界面授权后重试。

## 下一步

若尚未检查 Orca 状态，先确认状态，再运行 `orca computer capabilities --json`。对于 Gmail 等网站或 Web 应用，先找到承载该页面的桌面浏览器应用或窗口，再执行 `orca computer get-app-state --app <app> --json` 获取目标应用状态。
