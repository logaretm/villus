---
title: <Query />
description: API reference for the Query component
order: 4
---

## Query

The `Query` component uses [scoped slots](https://v3.vuejs.org/guide/component-slots.html#scoped-slots) to provide the query state to the slot template.

<doc-tip>

The **Query** component is **renderless** by default, meaning it will not render any extra HTML other than its slot.

</doc-tip>

## Props

The `Query` component accepts the following props:

| Prop              | Type                                                                                         | Required | Description                                                                                           |
| ----------------- | -------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| query             | `string` or `DocumentNode`                                                                   | **Yes**  | The query to be executed                                                                              |
| variables         | `object`                                                                                     | **No**   | The query variables                                                                                   |
| cachePolicy       | A `string` with those possible values `cache-and-network` or `network-only` or `cache-first` | **No**   | The cache policy to execute the query with, defaults to the value configured with the provided client |
| fetchOnMount      | `boolean`                                                                                    | **No**   | If the query **should be** be executed on `onMounted` lifecycle hook, default is `true`               |
| suspended         | `boolean`                                                                                    | **No**   | If the component is suspended with `Suspend` or not, defaults to `false`                              |
| watchVariables    | `boolean`                                                                                    | **No**   | If the query variable watching is disabled or not, defaults to `true`                                 |
| initialIsFetching | `boolean`                                                                                    | **No**   | Sets `isFetching` to an initial value                                                                 |

## Slot Props

The `Query` component exposes a single `default` slot with the following properties:

| Property   | Type                                                              | Description                                                                                                                            |
| ---------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| data       | `any/null`                                                        | The GraphQL query result's `data`                                                                                                      |
| error      | `CombinedError`                                                   | Any errors encountered during query execution                                                                                          |
| execute    | `({cachePolicy: CachePolicy}) => Promise<OperationResult<TData>>` | Executes the query and returns the operation result containing `data` and `error` values                                               |
| isDone     | `boolean`                                                         | Set to true when the query is executed at least once, never resets to `false`                                                          |
| isFetching | `boolean`                                                         | Set to true when the query is executing either by calling `execute` explicitly or by watch effect due to reactive variables or queries |

## Events

The `Query` component does not emit any events at the moment
