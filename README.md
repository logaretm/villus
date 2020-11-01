# villus

<p align="center">

![alt text](https://raw.githubusercontent.com/logaretm/villus/main/logo.png)

</p>

<p align="center">

[![codecov](https://codecov.io/gh/logaretm/villus/branch/main/graph/badge.svg)](https://codecov.io/gh/logaretm/villus)
[![Build Status](https://travis-ci.org/logaretm/villus.svg?branch=main)](https://travis-ci.org/logaretm/villus)
[![Bundle Size](https://badgen.net/bundlephobia/minzip/villus)](https://bundlephobia.com/result?p=villus)
[![npm](https://img.shields.io/npm/dm/villus.svg)](https://npm-stat.com/charts.html?package=villus)
[![npm](https://img.shields.io/npm/v/villus.svg)](https://www.npmjs.com/package/villus)

</p>

<h6 align="center">Villus is a finger-like structures in the small intestine. They help to absorb digested food.</h6>

A small and fast GraphQL client for Vue.js.

This is forked from my previous work at [vue-gql](https://github.com/baianat/vue-gql) before they decide to go for a different direction with this library.

## Features

- 📦 **Minimal:** Its all you need to query GQL APIs
- 🦐 **Tiny:** Very small footprint
- 🗄 **Caching:** Simple and convenient query caching by default
- 👕 **TypeScript:** Written in Typescript and Supports GraphQL TS tooling
- 🖇 **Composable:** Built for the Composition API
- ⚡️ **Suspense:** Supports the `<Suspense>` API in Vue 3
- Higher-order components available
- Supports both Vue 2.x (with @vue/composition-api) and 3.0

## Why use this

GraphQL is just a simple HTTP request. This library is meant to be a tiny client without all the bells and whistles attached to Apollo and its ecosystem, it offers simple strategies to cache and batch your GraphQL requests.

If you are looking for a more full-featured client use [vue-apollo](https://github.com/vue/vue-apollo), it has everything you need.

You can read more about it in the [announcement post](https://logaretm.com/blog/2020-01-11-announcing-villus/).

## Documentation

You can find the full [documentation here](https://villus.logaretm.com/)

## Quick Start

First install `villus`:

```bash
yarn add villus graphql

# or npm

npm install villus graphql --save
```

Or because villus is so simple, you can use it via CDN:

```html
<!-- Import Vue 2 or 3 -->
<script src="https://unpkg.com/vue@3.0.2/dist/vue.global.js"></script>
<!-- Vue Demi is needed for Vue 2 and 3 support -->
<script src="https://unpkg.com/vue-demi@0.4.1/lib/index.iife.js"></script>
<!-- Villus -->
<script src="https://unpkg.com/villus@1.0.0-rc.1/dist/villus.min.js"></script>
```

You can now use it with either the new Vue composition API or higher order components.

### Usage

Configure the GraphQL client for your root component:

```js
import { useClient } from 'villus';

export default {
  name: 'App',
  setup() {
    useClient({
      url: 'http://localhost:3002/graphql',
    });
  },
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
    const AllPosts = `
      query AllPosts {
        posts {
          title
        }
      }
    `;

    const { data } = useQuery({
      query: AllPosts,
    });

    return { data };
  },
};
</script>
```

There is also the higher-order component flavor if you prefer to use them instead. Check the [docs for more examples and details](https://villus.logaretm.com/).

---

You can do a lot more than that, `villus` makes frequent tasks such as re-fetching, caching, deduplication, mutations, and subscriptions a breeze. It has even built-in `Suspense` support with Vue 3! Consult the [documentation](https://villus.logaretm.com) for more use-cases and examples.

## Compatibility

This library relies on the `fetch` web API to run queries, you can use [`unfetch`](https://github.com/developit/unfetch) (client-side) or [`node-fetch`](https://www.npmjs.com/package/node-fetch) (server-side) to use as a polyfill.

## Examples

Live examples can be found [here](https://villus.logaretm.com/examples/basic-query)

## License

MIT
