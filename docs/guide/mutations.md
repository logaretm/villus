# Mutations

**villus** offers both a `useMutation` function and a `Mutation` component that are very similar their **[querying](./queries.md)** counterparts but with few distinct differences:

- They **do not** accept a `variables` prop.
- They **do not** run automatically, you have to explicitly call `execute`.
- Cache policies do not apply to mutations as mutations represent user actions and will always use `network-only` policy.

Here is an example for the `useMutation` function:

```vue
<template>
  <div>
    <div v-if="data">
      <p>{{ data.likePost.message }}</p>
    </div>
    <button @click="execute()">Submit</button>
  </div>
</template>

<script>
import { useMutation } from 'villus';

export default {
  setup () {
    const { data, execute } = useMutation(
      query: `mutation { likePost (id: 123) { message } }`
    );

    return {
      data,
      execute
    };
  }
};
</script>
```

Here is a basic example for the `Mutation` component:

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
import { Mutation } from 'villus`;

export default {
  components: {
    Mutation
  }
};
</script>
```

:::tip
The `Mutation` component is **renderless**, meaning it will not render any extra HTML other than its slot.
:::

## Passing Variables

Since the `useMutation` function does not accept a `variables` property you can pass them to the `execute` method returned:

```js
// in setup
const { data, execute } = useMutation({
  query: 'mutation Like ($id: ID!) { likePost (id: $id) { message } }'
});

function submit() {
  execute({ id: 123 });
}

return { submit, data };
```

For the `Mutation` component you can pass the `variables` to the `execute` method instead:

```vue{3,8}
<Mutation query="mutation Like ($id: ID!) { likePost (id: $id) { message } }" v-slot="{ data, execute }">
  <div v-if="data">
    <p>{{ data.likePost.message }}</p>
  </div>
  <button @click="execute({ id: 123 })">Submit</button>
</Mutation>
```

Usually you would wrap your `forms` with the `Mutation` component and handle submits by executing the mutation.

## Other Properties

### fetching

The `Mutation` slot props contain more useful information that you can use to build better experience for your users, for example you can use the `fetching` slot prop to display a loading indicator while the form submits.

```vue{3,5}
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

```vue{3,6}
<Mutation
  query="mutation { likePost (id: 123) { message } }"
  v-slot="{ data, errors, execute }"
>
  <!-- Your Custom component to handle error display -->
  <ErrorPage v-if="errors" :errors="errors" />


  <button @click="execute()"">Submit</button>
</Mutation>
```

:::tip
You can also extract the same properties mentioned above from the `useMutation` function:

```js
const { fetching, done, errors } = useMutation({
  // ...
});
```

:::
