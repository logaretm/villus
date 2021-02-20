---
title: Plugins
description: Learn how villus plugins work
order: 6
---

# Plugins

villus is very flexible and versatile, and as such you will need to write quite a few plugins of your own for various purposes, wehter to add special headers, transform the body to a specific format or encoding, or even change the `fetch` function used.

Something you might not be aware of is that villus is pre-configured with a couple of plugins that are necessary to execute queries, the default plugins are:

- [`fetch`](/plugins/fetch): used to execute queries on the network (actual fetching)
- [`cache`](/plugins/cache): an in-memory simple cache that comes with villus by default, supports all cache policies
- [`dedup`](/plugins/dedup): removes any duplicate pending queries

Furthermore, villus exposes the default plugins as `defaultPlugins` function. To add plugins to villus client you need to pass a `use` array containing the plugins you would like to have

```js
// later in your setup
import { useClient, defaultPlugins } from 'villus';

useClient({
  url: '/graphql',
  use: [...defaultPlugins()], // if not provided `defaultPlugins` will be used
});
```

In addition to the default plugins, villus also offers the following plugins but they are not enabled by default:

- [`batch`](/plugins/batch): used instead of `fetch` to execute queries in batches on the network
- [`multipart`](/plugins/multipart): Adds File upload support
- [`handleSubscriptions`](/plugins/handle-subscriptions): Adds GraphQL subscriptions support

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

interface AfterQueryContext {
  response?: ParsedResponse<unknown>; // The fetch operation response except it contains a parsed `body` property
}

interface ClientPluginContext {
  useResult: (result: OperationResult<unknown>, terminate?: boolean) => void; // used to signal that the plugin found a result for the operation
  afterQuery: (cb: AfterQueryCallback, ctx: AfterQueryContext) => void; // Registers a callback to do something after the query is finished and the pipeline is done
  operation: {
    query: DocumentNode | string; // The query/mutation to be executed
    variables: Record<string, any>; // The query variables
    cachePolicy: CachePolicy; // The cache policy for this operation
    key: number; // a unique key to identify this operation (useful for cache)
    type: OperationType; // the operation type: `query` or `mutation` or `subscription`
  };
  opContext: FetchOptions; // The current operation context, contains stuff like `headers`, `body` and `url` and other fetch options
  response?: ParsedResponse<unknown>; // The fetch operation response except it contains a parsed `body` property
}

type ClientPlugin = ({ useResult, operation }: ClientPluginContext) => void | Promise<void>;
```

The following sections will explain the purpose of each item in the context

### useResult()

The `useResult` function allows your plugin to resolve a value for the GraphQL operation. Plugins like `fetch`, `batch` and `cache` make use of this as each of them is responsible for setting a response value for the GraphQL operation.

#### Non-terminating Results

There is two types of `useResult` calls, the first being a **non-terminating** resolution, meaning that while your plugin found a value, it still wants other plugins to continue executing:

```js
useResult(response); // Other plugins will still execute
```

This is useful for the `cache` plugin with the `cache-and-network` policy as it may decide to resolve an operation earlier (if found in cache) and leave the pipeline of plugins unaffected because it still needs to make a network request to fetch the fresh result.

#### Terminating Results

The other type is a **terminating** resolution, meaning your plugin has decided to take over the pipeline and stop executing all others. This is useful with the `cache` plugin, because with the `cache-first` policy, it doesn't want any requests to go through.

```js
useResult(response, true); // Stops all plugins after it
```

<doc-tip>

Calling `useResult` mutliple times in the pipeline (by multiple plugins) won't have an effect on the end result, the very first `useResult` call will set the operation response, any subsequent calls are ignored.

</doc-tip>

### afterQuery()

The `afterQuery` function allows you to run a callback after the query is finished, the callback receives the GraphQL response as the first and only argument at the moment.

For example the `cache` plugin makes use of this to cache the operation response, here is an snippet of what happens in the `cache` plugin:

```js
function cachePlugin({ afterQuery, useResult, operation }) {
  // ...
  afterQuery(result => {
    // Set the cache result after query is resolved
    setCacheResult(operation, result);
  });
  // ...
}
```

### operation

The `operation` field contains useful information about the GraphQL operation being executed.

| Field       | Type                                                                     | Description                                                                           |
| ----------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| query       | `string \| DocumentNode`                                                 | The query/mutation being executed                                                     |
| variables   | `Record<string, any>`                                                    | The query variables passed with the operation                                         |
| cachePolicy | `'cache-first' \| 'network-only' \| 'cache-and-network' \| 'cache-only'` | The cache policy for this operation, useful if you are building a custom cache plugin |
| key         | `number`                                                                 | A unique identifier to use for this operation, useful for cache and dedup plugins     |
| type        | `'query' \| 'mutation' \| 'subscription'`                                | The operation type                                                                    |

### opContext

The `opContext` field is the `fetch` options that will be passed to the `fetch` or `batch` plugins or your custom plugin that makes the actual request, it has the same shape as [`RequestInit` interface](https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#Parameters). This is particularly useful if you are building a `fetch` plugin or some kind of authentication plugin with headers or cookies.

Here is a few useful snippets:

```js
function myPlugin({ opContext, operation }) {
  // Add auth headers
  opContext.headers.Authorization = 'Bearer <token>';

  // Encode additional information in the body
  opContext.body = JSON.stringify({ query: operation.query, variables: operation.variables, mutationKey: 39933 });

  // Change the URL dynamically
  opContext.url = '/other/graphql';
}
```

<doc-tip>

All plugins are processed in the same order they were added in, and as you can imagine the order of these plugins is critical as some plugins may override options for others and some may resolve the value too early. So keep the order in mind when defining the plugins

</doc-tip>

## Plugin Configuration

You might want to create a configurable plugin to publish or re-use in various ways. `villus` doesn't really offer any API for that but good old higher-order functions can be used to achieve that:

```js
function myPluginWithConfig({ prefix }) {
  return ({ opContext, operation }) => {
    // Add auth headers with configurable prefix
    opContext.headers.Authorization = `${prefix} <token>`;
  };
}
```

## TypeScript Support

While `villus` exports the `ClientPlugin` type, you can use the `definePlugin` helper to get automatic types for your plugins:

```typescript
import { definePlugin } from 'villus';

// opContext will be automatically typed
const myPlugin = definePlugin(({ opContext }) => {
  opContext.headers.Authorization = 'Bearer <token>';
});

const myPluginWithConfig = (prefix: string) => {
  // opContext will be automatically typed
  return definePlugin(({ opContext }) => {
    // Add auth headers with configurable prefix
    opContext.headers.Authorization = `${prefix} <token>`;
  });
};
```

## Example: Adding Authorization Headers

It's very likely you have a authentication header you would like to add to your queries to be able to execute protected queries/mutations. A very common header is `Authorization` header which contains an auth token. Here is a snippet that shows how to add such headers to your queries:

```js
function authPlugin({ opContext }) {
  opContext.headers.Authorization = 'Bearer <token>';
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
function localStorageCache({ afterQuery, useResult, operation }) {
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
}

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

For reference you may look at the implementation of the [`cache` plugin](https://github.com/logaretm/villus/blob/main/packages/villus/src/cache.ts)

## Example: Response Headers

You might want to do something after response headers, for example refreshing a user's token after each response to keep them signed in. You can do so by using the plugin context's `response` property which is set after either `fetch` or `batch` plugins are done executing.

To make sure you access the response, you need to do so in the `afterQuery` callback:

```js
let token = `TOKEN`;

function authPluginWithRefresh({ opContext, afterQuery }) {
  opContext.headers.Authorization = `Bearer $<token>`;

  afterQuery((result, { response }) => {
    // if no response, then the fetch plugin failed with a fatal error
    if (!response) {
      return;
    }

    // Update the access token
    token = response.headers['access-token'];
  });
}

// later in your setup
import { useClient, defaultPlugins } from 'villus';

useClient({
  url: '/graphql',
  use: [authPluginWithRefresh, ...defaultPlugins()], // add the auth plugin alongside the default plugins
});
```

<doc-tip type="danger">

It is important that you don't use ES6 destructing if you plan to use the `response` property as it will be set after the query is executed, destructing it at the function level will always yield `undefined`.

</doc-tip>
