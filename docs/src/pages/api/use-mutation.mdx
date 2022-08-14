---
layout: ../../layouts/PageLayout.astro
title: useMutation()
description: API reference for the useMutation composable function
order: 2
---

## useMutation()

The `useMutation` function allows you to execute GraphQL mutations, it requires a `Provider` or `useClient` to be called in the component tree, so make sure to [set that up](/guide/setup) before using `useMutation`

The `useMutation` function returns the following properties and functions:

| Property   | Type                                                     | Description                                                                                 |
| ---------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| data       | `Ref<any/null>`                                          | The GraphQL mutation result's `data`                                                        |
| error      | `Ref<CombinedError>`                                     | Any errors encountered during mutation execution                                            |
| execute    | `(variables: object) => Promise<OperationResult<TData>>` | Executes the mutation and returns the operation result containing `data` and `error` values |
| isDone     | `Ref<boolean>`                                           | Set to true when the mutation is executed at least once, never resets to `false`            |
| isFetching | `Ref<boolean>`                                           | Set to true when the mutation is executing by calling `execute` explicitly                  |

## Mutation Options

Aside from the mutation itself, the `useMutation` function accepts an optional second argument containing these options:

| Property | Type                                  | Required | Description                                                                                                                         |
| -------- | ------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| context  | `{ headers: Record<string, string> }` | **No**   | A object to be merged with the fetch options, currently accepts `headers`. The `context` can be a reactive `ref` or `computed ref`. |

## Signature and Usage

You can use `useMutation` like this:

```vue
<script setup>
import { useMutation } from 'villus';

const LikePost = `
  mutation {
    likePost (id: 123) {
      message
    }
  }
`;

const { data, execute } = useMutation(LikePost);
</script>
```

`useMutation` is very simple and doesn't accept any other arguments, just the mutation.

## Reactivity

useMutation does not accept reactive queries or variables, so it is your responsibility to unwrap any reactive values passed to it

For more information on `useMutation`, [check the mutations guide](/guide/mutations)/
