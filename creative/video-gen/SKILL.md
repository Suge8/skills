---
name: video-gen
description: 生成带音轨的 MP4 短视频，双后端：Grok Build 订阅（免费）或 Seedance API（按量付费）。用于用户要生成视频、短片、宣传片段、动态分镜时；生成静态图片用 gpt-image。
---

# Video Gen

两个后端，各自独立脚本，成功都打印 `{"ok":true,"paths":[...]}`，失败打印 `{"ok":false,"error":...}` 且退出码 1。

## Grok（默认，订阅内免费）

需要本机 `grok` CLI 已登录。参数全部用自然语言写进 prompt：比例（`9:16 竖版`）、时长（`6秒`）、音频（`带环境音`）、风格。

```bash
python3 /Users/sugeh/.agents/skills/creative/video-gen/scripts/grok_video.py \
  "VIDEO_PROMPT" --out "/absolute/path/output.mp4"
```

生成约 1-3 分钟，默认超时 900s（`--timeout` 可调，调用方 bash timeout 必须更大）。多镜头输出 `output-1.mp4` 等。多条视频串行生成，不要并发。

## Seedance（API 按量付费，用户明确要求时用）

需要 `~/.config/video-gen/seedance.json`（`{"url":...,"key":...}`）。参数用 flag 传：

```bash
python3 /Users/sugeh/.agents/skills/creative/video-gen/scripts/seedance_video.py \
  "VIDEO_PROMPT" --out "/absolute/path/output.mp4" \
  --duration 5 --resolution 480p --ratio 9:16
```

- `--model`：`seedance-2.0-mini`（最便宜，默认）/ `seedance-2.0-fast` / `seedance-2.0`
- `--duration`：4-15 秒整数，默认 5
- `--resolution`：`480p`（默认，最省）/ `720p` / `1080p`
- `--ratio`：`16:9`（默认）/ `9:16` / `1:1` / `adaptive`
- `--no-audio`：默认带 AI 配音/音效，加此 flag 省掉
- 按量计费：默认 mini + 480p + 5 秒已是最省组合，用户要求高质量再升 `--resolution 720p` 或换模型

长 prompt 两个脚本都可 pipe stdin。
