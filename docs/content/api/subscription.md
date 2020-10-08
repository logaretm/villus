---
title: <Subscription />
description: API reference for the useQuery composable function
order: 6
---

## Subscription

The `Subscription` component uses [scoped slots](https://v3.vuejs.org/guide/component-slots.html#scoped-slots) to provide the subscription state to the slot template.

<doc-tip>

The **Subscription** component is **renderless** by default, meaning it will not render any extra HTML other than its slot.

</doc-tip>

## Props

The `Subscription` component accepts the following props:

| Prop      | Type                                              | Required | Description                                                                                                                                    |
| --------- | ------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| query     | `string` or `DocumentNode`                        | **Yes**  | The subscription to be executed/started                                                                                                        |
| variables | `object`                                          | **No**   | The subscription variables                                                                                                                     |
| paused    | `boolean`                                         | **No**   | Activates/Deactivates the subscription, defaults to `false`                                                                                    |
| reduce    | `(prev: any, current: ) => any` or `DocumentNode` | **No**   | A reducer used to aggregate the values returned by the subscription, check the [subscription guide for more information](/guide/subscriptions) |

## Slot Props

The `Mutation` component exposes a single `default` slot with the following properties:

| Property   | Type            | Description                                                                                                                            |
| ---------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| data       | `any/null`      | The GraphQL query result's `data`                                                                                                      |
| error      | `CombinedError` | Any errors encountered during query execution                                                                                          |
| isDone     | `boolean`       | Set to true when the query is executed at least once, never resets to `false`                                                          |
| isFetching | `boolean`       | Set to true when the query is executing either by calling `execute` explicitly or by watch effect due to reactive variables or queries |
| isPaused   | `boolean`       | If the subscription is currently paused or inactive                                                                                    |

## Events

The `Mutation` component does not emit any events at the moment
