---
title: Queries
description: Learn how to run GraphQL queries
order: 3
---

# Queries

You can query GraphQL APIs with the `useQuery` function or `Query` component after you've setup the [GraphQL Client](./client.md).

## useQuery

The `useQuery` function is a composition API function that provides query state and various helper methods around managing the query.

To run a query the `useQuery` function accepts an object containing a `query` property. The `query` property is a `string` containing the query body or a `DocumentNode` created by `graphql-tag`. The `query` property is always required.

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
    const { data } = useQuery({
      query: '{ todos { text } }'
    });

    return { data };
  }
};
</script>
```

:::tip
By default the query **will run whenever the component is mounted**. But you can disable this behavior by providing a `lazy` flag set to true.

```js
const { data } = useQuery({
  query: '{ todos { text } }',
  lazy: true
});
```

:::

## Query

The `Query` component uses [scoped slots](https://vuejs.org/v2/guide/components-slots.html#Scoped-Slots) to provide the query state to the slot template.

To run a query, the **Query** component takes a required `query` prop that can be either a `string` containing the query or a `DocumentNode` loaded by `graphql-tag/loader` from `.graphql` files.

:::tip
The **Query** component is **renderless** by default, meaning it will not render any extra HTML other than its slot, but only when exactly one child is present, if multiple children exist inside its slot it will render a `span`.
:::

```vue
<template>
  <div>
    <Query query="{ todos { text } }" v-slot="{ data }">
      <div v-if="data">
        <p v-for="todo in data.todos">{{ todo.text }}</p>
      </div>
    </Query>
  </div>
</template>

<script>
import { Query } from 'villus';

export default {
  components: {
    Query
  }
};
</script>
```

By default the query will run on the server-side if applicable (via `serverPrefetch`) or on mounted (client-side) if it didn't already.

:::tip
The examples from now on will omit much of the boilerplate and will only use the `useQuery` and `Query` component to demonstrate its uses clearly.
:::

## [graphql-tag](https://github.com/apollographql/graphql-tag)

You can use `graphql-tag` to compile your queries or load them with the `graphql-tag/loader`.

This a sample with the `useQuery` function:

```js
// In setup
const { data } = useQuery({
  query: gql`
    todos {
      id
      text
    }
  `
});

return { data };
```

with the `Query` component:

```vue
<Query :query="todos" v-slot="{ data }">
  <div v-if="data">
    <p v-for="todo in data.todos">{{ todo.text }}</p>
  </div>
</Query>

<script>
import gql from 'graphql-tag';

export default {
  data: () => ({
    todos: gql`
      todos {
        id
        text
      }
    `
  })
};
</script>
```

If you are using **webpack** you can configure the loader `graphql-tag/loader` and use `import/require`:

```js
import { Todos } from '@/graphql/todos';

// In setup
const { data } = useQuery({
  query: Todos
});

return { data };
```

With `Query` component you can use `require` in the template:

```vue{1}
<Query :query="require('@/graphql/todos').Todos" v-slot="{ data }">
  <div v-if="data">
    <p v-for="todo in data.todos">{{ todo.text }}</p>
  </div>
</Query>
```

## Variables

You can pass variables to your queries using the `variables` optional property/prop, which is an object containing the variables you would normally send to a GraphQL request.

For the `useQuery` function, you can pass `variables` prop as either a raw object or a `Ref`:

```js{2,5}
// in setup
const variables = { id: 123 };

// and this is also fine
const variables = ref({ id: 123 });

const { data } = useQuery({
  variables,
  query: `
    query FetchTodo ($id: ID!) {
      todo (id: $id) {
        text
      }
    }
  `
});
```

For the `Query` component you can pass it as a prop:

```vue{2}
<template>
  <Query :query="todo" :variables="{ id: 123 }" v-slot="{ data }">
    <div v-if="data">
      <p v-for="todo in data.todos">{{ todo.text }}</p>
    </div>
  </Query>
</template>

<script>
export default {
  // ... same as before,
  data: () => ({
    todo: `
      query FetchTodo ($id: ID!) {
        todo (id: $id) {
          text
        }
      }
    `
  })
};
</script>
```

## Manual Fetching

Sometimes you want to re-fetch the query or run it after some action, the `execute` function that is returned from the `useQuery` function and available on the `Query` component slot props. When called it re-runs the query. This example executes the query after the button has been clicked, note that the query is still fetched initially.

Here is a snippet for calling `execute` with `useQuery`:

```js
// in setup
const { data, execute } = useQuery({
  // ...
});

return {
  data,
  // call execute whenever you want the query to re-fetch
  execute
};
```

```vue{1,6}
<Query query="{ posts { id title } }" v-slot="{ data, execute }">
  <div v-if="data">
    <ul>
      <li v-for="post in data.posts" :key="post.id">{{ post.title }}</li>
    </ul>
    <button @click="execute()"></button>
  </div>
</Query>
```

## Caching

Queries are **cached in memory**, the uniqueness criteria is the query name, body, and its variables. Meaning if the same query is run with the same variables it will be fetched from the cache by default and will not hit the network. **Cache is deleted after the user closes/refreshes the page.**

By default the client uses `cache-first` policy to handle queries, the full list of available policies are:

- `cache-first`: If found in cache return it, otherwise fetch it from the network.
- `network-only`: Always fetch from the network and do not cache it.
- `cache-and-network`: If found in cache return it, but fetch the fresh value and cache it for next time, if not found in cache it will fetch it from network and cache it.

You can specify a different strategy on different levels:

### On the client level

You can set the default policy on the client level when you are [building the GraphQL client](./client.md) by passing `cachePolicy` option to either:

The `createClient` function:

```js{3,10}
const client = createClient({
  url: '/graphql', // Your endpoint
  cachePolicy: 'network-only'
});
```

This will make all the `Query` components under the `Provider` tree use the `network-only` policy by default.

You can also pass it to the `useClient` composition function:

```js{4}
// in setup
useClient({
  url: '/graphql', // Your endpoint
  cachePolicy: 'network-only'
});
```

This will make all the child-components using `useQuery` use the `network-only` policy by default.

### On the query level

You can pass the `cachePolicy` property to the `useQuery` function to set the default caching policy for that query:

```js
const { data } = useQuery({
  query: '{ posts { id title } }',
  cachePolicy: 'network-only'
});
```

For the `Query` component, you can pass the `cachePolicy` prop to set the caching policy for that component/query.

```vue{3}
<Query query="{ posts { id title } }" cache-policy="network-only" v-slot="{ data }">
  <div v-if="data">
    <ul>
      <li v-for="post in data.posts" :key="post.id">{{ post.title }}</li>
    </ul>
  </div>
</Query>
```

### On each `execute` call level

You can also set the caching policy for a single `execute` call by passing it to the `execute` function provided by the slot props or the `useQuery` function.

Here is a snippet for doing so with the `useQuery` function:

```js
// in setup
const { execute, data } = useQuery({
  query: '{ posts { id title } }'
});

// use this in template or whatever.
function runWithPolicy() {
  execute({ cachePolicy: 'network-only' });
}
```

Here is a snippet for doing so with the `Query` component:

```vue{6}
<Query query="{ posts { id title } }" v-slot="{ data, execute }">
  <div v-if="data">
    <ul>
      <li v-for="post in data.posts" :key="post.id">{{ post.title }}</li>
    </ul>
    <button @click="execute({ cachePolicy: 'network-only' })"></button>
  </div>
</Query>
```

## Watching Variables

Often you want to re-fetch the query when a variable changes, for the `useQuery` this is done for you automatically as long as you are passing `variables` as a `Ref` created by `ref` composition function.

```js
import { ref } from 'vue';

const variables = ref({ id: 123 });

const { data } = useQuery({
  variables,
  query: `query getPost ($id: ID!) { post (id: $id) { id title } }`
});
```

For the `Query` component this is done for you automatically as long as the query uses `variables` prop.

```vue{3}
<Query query="query getPost ($id: ID!) { post (id: $id) { id title } }" :variables="{ id }" v-slot="{ data }">
  <div v-if="data">
    <h1>{{ data.post.title }}</h1>
  </div>
</Query>
```

:::tip
These snippets re-runs the query whenever the `id` changes, the results of re-fetched queries follows the configured cache-policy.
:::

### Disabling variable watching

You can disable the automatic re-fetch behavior by calling the `pause` function returned by the `useQuery` function:

```js
import { ref } from 'vue';

const variables = ref({ id: 123 });

const { data, pause, resume } = useQuery({
  variables,
  query: `query getPost ($id: ID!) { post (id: $id) { id title } }`
});

// variables watching is stopped.
pause();

// variables watching is resumed.
resume();
```

For the `Query` component you can pass the `pause` prop as `true`.

```vue{4}
<Query
  query="query getPost ($id: ID!) { post (id: $id) { id title } }"
  :variables="{ id }"
  :pause="true"
  v-slot="{ data }"
>
  <div v-if="data">
    <h1>{{ data.post.title }}</h1>
  </div>
</Query>
```

## Other properties

The `useQuery` function and `Query` component slot props contain more useful information that you can use to build better experience for your users.

### fetching

For example you can use the `fetching` slot prop to display a loading indicator.

```vue{1,3}
<Query query="{ todos { text } }" v-slot="{ data, fetching }">
  <!-- Your Loading Indicator Component -->
  <Loading v-if="fetching" />

  <div v-else>
    <p v-for="todo in data.todos">{{ todo.text }}</p>
  </div>

</Query>
```

### done

The `done` slot prop is a boolean that indicates that the query has been completed.

### errors

The `error` slot prop contains all errors encountered when running the query.

```vue{1,3}
<Query query="{ todos { text } }" v-slot="{ data, error }">
  <!-- Your Custom component to handle error display -->
  <ErrorPage v-if="error" :error="error" />

  <div v-else>
    <p v-for="todo in data.todos">{{ todo.text }}</p>
  </div>

</Query>
```

:::tip
You can also extract the same properties mentioned above from the `useQuery` function:

```js
const { data, fetching, done, error } = useQuery({
  // ...
});
```

:::

## Suspense <Badge text="Only for Vue 3.x" />

Both the `useQuery` and `Query` component can take advantage of the `Suspense` component shipped by Vue 3.x.

For the `useQuery` function, instead of call it directly, you can call the `useQuery.suspend` instead, which has the exact same and behaves the same except it can be used to suspend components like this:

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
    const { data } = await useQuery.suspend({
      query: '{ posts { id title } }'
    });

    return { data };
  }
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

And that is it! For the `Query` component you can do the same with the `suspend` prop:

```vue
<Suspense>
  <template #default>
    <Query query="{ posts { id title } }" v-slot="{ data }" :suspend="true">
      <ul>
        <li v-for="post in data.posts" :key="post.id">{{ post.title }}</li>
      </ul>
    </Query>
  </template>
  <template #fallback>
    <span>Loading...</span>
  </template>
</Suspense>
```
