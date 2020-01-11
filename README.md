# villus

<p align="center">

[![codecov](https://codecov.io/gh/logaretm/villus/branch/master/graph/badge.svg)](https://codecov.io/gh/logaretm/villus)
[![Build Status](https://travis-ci.org/logaretm/villus.svg?branch=master)](https://travis-ci.org/logaretm/villus)
[![Bundle Size](https://badgen.net/bundlephobia/minzip/villus)](https://bundlephobia.com/result?p=villus@0.1.0)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/8d6ba0a78903476dac459c15506ff312)](https://www.codacy.com/app/logaretm/villus?utm_source=github.com&utm_medium=referral&utm_content=logaretm/villus&utm_campaign=Badge_Grade)
[![npm](https://img.shields.io/npm/dm/villus.svg)](https://npm-stat.com/charts.html?package=villus)
[![npm](https://img.shields.io/npm/v/villus.svg)](https://www.npmjs.com/package/villus)

</p>

> Villus is a finger-like structures in the small intestine. They help to absorb digested food. Think of GraphQL data as food!

A small and fast GraphQL client for Vue.js.

This is forked from my previous work at [vue-gql](https://github.com/baianat/vue-gql) before they decide to go for a different direction with this library.

## Features

- 📦 **Minimal:** Its all you need to query GQL APIs.
- 🦐 **Tiny:** Very small footprint.
- 🗄 **Caching:** Simple and convenient query caching by default.
- 💪 **TypeScript**: Written in Typescript.
- 💚 Minimal Vue.js Components.
- 🖇 Composition API support.

**It is Vue 3.0-ready!**

## Why use this

GraphQL is just a simple HTTP request. This library is meant to serve a tiny client without all the bells and whistles attached to Apollo and its ecosystem, it offers simple strategies to cache and batch your GraphQL requests.

If you are looking for a more full-featured client use [vue-apollo](https://github.com/vue/vue-apollo), it has everything you need.

You can read more about it in the [announcement post]().

## Documentation

You can find the full [documentation here](https://logaretm.github.io/villus)

## Quick Start

First install `villus`:

```bash
yarn add villus@next graphql

# or npm

npm install villus@next graphql --save
```

> If you are using Vue 2 with the @vue/composition-api don't use the `next` tag.

You can now use it with either the new Vue composition API or higher order components:

### Composition API

If you are using `Vue@2.x` make sure to install `@vue/composition-api` and use the `villus@0.x` releases, if you are rocking the `Vue@3.x` releases, then use `villus@1.x`.

Configure the GraphQL client for your root component:

```js
import { useClient } from 'villus';

export default {
  name: 'App',
  setup() {
    useClient({
      url: 'http://localhost:3002/graphql'
    });
  }
};
```

Then you can use `useQuery` in any child component:

```vue
<template>
  <div>
    <div v-if="data">
      <pre>{{ data }}</pre>
    </div>
  </div>
</template>

<script>
import { useQuery } from 'villus';

export default {
  setup() {
    const { data } = useQuery({
      query: '{ posts { title } }'
    });

    return { data };
  }
};
</script>
```

There is also the higher-order component flavor if you prefer to use them instead. Check the docs for more examples and details.

---

You can do a lot more than that, `villus` makes frequent tasks such as re-fetching, caching, mutations, and subscriptions a breeze. Consult the documentation for more use-cases and examples.

## Compatibility

This library relies on the `fetch` web API to run queries, you can use [`unfetch`](https://github.com/developit/unfetch) (client-side) or [`node-fetch`](https://www.npmjs.com/package/node-fetch) (server-side) to use as a polyfill.

## Examples

SOON

## License

MIT
