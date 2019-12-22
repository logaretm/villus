# villus

> Villus is a finger-like structures in the small intestine. They help to absorb digested food. Think of GraphQL data as food!

A small and fast GraphQL client for Vue.js.

This is forked from my previous work at [villus](https://github.com/baianat/villus) before they decide to go for a different direction with this library.

<p align="center">

[![codecov](https://codecov.io/gh/logaretm/villus/branch/master/graph/badge.svg)](https://codecov.io/gh/logaretm/villus)
[![Build Status](https://travis-ci.org/logaretm/villus.svg?branch=master)](https://travis-ci.org/logaretm/villus)
[![Bundle Size](https://badgen.net/bundlephobia/minzip/villus)](https://bundlephobia.com/result?p=villus@0.1.0)

</p>

## Features

- 📦 **Minimal:** Its all you need to query GQL APIs.
- 🦐 **Tiny:** Very small footprint.
- 🗄 **Caching:** Simple and convenient query caching by default.
- 💪 **TypeScript**: Written in Typescript.
- 💚 Minimal Vue.js Components.

## Why use this

GraphQL is just a simple HTTP request. This library is meant to serve a tiny client without all the bells and whistles attached to Apollo and its ecosystem, it offers simple strategies to cache and batch your GraphQL requests.

If you are looking for a more full-featured client use [vue-apollo](https://github.com/vue/vue-apollo), it has everything you need.

## Documentation

You can find the full [documentation here](https://logaretm.github.io/villus)

## Quick Start

First install `villus`:

```bash
yarn add villus graphql

# or npm

npm install villus graphql --save
```

Setup the GraphQL client/endpoint:

```js
import Vue from 'vue';
import { withProvider, createClient } from 'villus';
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
import { Query } from 'villus';

export default {
  components: {
    Query
  }
};
</script>
```

You can do a lot more, `villus` makes frequent tasks such as re-fetching, caching, mutation responses, error handling, subscriptions a breeze. Consult the documentation for more use-cases and examples.

## Compatibility

This library relies on the `fetch` web API to run queries, you can use [`unfetch`](https://github.com/developit/unfetch) (client-side) or [`node-fetch`](https://www.npmjs.com/package/node-fetch) (server-side) to use as a polyfill.

## Examples

SOON

## License

MIT
