# vue-gql

A small and fast GraphQL client for Vue.js.

## Features

- 📦 **No dependencies:** Its all you need to query GQL APIs.
- 🦐 **Tiny:** only (3.5kb gzipped).
- 🗄 **Caching:** Simple and convenient query caching by default.
- 💪 **TypeScript**: Written in Typescript.
- 💚 Minimal Vue.js Components.

## Documentation

You can find the full [documentation here](https://baianat.github.io/vue-gql)

## Quick Start

First install `vue-gql`:

```bash
yarn add vue-gql

# or npm

npm install vue-gql --save
```

Setup the GraphQL client/endpoint:

```js
import Vue from 'vue';
import { withProvider, createClient } from 'vue-gql';
import App from './App.vue'; // Your App Component

const client = createClient({
  url: 'http://localhost:3002/graphql'
});

// Wrap your app component with the provider component.
const AppWithGQL = withProvider(App, client);

new Vue({
  render: h => h(AppWithGQL)
}).$mount('#app');
```

Now you can use the `Query` and `Mutation` components to run queries:

```vue
<template>
  <Query query="{ posts { title } }" v-slot="{ data, fetching }">
    <div v-if="fetching">Is Fetching ...</div>
    <div v-else>
      <pre>{{ data }}</pre>
    </div>
  </Query>
</template>

<script>
import { Query } from 'vue-gql';

export default {
  components: {
    Query
  }
};
</script>
```

You can do a lot more, `vue-gql` makes frequent tasks such as re-fetching, caching, mutation responses, error handling, subscriptions a breeze. Consult the documentation for more use-cases and examples.

## Compatibility

This library relies on the `fetch` web API to run queries, you can use `unfetch` (client-side) or `node-fetch` (server-side) to use as a polyfill.

## Examples

SOON

## License

MIT
