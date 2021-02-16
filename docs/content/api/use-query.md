---
title: useQuery()
description: API reference for the useQuery composable function
order: 1
---

# useQuery()

The `useQuery` function allows you to execute GraphQL queries, it requires a `Provider` or `useClient` to be called in the component tree, so make sure to [set that up](/guide/setup) before using `useQuery`

The `useQuery` function returns the following properties and functions:

| Property            | Type                                                              | Description                                                                                                                            |
| ------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| data                | `Ref<any/null>`                                                   | The GraphQL query result's `data`                                                                                                      |
| error               | `Ref<CombinedError>`                                              | Any errors encountered during query execution                                                                                          |
| execute             | `({cachePolicy: CachePolicy}) => Promise<OperationResult<TData>>` | Executes the query and returns the operation result containing `data` and `error` values                                               |
| isDone              | `Ref<boolean>`                                                    | Set to true when the query is executed at least once, never resets to `false`                                                          |
| isFetching          | `Ref<boolean>`                                                    | Set to true when the query is executing either by calling `execute` explicitly or by watch effect due to reactive variables or queries |
| isWatchingVariables | `Ref<boolean>`                                                    | If the variables watchers are enabled or not                                                                                           |
| unwatchVariables    | `() => void`                                                      | Pauses variable watching                                                                                                               |
| watchVariables      | `() => void`                                                      | Resumes variable watching                                                                                                              |

There might be undocumented properties, such properties are no intended for public use and should be ignored.

## Usage

```js
const Todos = `
  query Todos {
    todos {
      text
    }
  }
`;

// without variables
const { data, error } = useQuery({
  query: Todos,
});

const FindTodo = `
  query FindTodo($id: ID!) {
    todo (id: $id) {
      text
    }
  }
`;

// with variables
const { data, error } = useQuery({
  query: FindTodo,
  variables: { id: 1 },
});
```

### Query Options

This is the full object fields that the `useQuery` function accepts:

| Property     | Type                                                                                         | Required | Description                                                                                                                         |
| ------------ | -------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| query        | `string` or `DocumentNode` or `Ref<string>`                                                  | **Yes**  | The query to be executed                                                                                                            |
| variables    | `object` or `Ref<object>`                                                                    | **No**   | The query variables                                                                                                                 |
| cachePolicy  | A `string` with those possible values `cache-and-network` or `network-only` or `cache-first` | **No**   | The cache policy to execute the query with, defaults to the value configured with the provided client                               |
| fetchOnMount | `boolean`                                                                                    | **No**   | If the query **should be** executed on `mounted`, default is `true`                                                                 |
| context      | `{ headers: Record<string, string> }`                                                        | **No**   | A object to be merged with the fetch options, currently accepts `headers`. The `context` can be a reactive `ref` or `computed ref`. |

This signature allows you to tweak the `fetchOnMount` and `cachePolicy` behaviors for the query, Here is an example:

```js
const FindTodo = `
  query FindTodo($id: ID!) {
    todo (id: $id) {
      text
    }
  }
`;

const { data, error } = useQuery({
  query: FindTodo, // query
  variables: { id: 1 }, // variables
  fetchOnMount: false,
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

const { data } = useQuery({
  query: FetchTodo,
});

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

const { data } = useQuery({
  query: `query FetchTodo ($id: ID!) {
      todo (id: $id) {
        text
      }
    }
  `,
  variables,
});
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

const { data } = useQuery({
  query: FetchTodo,
  variables,
});
```

You can pause variable watching by [checking the guide](/guide/queries#disabling-re-fetching).

For more information on `useQuery`, [check the queries guide](/guide/queries)
