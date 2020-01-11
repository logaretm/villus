---
title: villus
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
footer: MIT Licensed | Copyright © 2019-present Abdelrahman Awad
description: A small and fast GraphQL client for Vue.js
meta:
  - name: og:title
    content: villus
  - name: og:description
    content: A small and fast GraphQL client for Vue.js
---

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
