# CONTEXT.md 格式

## 结构

```md
# {上下文名称}

{一两句话：这个上下文是什么，为什么存在。}

## 语言

**Order**:
{一两句话描述这个术语}
_Avoid_: Purchase, transaction

**Invoice**:
交付后发送给客户的付款请求。
_Avoid_: Bill, payment request

**Customer**:
下订单的个人或组织。
_Avoid_: Client, buyer, account
```

## 规则

- **立场明确。** 当同一个概念有多个词时，选最好的那个，把其他词列到 `_Avoid_` 下。
- **定义要紧。** 最多一两句话。定义它“是什么”，不是“做什么”。
- **只包含这个项目上下文特有的术语。** 通用编程概念（timeouts、error types、utility patterns）不属于这里，即使项目大量使用它们。添加术语前先问：这是该上下文独有的概念，还是通用编程概念？只有前者属于这里。
- **自然出现术语簇时，用子标题分组。** 如果所有术语属于单一内聚区域，平铺列表也可以。

## 单上下文仓库 vs 多上下文仓库

**单上下文（大多数仓库）：** repo root 下一个 `CONTEXT.md`。

**多上下文：** repo root 下一个 `CONTEXT-MAP.md`，列出各上下文、所在位置，以及彼此关系：

```md
# Context Map

## Contexts

- [Ordering](./src/ordering/CONTEXT.md) — receives and tracks customer orders
- [Billing](./src/billing/CONTEXT.md) — generates invoices and processes payments
- [Fulfillment](./src/fulfillment/CONTEXT.md) — manages warehouse picking and shipping

## Relationships

- **Ordering → Fulfillment**: Ordering emits `OrderPlaced` events; Fulfillment consumes them to start picking
- **Fulfillment → Billing**: Fulfillment emits `ShipmentDispatched` events; Billing consumes them to generate invoices
- **Ordering ↔ Billing**: Shared types for `CustomerId` and `Money`
```

这个 skill 会推断适用哪种结构：

- 如果 `CONTEXT-MAP.md` 存在，读取它来查找上下文
- 如果只有 root `CONTEXT.md` 存在，视为单上下文
- 如果两者都不存在，在第一个术语被确定时懒创建 root `CONTEXT.md`

存在多个上下文时，推断当前话题属于哪个上下文。如果不清楚，就询问。
