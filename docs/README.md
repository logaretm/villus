---
title: Vue-gql
lang: en-US
home: true
heroImage: /logo.png
actionText: Get Started →
actionLink: ./guide/
features:
  - title: Declarative
    details: Use minimal Vue.js components to work with GraphQL
  - title: Fast
    details: A lightweight footprint.
  - title: Caching
    details: Reasonable caching behavior out of the box.
  - title: TypeScript
    details: Everything is written in TypeScript.
footer: MIT Licensed | Copyright © 2019-present Baianat
description: A small and fast GraphQL client for Vue.js
meta:
  - name: og:title
    content: Vue-gql
  - name: og:description
    content: A small and fast GraphQL client for Vue.js
---

# Quick Setup

## install

```bash
# install with yarn
yarn add vue-gql graphql

# install with npm
npm install vue-gql graphql
```

## Use

In your entry file, import the required modules:

```js
import Vue from 'vue';
import { createClient, withProvider } from 'vue-gql';
import App from './App.vue';

const client = createClient({
  url: '/graphql' // Your endpoint
});

// use this instead of your App
const AppWithClient = withProvider(App, client);

new Vue({
  render: h => h(AppWithClient)
}).mount('#app');
```

Now you can use the `Query` component to run GQL queries:

```vue
<template>
  <Query query="{ posts { id title } }" v-slot="{ data, execute }">
    <div v-if="data">
      <ul>
        <li v-for="post in data.posts" :key="post.id">{{ post.title }}</li>
      </ul>
      <button @click="execute()"></button>
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
