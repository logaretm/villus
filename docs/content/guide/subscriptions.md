---
title: Subscriptions
description: Learn how to run GraphQL subscriptions
order: 5
---

# Subscriptions

`villus` handles subscriptions with the `useSubscription` or the `Subscription` component in the same way as the `useQuery` or the `Query` component.

To add support for subscriptions you need to add the `handleSubscriptions` plugin to the `useClient` plugin list, which in turn will call your subscription client. The plugin expects an a function that returns an object that follows the [observable spec](https://github.com/tc39/proposal-observable) to be returned, this function is called a **subscription forwarder**

The following example uses `apollo-server` with the `subscriptions-transport-ws` package:

```js
import { useClient, handleSubscriptions, defaultPlugins } from 'villus';
import { SubscriptionClient } from 'subscriptions-transport-ws';

const subscriptionClient = new SubscriptionClient('ws://localhost:4001/graphql', {});
const subscriptionForwarder = operation => subscriptionClient.request(op),

// in your setup
const client = useClient({
  url: 'http://localhost:4000/graphql',
  use: [handleSubscriptions(subscriptionForwarder), ...defaultPlugins()]
});
```

Once you've setup the `handleSubscriptions` plugin, you can now use the `useSubscription` function or the `Subscription`.

## Executing Subscriptions

The `useSubscription` function has a similar API as it exposes a `data` property that you can watch

```vue
<template>
  <ul>
    <li v-for="message in messages">{{ message }}</li>
  </ul>
</template>

<script>
import { watch, ref } from 'vue';
import { useSubscription } from 'villus';

export default {
  setup() {
    const NewMessages = `
      subscription NewMessages {
        newMessages {
          id
          from
          message
        }
      }
    `;

    const { data } = useSubscription(NewMessages);
    const messages = ref([]);
    watch(data, incoming => {
      // do stuff with incoming data
      messages.value.push(incoming);
    });

    return { messages };
  },
};
</script>
```

This isn't very useful as usually you would like to be able to use the `data` as a continuos value rather than a reference to the last received value, that is why you can pass a custom reducer as the second argument to the `useSubscription` function, think of it as a subscription handler that aggregates the results into a single value. The aggregated value will become the `data` returned from `useSubscription`.

Here is the last example with a custom reducer, we will be covering the `setup` function only since the rest of the component is mostly the same:

```js
function handleSubscription(oldValue, response) {
  oldValue = oldValue || [];
  if (!response.data || response.errors) {
    return oldValue;
  }

  return [...oldValue, response.data.newMessages];
}

const NewMessages = `
  subscription NewMessages {
    newMessages {
      id
      from
      message
    }
  }
`;

const { data } = useSubscription(NewMessages, handleSubscription);
```

The `handleSubscription` function acts as a reducer for the incoming data, whenever a new response is received it will be passed to `handleSubscription` function as the second argument, the first argument will be the previous value.

<doc-tip>

Keep in mind that initially we have `null` for the initial value so we needed to provide a fallback for that.

</doc-tip>

## Passing Variables

You can pass variables to subscriptions by passing an object containing both `query` and `variables` as the first argument:

```js
function handleSubscription(oldValue, response) {
  // ...
}

const NewMessages = `
  subscription ConversationMessages ($id: ID!) {
    conversation(id: $id) {
      id
      from
      message
    }
  }
`;

const { data } = useSubscription(
  {
    query: NewMessages,
    variables: { id: 1 },
  },
  handleSubscription
);
```
