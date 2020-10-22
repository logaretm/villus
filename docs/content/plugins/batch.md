---
title: Query Batching Plugin
description: Learn how to run batch multiple GraphQL queries
order: 4
---

# Query Batching

Villus has support for query batching but it is not configured out of the box, this is because not all GraphQL implementations support query-batching. So you would need to manually import it and configure it with `villus` client.

The batch plugin is available as its own package under the name `@villus/batch`

## Basic Batching

First add the plugin to your dependencies using `yarn` or `npm`:

```bash
yarn add @villus/batch
# Or
npm install @villus/batch
```

Then import the `batch` plugin from `villus` and pass it at the very end of the `plugins` array in client configuration:

```js
import { useClient } from 'villus';
import { batch } from '@villus/batch';

export default {
  setup() {
    useClient({
      url: 'https://test.com/graphql',
      use: [batch()],
    });
  },
};
```

<doc-tip type="danger">
  Careful not to use `batch` with the default `fetch` plugin, both of them act as a fetcher and there can only be 1 fetcher plugin for `villus` at any given time.
</doc-tip>

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
    const firstQuery = useQuery('{ posts { title } }');
    const secondQuery = useQuery('{ posts { id } }');

    return { postsWithTitle: firstQuery.data, postsWithId: secondQuery.data };
  },
};
</script>
```

## Batching timeout

Batching is done by waiting for a specific time which is `10ms` by default since the last executed query, and all queries executed within this time window will be batched together.

You can configure that time window by passing a `timeout` option to the `batch` function configuration:

```js{8}
import { useClient, batch } from 'villus';

export default {
  setup() {
    useClient({
      url: 'https://test.com/graphql',
      use: [batch({ timeout: 50 })],
    });
  },
};
```

This will add a `50ms` time window between queries to be batched together.

## Options

You can customize a few aspects of the `batch` plugin:

The available options are:

| Option  | Type                  | Description                                                                                                                                                                                                             |
| ------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| fetch   | `typeof window.fetch` | Pass this option if you plan to be specific about the `fetch` polyfill that will be used, by default it tries to find `window.fetch` on the browser or `global.fetch` on Node.js depending on the execution environment |
| timeout | `number`              | The number of milliseconds to wait for before executing the batched queries                                                                                                                                             |

## Code

You can check the [source code for the `batch` plugin](https://github.com/logaretm/villus/blob/main/packages/batch/src/index.ts) and use it as a reference to build your own
