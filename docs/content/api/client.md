---
title: Client
---

# Client API Reference

This is a detailed documented of the villus client

## API Reference

### createClient()

The `createClient` function exported by `villus` package allows you to create raw villus client instances to be used freely without being attached to components/composable functions. Here are the options that `createClient` accepts:

| Option                | Description                                                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| url                   | The URL of the GraphQL API service                                                                                                    |
| fetch                 | The `fetch` function to be used, must be compatible with `window.fetch`                                                               |
| cachePolicy           | The global cache policy to be used for queries, possible values are: `cache-and-network`, `network-only`, or `cache-first`            |
| context               | A function used to add headers, fetch options to all HTTP requests                                                                    |
| subscriptionForwarder | A function that initiates subscriptions using observable API. Read more about it in the [subscriptions guide](../guide/subscriptions) |

```js
const client = createClient({
  // opts ...
});
```

### useClient()

The `useClient` function exported by `villus` package allows you to create a villus client that can be injected into your components using `useQuery` or `useMutation` or `useSubscription` and their higher-order components variants. It accepts the same options as [createClient()](#createclient).

```js
useClient({
  // createClient() opts...
});
```

## Using The Client Manually

You don't have to use any of the functions/components to make use of `villus`. You can still use the core client manually to run arbitrary GraphQL queries and still get most of the benefits like caching queries and batching requests.

```js
import { createClient } from 'villus';

const client = createClient({
  url: '/graphql',
});
```

### Queries

First you need to build the client instance, which can be done using `createClient` function exported by `villus`:

Then you can run queries, mutations or subscriptions using any of their corresponding methods.

You can execute queries using `executeQuery` method on the client instance:

```js
import { createClient } from 'villus';

const client = createClient({
  url: '/graphql',
});

client
  .executeQuery({
    query: 'your query',
    variables: {
      // any variables
    },
  })
  .then(response => {
    // process the response
  });
```

You can also specify a custom cache policy per query execution by passing a `cachePolicy` property, by default it will follow whatever policy configured in the `createClient` function.

```js{13}
import { createClient } from 'villus';

const client = createClient({
  url: '/graphql',
});

client
  .executeQuery({
    query: 'your query',
    variables: {
      // any variables
    },
    cachePolicy: 'network-only',
  })
  .then(response => {
    // process the response
  });
```

### Mutations

You can execute mutations using `executeMutation` method on the client instance:

```js
import { createClient } from 'villus';

const client = createClient({
  url: '/graphql',
});

client
  .executeMutation({
    query: 'your query',
    variables: {
      // any variables
    },
  })
  .then(response => {
    // process the response
  });
```

<doc-tip>

You can make use of `async/await` as `executeQuery` and `executeMutation` both return a native Promise.

</doc-tip>

### Subscriptions

Subscriptions are trickier, because they are more **event-driven**, so you cannot wait for them to execute like queries or mutations. Because of this, the `executeSubscription` method returns an **Observable** that allows you respond to incoming data.

The `useSubscription` function and `Subscription` component offer a great abstraction for dealing with subscriptions but you can still execute your own arbitrary subscriptions without resorting to either:

```js
import { createClient } from 'villus';
import { SubscriptionClient } from 'subscriptions-transport-ws';

const subscriptionClient = new SubscriptionClient('ws://localhost:4001/graphql', {});

const client = createClient({
  url: 'http://localhost:4000/graphql',
  subscriptionForwarder: op => subscriptionClient.request(op),
});

const observable = client.executeSubscription({
  query: 'your subscription query',
  variables: {
    // any variables
  },
});

observable.subscribe({
  next(response) {
    // handle incoming data
  },
  // eslint-disable-next-line
  error(err) {
    // Handle errors
  },
});
```

<doc-tip>

Don't forget to set the `subscriptionForwarder` option on the client, which is a function that returns an observable.

</doc-tip>
