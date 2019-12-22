# Client

To start querying GraphQL endpoints, you need to setup a client for that endpoint. **villus** exposes a `createClient` function that allows you to create GraphQL clients for your endpoints.

```js
import { createClient } from 'villus';

const client = createClient({
  url: '/graphql' // your endpoint.
});
```

After you've created a client, you need to **provide** the client instance to your app, you can do this via two ways.

## Provider component

**villus** exports a `Provider` component that accepts a single prop, the `client` created by `createClient` function.

### SFC

```vue
<template>
  <Provider :client="client">
    <App />
  </Provider>
</template>

<script>
import { Provider, createClient } from 'villus';

const client = createClient({
  url: '/graphql'
});

export default {
  components: {
    Provider
  },
  data: () => ({
    client
  })
};
</script>
```

### JSX

This can be much easier if you are using JSX:

```jsx
import { Provider, createClient } from 'villus';

const client = createClient({
  url: '/graphql'
});

return new Vue({
  el: '#app',
  render() {
    return (
      <Provider client="{client}">
        <App />
      </Provider>
    );
  }
});
```

:::tip
The **Provider** component is **renderless** by default, meaning it will not render any extra HTML other than its slot, but only when exactly one child is present, if multiple children exist inside its slot it will render a `span`.
:::

### Multiple Providers

While uncommon, there is no limitations on how many endpoints you can use within your app, you can use as many provider as you like and that allows you to query different GraphQL APIs within the same app without hassle.

```vue
<Provider :client="githubClient">
  <PartOfApp />
</Provider>

<Provider :client="appApi">
  <OtherPart />
</Provider>
```

## withProvider function

**villus** exposes a `withProvider` function that takes a Vue component and returns the same component wrapped by the `Provider` component, it is very handy to use in JS components and render functions.

```js
import Vue from 'vue';
import { createClient, withProvider } from 'villus';
import App from './App.vue';

const client = createClient({
  url: '/graphql' // Your endpoint
});

// use this instead of your App
const AppWithClient = withProvider(App, client);

new Vue({
  // Render the wrapped version instead.
  render: h => h(AppWithClient)
}).mount('#app');
```

## Next Steps

Now that you have successfully setup the GraphQL client, you can use [Query](./queries.md) and [Mutation](./mutations.md) components to execute GraphQL queries.
