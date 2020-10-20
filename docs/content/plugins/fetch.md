---
title: Fetch Plugin
description: The default plugin that executes your queries
order: 1
---

# Fetch Plugin

The fetch plugin is both a very simple plugin and a critical one to villus inner workings. Because villus is built using a pipeline of plugins that perform some processing on a GraphQL operation. The `fetch` plugin is treated as the one that actually executes your queries and mutations against the GraphQL API that is why it is very important to either have a `fetch` or `batch` plugins or any similar plugins you may write on your own.

## Options

You can customize a few aspects of the `fetch` plugin:

```js
import { useClient, fetch } from 'villus';

const fetchPlugin = fetch({
  // plugin options...
});

useClient({
  use: [fetchPlugin],
});
```

The available options are:

| Option | Type                  | Description                                                                                                                                                                                                             |
| ------ | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| fetch  | `typeof window.fetch` | Pass this option if you plan to be specific about the `fetch` polyfill that will be used, by default it tries to find `window.fetch` on the browser or `global.fetch` on Node.js depending on the execution environment |

## Code

You can check the [source code for the `fetch` plugin](https://github.com/logaretm/villus/blob/main/packages/villus/src/fetch.ts) and use it as a reference to build your own
