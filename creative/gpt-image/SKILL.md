---
name: gpt-image
description: 用本地 Codex ChatGPT 订阅认证和托管 image_generation 工具生成 PNG 图片。用于用户要生成精美图片，设计感海报等。
disable-model-invocation: true
---

# GPT Image

使用 bundled script。不要读取或打印 tokens。

```bash
python3 /Users/sugeh/.agents/skills/creative/gpt-image/scripts/gpt_image.py \
  "IMAGE_PROMPT" \
  --out "/absolute/path/output.png"
```

脚本读取 `~/.codex/auth.json`，调用带以下内容的 Codex `/responses`：

```json
{"tools":[{"type":"image_generation","output_format":"png"}]}
```

它打印一个 JSON object：

```json
{"ok":true,"path":"/absolute/path/output.png","size":"1254x1254"}
```

如果 prompt 很长，pipe stdin：

```bash
printf '%s' "$PROMPT" | python3 /Users/sugeh/.agents/skills/creative/gpt-image/scripts/gpt_image.py --out "/absolute/path/output.png"
```
