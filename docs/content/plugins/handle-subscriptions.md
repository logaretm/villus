---
title: Handle Subscriptions Plugin
description: The plugin that executes your subscriptions
order: 5
---

# Handle Subscriptions Plugin

Subscriptions are very different from queries or mutations, as it is considered a constant stream of events or data. Because of this it requires special handling, `villus` implements the subscriptions support as a plugin for added flexibility and streamlining the query execution process regardless of its type.

## Options

The `handleSubscriptions` plugin requires only one option, a **subscription forwarder**, which is just a function that returns an observable.

```js
import { useClient, handleSubscriptions, defaultPlugins } from 'villus';
import { SubscriptionClient } from 'subscriptions-transport-ws';

const subscriptionClient = new SubscriptionClient('ws://localhost:4001/graphql', {});
const subscriptionForwarder = operation => subscriptionClient.request(op),

// in your setup
useClient({
  url: 'http://localhost:4000/graphql',
  use: [handleSubscriptions(subscriptionForwarder), ...defaultPlugins()]
});
```

## Code

You can check the [source code for the `handleSubscriptions` plugin](https://github.com/logaretm/villus/blob/master/packages/villus/src/handleSubscriptions.ts) and use it as a reference to build your own
