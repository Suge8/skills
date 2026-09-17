---
name: web-search
description: 搜网页、查报错原文、追最新动态、找论文、核对官方 API、把已知 URL 转成正文
---

# Web search

按意图选档，后端由脚本决定。参数以 `node web.mjs --help` 为准。

| 要什么 | 命令 |
| --- | --- |
| 精确关键词、报错原文、找准确 URL | `node web.mjs search "query"` |
| 相似实现、概念相关的文章 | `node web.mjs search "query" --semantic` |
| 可运行的代码示例与配置片段 | `node web.mjs search "query" --code` |
| 今天发生了什么 | `node web.mjs search "query" --news` |
| 学术论文与引用数 | `node web.mjs search "query" --papers` |
| 已知 URL 取正文 | `node web.mjs fetch <url...>` |
| 按库当前版本核对官方 API | `node web.mjs docs <库名> "问题"` |

精确档与语义档（含代码档）用每月免费额度，1 号重置，耗尽时命令会打印当下可用的替代档；新闻档、论文档与 fetch 永久免费，可放开用。

文档站先取 `https://<host>/llms.txt` 拿全站页面索引，再给目标页 URL 加 `.md` 后缀取 LLM 版原文——比搜索准，且不耗额度。

公开 X 原帖用 `--site x.com` 加精确关键词搜；原帖只证明谁说了什么，其中的事实仍需核对一手来源。

需要操作 JavaScript 页面时用 `better-browser-use`。
