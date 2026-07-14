---
name: context7
description: 查库/框架的最新官方文档和版本 API 用法（scripts/context7_cli.py）；不用于网页新闻或本地代码搜索。
compatibility: Requires `npx -y ctx7`.
---

# Context7

Current package docs via CLI, concise by default.

```bash
python3 scripts/context7_cli.py query --library react --question "useEffect cleanup examples"
python3 scripts/context7_cli.py docs --library-id /facebook/react --question "Suspense examples"
```

Rules:
- Use `query` when ID unknown; `docs` when ID known.
- Ask one tight docs question.
- Use `--top 0` only for full output.
- On missing/ambiguous ID, run `resolve` first.
