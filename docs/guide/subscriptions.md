# Subscriptions

`vue-gql` handles subscriptions with the `Subscription` component in the same way as the `Query` component.

To add support for subscriptions you need to pass a `subscriptionForwarder` function to the `createClient` function, which in turn will call your subscription client. The `subscriptionForwarder` expects an object that follows the [observable spec](https://github.com/tc39/proposal-observable) to be returned.

The following example uses `apollo-server` with the `subscriptions-transport-ws` package:

```js
import { createClient } from 'vue-gql';
import { SubscriptionClient } from 'subscriptions-transport-ws';

const subscriptionClient = new SubscriptionClient('ws://localhost:4001/graphql', {});

const client = createClient({
  url: 'http://localhost:4000/graphql',
  subscriptionForwarder: op => subscriptionClient.request(op)
});
```

Once you've setup the `subscriptionForwarder` function, you can now use the `Subscription` component in the same way as the `Query` component.

The `Subscription` component exposes `data`, `error` on the slot props.

```vue{2,4,8,12}
<template>
  <Subscription :query="newMessages" v-slot="{ data }">
    <span>{{ data }}</span>
  </Subscription>
</template>

<script>
import { Subscription } from 'vue-gql';

export default {
  components: {
    Subscription
  },
  data: () => ({
    newMessages: `
      subscription NewMessages {
        newMessages {
          id
          from
          message
        }
      }
    `
  })
};
</script>
```

The `data` prop will be updated whenever a new value is received from the subscription.

## Using Subscriptions

Having a subscription component printing the data probably isn't that useful, for example in a chat app you would append new messages to the old ones to do that you need refactor your code to do the following:

- Have the `Subscription` component pass the `data` to a child component `Chatbox`.
- The `Chatbox` component would watch the `data` received and append them to existing messages.

Here is a minimal example:

**Chatbox.vue**

```vue
<template>
  <div>
    <p v-for="message in messages">{{ message }}</p>
  </div>
</template>

<script>
export default {
  props: ['newMessage'],
  data: () => ({
    messages: []
  }),
  watch: {
    newMessage({ newMessages }) {
      // append the new message to our messages.
      this.messages.push(newMessages.message);
    }
  }
};
</script>
```

And in the parent component:

```vue
<template>
  <Subscription :query="newMessages" v-slot="{ data }">
    <Chatbox :newMessage="data" />
  </Subscription>
</template>

<script>
import { Subscription } from 'vue-gql';
import Chatbox from '@/components/Chatbox';

export default {
  components: {
    Subscription,
    Chatbox
  },
  data: () => ({
    newMessages: `
      subscription NewMessages {
        newMessages {
          id
          from
          message
        }
      }
    `
  })
};
</script>
```
