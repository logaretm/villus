---
title: Batching Queries
description: Learn how to run batch multiple GraphQL queries
order: 1
---

# Query Batching

Villus has support for query batching but it is not configured out of the box, this is because not all GraphQL implementations support query-batching. So you would need to manually import it and configure it with `villus` client.

## Basic Batching

You need to import the `batcher` module from `villus` and pass it as the `fetcher` option in client configuration:

```js
import { useClient, batcher } from 'villus';

export default {
  setup() {
    useClient({
      url: 'https://test.com/graphql',
      fetch: batcher(),
    });
  },
};
```

And that's it, all your nested components that use `useQuery` or `useMutation` will automatically be batched together in a single request:

```vue
<template>
  <div>
    <ul v-if="postsWithTitle">
      <li v-for="post in postsWithTitle.posts" :key="post.id">{{ post.title }}</li>
    </ul>
    <ul v-if="postsWithId">
      <li v-for="post in postsWithId.posts" :key="post.id">{{ post.title }}</li>
    </ul>
  </div>
</template>

<script>
import { useQuery } from 'villus';

export default {
  setup() {
    // Both will be sent in a single request
    const firstQuery = useQuery({ query: '{ posts { title } }' });
    const secondQuery = useQuery({ query: '{ posts { id } }' });

    return { postsWithTitle: firstQuery.data, postsWithId: secondQuery.data };
  },
};
</script>
```

## Batching timeout

Batching is done by waiting for a specific time which is `10ms` by default since the last executed query, and all queries executed within this time window will be batched together.

You can configure that time window by passing a `timeout` option to the `batcher` function configuration:

```js{8}
import { useClient, batcher } from 'villus';

export default {
  setup() {
    useClient({
      url: 'https://test.com/graphql',
      fetch: batcher({
        timeout: 50,
      }),
    });
  },
};
```

This will add a `50ms` time window between queries to be batched together.
