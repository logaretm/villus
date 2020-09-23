---
title: <Mutation />
description: API reference for the Mutation component
order: 5
---

## Mutation

The `Mutation` component uses [scoped slots](https://v3.vuejs.org/guide/component-slots.html#scoped-slots) to provide the mutation state to the slot template.

<doc-tip>

The **Mutation** component is **renderless** by default, meaning it will not render any extra HTML other than its slot.

</doc-tip>

## Props

The `Mutation` component accepts the following props:

| Prop  | Type                       | Required | Description              |
| ----- | -------------------------- | -------- | ------------------------ |
| query | `string` or `DocumentNode` | **Yes**  | The query to be executed |

## Slot Props

The `Mutation` component exposes a single `default` slot with the following properties:

| Property   | Type                                                     | Description                                                                                                                            |
| ---------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| data       | `any/null`                                               | The GraphQL query result's `data`                                                                                                      |
| error      | `CombinedError`                                          | Any errors encountered during query execution                                                                                          |
| execute    | `(variables: object) => Promise<OperationResult<TData>>` | Executes the query and returns the operation result containing `data` and `error` values                                               |
| isDone     | `boolean`                                                | Set to true when the query is executed at least once, never resets to `false`                                                          |
| isFetching | `boolean`                                                | Set to true when the query is executing either by calling `execute` explicitly or by watch effect due to reactive variables or queries |

## Events

The `Mutation` component does not emit any events at the moment
