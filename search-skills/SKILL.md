---
name: search-skills
description: "仅当用户明确要求使用归档 skill 时触发；查看 archived-skills 索引并指向对应 skill。"
---

# Search archived skills

只在用户明确说要用归档里的 skill 时使用。

## 索引

- `archived-skills/creative/`：文案、README、图像。
- `archived-skills/development/`：开发、调试、工程治理、skill 维护。
- `archived-skills/frontend/`：UI、React、shadcn、Magic UI。
- `archived-skills/operations/`：SSH、1Panel、服务器运维。
- `archived-skills/search/`：浏览器、代码库、文档、网络搜索。
- `archived-skills/office/`：PDF、Office、Obsidian。

## 规则

- 用户没明确指定归档 skill：不要主动查看归档。
- 只读对应 `SKILL.md`，按它的边界执行。
