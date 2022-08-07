---
title: Queries
description: Learn how to run GraphQL queries
order: 3
---

# Queries

You can query GraphQL APIs with the `useQuery` composition function after you've setup the [GraphQL Client](/setup.md).

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

<script setup>
import { useQuery } from 'villus';

const GetTodos = `
  GetTodos {
    todos {
      id
      title
    }
  }
`;

const { data } = useQuery({
  query: GetTodos,
});
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

const { data } = useQuery({
  query: GetTodos,
});

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

const { data } = useQuery({
  query: GetTodos,
  variables: { id: 123 },
});
```

However if you want to re-fetch the query whenever the variables change, then this is where the composition API shines. You can pass a [reactive object](https://v3.vuejs.org/api/basic-reactivity.html#reactive) containing your variables and the query will automatically execute with the new variables value:

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

const { data } = useQuery({
  query: FetchTodo,
  variables,
});
```

This is only one way to re-fetch queries, because `villus` is built with composable API first you will find many ways to re-fetch your queries no matter how complex your requirements are.

## Re-fetching Queries

Sometimes you want to re-fetch the query or run it after some action, the `execute` function that is returned from the `useQuery` function. When called it re-executes the query.

This example executes the query after the button has been clicked, note that the query is still fetched initially.

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
const { data, execute } = useQuery({
  query: GetTodos,
});

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

const { data } = useQuery({
  query: FetchTodo,
});

// later on, changing the `id` ref will automatically refetch the query because it is computed
id.value = 2;
```

Reactive queries are very flexible and one of the many advantages of using the composition API.

### Disabling Re-fetching

You can disable the automatic refetch behavior by passing a `paused` getter function to the `useQuery` function. The getter should return a boolean.

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
const { data } = useQuery({
  query: GetPostById,
  variables,
  paused: () => !variables.id, // Don't re-fetch automatically unless the id is present
});
```

The previous example can be also re-written like this, since the `paused` function receives the current variables as an argument.

```js
const { data } = useQuery({
  query: GetPostById,
  variables,
  paused: ({ id }) => !id, // Don't re-fetch automatically unless the id is present
});
```

This is useful if you want to build variable guards to make sure you don't pass invalid values to your GraphQL servers.

In addition to passing a function, you can also pass reactive refs or a plain boolean:

```js
const { data } = useQuery({
  query: GetPostById,
  variables,
  paused: computed(() => !variables.id), // computed or `ref`
});

const { data, execute } = useQuery({
  query: GetPostById,
  variables,
  paused: true, // boolean, this query is now "lazy" and you have to trigger executions manually with `execute`.
});

function runQuery() {
  execute(); // won't be stopped
}
```

Whenever the `paused` is a reactive value and it changes to `false`, the query will be re-executed automatically so you can also use `paused` to wait for when some condition is met before the query is executed. For example maybe you have a query that depends on another and want to make sure not to fetch the second one unless the first one was fetched.

```js
const Post = `
  query GetPost ($postId: ID!) {
    post (id: $postId) {
      id
      title
    }
  }
`;

const Comments = `
  query Comments ($postId: ID!) {
    post (id: $postId) {
      comments {
        body
      }
    }
  }
`;

const variables = { postId: 1 };

const { data: postData } = useQuery({
  query: Post,
  variables,
});

const { data } = useQuery({
  query: Comments,
  variables,
  // Causes the query to wait for the post to be found and fetched.
  paused: () => !!postData.value.post,
});
```

## Skipping Queries

You can also skip executing queries by providing a `skip` argument to the query options. This can be particularly useful if you want to prevent fetching or refetching a query if a variable value is invalid. This may seem similar to `paused` except it doesn't stop query or variables watching and it prevents all executions, even manual ones with `execute`. Also it doesn't re-fetch automatically whenever it is set back to `false`.

In the following example we skip the query unless the user has entered enough characters for the search terms.

```vue
<template>
  <div>
    <input v-model="searchTerm" type="search" placeholder="Enter search terms" />
    <ul v-if="data">
      <li v-for="post in data.searchPosts" :key="post.id">{{ post.title }}</li>
    </ul>

    <p v-if="isFetching">Searching...</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useQuery } from 'villus';

const SearchPosts = `
  query SearchPosts($term: String!) {
    searchPosts (term: $term) {
      id
      title
    }
  }
`;

const searchTerm = ref('');

// Skip the query if the search term has less than 3 characters.
const shouldSkip = computed(() => {
  return searchTerm.value && searchTerm.value.length >= 3;
});

const { data, isFetching } = useQuery({
  query: SearchPosts,
  skip: shouldSkip,
  variables: computed(() => {
    return {
      term: searchTerm.value,
    };
  }),
});
</script>
```

You can also pass a function instead of a reactive variable, this function receives the current variables as an argument.

```vue
<template>
  <div>
    <input v-model="searchTerm" type="search" placeholder="Enter search terms" />
    <ul v-if="data">
      <li v-for="post in data.searchPosts" :key="post.id">{{ post.title }}</li>
    </ul>

    <p v-if="isFetching">Searching...</p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useQuery } from 'villus';

const SearchPosts = `
  query SearchPosts($term: String!) {
    searchPosts (term: $term) {
      id
      title
    }
  }
`;

const searchTerm = ref('');

const { data, isFetching } = useQuery({
  query: SearchPosts,
  skip: ({ term }) => {
    return term && term.length >= 3;
  },
  variables: computed(() => {
    return {
      term: searchTerm.value,
    };
  }),
});
</script>
```

Of course you could've used `paused` for the previous example, but because `paused` stops watching the query variables it means you query won't trigger whenever the user type something into the search terms. Also it wouldn't work correctly if you call `execute` manually with a watcher because `paused` doesn't stop manual executions. This makes `skip` ideal for situations where you want to keep the reactivity of the query while also ignoring certain executions of it.

## Fetching on Mounted

By default queries are executed when the component is mounted. You can configure this behavior by setting the `fetchOnMount` option:

```js
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
  fetchOnMount: false, // disables query fetching on mounted
});
```

<doc-tip type="warn" title="Pausing and Skipping with fetchOnMount">

Note that this behavior is subject to `paused` or `skip` being set. Meaning if a query is paused or skipped it won't fetch when the component is mounted.

</doc-tip>

## Caching

Queries are **cached in memory**, the uniqueness criteria is the query name, body, and its variables. Meaning if the same query is run with the same variables it will be fetched from the cache by default and will not hit the network. **Cache is deleted after the user closes/refreshes the page.**

By default the client uses `cache-first` policy to handle queries, the full list of available policies are:

- `cache-first`: If found in cache return it, otherwise fetch it from the network
- `network-only`: Always fetch from the network and do not cache it
- `cache-and-network`: If found in cache return it, then fetch a fresh result from the network and update current data (reactive). if not found in cache it will fetch it from network and cache it
- `cache-only`: If found in cache return it, otherwise returns `null` for both `data` and `errors`

You can specify a different strategy on different levels:

### On the client level

You can set the default policy on the client level when you are [building the GraphQL client](/client.md) by passing `cachePolicy` option to either:

```js{4}
// in setup
useClient({
  url: '/graphql', // Your endpoint
  cachePolicy: 'network-only',
});
```

This will make all the child-components using `useQuery` use the `network-only` policy by default.

### On the query level

You can pass the `cachePolicy` property to the `useQuery` function to set the default caching policy for that query:

<doc-tip>

Note the usage of a different signature here for the `useQuery` function, what you have seen so far is the "short-hand" but when you need to modify the query behavior you will need to use the full or extended options. The main difference is that this signature only accepts exactly 1 argument containing the query options, you can find more information about the available options in the [API reference page](/api/use-query).

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

const { execute, data } = useQuery({
  query: GetPosts,
});

// use this in template or whatever.
function runWithPolicy() {
  execute({ cachePolicy: 'network-only' });
}
```

You can build your own cache layer and plugins for villus, check the [Plugins Guide](/plugins)

## Suspense

<doc-tip type="danger" title="Vue 3">

This feature is only available with Vue 3 at the moment

</doc-tip>

You can use `useQuery` with the `Suspense` API component shipped in Vue 3.x.

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

    const { data } = await useQuery({
      query: GetPosts,
    });

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
    Listing,
  },
};
</script>
```

## Fetching Indication

It is very common to display an indication for pending queries in your UI so your users know that something is being done, the `useQuery` composition function exposes a `isFetching` boolean ref that you can use to display such indicators.

```vue
<template>
  <div>
    <ul v-if="data">
      <li v-for="post in data.posts" :key="post.id">{{ post.title }}</li>
    </ul>

    <p v-if="isFetching">Loading...</p>
  </div>
</template>

<script setup>
import { useQuery } from 'villus';

const GetPosts = `
  query GetPosts {
    posts {
      id
      title
    }
  }
`;

const { data, isFetching } = useQuery({
  query: GetPosts,
});
</script>
```

Whenever a re-fetch is triggered, or the query was executed again the `isFetching` will be updated accordingly so you don't have to keep it in sync with anything nor you have to create your own boolean refs for indications.

<doc-tip title="Initial isFetching value">

Is fetching default value is `true` if `fetchOnMount` is enabled, otherwise it will start off with `false`.

</doc-tip>
