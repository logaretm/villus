# Queries

You can query GraphQL APIs with the **Query** component after you've setup the [GraphQL Client](./client.md).

The **Query** component uses slots and [scoped slots](https://vuejs.org/v2/guide/components-slots.html#Scoped-Slots) to provide the query state to the slot template.

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
import { Query } from 'vue-gql';

export default {
  components: {
    Query
  }
};
</script>
```

By default the query will run on the server-side if applicable (via `serverPrefetch`) or on mounted (client-side) if it didn't already.

:::tip
The examples from now on will omit much of the boilerplate and will only use the `Query` component to demonstrate its uses clearly.
:::

## [graphql-tag](https://github.com/apollographql/graphql-tag)

You can use `graphql-tag` to compile your queries or load them with the `graphql-tag/loader`.

```
// in script
const todos = gql`
  todos {
    id
    text
  }
`;

// in template
<Query :query="todos" v-slot="{ data }">
  <div v-if="data">
    <p v-for="todo in data.todos">{{ todo.text }}</p>
  </div>
</Query>
```

Here we are using `require` with the `graphql-tag/loader`:

```vue{1}
<Query :query="require('@/graphql/todos').Todos" v-slot="{ data }">
  <div v-if="data">
    <p v-for="todo in data.todos">{{ todo.text }}</p>
  </div>
</Query>
```

## Variables

You can provide variables to your queries using the `variables` optional prop, which is an object containing the variables you would normally send to a GraphQL request.

```vue{2}
<template>
  <Query :query="todo" :variables="{ id: 123 }" v-slot="{ data }">
    <div v-if="data">
      <p v-for="todo in data.todos">{{ todo.text }}</p>
    </div>
  </Query>
</template>

<script>
const todo = `
  query FetchTodo ($id: ID!) {
    todo (id: $id) {
      text
    }
  }
`;

export default {
  // ... same as before,
  data: () => ({
    todo
  })
};
</script>
```

## Slot Props

### fetching

The **Query** slot props contain more useful information that you can use to build better experience for your users, for example you can use the `fetching` slot prop to display a loading indicator.

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

The `errors` slot prop contains all errors encountered when running the query.

```vue{1,3}
<Query query="{ todos { text } }" v-slot="{ data, errors }">
  <!-- Your Custom component to handle error display -->
  <ErrorPage v-if="errors" :errors="errors" />

  <div v-else>
    <p v-for="todo in data.todos">{{ todo.text }}</p>
  </div>

</Query>
```

### execute

Sometimes you want to re-fetch the query or run it after some action, the `execute` slot prop is a function that re-runs the query. This example executes the query after the button has been clicked, note that the query is still fetched initially.

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

Unique queries are cached in memory, the uniqueness here is an id calculated by the query body, and its variables. Meaning if the same query is run with the same variables it will be fetched from the cache by default and will not hit the network. **Cache is deleted after the user closes/refreshes the page.**

By default the client uses `cache-first` policy to handle queries, the full list of available policies are:

- `cache-first`: If found in cache return it, otherwise fetch it from the network.
- `network-only`: Always fetch from the network and do not cache it.
- `cache-and-network`: If found in cache return it, but fetch the fresh value and cache it for next time, if not found in cache it will fetch it from network and cache it.

You can force the **Query** component to fetch using any of the policies mentioned, you can do this by passing a `cachePolicy` option to the `execute` slot prop:

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

:::tip
Calling `execute` with a different cache policy will not change the default policy, the policy you specify will always be used for the next request upon calling `execute`.
:::

### Setting default cache policy

You can set the default policy when you are [providing the GraphQL client](./client.md) by passing `cachePolicy` option to the `createClient` function.

```js{3}
const client = createClient({
  url: '/graphql', // Your endpoint
  cachePolicy: 'network-only'
});
```

This will make all the **Query** components under the **Provider** tree use the `network-only` policy by default, you can still override with the `execute` slot prop.

### Cache Prop

You could also pass the `cachePolicy` prop to the `Query` component to set its default caching policy explicitly.

```vue{3}
<Query
  query="{ posts { id title } }"
  cache-policy="network-only"
  v-slot="{ data }"
>
  <div v-if="data">
    <ul>
      <li v-for="post in data.posts" :key="post.id">{{ post.title }}</li>
    </ul>
  </div>
</Query>
```

## Watching Variables

Often you want to re-fetch the query when a variable changes, this is done for you by default as long as the query uses `variables` prop.

```vue{3}
<Query
  query="query getPost ($id: ID!) { post (id: $id) { id title } }"
  :variables="{ id }"
  v-slot="{ data }"
>
  <div v-if="data">
    <h1>{{ data.post.title }}</h1>
  </div>
</Query>
```

:::tip
This examples re-runs the query whenever the `id` changes, the results of re-fetched queries follows the configured cache-policy.
:::

### Disabling variable watching

You can disable the mentioned behavior by setting `refetch` prop to false.

```vue{4}
<Query
  query="query getPost ($id: ID!) { post (id: $id) { id title } }"
  :variables="{ id }"
  :refetch="false"
  v-slot="{ data }"
>
  <div v-if="data">
    <h1>{{ data.post.title }}</h1>
  </div>
</Query>
```
