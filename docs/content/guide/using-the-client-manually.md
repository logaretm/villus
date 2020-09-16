---
title: Using the Client Manually
---

# Using The Client Manually

You don't have to use any of the functions/components to make use of `villus`. You can still use the core client manually to run arbitrary GraphQL queries and still get most of the benefits like caching queries and batching requests.

## Executing Queries

First you need to build the client instance, which can be done using `createClient` function exported by `villus`:

```js
import { createClient } from 'villus';

const client = createClient({
  url: 'your_graphql_endpoint'
});
```

Then you can run queries, mutations or subscriptions using any of their corresponding methods.

### Querying

You can execute queries using `executeQuery` method on the client instance:

```js
import { createClient } from 'villus';

const client = createClient({
  url: 'your_graphql_endpoint'
});

client
  .executeQuery({
    query: 'your query',
    variables: {
      // any variables
    }
  })
  .then(response => {
    // process the response
  });
```

You can also specify a custom cache policy per query execution by passing a `cachePolicy` property, by default it will follow whatever policy configured in the `createClient` function.

```js{13}
import { createClient } from 'villus';

const client = createClient({
  url: 'your_graphql_endpoint'
});

client
  .executeQuery({
    query: 'your query',
    variables: {
      // any variables
    },
    cachePolicy: 'network-only'
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
  url: 'your_graphql_endpoint'
});

client
  .executeMutation({
    query: 'your query',
    variables: {
      // any variables
    }
  })
  .then(response => {
    // process the response
  });
```

:::tip
You can make use of `async/await` as `executeQuery` and `executeMutation` both return a native Promise.
:::

### Subscriptions

Subscriptions are trickier, because they are more **event-driven**, so you cannot wait for them to execute like queries or mutations. Because of this, the `executeSubscription` method returns an **Observable** that allows you respond to incoming data.

The `useSubscription` function and `Subscription` component offer a great abstraction for dealing with subscriptions but you can still execute your own arbitrary subscriptions without resorting to either:

```js
import { createClient } from 'villus';
import { SubscriptionClient } from 'subscriptions-transport-ws';

const subscriptionClient = new SubscriptionClient('ws://localhost:4001/graphql', {});

const client = createClient({
  url: 'http://localhost:4000/graphql',
  subscriptionForwarder: op => subscriptionClient.request(op)
});

const observable = client.executeSubscription({
  query: 'your subscription query',
  variables: {
    // any variables
  }
});

observable.subscribe({
  next(response) {
    // handle incoming data
  },
  // eslint-disable-next-line
  error(err) {
    // Handle errors
  }
});
```

:::tip
Don't forget to set the `subscriptionForwarder` option on the client, which is a function that returns an observable.
:::
