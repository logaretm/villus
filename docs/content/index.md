---
title: villus
description: A small and fast GraphQL client for Vue.js
home: true
features:
  - title: ⚡️ Fast
    details: Small API footprint with tiny bundle size < 4kb to make your apps load faster
  - title: 📦 Cache-Ready
    details: Reasonable caching behavior out of the box which can be adjusted per query
  - title: 👕 TypeScript
    details: Written in TypeScript and supports Typed query Responses and variables
  - title: 😋 Two Flavors
    details: Available as composable functions (hooks) or higher-order components
  - title: ☢️ Reactive
    details: Write reactive queries/variables with the composition API
  - title: 🚟 Suspense API
    details: Supports the <Suspense /> component API out of the box
---

## Sponsors

Thanks for the following companies and individuals who are supporting villus

<br>

<div class="flex justify-center items-center flex-wrap gap-4">
  <a href="https://getform.io" target="_blank" class="border-2 border-transparent dark:border-gray-600 rounded-xl">
    <img src="https://raw.githubusercontent.com/logaretm/vee-validate/main/docs/assets/img/sponsors/getform.svg" width="240" title="Go to getform.io">
  </a>
</div>

<br>

<br>

You can also help this this project and my other projects by donating one time or by sponsoring via the following link

<br>

<div class="flex justify-center items-center">
  <a href="https://www.buymeacoffee.com/logaretm" target="_blank">
      <img src="https://cdn.buymeacoffee.com/buttons/v2/default-red.png" alt="Buy Me A Coffee" width="180" title="Go to Buy Me A Coffee site">
  </a>
</div>

<br>

## Quick Start

First install `villus`:

```bash
yarn add villus graphql

# or npm

npm install villus graphql --save
```

You can now use it with either the [Vue composition API](https://v3.vuejs.org/guide/composition-api-introduction.html) or higher order components:

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
    const { data } = useQuery({
      query: '{ posts { title } }',
    });

    return { data };
  },
};
</script>
```

There is also the higher-order component flavor if you prefer to use them instead. Check the docs for more examples and details.
