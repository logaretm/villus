---
title: Queries
description: Learn how to run GraphQL queries
order: 3
---

# Queries

You can query GraphQL APIs with the `useQuery` function or `Query` component after you've setup the [GraphQL Client](./setup.md). This guide will focus on using the composable API because it is more flexible and concise, everything covered in this guide can be done with the `Query` component.

## Queries Basics

The `useQuery` function is a composable function that provides query state and various helper methods around managing the query.

To execute a query the `useQuery` accepts a GraphQL query as the first argument. The `query` property is a `string` containing the query body or a `DocumentNode` (AST) created by `graphql-tag`.

```vue
<template>
  <div>
    <ul v-if="data">
      <li v-for="todo in data.todos">{{ todo.text }}</li>
    </ul>
  </div>
</template>

<script>
import { useQuery } from 'villus';

export default {
  setup() {
    const GetTodos = `
      GetTodos {
        todos {
          id
          title
        }
      }
    `;
    const { data } = useQuery(GetTodos);

    return { data };
  },
};
</script>
```

## With [graphql-tag](https://github.com/apollographql/graphql-tag)

You can use `graphql-tag` to compile your queries or load them with the `graphql-tag/loader`.

This a sample with the `useQuery` function:

```js
import { gql } from 'graphql-tag';

// In setup
const GetTodos = gql`
  GetTodos {
    todos {
      id
      title
    }
  }
`;

const { data } = useQuery(GetTodos);

return { data };
```

If you are using **webpack** you can configure the loader `graphql-tag/loader` and use `import/require`:

```js
import { Todos } from '@/graphql/todos.gql';

// In setup
const { data } = useQuery({
  query: Todos,
});

return { data };
```

## Query Variables

You can pass variables to your queries as the second argument of `useQuery`:

```js
// in setup

const FetchTodo = `
  query FetchTodo ($id: ID!) {
    todo (id: $id) {
      text
    }
  }
`;

const { data } = useQuery(FetchTodo, {
  id: 123,
});
```

However if you want to re-fetch the query whenever the variables change, then this is where the composable API shines. You can pass a [reactive object](https://v3.vuejs.org/api/basic-reactivity.html#reactive) containing your variables and the query will automatically execute with the new variables value:

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

This also works with [reactive Refs](https://v3.vuejs.org/api/refs-api.html#ref)

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

This is only one way to re-fetch queries, because `villus` is built with composable API first you will find many ways to re-fetch your queries no matter how complex your requirements are.

## Re-fetching Queries

Sometimes you want to re-fetch the query or run it after some action, the `execute` function that is returned from the `useQuery` function and available on the `Query` component slot props. When called it re-executes the query. This example executes the query after the button has been clicked, note that the query is still fetched initially.

Here is a snippet for calling `execute` with `useQuery`:

```js
// in setup
const { data, execute } = useQuery({
  // ...
});

return {
  data,
  // call execute whenever you want the query to re-fetch
  execute,
};
```

This can be very useful in situations where you have a complex logic that triggers a refetch, that means `watch` and `watchEffect` play really well with the `execute` function:

```js
import { watch } from 'vue';
import { useQuery } from 'villus';

const GetTodos = `
  GetTodos {
    todos {
      id
      title
    }
  }
`;

// in your setup
const { data, execute } = useQuery(GetTodos);

watch(someComputedProp, () => execute());
```

## Reactive Queries

Vue is all about reactivity to achieve better DX, and villus follows this philosophy as well. You are not only limited to reactive variables, you can also have reactive queries. In other words, queries created with `ref` or `computed` are recognized as reactive queries and will be watched automatically and re-fetched whenever the query changes.

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

Reactive queries are very flexible and one of the many advantages of using the composition API.

### Disabling Re-fetching

You can disable the automatic refetch behavior by calling the `pause` function returned by the `useQuery` function:

```js
import { ref } from 'vue';

const GetPostById = `
  query getPost ($id: ID!) {
    post (id: $id) {
      id
      title
    }
  }
`;

// Create a reactive variables object
const variables = ref({ id: 123 });
const { data, pause, resume } = useQuery(GetPostById, variables);

// variables/query watching is stopped.
pause();

// variables/query watching is resumed.
resume();
```

## Caching

Queries are **cached in memory**, the uniqueness criteria is the query name, body, and its variables. Meaning if the same query is run with the same variables it will be fetched from the cache by default and will not hit the network. **Cache is deleted after the user closes/refreshes the page.**

By default the client uses `cache-first` policy to handle queries, the full list of available policies are:

- `cache-first`: If found in cache return it, otherwise fetch it from the network
- `network-only`: Always fetch from the network and do not cache it
- `cache-and-network`: If found in cache return it, but fetch the fresh value and cache it for next time, if not found in cache it will fetch it from network and cache it
- `cache-only`: If found in cache return it, otherwise returns `null` for both `data` and `errors`

You can specify a different strategy on different levels:

### On the client level

You can set the default policy on the client level when you are [building the GraphQL client](./client.md) by passing `cachePolicy` option to either:

The `createClient` function:

```js{3,10}
const client = createClient({
  url: '/graphql', // Your endpoint
  cachePolicy: 'network-only',
});
```

This will make all the `Query` components under the `Provider` tree use the `network-only` policy by default.

You can also pass it to the `useClient` composition function:

```js{4}
// in setup
useClient({
  url: '/graphql', // Your endpoint
  cachePolicy: 'network-only',
});
```

This will make all the child-components using `useQuery` or `Query` component use the `network-only` policy by default.

### On the query level

You can pass the `cachePolicy` property to the `useQuery` function to set the default caching policy for that query:

<doc-tip>

Note the usage of a different signature here for the `useQuery` function, what you have seen so far is the "short-hand" but when you need to modify the query behavior you will need to use the full or extended options. The main difference is that this signature only accepts exactly 1 argument containing the query options, you can find more information about the available options in the [API reference page](../api/use-query).

</doc-tip>

```js
// in setup
const GetPosts = `
  query GetPosts {
    posts {
      id
      title
    }
  }
`;

const { data } = useQuery({
  query: GetPosts,
  cachePolicy: 'network-only',
});
```

### On each `execute` call level

You can also set the caching policy for a single `execute` call by passing it to the `execute` function provided by the slot props or the `useQuery` function.

Here is a snippet for doing so with the `useQuery` function:

```js
// in setup
const GetPosts = `
  query GetPosts {
    posts {
      id
      title
    }
  }
`;

const { execute, data } = useQuery(GetPosts);

// use this in template or whatever.
function runWithPolicy() {
  execute({ cachePolicy: 'network-only' });
}
```

You can build your own cache layer and plugins for villus, check the [Plugins Guide](./plugins)

## Suspense

<doc-tip type="danger" title="Vue 3">

This feature is only available with Vue 3 at the moment

</doc-tip>

Both the `useQuery` and `Query` component can take advantage of the `Suspense` component shipped by Vue 3.x.

To utilize the suspense feature, you need to `await` the `useQuery` function and it returns the exact same API after executing the query:

```vue
<template>
  <ul>
    <li v-for="post in data.posts" :key="post.id">{{ post.title }}</li>
  </ul>
</template>

<script>
// Listing.vue
import { useQuery } from 'villus';

export default {
  name: 'Listing',
  async setup() {
    const GetPosts = `
      query GetPosts {
        posts {
          id
          title
        }
      }
    `;

    const { data } = await useQuery(GetPosts);

    return { data };
  },
};
</script>
```

Then you can suspend the `Listing.vue` component like this:

```vue
<template>
  <div>
    <Suspense>
      <template #default>
        <Listing />
      </template>
      <template #fallback>
        <span>Loading...</span>
      </template>
    </Suspense>
  </div>
</template>

<script>
import Listing from '@/components/Listing.vue';

export default {
  components: {
    Listing
  }
};
<script>
```
