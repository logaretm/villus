---
title: Application Setup
order: 2
---

# Application Setup

To start querying GraphQL endpoints, you need to setup a client for that endpoint. **villus** exposes multiple functions and components that allow you to create GraphQL clients for your endpoints.

## Composition API

The `useClient` composition API function allows your components to define a GraphQL endpoint that all children of that component will query against.

To create a GraphQL client with the composition API:

```js
import { useClient } from 'villus';

// Your App component
export default {
  setup() {
    useClient({
      url: '/graphql', // your endpoint.
    });
  },
};
```

Internally it uses `provide/inject` API to inject the client into your components or composable functions. You can find the full options the `useClient` accepts in the [API reference](../api/client)

## Provider Component

If you prefer to use higher-order components you can use the `<Provider />` component, similar to `useClient` it accepts the same client options as props. It might be handy to use `v-bind` here to group the various client config options in a single object:

```vue
<template>
  <Provider v-bind="clientOptions">
    <App />
  </Provider>
</template>

<script>
import { Provider } from 'villus';

export default {
  components: {
    Provider,
  },
  data: () => ({
    clientOptions: {
      url: '/graphql',
    },
  }),
};
</script>
```

<doc-tip>

The **Provider** component is **renderless** by default. It will not render any extra HTML other than its slot.

</doc-tip>

### withProvider function

**villus** exposes a `withProvider` function that takes a Vue component and returns the same component wrapped by the `Provider` component, it is very handy to use in JSX and render functions.

```js
import Vue from 'vue';
import { withProvider } from 'villus';
import App from './App.vue';

const clientOptions = {
  url: '/graphql', // Your endpoint
};

// use this instead of your App
const AppWithClient = withProvider(App, clientOptions);

new Vue({
  // Render the wrapped version instead.
  render: h => h(AppWithClient),
}).mount('#app');
```

## Multiple Providers

While uncommon, there is no limitations on how many endpoints you can use within your app, you can use as many clients as you like and that allows you to query different GraphQL APIs within the same app without hassle.

```vue
<Provider v-bind="githubClient">
  <PartOfApp />
</Provider>

<Provider v-bind="appApi">
  <OtherPart />
</Provider>
```

For the composition API you will need to create a parent component for each client:

```js
// Component A
export default {
  name: 'GitHubProvider',
  setup() {
    useClient({
      url: '{GITHUB_API_ENDPOINT}',
    });
  },
};

// Component B
export default {
  name: 'AppAPI',
  setup() {
    useClient({
      url: '{MY_API}',
    });
  },
};
```

<doc-tip>

You can mix between higher-order components and composable API as higher-order components actually use the composable functions under the hood.

</doc-tip>

## Next Steps

Now that you have successfully setup the GraphQL client, you can start to [query](./queries) and [execute mutations](./mutations) on your GraphQL APIs.
