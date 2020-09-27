---
title: Plugins
description: Learn how villus plugins work
order: 6
---

# Plugins

villus is very flexible and versatile, and as such you will need to write quite a few plugins of your own for various purposes, wehter to add special headers, transform the body to a specific format or encoding, or even change the `fetch` function used.

Something you might not be aware of is that villus is pre-configured with a couple of plugins that are necessary to execute queries, the default plugins are:

- [`fetch`](../plugins/fetch): used to execute queries on the network (actual fetching)
- [`cache`](../plugins/cache): an in-memory simple cache that comes with villus by default, supports all cache policies

Because of this villus is very minimal and lightweight. That's not all, in addition to those plugins, villus also offers the following plugins but they are not enabled by default:

- [`batch`](../plugins/batch): used instead of `fetch` to execute queries in batches on the network

Furthermore, villus exposes the default plugins as `defaultPlugins` function. To add plugins to villus client you need to pass a `use` array containing the plugins you would like to have

```js
// later in your setup
import { useClient, defaultPlugins } from 'villus';

useClient({
  url: '/graphql',
  use: [...defaultPlugins()], // if not provided `defaultPlugins` will be used
});
```

## Plugins under the hood

Under the hood, plugins are simple callbacks that run through various life-cycles of the operation execution, the main features of villus plugins compared to other libraries are:

- All plugins can be synchronous or asynchronous
- They will be executed at the same order they are defined in
- Each plugin can set anything about the current operation fetch options, like `url` or `body` or `headers` (ex: adding auth token to headers)
- Each plugin can choose to set the operation result at any time without stopping other plugins (ex: cache plugins)
- Each plugin can choose to end the operation with a specific result while skipping other plugins by setting the terminate signal (ex: fetch and batch plugins)
- Each plugin can execute a callback that's synchronous or asynchronous after the query is executed (ex: cache plugin)

A villus plugin has a type called `ClientPlugin` and it looks like this in TypeScript:

```typescript
type OperationType = 'query' | 'mutation' | 'subscription';

type AfterQueryCallback = (result: OperationResult) => void | Promise<void>;

interface FetchOptions extends RequestInit {
  url?: string;
}

interface ClientPluginContext {
  useResult: (result: OperationResult<unknown>, terminate?: boolean) => void; // used to signal that the plugin found a result for the operation
  setOperationContext: (opts: FetchOptions) => void; // Updates the operation context (opContext), useful to set any headers
  afterQuery: (cb: AfterQueryCallback) => void; // Registers a callback to do something after the query is finished and the pipeline is done
  operation: {
    query: DocumentNode | string; // The query/mutation to be executed
    variables: Record<string, any>; // The query variables
    cachePolicy: CachePolicy; // The cache policy for this operation
    key: number; // a unique key to identify this operation (useful for cache)
    type: OperationType; // the operation type: `query` or `mutation` or `subscription`
  };
  opContext: FetchOptions; // Read-only of the current operation context, contains stuff like `headers`, `body` and `url` and other fetch options
}

type ClientPlugin = ({ useResult, operation }: ClientPluginContext) => void | Promise<void>;
```

This will be clearer in the following examples

## Example: Adding Authorization Headers

It's very likely you have a authentication header you would like to add to your queries to be able to execute protected queries/mutations. A very common header is `Authorization` header which contains an auth token. Here is a snippet that shows how to add such headers to your queries:

```js
function authPlugin({ setOperationContext }) {
  setOperationContext({
    headers: {
      Authorization: 'Bearer {TOKEN}',
    },
  });
}

// later in your setup
import { useClient, defaultPlugins } from 'villus';

useClient({
  url: '/graphql',
  use: [authPlugin, ...defaultPlugins()], // add the auth plugin alongside the default plugins
});
```

And that's it,

## Example: Persistent Cache

You might want to create a custom cache especially that villus default cache plugin does not persist when the page is reloaded or when the client is destroyed, this is because villus default cache is a simple object in memory that keeps track of queries during runtime and each time the page is reloaded or when the client is initialized, it will start with a new object each time. This is convenient for most cases but you might want to leverage a more permanent cache solution.

In our example we will use `localStorage` as our storage to cache queries, you are free to use anything else as a storage like [`indexedDB`](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) which should offer more powerful capabilities and flexibility.

Here is an example of such cache:

```js
return function localStorageCache({ afterQuery, useResult, operation }) {
  // avoid caching mutations or subscriptions, also avoid caching queries with `network-only` policy
  if (operation.type !== 'query' || operation.cachePolicy === 'network-only') {
    return;
  }

  // Set the cache result after query is resolved
  // Using the `operation.key` is very handy here, it is a unique value that identifies this operation
  // The key is calculated from the query itself and it's variables
  afterQuery(result => {
    localStorage.setItem(operation.key, result);
  });

  // Get cached item
  const cachedResult = localStorage.getItem(operation.key);

  // if exists in cache, terminate with result
  if (cachedResult) {
    // The first argument of `useResult` is the final value of the operation
    // The second argument is optional, it allows the plugin to terminate the operation
    // and stop all other plugins from executing, the last plugin must terminate with `true`
    return useResult(cachedResult, true);
  }
};

// later in your setup
import { useClient, fetch } from 'villus';

useClient({
  url: '/graphql',
  use: [localStorageCache, fetch()], // add the local storage plugin along with the fetch plugin
});
```

In the previous sample, our cache plugin does not handle `cache-and-network` policy because it terminates the operation once it finds a cached value in local storage. To simply support it you could check if the cache policy is `cache-first` which doesn't require any cache invalidations/update after resolving the value. So you need to terminate the operation conditionally if the policy is `cache-first` or not.

```js
// ...
// Terminate operation only if the cache policy is cache-first
return useResult(cachedResult, operation.cachePolicy === 'cache-first');
```

For reference you may look at the implementation of the [`cache` plugin](https://github.com/logaretm/villus/blob/master/src/cache.ts)
