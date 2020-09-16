---
title: villus
home: true
heroImage: /logo.png
actionText: Get Started →
actionLink: ./guide/
features:
  - title: Fast
    details: A lightweight footprint.
  - title: Caching
    details: Reasonable caching behavior out of the box.
  - title: TypeScript
    details: Everything is written in TypeScript.
description: A small and fast GraphQL client for Vue.js
---

<p align="center">

[![codecov](https://codecov.io/gh/logaretm/villus/branch/next/graph/badge.svg)](https://codecov.io/gh/logaretm/villus)
[![Build Status](https://travis-ci.org/logaretm/villus.svg?branch=next)](https://travis-ci.org/logaretm/villus)
[![Bundle Size](https://badgen.net/bundlephobia/minzip/villus)](https://bundlephobia.com/result?p=villus@0.1.0)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/8d6ba0a78903476dac459c15506ff312)](https://www.codacy.com/app/logaretm/villus?utm_source=github.com&utm_medium=referral&utm_content=logaretm/villus&utm_campaign=Badge_Grade)
[![npm](https://img.shields.io/npm/dm/villus.svg)](https://npm-stat.com/charts.html?package=villus)
[![npm](https://img.shields.io/npm/v/villus.svg)](https://www.npmjs.com/package/villus)

</p>

## Quick Start

First install `villus`:

```bash
yarn add villus@next graphql

# or npm

npm install villus@next graphql --save
```

> If you are using Vue 2 with the @vue/composition-api don't use the `next` tag.

You can now use it with either the new Vue composition API or higher order components:

### Usage

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

<nuxt-link to="/guide/overview">Guide</nuxt-link>