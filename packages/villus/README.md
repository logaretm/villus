# villus

<p align="center">
  <img width="80%" src="https://raw.githubusercontent.com/logaretm/villus/main/logo.png">
</p>

<p align="center">

<a target="_blank" href="https://www.npmjs.com/package/villus">
  <img src="https://img.shields.io/npm/v/villus.svg?label=&color=05bda8">
</a>

<a target="_blank" href="https://npm-stat.com/charts.html?package=villus">
  <img src="https://img.shields.io/npm/dm/villus.svg?color=05bd6d&label=">
</a>

<a href="https://villus.logaretm.com/" target="_blank">
  <img src="https://img.shields.io/badge/-docs%20and%20demos-009f53">
</a>

<a href="https://github.com/sponsors/logaretm">
  <img src="https://img.shields.io/badge/-%E2%99%A5%20Sponsors-ec5cc6">

</a>

</p>

<h6 align="center">Villus is a finger-like structures in the small intestine. They help to absorb digested food.</h6>

A small and fast GraphQL client for **Vue.js**

This is forked from my previous work at [vue-gql](https://github.com/baianat/vue-gql) before they decide to go for a different direction with this library.

<p align="center">
  <a href="https://github.com/sponsors/logaretm">
    <img src='https://sponsors.logaretm.com/sponsors.svg'>
  </a>
</p>

<br>

You can also help this this project and my other projects by donating one time or by sponsoring.

## Features

- 📦 **Minimal:** Its all you need to query GQL APIs
- 🦐 **Tiny:** Very small footprint
- 🗄 **Caching:** Simple and convenient query caching by default
- 👕 **TypeScript:** Written in Typescript and Supports GraphQL TS tooling
- 🖇 **Composable:** Built for the Composition API
- ⚡️ **Suspense:** Supports the `<Suspense>` API
- 🔌 **Plugins:** Use existing plugins and create custom ones

## Why use this

GraphQL is just a simple HTTP request. This library is meant to be a tiny client without all the bells and whistles attached to Apollo and its ecosystem which subsequently means it is faster across the board due to it's smaller bundle size and reduced overhead. `villus` offers simple strategies to cache and batch, dedup your GraphQL requests.

`villus` also supports file uploads and subscriptions without compromising bundle size through plugins.

If you are looking for a more full-featured client use [vue-apollo](https://github.com/vuejs/vue-apollo), it has everything you need.

You can read more about it in the [announcement post](https://logaretm.com/blog/2020-01-11-announcing-villus/).

## Documentation

You can find the [documentation here](https://villus.logaretm.com/)

## Quick Start

First install `villus`:

```bash
yarn add villus graphql

# or npm

npm install villus graphql --save
```

Or because villus is so simple, you can use it via CDN:

```html
<!-- Import Vue 3 -->
<script src="https://unpkg.com/vue@3.0.2/dist/vue.global.js"></script>
<!-- Villus -->
<script src="https://unpkg.com/villus@latest/dist/villus.min.js"></script>
```

### Usage

Configure the GraphQL client for your root component:

```vue[App.vue]
<script setup>
import { useClient } from 'villus';

useClient({
  url: 'http://localhost:3002/graphql',
});
</script>
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

<script setup>
import { useQuery } from 'villus';

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
</script>
```

`villus` makes frequent tasks such as re-fetching, caching, deduplication, mutations, and subscriptions a breeze. It has even built-in `Suspense` support with Vue 3! Consult the [documentation](https://villus.logaretm.com) for more use-cases and examples.

## Compatibility

This library relies on the `fetch` web API to run queries, you can use [`unfetch`](https://github.com/developit/unfetch) (client-side) or [`node-fetch`](https://www.npmjs.com/package/node-fetch) (server-side) to use as a polyfill.

This library is compatible with Vue 3.0+ or 2.7+

## Examples

Live examples can be found [here](https://villus.logaretm.com/examples/basic-query)

## License

MIT
