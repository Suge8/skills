---
name: exa
description: 用 Exa 做当前网页搜索和代码上下文搜索：文档、发布说明、技术文章、代码示例、API 语法、库用法、项目配置、调试片段
compatibility: 需要 Node.js 18+ 和 EXA_API_KEY。
allowed-tools: Bash(node *exa-search.mjs*), Bash(exa-search *)
---

# Exa

极简 Exa wrapper：普通网页搜索 + 代码上下文搜索。

## 命令

```bash
exa-search "query"
exa-search "query" --code
```

## 何时使用

- 当前网页、文档、发布说明、技术文章 → 普通搜索。
- 代码示例、API 语法、库用法、框架配置、调试片段 → `--code`。
- 查询要具体：语言 + 框架/版本 + 精确标识符/错误消息。
- 默认用 highlights：token 少，适合 agent 工作流。
- 官方文档/文档站 → `--docs domain.com`。
- 需要读完整页面 → `--text 8000`。
- 需要最新页面内容 → `--fresh`。
- 速度优先 → `--type fast` 或 `--type instant`。
- 复杂研究 → `--type deep`；更慢，少用。
- 需要探索文档站子页面 → `--subpages 5 --subpage-target reference,guide`。

## 参数

```text
--code                    使用 Exa Code Context API
-n, --num-results N       结果数，1-20，默认 10
-t, --type TYPE           auto | fast | instant | deep-lite | deep | deep-reasoning
--tokens N|dynamic        code 模式 token 预算，默认 dynamic
--docs DOMAIN             文档站 preset：include-domain + text 8000 + subpages 5
--fresh                   强制获取新内容
--text N                  返回全文，限制 N 字符
--summary                 返回 Exa 摘要
--highlight-chars N       限制每个结果的 highlights 字符数
--highlight-query QUERY   指定 highlights 抽取重点
--include-domain DOMAIN   只搜域名；可重复或逗号分隔
--exclude-domain DOMAIN   排除域名；可重复或逗号分隔
--after DATE              只要此日期后的内容，例如 2026-01-01
--before DATE             只要此日期前的内容
--subpages N              每个结果抓 N 个子页面
--subpage-target WORDS    子页面优先词；可重复或逗号分隔
--links N                 每个结果抽取 N 个链接
--image-links N           每个结果抽取 N 个图片链接
--no-highlights           只返回搜索结果 URL
--json                    输出原始 JSON
```

## 示例

```bash
exa-search "latest Vercel AI SDK release notes" --type fast
exa-search "Python 3.12 asyncio TaskGroup cancellation example" --code --tokens 5000
exa-search "React 19 useActionState docs" --docs react.dev
exa-search "Next.js 15 app router cache revalidateTag docs" --fresh
exa-search "FastAPI docs dependency injection" --docs fastapi.tiangolo.com
```

## 规则

- 只用本 skill 暴露的参数；不要临时发明 Exa API 参数。
- `--tokens` 只用于 `--code`。
- `--docs domain.com` 等价于：`--include-domain domain.com --text 8000 --subpages 5 --subpage-target reference,guide,api,docs`。
- `--subpages` 默认不用；只在 docs 首页/入口页信息不够时开，先用 5。
