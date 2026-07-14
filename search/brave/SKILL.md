---
name: brave
description: Brave 网页搜索（真实 SERP）：精确关键词、时效性内容、找准确 URL 和官方站点。语义/代码搜索用 exa，库文档用 context7。
compatibility: 需要 Node.js 18+ 和 BRAVE_SEARCH_API_KEY。
allowed-tools: Bash(brave-search *), Bash(node *brave-search.mjs*)
---

# Brave Search

独立索引的关键词搜索，返回带准确 URL 的排名结果。

## 命令

```bash
brave-search "query"
brave-search "pi coding agent changelog" --freshness pw   # 最近一周
brave-search "chromium headless flags" -n 15
brave-search "东京 拉面 推荐" --country JP
```

## 参数

```text
-n <num>            结果数 1-20，默认 8
--freshness <p>     pd 24h | pw 周 | pm 月 | py 年 | YYYY-MM-DDtoYYYY-MM-DD
--country <code>    两字母国家码
--offset <n>        翻页 0-9
--json              原始 JSON（含 deep_results 等，默认别用）
```

## 何时用

- 找准确 URL、官方站点、最新发布/新闻、精确报错原文 → brave。
- 语义理解、代码示例、API 用法 → exa。
- 已知 URL 取内容 → curl；JS 渲染页 → browser-dev。
