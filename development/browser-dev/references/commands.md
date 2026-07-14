# Browser Dev 命令速查

所有命令用 wrapper：`./bin/browser-dev <command>`（或 skill 内绝对路径）。
命令随 agent-browser 版本变化，报错或参数不确定时读 `agent-browser skills get core --full`。

## 目录

- [诊断 / 启动](#诊断--启动)
- [打开 / Tab](#打开--tab)
- [读页面](#读页面)
- [报错 / 请求](#报错--请求)
- [操作](#操作)
- [语义定位](#语义定位)
- [坐标 fallback](#坐标-fallback)
- [等待](#等待)
- [局部读取](#局部读取)
- [开发专项](#开发专项)
- [React 调试](#react-调试)
- [高性能 batch](#高性能-batch)

## 诊断 / 启动

默认启动无头专属 Helium（1440x900）；已有 `9333` CDP 时直接复用，不切换模式。

```bash
./bin/browser-dev doctor          # 只读检查，不启动浏览器
./bin/browser-dev doctor --start  # 显式启动后检查
BROWSER_DEV_HEADED=1 ./bin/browser-dev-start  # 需要可见窗口时（看流程/验证码/反爬）
```

## 打开 / Tab

```bash
./bin/browser-dev tab
./bin/browser-dev tab new http://localhost:3000
./bin/browser-dev open http://localhost:3000
./bin/browser-dev reload
./bin/browser-dev back
./bin/browser-dev forward
```

## 读页面

```bash
./bin/browser-dev snapshot -i -c
./bin/browser-dev snapshot -c
./bin/browser-dev snapshot -s "#main" -i -c
./bin/browser-dev screenshot --annotate
```

## 报错 / 请求

```bash
./bin/browser-dev errors
./bin/browser-dev console
./bin/browser-dev network requests
./bin/browser-dev network requests --type xhr,fetch
./bin/browser-dev network requests --status 400-499
./bin/browser-dev network requests --status 500-599
./bin/browser-dev network requests --filter api
```

## 操作

```bash
./bin/browser-dev click @e2
./bin/browser-dev dblclick @e2
./bin/browser-dev fill @e3 "hello"
./bin/browser-dev type @e3 "hello"
./bin/browser-dev keyboard type "hello"
./bin/browser-dev press Enter
./bin/browser-dev focus @e3
./bin/browser-dev select @e4 "value"
./bin/browser-dev check @e5
./bin/browser-dev hover @e6
./bin/browser-dev drag @e7 @e8
./bin/browser-dev upload @e9 ./file.png
./bin/browser-dev download @e10 ./downloaded.zip
./bin/browser-dev scroll down 400
./bin/browser-dev scrollintoview @e8
```

## 语义定位

ref 不够时用：

```bash
./bin/browser-dev find role button click --name "Submit"
./bin/browser-dev find label "Email" fill "test@example.com"
./bin/browser-dev find text "Sign In" click
```

## 坐标 fallback

语义 ref 失效、canvas/shadow/复杂 iframe 难以定位时，先截图标注和读取盒模型，再用 mouse 坐标兜底；必要时参考 raw CDP 的 target/frame 思路手动拆解。

```bash
./bin/browser-dev screenshot --annotate
./bin/browser-dev get box @e5
./bin/browser-dev mouse move 100 200
./bin/browser-dev mouse down left
./bin/browser-dev mouse up left
```

## 等待

```bash
./bin/browser-dev wait --load networkidle
./bin/browser-dev wait --text "Welcome"
./bin/browser-dev wait --url "**/dashboard"
./bin/browser-dev wait "#app"
./bin/browser-dev wait --fn "window.__READY__ === true"
```

## 局部读取

```bash
./bin/browser-dev get url
./bin/browser-dev get title
./bin/browser-dev get text @e1
./bin/browser-dev get html @e1
./bin/browser-dev get value @e3
./bin/browser-dev get attr @e4 href
./bin/browser-dev get count ".item"
./bin/browser-dev get box @e5
./bin/browser-dev get styles @e5
./bin/browser-dev is visible @e2
./bin/browser-dev is enabled @e2
./bin/browser-dev is checked @e2
```

## 开发专项

```bash
./bin/browser-dev set viewport 1440 900
./bin/browser-dev set media dark
./bin/browser-dev set offline on
./bin/browser-dev pushstate /dashboard
./bin/browser-dev vitals http://localhost:3000 --json
./bin/browser-dev diff snapshot
./bin/browser-dev diff screenshot --baseline
./bin/browser-dev trace start
./bin/browser-dev trace stop ./trace.json
./bin/browser-dev profiler start
./bin/browser-dev profiler stop ./profile.cpuprofile
./bin/browser-dev inspect
./bin/browser-dev highlight @e2
./bin/browser-dev clipboard read
```

## React 调试

需要组件树/重渲染证据时才启用：

```bash
./bin/browser-dev open --enable react-devtools http://localhost:3000
./bin/browser-dev react tree
./bin/browser-dev react renders start
./bin/browser-dev react renders stop --json
```

## 高性能 batch

优先把无依赖查询合并成一次调用；依赖 `@eN` ref 的步骤不要提前 batch。

```bash
./bin/browser-dev batch "snapshot -i -c" "errors" "network requests --type xhr,fetch"
./bin/browser-dev batch "open http://localhost:3000" "wait --load networkidle" "snapshot -i -c" "errors"
```
