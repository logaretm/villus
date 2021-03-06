---
title: Dedup Plugin
description: How the default dedup plugin works in villus
order: 3
---

# Dedup Plugin

The dedup plugin removes any duplicate pending queries from executing which means you can safely run the same queries at the same time without worrying about excessive requests.

The dedup plugin only applies it's caching logic to queries. Mutations and subscriptions are excluded from the deduplication process.

```js
import { useClient, dedup, fetch } from 'villus';

useClient({
  use: [dedup(), fetch()],
});
```

<doc-tip>

The dedup plugin is one of the default plugins that are pre-configured with any villus client unless specified otherwise

</doc-tip>

## Options

At this moment the dedup plugin doesn't have any options to customize

## Code

You can check the [source code for the `dedup` plugin](https://github.com/logaretm/villus/blob/main/packages/villus/src/dedup.ts) and use it as a reference to build your own
