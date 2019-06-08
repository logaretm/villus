# Mutations

**vue-gql** exposes a **Mutation** component that is very similar to the **[Query](./queries.md)** component but with few distinct differences:

- The mutation component **does not** have a `variables` prop.
- The mutation component **does not** run automatically, you have to explicitly call `execute`.
- Cache policies do not apply to mutations as mutations represent real-time actions and will always use `network-only` policy.

:::tip
The **Mutation** component is **renderless** by default, meaning it will not render any extra HTML other than its slot, but only when exactly one child is present, if multiple children exist inside its slot it will render a `span`.
:::

```vue
<template>
  <div>
    <Mutation query="mutation { likePost (id: 123) { message } }" v-slot="{ data, execute }">
      <div v-if="data">
        <p>{{ data.likePost.message }}</p>
      </div>
      <button @click="execute()">Submit</button>
    </Mutation>
  </div>
</template>

<script>
import { Mutation } from 'vue-gql`;

export default {
  components: {
    Mutation
  }
};
</script>
```

## Variables

Since the **Mutation** component does not accept `variables` you can pass them to the `execute` method instead:

```vue
<Mutation query="mutation Like ($id: ID!) { likePost (id: $id) { message } }" v-slot="{ data, execute }">
  <div v-if="data">
    <p>{{ data.likePost.message }}</p>
  </div>
  <button @click="execute({ id: 123 })">Submit</button>
</Mutation>
```

Usually you would wrap your `forms` with the **Mutation** component and handle submits by executing the mutation.

## Slot Props

### fetching

The **Mutation** slot props contain more useful information that you can use to build better experience for your users, for example you can use the `fetching` slot prop to display a loading indicator while the form submits.

```vue
<Mutation query="mutation { likePost (id: 123) { message } }" v-slot="{ data, execute, fetching }">
  <Loading v-if="fetching" />

  <div v-if="data">
    <p>{{ data.likePost.message }}</p>
  </div>

  <button @click="execute()" :disabled="fetching">Submit</button>
</Mutation>
```

### done

The `done` slot prop is a boolean that indicates that the query has been completed.

### errors

The `errors` slot prop contains all errors encountered when running the query.

```vue
<Mutation query="mutation { likePost (id: 123) { message } }" v-slot="{ data, errors, execute }">
  <!-- Your Custom component to handle error display -->
  <ErrorPage v-if="errors" :errors="errors" />


  <button @click="execute()"">Submit</button>
</Mutation>
```

### execute

Like you previously saw, the `execute` slot prop is a function that executes the mutation, it accepts the variables object if specified, and unlike the same slot prop in the **Query** component it does not affect caching.

```vue
<Mutation query="mutation { likePost (id: 123) { message } }" v-slot="{ data, execute }">
  <div v-if="data">
    <ul>
      <li v-for="post in data.posts" :key="post.id">{{ post.title }}</li>
    </ul>
    <button @click="execute()">Submit</button>
  </div>
</Mutation>
```
