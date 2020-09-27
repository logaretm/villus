---
title: Cache Plugin
description: How the default cache works in villus
order: 2
---

# Cache Plugin

The cache plugin is one of the default plugins that are pre-configured with any villus client unless specified otherwise, the cache plugin is a simple in-memory cache that clears whenever the page reloads or when the client is destroyed.

The cache plugin only applies it's caching logic to queries, as mutations require a fresh response from the server.

The cache plugin all the cache policies in villus:

- `cache-first`: If found in cache return it, otherwise fetch it from the network
- `network-only`: Always fetch from the network and do not cache it
- `cache-and-network`: If found in cache return it, but fetch the fresh value and cache it for next time, if not found in cache it will fetch it from network and cache it
- `cache-only`: If found in cache return it, otherwise returns an empty response without errors

```js
import { useClient, cache, fetch } from 'villus';

useClient({
  use: [cache(), fetch()],
});
```

## Options

At this moment the cache plugin doesn't have any options to customize

## Code

You can check the [source code for the `fetch` plugin](https://github.com/logaretm/villus/blob/master/src/fetch.ts) and use it as a reference to build your own
