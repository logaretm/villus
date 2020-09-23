---
title: useQuery()
description: API reference for the useQuery composable function
order: 1
---

# useQuery()

The `useQuery` function allows you to execute GraphQL queries, it requires a `Provider` or `useClient` to be called in the component tree, so make sure to [set that up](../guide/setup) before using `useQuery`

The `useQuery` function returns the following properties and functions:

| Property   | Type                                                              | Description                                                                                                                            |
| ---------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| data       | `Ref<any/null>`                                                   | The GraphQL query result's `data`                                                                                                      |
| error      | `Ref<CombinedError>`                                              | Any errors encountered during query execution                                                                                          |
| execute    | `({cachePolicy: CachePolicy}) => Promise<OperationResult<TData>>` | Executes the query and returns the operation result containing `data` and `error` values                                               |
| isDone     | `Ref<boolean>`                                                    | Set to true when the query is executed at least once, never resets to `false`                                                          |
| isFetching | `Ref<boolean>`                                                    | Set to true when the query is executing either by calling `execute` explicitly or by watch effect due to reactive variables or queries |
| isPaused   | `Ref<boolean>`                                                    | If the variables watchers are enabled or not                                                                                           |
| pause      | `() => void`                                                      | Pauses variable watching                                                                                                               |
| resume     | `() => void`                                                      | Resumes variable watching                                                                                                              |

There might be undocumented properties, such properties are no intended for public use and should be ignored.

## Signatures

There are two ways to call `useQuery` for your convenience

### Simple

The first being the simpler `query` and optional `variables` arguments, it can be used like this:

```js
const Todos = `
  query Todos {
    todos {
      text
    }
  }
`;

// without variables
const { data, error } = useQuery(Todos);

const FindTodo = `
  query FindTodo($id: ID!) {
    todo (id: $id) {
      text
    }
  }
`;

// with variables
const { data, error } = useQuery(FindTodo, { id: 1 });
```

If you are interested in it's TS type, you can check the source code or check the following snippet:

```ts
function useQuery<TData = any, TVars = QueryVariables>(
  query: QueryCompositeOptions<TVars>['query'],
  variables?: QueryCompositeOptions<TVars>['variables']
): ThenableQueryComposable<TData>;
```

### Operation Object

The Second signature is the more complex one, it accepts an object containing the following properties:

| Property    | Type                                                                                         | Required | Description                                                                                           |
| ----------- | -------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| query       | `string` or `DocumentNode` or `Ref<string>`                                                  | **Yes**  | The query to be executed                                                                              |
| variables   | `object` or `Ref<object>`                                                                    | **No**   | The query variables                                                                                   |
| cachePolicy | A `string` with those possible values `cache-and-network` or `network-only` or `cache-first` | **No**   | The cache policy to execute the query with, defaults to the value configured with the provided client |
| lazy        | `boolean`                                                                                    | **No**   | If the query **should not** be executed on `mounted`, default is `false`                              |

This signature allows you to tweak the `lazy` and `cachePolicy` behaviors for the query, which is why we needed an extended object. Here is an example:

```js
const FindTodo = `
  query FindTodo($id: ID!) {
    todo (id: $id) {
      text
    }
  }
`;

const { data, error } = useQuery({
  query: FindTodo,
  variables: { id: 1 },
  lazy: false,
  cachePolicy: 'network-only',
});
```

## Reactivity

The `useQuery` works well with reactive arguments with some limitations

### Reactive Queries

You can create reactive queries using `Ref` or `Computed` with the recommended being `Computed` as it is unlikely you will be explicitly changing the query value. By default `useQuery` detects whenever a `query` argument is reactive and watches it for changes, when a change is triggered it will re-fetch the query automatically.

```js
import { computed, ref } from 'vue';
import { useQuery } from 'villus';

// computed id that will be used to compute the query
const id = ref(1);

// Create a computed query
const FetchTodo = computed(() => {
  return `query FetchTodo {
      todo (id: ${id.value}) {
        text
      }
    }
  `;
});

const { data } = useQuery(FetchTodo);

// later on, changing the `id` ref will automatically refetch the query because it is computed
id.value = 2;
```

This works the same if you are using `graphql-tag` and returning `ASTs` for your queries. But it's unlikely you will be switching between two different queries.

<doc-tip type="danger" title="reactive() Support">

Note that reactive objects created with `reactive()` are not considered reactive queries, only `Ref` and `ComputedRef` are accepted.

</doc-tip>

### Reactive Variables

You can also create reactive variables and `useQuery` will detect them and will be watching them for changes, once a change is detected it will re-fetch the query. You can create reactive variables with both `ref` or `reactive` and their derivatives.

Here is a quick sample with `reactive`:

```js
import { reactive } from 'vue';
import { useQuery } from 'villus';

const variables = reactive({
  id: 123,
});

const { data } = useQuery(
  `query FetchTodo ($id: ID!) {
      todo (id: $id) {
        text
      }
    }
  `,
  variables
);
```

This also works with [ref()](https://v3.vuejs.org/api/refs-api.html#ref)

```js
import { ref } from 'vue';
import { useQuery } from 'villus';

const variables = ref({
  id: 123,
});

const FetchTodo = `
  query FetchTodo ($id: ID!) {
    todo (id: $id) {
      text
    }
  }
`;

const { data } = useQuery(FetchTodo, variables);
```

You can pause variable watching by [checking the guide](../guide/queries#disabling-re-fetching).

For more information on `useQuery`, [check the queries guide](../guide/queries)
