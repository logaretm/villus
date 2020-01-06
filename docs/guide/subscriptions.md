# Subscriptions

`villus` handles subscriptions with the `useSubscription` or the `Subscription` component in the same way as the `useQuery` or the `Query` component.

To add support for subscriptions you need to pass a `subscriptionForwarder` function to the `createClient` function, which in turn will call your subscription client. The `subscriptionForwarder` expects an object that follows the [observable spec](https://github.com/tc39/proposal-observable) to be returned.

The following example uses `apollo-server` with the `subscriptions-transport-ws` package:

```js
import { createClient } from 'villus';
import { SubscriptionClient } from 'subscriptions-transport-ws';

const subscriptionClient = new SubscriptionClient('ws://localhost:4001/graphql', {});

const client = createClient({
  url: 'http://localhost:4000/graphql',
  subscriptionForwarder: op => subscriptionClient.request(op)
});
```

Once you've setup the `subscriptionForwarder` function, you can now use the `useSubscription` function or the `Subscription`.

## Subscription Component

The `Subscription` component exposes `data`, `error` on the slot props.

```vue{2,4,8,12}
<template>
  <Subscription :query="newMessages" v-slot="{ data }">
    <span>{{ data }}</span>
  </Subscription>
</template>

<script>
import { Subscription } from 'villus';

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

### Usage

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
import { Subscription } from 'villus';
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

## useSubscription

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
    const { data } = useSubscription({
      query: `
        subscription NewMessages {
          newMessages {
            id
            from
            message
          }
        }
      `
    });

    const messages = ref([]);
    watch(data, incoming => {
      // do stuff with incoming data
      messages.value.push(incoming);
    });

    return { messages };
  }
};
</script>
```

This isn't very useful as usually you would like to be able to use the `data` as a continuos value rather than a reference to the last received value, that is why you can pass a custom `reducer` as the second argument to the `useSubscription` function.

Here is the last example with a custom reducer, we will be covering the `setup` function only since the rest of the component is mostly the same:

```js{1-8,23}
function reduce(oldValue, response) {
  oldValue = oldValue || [];
  if (!response.data || response.errors) {
    return oldValue;
  }

  return [...oldValue, response.data.newMessages];
}

const { data } = useSubscription(
  {
    query: `
    subscription NewMessages {
      newMessages {
        id
        from
        message
      }
    }
  `
  },
  reduce
);

return { messages: data };
```

The `reduce` function will act as a reducer for the incoming data, whenever a new response is received it will be passed to `reduce` function as the second argument, the first argument will always be the initial value.

:::tip
Keep in mind that initially we have `null` for the initial value so we needed to provide a fallback for that.
:::
