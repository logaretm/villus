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
