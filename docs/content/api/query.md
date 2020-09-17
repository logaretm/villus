---
title: <Query />
description: API reference for the Query component
order: 4
---

## Query

The `Query` component uses [scoped slots](https://vuejs.org/v2/guide/components-slots.html#Scoped-Slots) to provide the query state to the slot template.

To run a query, the **Query** component takes a required `query` prop that can be either a `string` containing the query or a `DocumentNode` (AST) loaded by `graphql-tag/loader` from `.graphql` files.

<doc-tip>

The **Query** component is **renderless** by default, meaning it will not render any extra HTML other than its slot.

</doc-tip>

```vue
<template>
  <div>
    <Query query="{ todos { text } }" v-slot="{ data }">
      <div v-if="data">
        <p v-for="todo in data.todos">{{ todo.text }}</p>
      </div>
    </Query>
  </div>
</template>

<script>
import { Query } from 'villus';

export default {
  components: {
    Query,
  },
};
</script>
```

By default the query will run on the server-side if applicable (via `serverPrefetch`) or on mounted (client-side) if it didn't already.

<doc-tip>

The examples from now on will omit much of the boilerplate and will only use the `useQuery` and `Query` component to demonstrate its uses clearly.

</doc-tip>

## Other properties

The `useQuery` function and `Query` component slot props contain more useful information that you can use to build better experience for your users.

```js
const { data, fetching, done, error } = useQuery(...);
```

| Prop/Slot-Prop | type            | Description                                                                                                         |
| -------------- | --------------- | ------------------------------------------------------------------------------------------------------------------- |
| done           | `boolean`       | Indicates that the query was executed at least once                                                                 |
| error          | `CombinedError` | Contains an aggregate error object with information about any kind of errors encountered during executing the query |
| fetching       | `boolean`       | Indicates if the query is currently executing                                                                       |
